"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { isAddress, decodeEventLog } from "viem";
import { Loader2, Plus, Sparkles, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { useCreateInvoice, useContractReady } from "@/hooks/use-echo-contract";
import { parseUsdcInput, formatUsdc } from "@/lib/format";
import { truncateAddress, copyToClipboard, cn } from "@/lib/utils";
import { echoPayAbi } from "@/lib/contracts/abi";
import { EXPLORER_TX, isContractConfigured } from "@/lib/contracts/config";
import { bpsToPercent } from "@/lib/contracts/types";

type SplitRow = { account: string; percent: string };

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { onArc } = useContractReady();
  const { createInvoice, isPending, hash, isSuccess } = useCreateInvoice();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineLocal, setDeadlineLocal] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState("30");
  const [splits, setSplits] = useState<SplitRow[]>([
    { account: "", percent: "100" },
  ]);
  const [useSelfPrimary, setUseSelfPrimary] = useState(true);

  useEffect(() => {
    if (useSelfPrimary && address) {
      setSplits((prev) => {
        const next = [...prev];
        next[0] = { ...next[0], account: address };
        return next;
      });
    }
  }, [useSelfPrimary, address]);

  const amountWei = useMemo(() => parseUsdcInput(amount), [amount]);
  const descLen = description.trim().length;

  const deadlineTs = useMemo(() => {
    if (!deadlineLocal) return 0n;
    const ms = new Date(deadlineLocal).getTime();
    if (Number.isNaN(ms) || ms <= Date.now()) return null;
    return BigInt(Math.floor(ms / 1000));
  }, [deadlineLocal]);

  const parsedSplits = useMemo(() => {
    const rows = splits.map((s) => {
      const pct = Number(s.percent);
      const bps = Math.round(pct * 100);
      return {
        account: s.account.trim() as `0x${string}`,
        bps,
        validAddr: isAddress(s.account.trim()),
        validBps: Number.isFinite(pct) && pct > 0 && bps > 0,
      };
    });
    const totalBps = rows.reduce((a, r) => a + r.bps, 0);
    return { rows, totalBps, ok: totalBps === 10_000 && rows.every((r) => r.validAddr && r.validBps) };
  }, [splits]);

  const intervalNum = Number(intervalDays);
  const intervalOk = !recurring || (Number.isInteger(intervalNum) && intervalNum >= 1 && intervalNum <= 365);

  const canSubmit =
    isConnected &&
    onArc &&
    isContractConfigured &&
    amountWei !== null &&
    amountWei > 0n &&
    descLen > 0 &&
    descLen <= 280 &&
    deadlineTs !== null &&
    parsedSplits.ok &&
    intervalOk &&
    !isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || amountWei === null || deadlineTs === null) return;

    try {
      await createInvoice({
        description: description.trim(),
        amount: amountWei,
        deadline: deadlineTs,
        splits: parsedSplits.rows.map((r) => ({
          account: r.account,
          bps: r.bps,
        })),
        recurring,
        intervalDays: recurring ? intervalNum : 0,
      });
      toast.success("Invoice submitted — confirming…");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (!/user rejected|denied/i.test(msg)) toast.error(msg.slice(0, 160));
    }
  };

  useSuccessNavigate(hash, isSuccess, router);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 animate-fade-up">
        <Badge className="mb-3">New invoice</Badge>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Create an advanced invoice
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Partials, multi-recipient splits, deadlines, and optional monthly-style
          renewals — all on Arc.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3 animate-fade-up">
          <CardHeader>
            <CardTitle>Invoice details</CardTitle>
            <CardDescription>
              Amounts are native USDC (18 decimals) on Arc Testnet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="flex flex-col items-start gap-4 py-6">
                <p className="text-sm text-muted-foreground">
                  Connect Rabby or MetaMask to create invoices.
                </p>
                <ConnectWallet />
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Recipients (split)</Label>
                    <button
                      type="button"
                      className="text-xs text-echo-cyan hover:underline"
                      onClick={() => setUseSelfPrimary((v) => !v)}
                    >
                      {useSelfPrimary ? "Edit primary address" : "Use my address"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {splits.map((row, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="0x…"
                          value={row.account}
                          disabled={i === 0 && useSelfPrimary}
                          onChange={(e) => {
                            if (i === 0) setUseSelfPrimary(false);
                            setSplits((prev) => {
                              const n = [...prev];
                              n[i] = { ...n[i], account: e.target.value };
                              return n;
                            });
                          }}
                          className="font-mono text-xs"
                        />
                        <Input
                          inputMode="decimal"
                          placeholder="%"
                          value={row.percent}
                          onChange={(e) =>
                            setSplits((prev) => {
                              const n = [...prev];
                              n[i] = { ...n[i], percent: e.target.value };
                              return n;
                            })
                          }
                          className="w-20"
                        />
                        {splits.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setSplits((prev) => prev.filter((_, j) => j !== i))
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={splits.length >= 8}
                      onClick={() =>
                        setSplits((prev) => [...prev, { account: "", percent: "0" }])
                      }
                    >
                      <Plus className="size-3.5" />
                      Add recipient
                    </Button>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        parsedSplits.totalBps === 10_000
                          ? "text-echo-success"
                          : "text-echo-warn",
                      )}
                    >
                      {parsedSplits.totalBps / 100}% / 100%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Total amount (USDC)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      inputMode="decimal"
                      placeholder="250.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-16 font-mono"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      USDC
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Payers may send partial amounts until the total is met.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        descLen > 280 ? "text-red-400" : "text-muted-foreground",
                      )}
                    >
                      {descLen}/280
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Monthly retainers — design + product"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={320}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (optional — auto-expires)</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadlineLocal}
                    onChange={(e) => setDeadlineLocal(e.target.value)}
                  />
                  {deadlineTs === null && deadlineLocal && (
                    <p className="text-xs text-red-400">Deadline must be in the future</p>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      className="size-4 rounded border-white/20 bg-transparent accent-cyan-400"
                    />
                    <div>
                      <p className="text-sm font-medium">Recurring invoice</p>
                      <p className="text-xs text-muted-foreground">
                        After full payment, renew after the interval for the next period.
                      </p>
                    </div>
                  </label>
                  {recurring && (
                    <div className="space-y-2 pl-7">
                      <Label htmlFor="interval">Interval (days)</Label>
                      <Input
                        id="interval"
                        inputMode="numeric"
                        value={intervalDays}
                        onChange={(e) => setIntervalDays(e.target.value)}
                        placeholder="30"
                      />
                      {!intervalOk && (
                        <p className="text-xs text-red-400">Use 1–365 days</p>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Create on Arc
                    </>
                  )}
                </Button>

                {hash && (
                  <a
                    href={EXPLORER_TX(hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-echo-cyan hover:underline"
                  >
                    View transaction <ExternalLink className="size-3" />
                  </a>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Live preview
          </p>
          <Card className="relative overflow-hidden border-echo-cyan/20">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-echo-cyan/10 blur-2xl" />
            <CardContent className="relative space-y-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">EchoPay Invoice</p>
                  <p className="mt-1 font-display text-lg font-semibold">Draft</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge>Pending</Badge>
                  {recurring && <Badge variant="secondary">Recurring</Badge>}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Total due</p>
                <p className="mt-1 font-display text-3xl font-semibold text-echo-cyan">
                  {amountWei !== null ? formatUsdc(amountWei) : "—"}
                  <span className="ml-1.5 text-base font-normal text-muted-foreground">
                    USDC
                  </span>
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-white/5 bg-black/20 p-4 text-sm">
                <p className="text-xs text-muted-foreground mb-2">Split recipients</p>
                {parsedSplits.rows.map((r, i) => (
                  <div key={i} className="flex justify-between gap-2 text-xs">
                    <span className="font-mono truncate">
                      {r.validAddr ? truncateAddress(r.account, 4) : "—"}
                    </span>
                    <span className="text-echo-cyan tabular-nums">
                      {bpsToPercent(r.bps)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <Row label="Description" value={description.trim() || "Your memo"} />
                <Row
                  label="Deadline"
                  value={
                    deadlineLocal && deadlineTs
                      ? new Date(deadlineLocal).toLocaleString()
                      : "None"
                  }
                />
                <Row
                  label="Recurring"
                  value={recurring ? `Every ${intervalDays || "—"} days` : "Off"}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground text-xs">{label}</span>
      <span className="text-right text-xs font-medium break-all">{value}</span>
    </div>
  );
}

function useSuccessNavigate(
  hash: `0x${string}` | undefined,
  isSuccess: boolean,
  router: ReturnType<typeof useRouter>,
) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!hash || !isSuccess || done) return;
    let cancelled = false;

    (async () => {
      try {
        const { createPublicClient, http } = await import("viem");
        const { arcTestnet, ARC_RPC_URL, ECHOPAY_ADDRESS } = await import(
          "@/lib/contracts/config"
        );
        const client = createPublicClient({
          chain: arcTestnet,
          transport: http(ARC_RPC_URL),
        });
        const receipt = await client.getTransactionReceipt({ hash });
        for (const log of receipt.logs) {
          if (log.address.toLowerCase() !== ECHOPAY_ADDRESS.toLowerCase()) continue;
          try {
            const decoded = decodeEventLog({
              abi: echoPayAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "InvoiceCreated") {
              const id = (decoded.args as { id: bigint }).id;
              if (cancelled) return;
              setDone(true);
              const path = `/pay/${id.toString()}`;
              toast.success("Invoice created!", {
                action: {
                  label: "Copy link",
                  onClick: () =>
                    void copyToClipboard(`${window.location.origin}${path}`),
                },
              });
              router.push(path);
              return;
            }
          } catch {
            /* skip */
          }
        }
        if (!cancelled) {
          setDone(true);
          router.push("/dashboard");
        }
      } catch {
        if (!cancelled) {
          setDone(true);
          router.push("/dashboard");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hash, isSuccess, done, router]);
}
