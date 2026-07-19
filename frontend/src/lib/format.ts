import { formatUnits, parseUnits } from "viem";

/** Arc native USDC uses 18 decimals. */
export const USDC_DECIMALS = 18;

export function formatUsdc(value: bigint, maxFractionDigits = 4): string {
  const raw = formatUnits(value, USDC_DECIMALS);
  const num = Number(raw);
  if (!Number.isFinite(num)) return raw;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(num);
}

export function parseUsdcInput(input: string): bigint | null {
  const cleaned = input.trim().replace(/,/g, "");
  if (!cleaned || !/^\d+(\.\d+)?$/.test(cleaned)) return null;
  try {
    return parseUnits(cleaned, USDC_DECIMALS);
  } catch {
    return null;
  }
}

export function formatTimestamp(ts: bigint | number): string {
  const n = typeof ts === "bigint" ? Number(ts) : ts;
  if (!n) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(n * 1000));
}

export function formatRelative(ts: bigint | number): string {
  const n = typeof ts === "bigint" ? Number(ts) : ts;
  if (!n) return "—";
  const diff = Date.now() - n * 1000;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isExpired(deadline: bigint | number, paid: boolean): boolean {
  if (paid) return false;
  const d = typeof deadline === "bigint" ? Number(deadline) : deadline;
  if (!d) return false;
  return Date.now() / 1000 > d;
}
