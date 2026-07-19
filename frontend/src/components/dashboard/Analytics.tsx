"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsdc } from "@/lib/format";
import type { CreatorStats } from "@/lib/contracts/types";
import { Skeleton } from "@/components/ui/skeleton";

export function Analytics({
  stats,
  isLoading,
}: {
  stats?: CreatorStats;
  isLoading?: boolean;
}) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total received",
      value: `${formatUsdc(stats.totalReceived)} USDC`,
      hint: `of ${formatUsdc(stats.totalInvoiced)} invoiced`,
      accent: true,
    },
    {
      label: "Invoices",
      value: stats.invoiceCount.toString(),
      hint: `${stats.fullyPaidCount.toString()} settled`,
    },
    {
      label: "Open / partial",
      value: `${stats.openCount.toString()} / ${stats.partialCount.toString()}`,
      hint: "awaiting payment",
    },
    {
      label: "Disputed / expired",
      value: `${stats.disputedCount.toString()} / ${stats.expiredCount.toString()}`,
      hint: "needs attention",
    },
  ];

  const bars = [
    { label: "Paid", value: Number(stats.fullyPaidCount), color: "bg-echo-success" },
    { label: "Open", value: Number(stats.openCount), color: "bg-echo-cyan" },
    { label: "Partial", value: Number(stats.partialCount), color: "bg-echo-warn" },
    { label: "Disputed", value: Number(stats.disputedCount), color: "bg-red-400" },
    { label: "Expired", value: Number(stats.expiredCount), color: "bg-white/30" },
  ];
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className={c.accent ? "border-echo-cyan/25" : undefined}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
              <p
                className={`mt-2 font-display text-xl font-semibold ${
                  c.accent ? "text-echo-cyan" : "text-foreground"
                }`}
              >
                {c.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Invoice mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {bars.map((b) => (
            <div key={b.label} className="grid grid-cols-[72px_1fr_32px] items-center gap-3 text-xs">
              <span className="text-muted-foreground">{b.label}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${b.color} transition-all duration-500`}
                  style={{ width: `${(b.value / max) * 100}%` }}
                />
              </div>
              <span className="text-right tabular-nums text-muted-foreground">
                {b.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
