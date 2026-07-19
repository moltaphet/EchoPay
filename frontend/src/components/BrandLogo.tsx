import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Pixel size of the logo mark (square). Default 36. */
  size?: number;
  /** Show "EchoPay" wordmark beside the mark. Default true. */
  showWordmark?: boolean;
  /** Wordmark text size class */
  wordmarkClassName?: string;
};

/**
 * EchoPay brand mark — uses public/LOGO.jpeg.
 */
export function BrandLogo({
  className,
  size = 36,
  showWordmark = true,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 shadow-[0_0_20px_-6px_rgba(34,211,238,0.35)] bg-echo-deep/80"
        style={{ width: size, height: size }}
      >
        <Image
          src="/LOGO.jpeg"
          alt="EchoPay"
          width={size}
          height={size}
          className="h-full w-full object-cover object-center"
          priority
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            wordmarkClassName,
          )}
        >
          Echo<span className="text-echo-cyan">Pay</span>
        </span>
      )}
    </span>
  );
}
