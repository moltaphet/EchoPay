"use client";

import { AlertTriangle } from "lucide-react";
import { isContractConfigured } from "@/lib/contracts/config";

export function ContractBanner() {
  if (isContractConfigured) return null;

  return (
    <div className="border-b border-echo-warn/20 bg-echo-warn/10 px-4 py-2.5 text-center text-sm text-echo-warn">
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        Contract not configured. Deploy EchoPay and set{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_ECHOPAY_ADDRESS
        </code>{" "}
        in your environment.
      </span>
    </div>
  );
}
