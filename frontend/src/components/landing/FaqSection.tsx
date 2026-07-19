"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What network does EchoPay run on?",
    a: "EchoPay is built for Arc Testnet (chain ID 5042002). Gas and payments use native USDC — no separate ERC-20 approvals for settlement.",
  },
  {
    q: "Can clients pay partially?",
    a: "Yes. Payers can send any amount up to the remaining balance. Progress is tracked on-chain until the invoice is fully settled.",
  },
  {
    q: "How do multi-recipient splits work?",
    a: "When you create an invoice you assign basis-point shares (must total 100%). Each payment is distributed automatically to those addresses.",
  },
  {
    q: "What happens if a deadline passes?",
    a: "Unpaid invoices with a deadline stop accepting payments after expiry. Fully paid invoices stay settled; recurring renewals are separate.",
  },
  {
    q: "Who can open a dispute?",
    a: "The invoice creator or the last payer can flag a dispute, which freezes further payments until the creator resolves it.",
  },
  {
    q: "Is EchoPay free on testnet?",
    a: "The protocol does not charge platform fees on testnet. You only pay Arc gas in native USDC for create, pay, renew, and dispute transactions.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              "rounded-2xl border transition-all duration-300",
              isOpen
                ? "border-echo-cyan/25 bg-white/[0.04]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/10",
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-display text-sm font-semibold tracking-tight text-white sm:text-[0.9375rem]">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-echo-cyan transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
