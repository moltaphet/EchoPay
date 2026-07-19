export type InvoiceStatus =
  | "pending"
  | "partial"
  | "paid"
  | "expired"
  | "disputed";

export interface RecipientShare {
  account: `0x${string}`;
  bps: number;
}

export interface Invoice {
  id: bigint;
  creator: `0x${string}`;
  amount: bigint;
  amountPaid: bigint;
  description: string;
  deadline: bigint;
  fullyPaid: boolean;
  disputed: boolean;
  cancelled: boolean;
  recurring: boolean;
  intervalDays: number;
  parentId: bigint;
  nextRenewalAt: bigint;
  lastPayer: `0x${string}`;
  createdAt: bigint;
  paidAt: bigint;
}

export interface CreatorStats {
  invoiceCount: bigint;
  totalInvoiced: bigint;
  totalReceived: bigint;
  fullyPaidCount: bigint;
  openCount: bigint;
  partialCount: bigint;
  disputedCount: bigint;
  expiredCount: bigint;
}

export function remainingOf(invoice: Invoice): bigint {
  return invoice.amount - invoice.amountPaid;
}

export function getInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.fullyPaid) return "paid";
  if (invoice.disputed) return "disputed";
  const deadline = Number(invoice.deadline);
  if (deadline > 0 && Date.now() / 1000 > deadline) return "expired";
  if (invoice.amountPaid > 0n) return "partial";
  return "pending";
}

export function bpsToPercent(bps: number): string {
  return (bps / 100).toFixed(bps % 100 === 0 ? 0 : 2);
}
