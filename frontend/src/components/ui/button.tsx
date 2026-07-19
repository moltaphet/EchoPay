import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-echo-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-echo-void disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-echo-cyan via-sky-400 to-echo-blue text-echo-void shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_0_28px_-6px_rgba(34,211,238,0.55),0_10px_28px_-12px_rgba(0,0,0,0.55)] hover:shadow-[0_0_0_1px_rgba(34,211,238,0.4),0_0_40px_-4px_rgba(34,211,238,0.7),0_12px_32px_-10px_rgba(0,0,0,0.5)] hover:brightness-110",
        secondary:
          "border border-white/[0.12] bg-white/[0.04] text-foreground backdrop-blur-sm hover:border-echo-cyan/30 hover:bg-white/[0.08] hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)]",
        outline:
          "border border-echo-cyan/40 bg-echo-cyan/[0.04] text-echo-cyan hover:bg-echo-cyan/12 hover:border-echo-cyan/60 hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.4)]",
        ghost:
          "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        destructive:
          "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400/40",
        link: "text-echo-cyan underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-[0.95rem] tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
