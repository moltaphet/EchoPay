"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, RefreshCw, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { ProgressBar } from "@/components/invoice/ProgressBar";
import { formatUsdc, formatRelative } from "@/lib/format";
import { getInvoiceStatus, remainingOf, type Invoice } from "@/lib/contracts/types";
import { Badge } from "@/components/ui/badge";

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const status = getInvoiceStatus(invoice);
  const remaining = remainingOf(invoice);

  return (
    <Link href={`/pay/${invoice.id.toString()}`} className="group block">
      <Card className="transition-all duration-300 hover:border-echo-cyan/30 hover:shadow-glow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  #{invoice.id.toString()}
                </span>
                <StatusBadge status={status} />
                {invoice.recurring && (
                  <Badge variant="secondary" className="gap-1">
                    <RefreshCw className="size-3" />
                    {invoice.intervalDays}d
                  </Badge>
                )}
                {invoice.parentId > 0n && (
                  <Badge variant="outline">renewal</Badge>
                )}
              </div>
              <p className="truncate font-medium text-foreground group-hover:text-echo-cyan transition-colors">
                {invoice.description}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {formatRelative(invoice.createdAt)}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-2xl font-semibold tracking-tight text-echo-cyan">
                {formatUsdc(invoice.amount)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  USDC
                </span>
              </p>
              {!invoice.fullyPaid && invoice.amountPaid > 0n && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatUsdc(remaining)} left
                </p>
              )}
            </div>
          </div>

          <ProgressBar paid={invoice.amountPaid} total={invoice.amount} />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              Split settlement
            </span>
            <span className="inline-flex items-center gap-1 group-hover:text-echo-cyan transition-colors">
              View
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
