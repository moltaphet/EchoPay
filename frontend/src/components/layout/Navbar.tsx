"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const appLinks = [
  { href: "/create", label: "Create" },
  { href: "/dashboard", label: "Dashboard" },
];

const homeAnchors = [
  { href: "/#why", label: "Why" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHome = pathname === "/";

  const links = onHome
    ? [...homeAnchors, ...appLinks]
    : appLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020617]/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#020617]/65">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group transition-opacity duration-300 hover:opacity-90"
          aria-label="EchoPay home"
        >
          <BrandLogo size={38} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => {
            const active =
              !l.href.includes("#") &&
              (pathname === l.href || pathname.startsWith(l.href + "/"));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-[0.8125rem] font-medium tracking-wide transition-all duration-300",
                  active
                    ? "bg-white/[0.06] text-echo-cyan shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ConnectWallet />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-echo-deep/98 px-4 py-4 lg:hidden animate-fade-up">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === l.href
                    ? "bg-white/[0.06] text-echo-cyan"
                    : "text-slate-400",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 sm:hidden">
            <ConnectWallet className="w-full" />
          </div>
        </div>
      )}
    </header>
  );
}
