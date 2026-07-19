import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-echo-cyan/15 text-echo-cyan",
        secondary: "border-white/10 bg-white/5 text-muted-foreground",
        success: "border-echo-success/30 bg-echo-success/10 text-echo-success",
        warn: "border-echo-warn/30 bg-echo-warn/10 text-echo-warn",
        outline: "border-white/15 text-foreground",
        destructive: "border-red-500/30 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
