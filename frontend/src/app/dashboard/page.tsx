"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FilePlus2, Inbox, RefreshCw, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { Analytics } from "@/components/dashboard/Analytics";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import {
  useMyInvoices,
  useCreatorStats,
  useContractReady,
} from "@/hooks/use-echo-contract";
import {
  getInvoiceStatus,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/contracts/types";
import { isContractConfigured } from "@/lib/contracts/config";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "oldest" | "amount-desc" | "amount-asc" | "remaining";
type StatusFilter = "all" | InvoiceStatus | "recurring";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { onArc } = useContractReady();
  const { invoices, isLoading, refetch, isError } = useMyInvoices();
  const { stats, isLoading: statsLoading, refetch: refetchStats } =
    useCreatorStats();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list: Invoice[] = [...invoices];
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (inv) =>
          inv.description.toLowerCase().includes(q) ||
          inv.id.toString().includes(q) ||
          inv.creator.toLowerCase().includes(q) ||
          inv.lastPayer.toLowerCase().includes(q),
      );
    }

    if (status === "recurring") {
      list = list.filter((inv) => inv.recurring);
    } else if (status !== "all") {
      list = list.filter((inv) => getInvoiceStatus(inv) === status);
    }

    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return Number(a.createdAt - b.createdAt);
        case "amount-desc":
          return a.amount === b.amount ? 0 : a.amount > b.amount ? -1 : 1;
        case "amount-asc":
          return a.amount === b.amount ? 0 : a.amount < b.amount ? -1 : 1;
        case "remaining": {
          const ra = a.amount - a.amountPaid;
          const rb = b.amount - b.amountPaid;
          return ra === rb ? 0 : ra > rb ? -1 : 1;
        }
        case "newest":
        default:
          return Number(b.createdAt - a.createdAt);
      }
    });

    return list;
  }, [invoices, query, status, sort]);

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "partial", label: "Partial" },
    { id: "paid", label: "Paid" },
    { id: "disputed", label: "Disputed" },
    { id: "expired", label: "Expired" },
    { id: "recurring", label: "Recurring" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
        <div>
          <Badge className="mb-3">Dashboard</Badge>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            My invoices
          </h1>
          <p className="mt-2 text-muted-foreground">
            Analytics, filters, and full settlement history on Arc.
          </p>
        </div>
        <div className="flex gap-2">
          {isConnected && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void refetch();
                void refetchStats();
              }}
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/create">
              <FilePlus2 className="size-3.5" />
              New
            </Link>
          </Button>
        </div>
      </div>

      {!isContractConfigured && (
        <div className="mb-6 rounded-xl border border-echo-warn/25 bg-echo-warn/10 p-4 text-sm text-echo-warn">
          Set <code className="font-mono">NEXT_PUBLIC_ECHOPAY_ADDRESS</code> after
          deploying the upgraded contract.
        </div>
      )}

      {!isConnected ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-16 text-center animate-fade-up">
          <Inbox className="size-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">Connect to view analytics & invoices</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Creator history and stats load from Arc Testnet.
            </p>
          </div>
          <ConnectWallet />
        </div>
      ) : !onArc ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-300">
          Switch to Arc Testnet to load invoices.
          <div className="mt-4 flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <Analytics stats={stats} isLoading={statsLoading} />

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search id, description, address…"
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground shrink-0" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-echo-cyan/40"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="amount-desc">Amount ↓</option>
                  <option value="amount-asc">Amount ↑</option>
                  <option value="remaining">Remaining ↓</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatus(f.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs transition-colors border",
                    status === f.id
                      ? "border-echo-cyan/40 bg-echo-cyan/15 text-echo-cyan"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-300">
                Failed to load invoices.{" "}
                <button className="underline" onClick={() => void refetch()}>
                  Retry
                </button>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <Inbox className="size-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No invoices yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first advanced invoice to get paid in USDC.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/create">Create invoice</Link>
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-muted-foreground">
                No invoices match your filters.
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Showing {filtered.length} of {invoices.length}
                </p>
                <div className="space-y-3">
                  {filtered.map((inv) => (
                    <InvoiceCard key={inv.id.toString()} invoice={inv} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
