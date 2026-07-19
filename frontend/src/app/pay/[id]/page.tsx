"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Flag,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { ProgressBar } from "@/components/invoice/ProgressBar";
import { PaymentQR } from "@/components/invoice/PaymentQR";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import {
  useInvoice,
  useSplits,
  useDisputeReason,
  usePayInvoice,
  useRaiseDispute,
  useResolveDispute,
  useRenewInvoice,
  useCancelRecurring,
  useContractReady,
} from "@/hooks/use-echo-contract";
import { formatUnits } from "viem";
import {
  formatUsdc,
  formatTimestamp,
  parseUsdcInput,
  USDC_DECIMALS,
} from "@/lib/format";
import {
  getInvoiceStatus,
  remainingOf,
  bpsToPercent,
} from "@/lib/contracts/types";
import { truncateAddress, copyToClipboard } from "@/lib/utils";
import {
  EXPLORER_TX,
  EXPLORER_ADDRESS,
  isContractConfigured,
} from "@/lib/contracts/config";

export default function PayPage({ params }: { params: { id: string } }) {
  const idStr = params.id;
  const id = (() => {
    try {
      return BigInt(idStr);
    } catch {
      return undefined;
    }
  })();

  const { address, isConnected } = useAccount();
  const { onArc } = useContractReady();
  const { invoice, isLoading, isError, refetch } = useInvoice(id);
  const { splits, refetch: refetchSplits } = useSplits(id);
  const { reason: disputeReason, refetch: refetchDispute } = useDisputeReason(id);
  const { payInvoice, isPending: paying, isSuccess: paidOk, hash: payHash } =
    usePayInvoice();
  const { raiseDispute, isPending: disputing } = useRaiseDispute();
  const { resolveDispute, isPending: resolving } = useResolveDispute();
  const { renewInvoice, isPending: renewing, isSuccess: renewed } = useRenewInvoice();
  const { cancelRecurring, isPending: cancelling } = useCancelRecurring();

  const [payAmount, setPayAmount] = useState("");
  const [disputeText, setDisputeText] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (paidOk || renewed) {
      toast.success(paidOk ? "Payment confirmed on Arc!" : "Renewal created");
      void refetch();
      void refetchSplits();
      void refetchDispute();
    }
  }, [paidOk, renewed, refetch, refetchSplits, refetchDispute]);

  useEffect(() => {
    if (!invoice) return;
    const rem = remainingOf(invoice);
    if (rem > 0n) setPayAmount(formatUnits(rem, USDC_DECIMALS));
  }, [invoice]);

  const payWei = useMemo(() => parseUsdcInput(payAmount), [payAmount]);

  if (!isContractConfigured) {
    return (
      <EmptyState
        title="Contract not configured"
        body="Deploy EchoPay and set NEXT_PUBLIC_ECHOPAY_ADDRESS."
      />
    );
  }

  if (id === undefined) {
    return <EmptyState title="Invalid invoice" body="Invoice id must be a number." />;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        body={`No invoice #${idStr} on the configured contract.`}
      />
    );
  }

  const status = getInvoiceStatus(invoice);
  const remaining = remainingOf(invoice);
  const isCreator = address?.toLowerCase() === invoice.creator.toLowerCase();
  const canPay =
    status !== "paid" &&
    status !== "expired" &&
    status !== "disputed" &&
    isConnected &&
    onArc &&
    payWei !== null &&
    payWei > 0n &&
    payWei <= remaining;

  const canDispute =
    isConnected &&
    !invoice.fullyPaid &&
    !invoice.disputed &&
    (isCreator ||
      (invoice.lastPayer !== "0x0000000000000000000000000000000000000000" &&
        address?.toLowerCase() === invoice.lastPayer.toLowerCase()));

  const canRenew =
    isCreator &&
    invoice.recurring &&
    invoice.fullyPaid &&
    !invoice.cancelled &&
    Number(invoice.nextRenewalAt) > 0 &&
    Date.now() / 1000 >= Number(invoice.nextRenewalAt);

  const onPay = async () => {
    if (payWei === null) return;
    try {
      await payInvoice(invoice.id, payWei);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      if (!/user rejected|denied/i.test(msg)) toast.error(msg.slice(0, 160));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-echo-cyan transition-colors"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        <Card className="relative overflow-hidden border-echo-cyan/15 animate-fade-up">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-echo-cyan/10 blur-3xl" />
          <CardHeader className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs text-muted-foreground">
                Invoice #{invoice.id.toString()}
              </p>
              <StatusBadge status={status} />
              {invoice.recurring && (
                <Badge variant="secondary" className="gap-1">
                  <RefreshCw className="size-3" />
                  every {invoice.intervalDays}d
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl leading-snug">{invoice.description}</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="rounded-2xl border border-white/5 bg-black/25 p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold text-echo-cyan">
                    {formatUsdc(invoice.amount)}
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      USDC
                    </span>
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-medium">{formatUsdc(invoice.amountPaid)} USDC</p>
                  <p className="text-muted-foreground mt-1">Remaining</p>
                  <p className="font-medium text-echo-warn">
                    {formatUsdc(remaining)} USDC
                  </p>
                </div>
              </div>
              <ProgressBar
                paid={invoice.amountPaid}
                total={invoice.amount}
                className="mt-4"
              />
            </div>

            {splits.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Split recipients
                </p>
                <div className="rounded-xl border border-white/5 divide-y divide-white/5">
                  {splits.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                    >
                      <a
                        href={EXPLORER_ADDRESS(s.account)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs hover:text-echo-cyan"
                      >
                        {truncateAddress(s.account, 5)}
                      </a>
                      <span className="text-echo-cyan tabular-nums">
                        {bpsToPercent(Number(s.bps))}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <Detail
                label="Creator"
                value={truncateAddress(invoice.creator, 6)}
                href={EXPLORER_ADDRESS(invoice.creator)}
              />
              <Detail label="Created" value={formatTimestamp(invoice.createdAt)} />
              <Detail
                label="Deadline"
                value={
                  invoice.deadline > 0n
                    ? formatTimestamp(invoice.deadline)
                    : "No deadline"
                }
              />
              {invoice.lastPayer !== "0x0000000000000000000000000000000000000000" && (
                <Detail
                  label="Last payer"
                  value={truncateAddress(invoice.lastPayer, 6)}
                  href={EXPLORER_ADDRESS(invoice.lastPayer)}
                />
              )}
              {invoice.fullyPaid && (
                <Detail label="Settled at" value={formatTimestamp(invoice.paidAt)} />
              )}
              {invoice.recurring && invoice.nextRenewalAt > 0n && !invoice.cancelled && (
                <Detail
                  label="Renew after"
                  value={formatTimestamp(invoice.nextRenewalAt)}
                />
              )}
            </div>

            {status === "paid" && (
              <Alert
                icon={CheckCircle2}
                tone="success"
                title="Settled on Arc"
                body="Full amount distributed to split recipients."
              />
            )}
            {status === "expired" && (
              <Alert
                icon={AlertCircle}
                tone="danger"
                title="Invoice expired"
                body="The deadline has passed. Further payments are blocked."
              />
            )}
            {status === "disputed" && (
              <Alert
                icon={Flag}
                tone="danger"
                title="Disputed"
                body={disputeReason || "This invoice is under dispute."}
              />
            )}

            {status !== "paid" && status !== "expired" && status !== "disputed" && (
              <div className="space-y-3">
                {!isConnected ? (
                  <div className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Connect to pay any amount up to the remaining balance
                    </p>
                    <ConnectWallet className="w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payAmt">Payment amount (USDC)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="payAmt"
                          inputMode="decimal"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="font-mono"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setPayAmount(formatUnits(remaining, USDC_DECIMALS))
                          }
                        >
                          Max
                        </Button>
                      </div>
                      {payWei !== null && payWei > remaining && (
                        <p className="text-xs text-red-400">
                          Exceeds remaining ({formatUsdc(remaining)} USDC)
                        </p>
                      )}
                    </div>
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!canPay || paying}
                      onClick={onPay}
                    >
                      {paying ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Paying…
                        </>
                      ) : (
                        <>Pay {payWei ? formatUsdc(payWei) : "—"} USDC</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Creator / dispute actions */}
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await copyToClipboard(window.location.href);
                  toast.success("Payment link copied");
                }}
              >
                <Copy className="size-3.5" />
                Copy link
              </Button>
              {payHash && (
                <Button variant="secondary" size="sm" asChild>
                  <a href={EXPLORER_TX(payHash)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Tx
                  </a>
                </Button>
              )}
              {canDispute && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDispute((v) => !v)}
                >
                  <Flag className="size-3.5" />
                  Dispute
                </Button>
              )}
              {isCreator && invoice.disputed && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={resolving}
                  onClick={async () => {
                    try {
                      await resolveDispute(invoice.id);
                      toast.success("Dispute resolved");
                      void refetch();
                      void refetchDispute();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message.slice(0, 120) : "Failed");
                    }
                  }}
                >
                  {resolving ? <Loader2 className="animate-spin" /> : <ShieldCheck className="size-3.5" />}
                  Resolve dispute
                </Button>
              )}
              {canRenew && (
                <Button
                  size="sm"
                  disabled={renewing}
                  onClick={async () => {
                    try {
                      await renewInvoice(invoice.id);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message.slice(0, 120) : "Failed");
                    }
                  }}
                >
                  {renewing ? <Loader2 className="animate-spin" /> : <RefreshCw className="size-3.5" />}
                  Renew period
                </Button>
              )}
              {isCreator && invoice.recurring && !invoice.cancelled && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cancelling}
                  onClick={async () => {
                    try {
                      await cancelRecurring(invoice.id);
                      toast.success("Recurring cancelled");
                      void refetch();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message.slice(0, 120) : "Failed");
                    }
                  }}
                >
                  Cancel recurring
                </Button>
              )}
            </div>

            {showDispute && (
              <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <Label htmlFor="dispute">Dispute reason</Label>
                <Textarea
                  id="dispute"
                  value={disputeText}
                  onChange={(e) => setDisputeText(e.target.value)}
                  placeholder="Describe the issue (max 200 chars)"
                  maxLength={200}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={disputing || disputeText.trim().length === 0}
                  onClick={async () => {
                    try {
                      await raiseDispute(invoice.id, disputeText.trim());
                      toast.success("Dispute raised");
                      setShowDispute(false);
                      void refetch();
                      void refetchDispute();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message.slice(0, 120) : "Failed");
                    }
                  }}
                >
                  {disputing ? <Loader2 className="animate-spin" /> : <Flag className="size-3.5" />}
                  Submit dispute
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "60ms" }}>
          {pageUrl && <PaymentQR url={pageUrl} />}
          <Card>
            <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed">
              Partial payments allowed. Funds route to split recipients on each
              payment. Expired or disputed invoices reject new payments.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs hover:text-echo-cyan transition-colors"
        >
          {value}
          <ExternalLink className="size-3 opacity-50" />
        </a>
      ) : (
        <span className="text-right text-sm font-medium">{value}</span>
      )}
    </div>
  );
}

function Alert({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: typeof CheckCircle2;
  tone: "success" | "danger";
  title: string;
  body: string;
}) {
  const cls =
    tone === "success"
      ? "border-echo-success/25 bg-echo-success/10 text-echo-success"
      : "border-red-500/25 bg-red-500/10 text-red-400";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${cls}`}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 opacity-80">{body}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-6" variant="secondary">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
