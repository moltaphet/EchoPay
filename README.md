# EchoPay

**Advanced on-chain invoices. Native USDC. Settled on Arc.**

EchoPay is a production-grade invoicing dApp for **Arc Network Testnet**: partial payments, multi-recipient splits, recurring renewals, disputes, analytics, QR checkout, and searchable dashboards.

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Arc](https://img.shields.io/badge/Arc%20Testnet-5042002-22D3EE)

---

## Feature matrix

| Feature | On-chain | UI |
|--------|----------|-----|
| Deadlines (auto-expire) | ✅ payments blocked after due | ✅ create + pay status |
| Partial payments | ✅ any amount ≤ remaining | ✅ amount input + progress |
| Multi-recipient splits | ✅ bps sum 10_000, up to 8 | ✅ create form + pay breakdown |
| Recurring / renew | ✅ interval + `renewInvoice` | ✅ create toggle + renew CTA |
| Disputes | ✅ raise / resolve, blocks pay | ✅ pay page actions |
| Analytics | ✅ `getCreatorStats` | ✅ dashboard charts |
| QR payment | — | ✅ `/pay/[id]` QR |
| Search & filters | — | ✅ dashboard |

---

## Network

| Parameter | Value |
|-----------|--------|
| Network | Arc Testnet |
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Currency | USDC (native, **18 decimals**) |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

---

## Project layout

```
EchoPay/
├── src/EchoPay.sol
├── test/EchoPay.t.sol
├── script/Deploy.s.sol
├── foundry.toml
└── frontend/                 # Next.js 14 App Router
    └── src/
        ├── app/              # /, /create, /dashboard, /pay/[id]
        ├── components/
        ├── hooks/
        └── lib/contracts/
```

---

## Contract API (v2)

```solidity
struct RecipientShare { address account; uint16 bps; }

function createInvoice(
  string description,
  uint256 amount,
  uint256 deadline,           // 0 = none
  RecipientShare[] splits,    // bps sum == 10_000
  bool recurring,
  uint32 intervalDays         // 1–365 if recurring
) external returns (uint256 id);

function payInvoice(uint256 id) external payable;  // partial OK

function raiseDispute(uint256 id, string reason) external;
function resolveDispute(uint256 id) external;      // creator

function renewInvoice(uint256 parentId) external returns (uint256 newId);
function cancelRecurring(uint256 id) external;     // blocks future renewals

function getInvoice(uint256 id) external view returns (Invoice);
function getSplits(uint256 id) external view returns (RecipientShare[]);
function getMyInvoices(address creator) external view returns (Invoice[]);
function getCreatorStats(address creator) external view returns (CreatorStats);
function remainingAmount(uint256 id) external view returns (uint256);
function isPayable(uint256 id) external view returns (bool);
function isExpired(uint256 id) external view returns (bool);
```

### Events
`InvoiceCreated` · `PaymentReceived` · `InvoiceSettled` · `DisputeRaised` · `DisputeResolved` · `InvoiceRenewed` · `RecurringCancelled`

---

## Quick start

### Contracts

```bash
cd EchoPay
forge install   # if needed
forge test -vv

cp .env.example .env   # PRIVATE_KEY, ARC_RPC_URL
source .env
forge script script/Deploy.s.sol:DeployEchoPay \
  --rpc-url $ARC_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

> **Note:** This is a breaking contract upgrade vs. the original single-pay EchoPay. Redeploy and update the frontend address.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_ECHOPAY_ADDRESS=0xF1f2924807314555d933bE00C75FD664d917DFE5

npm install
npm run dev
```

Open http://localhost:3000

---

## Environment

**Root `.env`**

```env
PRIVATE_KEY=
ARC_RPC_URL=https://rpc.testnet.arc.network
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_ECHOPAY_ADDRESS=0xF1f2924807314555d933bE00C75FD664d917DFE5
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
```

---

## Roadmap / Upcoming Features

EchoPay is shipping fast on Arc Testnet — and this is only the beginning. The items below are **planned for upcoming versions**, not guaranteed for the current release. They represent the next wave of protocol and product work as we push toward a production-grade stablecoin invoicing stack.

| Status | Meaning |
|--------|---------|
| 🔜 Planned | Targeted for a future release |
| 🧪 Exploring | Design and feasibility under review |

### 🔜 Planned for upcoming versions

- **Real deadlines with auto-expire**  
  Hard due dates enforced on-chain so unpaid invoices cleanly stop accepting funds after expiry — no manual intervention, no ambiguity for payers or creators.

- **Full partial payments with remaining-balance tracking**  
  Pay any amount up to the total, with live remaining balance, progress, and settlement status you can trust from the contract itself.

- **Split payments (multi-recipient, percentage shares)**  
  One invoice, many recipients: define percentage (or basis-point) splits so every payment routes automatically to collaborators, agents, or treasuries.

- **Recurring invoices (subscription-style)**  
  Monthly-style billing cycles with renewals after settlement — ideal for retainers, SaaS, and ongoing Arc-native relationships.

- **Escrow mode**  
  Hold funds in a protected path until conditions are met, then release — stronger guarantees for high-value or milestone-based work.

- **Tip on top of invoice**  
  Optional gratuity above the face amount so clients can reward exceptional delivery without rewriting the original invoice.

- **Optional invoice as NFT**  
  Mint an invoice (or paid receipt) as an NFT for portable proof of work, portfolio archives, and composable on-chain credentials.

### What’s next

We will prioritize based on builder feedback from Arc Testnet usage. If a roadmap item matters to your product, open an issue or reach out — community signal helps shape the order of delivery.

> **Note:** Roadmap items may change as Arc and the EchoPay protocol evolve. Features listed here should be treated as **intent for future versions**, not as commitments for the build you are running today.

---

## Design

- **Palette:** void `#020617` · cyan `#22D3EE` · blue `#38BDF8` · indigo `#6366F1`
- **Type:** Syne · DM Sans · JetBrains Mono
- **Signature:** echo rings + glass cards + live progress bars

---

## License

MIT
