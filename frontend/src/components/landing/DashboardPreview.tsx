import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockInvoices = [
  {
    id: "#1042",
    title: "Brand redesign — Phase 1",
    amount: "2,400",
    status: "Paid" as const,
    progress: 100,
  },
  {
    id: "#1041",
    title: "Monthly retainer · March",
    amount: "1,200",
    status: "Partial" as const,
    progress: 55,
  },
  {
    id: "#1040",
    title: "API integration milestone",
    amount: "3,850",
    status: "Pending" as const,
    progress: 0,
  },
  {
    id: "#1039",
    title: "Security audit invoice",
    amount: "5,000",
    status: "Disputed" as const,
    progress: 20,
  },
];

const statusStyles = {
  Paid: "success" as const,
  Partial: "warn" as const,
  Pending: "default" as const,
  Disputed: "destructive" as const,
};

/**
 * Static product preview — marketing only (not live chain data).
 */
export function DashboardPreview() {
  return (
    <div className="premium-panel overflow-hidden rounded-[1.75rem]">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <p className="font-mono text-[0.65rem] tracking-wide text-slate-500">
          echopay.app/dashboard
        </p>
        <div className="w-12" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.35fr]">
        {/* Stats column */}
        <div className="space-y-4 border-b border-white/[0.06] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Overview
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-white">
              Creator analytics
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-echo-cyan/20 bg-echo-cyan/[0.06] p-4">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-echo-cyan/80">
                Received
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-echo-cyan">
                8,450
                <span className="ml-1 text-sm font-normal text-echo-cyan/70">
                  USDC
                </span>
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[0.7rem] text-emerald-400/90">
                <TrendingUp className="size-3" /> +12% this week
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">
                Open
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-white">
                6
              </p>
              <p className="mt-1 text-[0.7rem] text-slate-500">2 partial · 1 dispute</p>
            </div>
          </div>

          {/* Mini chart bars */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">
              Invoice mix
            </p>
            <div className="flex h-24 items-end gap-2">
              {[
                { h: "72%", c: "bg-echo-success/80" },
                { h: "45%", c: "bg-echo-cyan/70" },
                { h: "28%", c: "bg-echo-warn/70" },
                { h: "18%", c: "bg-red-400/60" },
                { h: "55%", c: "bg-echo-blue/60" },
              ].map((b, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-md ${b.c} transition-all`}
                  style={{ height: b.h }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.6rem] text-slate-600">
              <span>Paid</span>
              <span>Open</span>
              <span>Partial</span>
              <span>Dispute</span>
              <span>Recur</span>
            </div>
          </div>

          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link href="/dashboard">
              Open live dashboard
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Invoice list */}
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-white">
              Recent invoices
            </p>
            <Badge variant="secondary" className="text-[0.65rem]">
              Preview
            </Badge>
          </div>
          <div className="space-y-2.5">
            {mockInvoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-colors hover:border-echo-cyan/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.65rem] text-slate-500">
                        {inv.id}
                      </span>
                      <Badge
                        variant={statusStyles[inv.status]}
                        className="text-[0.6rem] px-2 py-0"
                      >
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-200">
                      {inv.title}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-sm font-semibold text-echo-cyan">
                    {inv.amount}
                    <span className="ml-0.5 text-[0.65rem] font-normal text-slate-500">
                      USDC
                    </span>
                  </p>
                </div>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-echo-cyan to-echo-blue"
                    style={{ width: `${inv.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
