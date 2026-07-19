import type { Metadata } from "next";
import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContractBanner } from "@/components/ContractBanner";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EchoPay — On-chain invoices in USDC",
    template: "%s · EchoPay",
  },
  description:
    "Create professional invoices on Arc Network. Receive payments in native USDC with one-click settlement — transparent, verifiable, on-chain.",
  keywords: ["EchoPay", "Arc Network", "USDC", "invoice", "Web3", "payments"],
  icons: {
    icon: [{ url: "/LOGO.jpeg", type: "image/jpeg" }],
    apple: "/LOGO.jpeg",
  },
  openGraph: {
    title: "EchoPay — On-chain invoices in USDC",
    description:
      "Professional invoices settled in native USDC on Arc Testnet.",
    type: "website",
    images: [{ url: "/LOGO.jpeg", width: 512, height: 512, alt: "EchoPay" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} font-sans flex min-h-screen flex-col`}
      >
        <Providers>
          <ContractBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
