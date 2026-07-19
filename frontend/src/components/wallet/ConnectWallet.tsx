"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, truncateAddress, copyToClipboard } from "@/lib/utils";
import { formatUsdc } from "@/lib/format";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  EXPLORER_ADDRESS,
  arcTestnet,
} from "@/lib/contracts/config";
import { toast } from "sonner";

export function ConnectWallet({ className }: { className?: string }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="secondary" className={cn("min-w-[140px]", className)} disabled>
        <Loader2 className="animate-spin" />
        Loading
      </Button>
    );
  }

  const wrongNetwork = isConnected && chainId !== ARC_CHAIN_ID;

  if (!isConnected) {
    const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
    return (
      <Button
        className={className}
        disabled={isPending || isConnecting}
        onClick={() => {
          if (!injected) {
            toast.error("No wallet found. Install Rabby or MetaMask.");
            return;
          }
          connect(
            { connector: injected, chainId: ARC_CHAIN_ID },
            {
              onError: (err) => toast.error(err.message || "Connection failed"),
            },
          );
        }}
      >
        {isPending || isConnecting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Wallet />
        )}
        Connect Wallet
      </Button>
    );
  }

  if (wrongNetwork) {
    return (
      <Button
        variant="destructive"
        className={className}
        disabled={isSwitching}
        onClick={() =>
          switchChain(
            { chainId: ARC_CHAIN_ID },
            {
              onError: async () => {
                // Try to add the chain if switch fails
                try {
                  const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } }).ethereum;
                  await eth?.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
                        chainName: arcTestnet.name,
                        nativeCurrency: arcTestnet.nativeCurrency,
                        rpcUrls: [arcTestnet.rpcUrls.default.http[0]],
                        blockExplorerUrls: [ARC_EXPLORER_URL],
                      },
                    ],
                  });
                } catch {
                  toast.error("Could not switch to Arc Testnet");
                }
              },
            },
          )
        }
      >
        {isSwitching ? <Loader2 className="animate-spin" /> : null}
        Switch to Arc
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        className="gap-2 font-mono text-xs sm:text-sm"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-echo-success shadow-[0_0_8px_#34D399]" />
        {truncateAddress(address)}
        <ChevronDown className={cn("opacity-60 transition", open && "rotate-180")} />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-echo-deep/95 p-1 shadow-card backdrop-blur-xl animate-fade-up">
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Connected</span>
                <Badge variant="success">Arc Testnet</Badge>
              </div>
              <p className="font-mono text-sm break-all">{address}</p>
              {balance && (
                <p className="text-lg font-display font-semibold text-echo-cyan">
                  {formatUsdc(balance.value)} USDC
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    if (!address) return;
                    await copyToClipboard(address);
                    setCopied(true);
                    toast.success("Address copied");
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check /> : <Copy />}
                  Copy
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <a
                    href={EXPLORER_ADDRESS(address!)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                    Explorer
                  </a>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-red-400 hover:text-red-300"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
              >
                <LogOut />
                Disconnect
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
