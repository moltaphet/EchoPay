import { cn } from "@/lib/utils";

export function ProgressBar({
  paid,
  total,
  className,
}: {
  paid: bigint;
  total: bigint;
  className?: string;
}) {
  const pct =
    total === 0n
      ? 0
      : Math.min(100, Number((paid * 10_000n) / total) / 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-echo-cyan to-echo-blue transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground tabular-nums">
        {pct.toFixed(1)}% funded
      </p>
    </div>
  );
}
