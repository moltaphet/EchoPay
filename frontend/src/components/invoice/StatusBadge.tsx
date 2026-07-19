import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/lib/contracts/types";

const map: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "success" | "default" | "warn" | "destructive" | "secondary";
  }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "default" },
  partial: { label: "Partial", variant: "warn" },
  expired: { label: "Expired", variant: "destructive" },
  disputed: { label: "Disputed", variant: "destructive" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
