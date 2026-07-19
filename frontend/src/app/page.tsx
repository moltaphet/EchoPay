import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Zap,
  Wallet,
  Split,
  RefreshCw,
  Flag,
  BarChart3,
  QrCode,
  Clock,
  Layers,
  Link2,
  Eye,
  Check,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hero3D } from "@/components/hero/Hero3D";
import { AmbientField } from "@/components/atmosphere/AmbientField";
import { ScrollReveal } from "@/components/atmosphere/ScrollReveal";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { FaqSection } from "@/components/landing/FaqSection";

const features = [
  {
    icon: Clock,
    title: "Deadlines that auto-expire",
    body: "Optional due dates block late payments on-chain — no manual cleanup.",
  },
  {
    icon: Zap,
    title: "Partial payments",
    body: "Accept any amount up to the remaining balance. Progress is tracked live.",
  },
  {
    icon: Split,
    title: "Multi-recipient splits",
    body: "Divide every payment across up to 8 addresses by basis points.",
  },
  {
    icon: RefreshCw,
    title: "Recurring invoices",
    body: "Monthly-style series: settle, wait the interval, renew the next period.",
  },
  {
    icon: Flag,
    title: "Dispute system",
    body: "Flag issues to freeze payments; creators resolve and reopen when ready.",
  },
  {
    icon: BarChart3,
    title: "Dashboard analytics",
    body: "Total received, invoice mix, and status breakdown at a glance.",
  },
  {
    icon: QrCode,
    title: "QR payment links",
    body: "Share a scannable code so clients open /pay/{id} instantly.",
  },
  {
    icon: FileText,
    title: "Search & filters",
    body: "Find invoices by id, memo, or status — sort by amount or remaining.",
  },
];

const whyPoints = [
  {
    icon: Layers,
    title: "Native USDC settlement",
    body: "Arc uses USDC as gas. Payments settle in the same asset clients already hold — no token juggling.",
  },
  {
    icon: Eye,
    title: "Fully on-chain truth",
    body: "Amounts, payers, splits, and status live on Arc. Anyone can verify an invoice without trusting a database.",
  },
  {
    icon: Link2,
    title: "Shareable payment links",
    body: "Every invoice is a public /pay/{id} URL with QR. Clients pay in one click from Rabby or MetaMask.",
  },
  {
    icon: ShieldCheck,
    title: "Built for builders",
    body: "Partials, recurring renewals, and disputes are protocol features — not spreadsheets bolted on later.",
  },
];

const howSteps = [
  {
    n: "01",
    title: "Connect wallet",
    desc: "Add Arc Testnet, fund native USDC from Circle’s faucet, connect Rabby or MetaMask.",
  },
  {
    n: "02",
    title: "Create invoice",
    desc: "Set amount, recipients & splits, optional deadline, and recurring interval if needed.",
  },
  {
    n: "03",
    title: "Share the link",
    desc: "Send /pay/{id} or the QR code. Clients see status, remaining balance, and pay in-wallet.",
  },
  {
    n: "04",
    title: "Get paid on Arc",
    desc: "Funds route to split recipients automatically. Track everything in your dashboard.",
  },
];

const pricing = [
  {
    name: "Protocol",
    price: "Free",
    note: "On Arc Testnet",
    highlight: false,
    features: [
      "Unlimited invoice creation",
      "Partial & full payments",
      "Multi-recipient splits",
      "Deadlines & disputes",
      "Recurring renewals",
    ],
    cta: "Launch app",
    href: "/create",
  },
  {
    name: "Builder",
    price: "Gas only",
    note: "You pay Arc network fees",
    highlight: true,
    features: [
      "Everything in Protocol",
      "On-chain analytics views",
      "Shareable QR pay pages",
      "Contract verified on Arcscan",
      "Portfolio-ready demo flow",
    ],
    cta: "Open dashboard",
    href: "/dashboard",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <AmbientField className="opacity-70" />
        <div className="float-orb float-orb-a" />
        <div className="float-orb float-orb-b" />
        <div className="float-orb float-orb-c hidden sm:block" />
      </div>

      {/* ─── Hero ─── */}
      <section
        className="relative z-[2] w-full overflow-hidden"
        style={{ height: "100svh", minHeight: "680px" }}
      >
        <div className="hero-frame-aura" />
        <Hero3D />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#020617] via-[#020617]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44 bg-gradient-to-t from-[#020617] via-[#020617]/75 to-transparent" />

        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
          <div className="flex flex-1 flex-col items-center px-5 pt-28 text-center sm:pt-32 animate-fade-up">
            <Badge className="badge-alive mb-5 gap-2 border-echo-cyan/30 bg-[#020617]/70 px-3 py-1.5 text-[0.7rem] font-medium tracking-wide text-slate-200 backdrop-blur-md">
              <Image
                src="/LOGO.jpeg"
                alt=""
                width={18}
                height={18}
                className="rounded-md object-cover ring-1 ring-white/15"
              />
              Arc Network · Native USDC
            </Badge>

            <h1 className="hero-glow-title font-display max-w-4xl text-[2.35rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl md:text-[3.5rem] text-balance">
              Invoices that{" "}
              <span className="hero-glow-accent">echo on-chain</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-slate-300/90 sm:text-base text-balance drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)]">
              Create invoices and receive payments in native USDC on Arc.
              <br className="hidden sm:block" />
              <span className="sm:mt-1 sm:inline-block">
                Partial payments, splits, recurring invoices and QR checkout
                included.
              </span>
            </p>
          </div>

          <div className="pointer-events-auto flex flex-col items-center gap-4 px-5 pb-14 sm:pb-16 animate-fade-up">
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
              <Button asChild size="lg" className="btn-glow-primary min-w-[188px]">
                <Link href="/create">
                  Create invoice
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="btn-glow-secondary min-w-[188px]"
              >
                <Link href="#how-it-works">
                  How it works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why EchoPay ─── */}
      <section
        id="why"
        className="relative z-[2] scroll-mt-24 mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-28"
      >
        <div className="section-glow-line mb-16" />
        <ScrollReveal>
          <div className="mb-12 max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-echo-cyan/90">
              Why EchoPay
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Invoicing that matches how Arc actually works
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
              Not a Web2 bill with a wallet button bolted on — a protocol-native
              payment surface for stablecoin builders.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {whyPoints.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 50}>
              <Card className="card-alive group h-full">
                <CardContent className="flex gap-4 p-6 sm:p-7">
                  <div className="icon-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-echo-cyan/[0.08] ring-1 ring-echo-cyan/20">
                    <p.icon className="size-5 text-echo-cyan" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {p.body}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── Capabilities ─── */}
      <section
        id="features"
        className="relative z-[2] scroll-mt-24 mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20"
      >
        <ScrollReveal>
          <div className="mb-12 max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-echo-cyan/90">
              Capability set
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Everything a stablecoin merchant needs
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 35}>
              <Card className="card-alive group h-full">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="icon-glow flex h-11 w-11 items-center justify-center rounded-xl bg-echo-cyan/[0.08] ring-1 ring-echo-cyan/20 transition-all duration-300 group-hover:bg-echo-cyan/[0.12]">
                    <f.icon className="size-[1.125rem] text-echo-cyan" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-[0.9375rem] font-semibold tracking-tight text-white">
                      {f.title}
                    </h3>
                    <p className="text-[0.8125rem] leading-relaxed text-slate-400">
                      {f.body}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        id="how-it-works"
        className="relative z-[2] scroll-mt-24 mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20"
      >
        <ScrollReveal>
          <div className="premium-panel rounded-[1.75rem] p-8 sm:p-12">
            <div className="max-w-2xl">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-echo-cyan/90">
                How it works
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                From draft to paid in four steps
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
                No middleware accounts. No custodial balance. You and your client
                settle directly on Arc.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {howSteps.map((s, i) => (
                <ScrollReveal key={s.n} delay={60 + i * 50}>
                  <div className="step-card group h-full rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition-all duration-300 hover:border-echo-cyan/25">
                    <p className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] text-echo-cyan/80">
                      {s.n}
                    </p>
                    <p className="mt-3 font-display text-lg font-semibold tracking-tight text-white">
                      {s.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                      {s.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-10">
              <Button asChild className="btn-glow-primary">
                <Link href="/create">
                  Create your first invoice
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Dashboard preview ─── */}
      <section
        id="preview"
        className="relative z-[2] scroll-mt-24 mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20"
      >
        <ScrollReveal>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-echo-cyan/90">
                Product
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Dashboard that shows real status
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
                Track received USDC, open balances, and invoice health in one
                place. The preview below is static marketing UI — connect a
                wallet for live on-chain data.
              </p>
            </div>
            <Button asChild variant="secondary" className="btn-glow-secondary shrink-0">
              <Link href="/dashboard">
                <Wallet className="size-4" />
                Live dashboard
              </Link>
            </Button>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <DashboardPreview />
        </ScrollReveal>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        className="relative z-[2] scroll-mt-24 mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20"
      >
        <ScrollReveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-echo-cyan/90">
              Pricing
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Simple on testnet
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
              No platform subscription. You only spend native USDC gas on Arc
              when you write to the contract.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          {pricing.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 70}>
              <Card
                className={
                  plan.highlight
                    ? "card-alive relative h-full border-echo-cyan/35 shadow-[0_0_40px_-16px_rgba(34,211,238,0.35)]"
                    : "card-alive h-full"
                }
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 border-echo-cyan/40 bg-echo-cyan/15 px-3 text-[0.65rem] text-echo-cyan">
                      <Sparkles className="size-3" />
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardContent className="flex h-full flex-col p-6 pt-8 sm:p-7">
                  <p className="text-sm font-medium text-slate-400">{plan.name}</p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                    {plan.price}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{plan.note}</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-slate-300"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-echo-cyan" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={
                      plan.highlight
                        ? "btn-glow-primary mt-8 w-full"
                        : "btn-glow-secondary mt-8 w-full"
                    }
                    variant={plan.highlight ? "default" : "secondary"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section
        id="faq"
        className="relative z-[2] scroll-mt-24 mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20"
      >
        <ScrollReveal>
          <div className="mb-10 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-echo-cyan/90">
              FAQ
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Common questions
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <FaqSection />
        </ScrollReveal>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative z-[2] mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-6">
        <ScrollReveal>
          <Card className="card-alive overflow-hidden border-echo-cyan/25">
            <CardContent className="relative flex flex-col items-start gap-8 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-11">
              <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-echo-cyan/12 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/12 blur-3xl" />
              <div className="relative max-w-lg space-y-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-echo-cyan/80">
                  Get started
                </p>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                  Ship your Arc portfolio piece
                </h2>
                <p className="text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
                  Connect on Arc Testnet, create an invoice, and share a payment
                  link in under a minute.
                </p>
              </div>
              <Button asChild size="lg" className="btn-glow-primary relative shrink-0">
                <Link href="/create">
                  Start creating
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>
    </div>
  );
}
