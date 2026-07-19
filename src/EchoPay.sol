// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title EchoPay
 * @author EchoPay
 * @notice Advanced on-chain invoices settled in native USDC on Arc Network.
 * @dev Arc uses USDC as the native gas token. Payments use `msg.value` (wei, 18 decimals).
 *
 * Features:
 *  - Deadlines with automatic expiry (payments blocked after due date)
 *  - Partial payments with remaining balance tracking
 *  - Multi-recipient splits (basis points, sum to 10_000)
 *  - Recurring invoices with creator-triggered renewal
 *  - Dispute flagging (blocks further payments until resolved by creator)
 */
contract EchoPay {
    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Recipient share for split payments (basis points).
    struct RecipientShare {
        address account;
        /// @dev Share in basis points; 10_000 = 100%.
        uint16 bps;
    }

    /// @notice Core invoice record.
    struct Invoice {
        uint256 id;
        address creator;
        /// @dev Total amount due in wei.
        uint256 amount;
        /// @dev Cumulative amount paid in wei.
        uint256 amountPaid;
        string description;
        /// @dev Unix deadline; 0 = none.
        uint256 deadline;
        bool fullyPaid;
        bool disputed;
        /// @dev Recurring series cancelled (no further renewals).
        bool cancelled;
        bool recurring;
        /// @dev Days between renewals (e.g. 30 ≈ monthly).
        uint32 intervalDays;
        /// @dev Parent invoice id in a recurring series; 0 if root.
        uint256 parentId;
        /// @dev Earliest timestamp when renewInvoice is allowed; 0 if N/A.
        uint256 nextRenewalAt;
        address lastPayer;
        uint256 createdAt;
        /// @dev Timestamp when fully paid; 0 until then.
        uint256 paidAt;
    }

    /// @notice Aggregated creator analytics.
    struct CreatorStats {
        uint256 invoiceCount;
        uint256 totalInvoiced;
        uint256 totalReceived;
        uint256 fullyPaidCount;
        uint256 openCount;
        uint256 partialCount;
        uint256 disputedCount;
        uint256 expiredCount;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidAmount();
    error InvalidDescription();
    error InvalidDeadline();
    error InvalidSplits();
    error InvalidInterval();
    error InvoiceNotFound();
    error AlreadyFullyPaid();
    error InvoiceExpired();
    error InvoiceDisputed();
    error InvoiceCancelled();
    error PaymentTooSmall();
    error PaymentTooLarge();
    error TransferFailed();
    error NotCreator();
    error NotAuthorized();
    error NotRecurring();
    error RenewalNotReady();
    error AlreadyDisputed();
    error NotDisputed();
    error InvalidDisputeReason();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event InvoiceCreated(
        uint256 indexed id,
        address indexed creator,
        uint256 amount,
        string description,
        uint256 deadline,
        bool recurring,
        uint32 intervalDays,
        uint256 parentId
    );

    event PaymentReceived(
        uint256 indexed id,
        address indexed payer,
        uint256 amount,
        uint256 amountPaid,
        uint256 remaining,
        bool fullyPaid
    );

    event InvoiceSettled(uint256 indexed id, address indexed lastPayer, uint256 totalAmount);

    event DisputeRaised(uint256 indexed id, address indexed raisedBy, string reason);

    event DisputeResolved(uint256 indexed id, address indexed resolvedBy);

    event InvoiceRenewed(uint256 indexed parentId, uint256 indexed newId, address indexed creator);

    event RecurringCancelled(uint256 indexed id, address indexed creator);

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public constant MAX_DESCRIPTION_LENGTH = 280;
    uint256 public constant MAX_DISPUTE_REASON_LENGTH = 200;
    uint256 public constant MAX_SPLITS = 8;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint32 public constant MIN_INTERVAL_DAYS = 1;
    uint32 public constant MAX_INTERVAL_DAYS = 365;

    uint256 private _nextId = 1;

    mapping(uint256 => Invoice) private _invoices;
    mapping(uint256 => RecipientShare[]) private _splits;
    mapping(uint256 => string) private _disputeReasons;
    mapping(address => uint256[]) private _creatorInvoices;

    /*//////////////////////////////////////////////////////////////
                          EXTERNAL WRITE OPS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create an invoice with optional multi-recipient split and recurring config.
     * @param description Memo (1–280 chars).
     * @param amount Total amount due in wei.
     * @param deadline Unix deadline; 0 for none.
     * @param splits Recipients and bps (must sum to 10_000; 1–8 entries).
     * @param recurring Whether this starts a recurring series.
     * @param intervalDays Renewal interval in days (required if recurring).
     * @return id New invoice id.
     */
    function createInvoice(
        string calldata description,
        uint256 amount,
        uint256 deadline,
        RecipientShare[] calldata splits,
        bool recurring,
        uint32 intervalDays
    ) external returns (uint256 id) {
        _validateDescription(description);
        if (amount == 0) revert InvalidAmount();
        if (deadline != 0 && deadline < block.timestamp) revert InvalidDeadline();
        _validateSplits(splits);

        if (recurring) {
            if (intervalDays < MIN_INTERVAL_DAYS || intervalDays > MAX_INTERVAL_DAYS) {
                revert InvalidInterval();
            }
        } else if (intervalDays != 0) {
            revert InvalidInterval();
        }

        id = _mintInvoice(
            msg.sender,
            description,
            amount,
            deadline,
            splits,
            recurring,
            recurring ? intervalDays : 0,
            0
        );
    }

    /**
     * @notice Pay any amount up to the remaining balance (partial allowed).
     * @dev Distributes `msg.value` across split recipients by bps. Blocks if expired/disputed.
     * @param id Invoice id.
     */
    function payInvoice(uint256 id) external payable {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0) revert InvoiceNotFound();
        if (inv.fullyPaid) revert AlreadyFullyPaid();
        if (inv.disputed) revert InvoiceDisputed();
        if (inv.deadline != 0 && block.timestamp > inv.deadline) revert InvoiceExpired();
        if (msg.value == 0) revert PaymentTooSmall();

        uint256 remaining = inv.amount - inv.amountPaid;
        if (msg.value > remaining) revert PaymentTooLarge();

        inv.amountPaid += msg.value;
        inv.lastPayer = msg.sender;

        bool fullyPaid = inv.amountPaid == inv.amount;
        if (fullyPaid) {
            inv.fullyPaid = true;
            inv.paidAt = block.timestamp;
            if (inv.recurring && !inv.cancelled) {
                inv.nextRenewalAt = block.timestamp + (uint256(inv.intervalDays) * 1 days);
            }
        }

        _distribute(id, msg.value);

        emit PaymentReceived(id, msg.sender, msg.value, inv.amountPaid, inv.amount - inv.amountPaid, fullyPaid);
        if (fullyPaid) {
            emit InvoiceSettled(id, msg.sender, inv.amount);
        }
    }

    /**
     * @notice Flag an invoice as disputed (blocks further payments).
     * @dev Creator or last payer may raise. Only one open dispute at a time.
     * @param id Invoice id.
     * @param reason Short reason (1–200 chars).
     */
    function raiseDispute(uint256 id, string calldata reason) external {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0) revert InvoiceNotFound();
        if (inv.fullyPaid) revert AlreadyFullyPaid();
        if (inv.disputed) revert AlreadyDisputed();

        uint256 reasonLen = bytes(reason).length;
        if (reasonLen == 0 || reasonLen > MAX_DISPUTE_REASON_LENGTH) revert InvalidDisputeReason();

        if (msg.sender != inv.creator && msg.sender != inv.lastPayer) revert NotAuthorized();

        inv.disputed = true;
        _disputeReasons[id] = reason;

        emit DisputeRaised(id, msg.sender, reason);
    }

    /**
     * @notice Resolve a dispute (creator only). Re-enables payments if still open.
     * @param id Invoice id.
     */
    function resolveDispute(uint256 id) external {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0) revert InvoiceNotFound();
        if (msg.sender != inv.creator) revert NotCreator();
        if (!inv.disputed) revert NotDisputed();

        inv.disputed = false;
        delete _disputeReasons[id];

        emit DisputeResolved(id, msg.sender);
    }

    /**
     * @notice Create the next invoice in a recurring series after the interval elapses.
     * @param parentId Fully paid recurring invoice id.
     * @return newId Newly created invoice id.
     */
    function renewInvoice(uint256 parentId) external returns (uint256 newId) {
        Invoice storage parent = _invoices[parentId];
        if (parent.id == 0) revert InvoiceNotFound();
        if (msg.sender != parent.creator) revert NotCreator();
        if (!parent.recurring) revert NotRecurring();
        if (parent.cancelled) revert InvoiceCancelled();
        if (!parent.fullyPaid) revert NotAuthorized();
        if (block.timestamp < parent.nextRenewalAt) revert RenewalNotReady();

        // Prevent double-renew of the same parent instance.
        parent.cancelled = true;

        RecipientShare[] memory splits = _splits[parentId];
        RecipientShare[] memory splitsCopy = new RecipientShare[](splits.length);
        for (uint256 i = 0; i < splits.length;) {
            splitsCopy[i] = splits[i];
            unchecked {
                ++i;
            }
        }

        uint256 rootId = parent.parentId == 0 ? parentId : parent.parentId;
        uint256 newDeadline = parent.deadline == 0
            ? 0
            : block.timestamp + (parent.deadline - parent.createdAt);

        newId = _mintInvoice(
            parent.creator,
            parent.description,
            parent.amount,
            newDeadline,
            splitsCopy,
            true,
            parent.intervalDays,
            rootId
        );

        emit InvoiceRenewed(parentId, newId, parent.creator);
    }

    /**
     * @notice Cancel further renewals for a recurring invoice.
     * @param id Invoice id (any instance in the series owned by caller).
     */
    function cancelRecurring(uint256 id) external {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0) revert InvoiceNotFound();
        if (msg.sender != inv.creator) revert NotCreator();
        if (!inv.recurring) revert NotRecurring();
        if (inv.cancelled) revert InvoiceCancelled();

        inv.cancelled = true;
        inv.nextRenewalAt = 0;

        emit RecurringCancelled(id, msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL VIEW OPS
    //////////////////////////////////////////////////////////////*/

    function getInvoice(uint256 id) external view returns (Invoice memory invoice) {
        invoice = _invoices[id];
        if (invoice.id == 0) revert InvoiceNotFound();
    }

    function getSplits(uint256 id) external view returns (RecipientShare[] memory splits) {
        if (_invoices[id].id == 0) revert InvoiceNotFound();
        splits = _splits[id];
    }

    function getDisputeReason(uint256 id) external view returns (string memory reason) {
        if (_invoices[id].id == 0) revert InvoiceNotFound();
        reason = _disputeReasons[id];
    }

    function remainingAmount(uint256 id) external view returns (uint256 remaining) {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0) revert InvoiceNotFound();
        remaining = inv.amount - inv.amountPaid;
    }

    function getInvoicesByCreator(address creator) external view returns (uint256[] memory ids) {
        ids = _creatorInvoices[creator];
    }

    function getMyInvoices(address creator) external view returns (Invoice[] memory invoices) {
        uint256[] storage ids = _creatorInvoices[creator];
        uint256 len = ids.length;
        invoices = new Invoice[](len);
        for (uint256 i = 0; i < len;) {
            invoices[i] = _invoices[ids[i]];
            unchecked {
                ++i;
            }
        }
    }

    function getCreatorStats(address creator) external view returns (CreatorStats memory stats) {
        uint256[] storage ids = _creatorInvoices[creator];
        uint256 len = ids.length;
        stats.invoiceCount = len;

        for (uint256 i = 0; i < len;) {
            Invoice storage inv = _invoices[ids[i]];
            stats.totalInvoiced += inv.amount;
            stats.totalReceived += inv.amountPaid;

            if (inv.fullyPaid) {
                unchecked {
                    ++stats.fullyPaidCount;
                }
            } else if (inv.disputed) {
                unchecked {
                    ++stats.disputedCount;
                }
            } else if (inv.deadline != 0 && block.timestamp > inv.deadline) {
                unchecked {
                    ++stats.expiredCount;
                }
            } else if (inv.amountPaid > 0) {
                unchecked {
                    ++stats.partialCount;
                }
            } else {
                unchecked {
                    ++stats.openCount;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    function totalInvoices() external view returns (uint256 count) {
        unchecked {
            count = _nextId - 1;
        }
    }

    function invoiceExists(uint256 id) external view returns (bool exists) {
        exists = _invoices[id].id != 0;
    }

    /**
     * @notice Whether an invoice can currently accept payment.
     */
    function isPayable(uint256 id) external view returns (bool payable_) {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0 || inv.fullyPaid || inv.disputed) return false;
        if (inv.deadline != 0 && block.timestamp > inv.deadline) return false;
        return inv.amountPaid < inv.amount;
    }

    function isExpired(uint256 id) external view returns (bool expired) {
        Invoice storage inv = _invoices[id];
        if (inv.id == 0 || inv.fullyPaid) return false;
        expired = inv.deadline != 0 && block.timestamp > inv.deadline;
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    function _mintInvoice(
        address creator,
        string memory description,
        uint256 amount,
        uint256 deadline,
        RecipientShare[] memory splits,
        bool recurring,
        uint32 intervalDays,
        uint256 parentId
    ) internal returns (uint256 id) {
        id = _nextId;
        unchecked {
            ++_nextId;
        }

        _invoices[id] = Invoice({
            id: id,
            creator: creator,
            amount: amount,
            amountPaid: 0,
            description: description,
            deadline: deadline,
            fullyPaid: false,
            disputed: false,
            cancelled: false,
            recurring: recurring,
            intervalDays: intervalDays,
            parentId: parentId,
            nextRenewalAt: 0,
            lastPayer: address(0),
            createdAt: block.timestamp,
            paidAt: 0
        });

        for (uint256 i = 0; i < splits.length;) {
            _splits[id].push(splits[i]);
            unchecked {
                ++i;
            }
        }

        _creatorInvoices[creator].push(id);

        emit InvoiceCreated(id, creator, amount, description, deadline, recurring, intervalDays, parentId);
    }

    function _validateDescription(string calldata description) internal pure {
        uint256 descLen = bytes(description).length;
        if (descLen == 0 || descLen > MAX_DESCRIPTION_LENGTH) revert InvalidDescription();
    }

    function _validateSplits(RecipientShare[] calldata splits) internal pure {
        uint256 len = splits.length;
        if (len == 0 || len > MAX_SPLITS) revert InvalidSplits();

        uint256 totalBps;
        for (uint256 i = 0; i < len;) {
            if (splits[i].account == address(0) || splits[i].bps == 0) revert InvalidSplits();
            totalBps += splits[i].bps;
            unchecked {
                ++i;
            }
        }
        if (totalBps != BPS_DENOMINATOR) revert InvalidSplits();
    }

    /**
     * @dev Pro-rata distribution with remainder to the last recipient (dust-safe).
     */
    function _distribute(uint256 id, uint256 payment) internal {
        RecipientShare[] storage splits = _splits[id];
        uint256 len = splits.length;
        uint256 distributed;

        for (uint256 i = 0; i < len;) {
            uint256 share;
            if (i == len - 1) {
                share = payment - distributed;
            } else {
                share = (payment * uint256(splits[i].bps)) / BPS_DENOMINATOR;
                distributed += share;
            }

            if (share > 0) {
                (bool ok,) = splits[i].account.call{value: share}("");
                if (!ok) revert TransferFailed();
            }
            unchecked {
                ++i;
            }
        }
    }
}
