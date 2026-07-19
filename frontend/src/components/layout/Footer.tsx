import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  ARC_EXPLORER_URL,
  ARC_FAUCET_URL,
  EXPLORER_CONTRACT,
  isContractConfigured,
} from "@/lib/contracts/config";

const productLinks = [
  { href: "/#why", label: "Why EchoPay" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const appLinks = [
  { href: "/create", label: "Create invoice" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#preview", label: "Dashboard preview" },
];

const resourceLinks = [
  { href: ARC_EXPLORER_URL, label: "Arcscan", external: true },
  { href: ARC_FAUCET_URL, label: "USDC Faucet", external: true },
  ...(isContractConfigured
    ? [{ href: EXPLORER_CONTRACT, label: "Contract", external: true }]
    : []),
];

export function Footer() {
  return (
    <footer className="relative z-[2] mt-auto border-t border-white/[0.06] bg-gradient-to-b from-transparent via-echo-void/40 to-echo-void">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo size={32} wordmarkClassName="text-base" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Professional on-chain invoices settled in native USDC on Arc
              Network. Transparent, verifiable, production-ready.
            </p>
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Product
            </p>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 transition-colors hover:text-echo-cyan"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              App
            </p>
            <ul className="mt-4 space-y-2.5">
              {appLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 transition-colors hover:text-echo-cyan"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-echo-cyan"
                  >
                    {l.label}
                    <ExternalLink className="size-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} EchoPay · Built for Arc Testnet
          </p>
          <p className="font-mono text-[0.65rem] tracking-wide text-slate-600">
            Chain ID 5042002 · Native USDC
          </p>
        </div>
      </div>
    </footer>
  );
}
