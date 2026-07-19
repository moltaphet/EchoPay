// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {EchoPay} from "../src/EchoPay.sol";

contract EchoPayTest is Test {
    EchoPay internal echo;

    address internal creator = makeAddr("creator");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal payer = makeAddr("payer");

    uint256 internal constant AMOUNT = 100 ether;

    function setUp() public {
        echo = new EchoPay();
        vm.deal(payer, 10_000 ether);
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
    }

    function _single(address to) internal pure returns (EchoPay.RecipientShare[] memory s) {
        s = new EchoPay.RecipientShare[](1);
        s[0] = EchoPay.RecipientShare({account: to, bps: 10_000});
    }

    function _split50(address a, address b) internal pure returns (EchoPay.RecipientShare[] memory s) {
        s = new EchoPay.RecipientShare[](2);
        s[0] = EchoPay.RecipientShare({account: a, bps: 5_000});
        s[1] = EchoPay.RecipientShare({account: b, bps: 5_000});
    }

    /*//////////////////////////////////////////////////////////////
                              CREATE
    //////////////////////////////////////////////////////////////*/

    function test_createInvoice_success() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Design work", AMOUNT, 0, _single(alice), false, 0);

        EchoPay.Invoice memory inv = echo.getInvoice(id);
        assertEq(inv.id, 1);
        assertEq(inv.creator, creator);
        assertEq(inv.amount, AMOUNT);
        assertEq(inv.amountPaid, 0);
        assertFalse(inv.fullyPaid);
        assertFalse(inv.recurring);

        EchoPay.RecipientShare[] memory splits = echo.getSplits(id);
        assertEq(splits.length, 1);
        assertEq(splits[0].account, alice);
        assertEq(splits[0].bps, 10_000);
    }

    function test_createInvoice_withDeadlineAndRecurring() public {
        uint256 deadline = block.timestamp + 7 days;
        vm.prank(creator);
        uint256 id = echo.createInvoice("SaaS", AMOUNT, deadline, _single(alice), true, 30);

        EchoPay.Invoice memory inv = echo.getInvoice(id);
        assertTrue(inv.recurring);
        assertEq(inv.intervalDays, 30);
        assertEq(inv.deadline, deadline);
    }

    function test_createInvoice_revertsBadSplits() public {
        EchoPay.RecipientShare[] memory bad = new EchoPay.RecipientShare[](2);
        bad[0] = EchoPay.RecipientShare({account: alice, bps: 4_000});
        bad[1] = EchoPay.RecipientShare({account: bob, bps: 4_000}); // 8000 != 10000

        vm.prank(creator);
        vm.expectRevert(EchoPay.InvalidSplits.selector);
        echo.createInvoice("x", AMOUNT, 0, bad, false, 0);
    }

    function test_createInvoice_revertsPastDeadline() public {
        vm.warp(1000);
        vm.prank(creator);
        vm.expectRevert(EchoPay.InvalidDeadline.selector);
        echo.createInvoice("x", AMOUNT, 999, _single(alice), false, 0);
    }

    /*//////////////////////////////////////////////////////////////
                           PARTIAL PAYMENTS
    //////////////////////////////////////////////////////////////*/

    function test_partialPayment_thenFull() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Partial", AMOUNT, 0, _single(alice), false, 0);

        uint256 before = alice.balance;

        vm.prank(payer);
        echo.payInvoice{value: 40 ether}(id);

        EchoPay.Invoice memory inv = echo.getInvoice(id);
        assertEq(inv.amountPaid, 40 ether);
        assertFalse(inv.fullyPaid);
        assertEq(echo.remainingAmount(id), 60 ether);
        assertEq(alice.balance, before + 40 ether);
        assertTrue(echo.isPayable(id));

        vm.prank(payer);
        echo.payInvoice{value: 60 ether}(id);

        inv = echo.getInvoice(id);
        assertTrue(inv.fullyPaid);
        assertEq(inv.amountPaid, AMOUNT);
        assertEq(alice.balance, before + AMOUNT);
        assertFalse(echo.isPayable(id));
    }

    function test_pay_revertsOverpay() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Over", AMOUNT, 0, _single(alice), false, 0);

        vm.prank(payer);
        echo.payInvoice{value: 30 ether}(id);

        vm.prank(payer);
        vm.expectRevert(EchoPay.PaymentTooLarge.selector);
        echo.payInvoice{value: 80 ether}(id);
    }

    function test_pay_revertsExpired() public {
        uint256 deadline = block.timestamp + 1 days;
        vm.prank(creator);
        uint256 id = echo.createInvoice("Exp", AMOUNT, deadline, _single(alice), false, 0);

        vm.warp(deadline + 1);
        assertTrue(echo.isExpired(id));

        vm.prank(payer);
        vm.expectRevert(EchoPay.InvoiceExpired.selector);
        echo.payInvoice{value: 1 ether}(id);
    }

    /*//////////////////////////////////////////////////////////////
                              SPLITS
    //////////////////////////////////////////////////////////////*/

    function test_splitPayment_50_50() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Split", AMOUNT, 0, _split50(alice, bob), false, 0);

        uint256 a0 = alice.balance;
        uint256 b0 = bob.balance;

        vm.prank(payer);
        echo.payInvoice{value: AMOUNT}(id);

        assertEq(alice.balance, a0 + 50 ether);
        assertEq(bob.balance, b0 + 50 ether);
        assertTrue(echo.getInvoice(id).fullyPaid);
    }

    function test_splitPartial_dustSafe() public {
        // 1 wei payment with 1/3 + 2/3 style split via 3333/6667
        EchoPay.RecipientShare[] memory s = new EchoPay.RecipientShare[](2);
        s[0] = EchoPay.RecipientShare({account: alice, bps: 3_333});
        s[1] = EchoPay.RecipientShare({account: bob, bps: 6_667});

        vm.prank(creator);
        uint256 id = echo.createInvoice("Dust", 3, 0, s, false, 0);

        uint256 a0 = alice.balance;
        uint256 b0 = bob.balance;

        vm.prank(payer);
        echo.payInvoice{value: 3}(id);

        // total should equal payment
        assertEq((alice.balance - a0) + (bob.balance - b0), 3);
        assertTrue(echo.getInvoice(id).fullyPaid);
    }

    /*//////////////////////////////////////////////////////////////
                             DISPUTES
    //////////////////////////////////////////////////////////////*/

    function test_dispute_blocksPayment_thenResolve() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Disp", AMOUNT, 0, _single(alice), false, 0);

        vm.prank(payer);
        echo.payInvoice{value: 10 ether}(id);

        vm.prank(payer);
        echo.raiseDispute(id, "Wrong amount listed");

        assertTrue(echo.getInvoice(id).disputed);
        assertEq(echo.getDisputeReason(id), "Wrong amount listed");

        vm.prank(payer);
        vm.expectRevert(EchoPay.InvoiceDisputed.selector);
        echo.payInvoice{value: 1 ether}(id);

        vm.prank(creator);
        echo.resolveDispute(id);

        assertFalse(echo.getInvoice(id).disputed);

        vm.prank(payer);
        echo.payInvoice{value: 90 ether}(id);
        assertTrue(echo.getInvoice(id).fullyPaid);
    }

    function test_dispute_onlyAuthorized() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Auth", AMOUNT, 0, _single(alice), false, 0);

        vm.prank(bob);
        vm.expectRevert(EchoPay.NotAuthorized.selector);
        echo.raiseDispute(id, "nope");
    }

    /*//////////////////////////////////////////////////////////////
                             RECURRING
    //////////////////////////////////////////////////////////////*/

    function test_recurring_renew() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Sub", AMOUNT, 0, _single(alice), true, 30);

        vm.prank(payer);
        echo.payInvoice{value: AMOUNT}(id);

        EchoPay.Invoice memory inv = echo.getInvoice(id);
        assertTrue(inv.fullyPaid);
        assertEq(inv.nextRenewalAt, block.timestamp + 30 days);

        vm.prank(creator);
        vm.expectRevert(EchoPay.RenewalNotReady.selector);
        echo.renewInvoice(id);

        vm.warp(block.timestamp + 30 days);

        vm.prank(creator);
        uint256 newId = echo.renewInvoice(id);

        EchoPay.Invoice memory child = echo.getInvoice(newId);
        assertEq(child.amount, AMOUNT);
        assertEq(child.parentId, id);
        assertTrue(child.recurring);
        assertFalse(child.fullyPaid);
        assertTrue(echo.getInvoice(id).cancelled); // parent locked against double renew
    }

    function test_cancelRecurring() public {
        vm.prank(creator);
        uint256 id = echo.createInvoice("Sub", AMOUNT, 0, _single(alice), true, 30);

        // Current period remains payable; cancel only blocks renewals.
        vm.prank(creator);
        echo.cancelRecurring(id);
        assertTrue(echo.getInvoice(id).cancelled);

        vm.prank(payer);
        echo.payInvoice{value: AMOUNT}(id);
        assertTrue(echo.getInvoice(id).fullyPaid);

        vm.warp(block.timestamp + 30 days);
        vm.prank(creator);
        vm.expectRevert(EchoPay.InvoiceCancelled.selector);
        echo.renewInvoice(id);
    }

    /*//////////////////////////////////////////////////////////////
                              STATS
    //////////////////////////////////////////////////////////////*/

    function test_creatorStats() public {
        vm.startPrank(creator);
        uint256 a = echo.createInvoice("A", 50 ether, 0, _single(alice), false, 0);
        uint256 b = echo.createInvoice("B", 50 ether, 0, _single(alice), false, 0);
        vm.stopPrank();

        vm.prank(payer);
        echo.payInvoice{value: 50 ether}(a);

        vm.prank(payer);
        echo.payInvoice{value: 20 ether}(b);

        EchoPay.CreatorStats memory s = echo.getCreatorStats(creator);
        assertEq(s.invoiceCount, 2);
        assertEq(s.totalInvoiced, 100 ether);
        assertEq(s.totalReceived, 70 ether);
        assertEq(s.fullyPaidCount, 1);
        assertEq(s.partialCount, 1);
    }

    function test_getMyInvoices() public {
        vm.prank(creator);
        echo.createInvoice("one", AMOUNT, 0, _single(alice), false, 0);
        vm.prank(creator);
        echo.createInvoice("two", AMOUNT, 0, _single(bob), false, 0);

        EchoPay.Invoice[] memory mine = echo.getMyInvoices(creator);
        assertEq(mine.length, 2);
        assertEq(mine[1].description, "two");
    }
}
