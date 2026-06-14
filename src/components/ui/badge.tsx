import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-muted/70 text-muted-foreground hover:bg-muted/90",
        "primary-soft":
          "bg-primary/10 text-primary border-primary/20",
        success:
          "bg-success/10 text-success border-success/20",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
        warning:
          "bg-amber-500/10 text-amber-500 border-amber-500/20",
        outline: "border-border/40 text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
}

function Badge({
  className,
  variant,
  pulse = false,
  ...props
}: BadgeProps) {
  return (<div className={cn(badgeVariants({ variant }), pulse && "animate-pulse", className)} {...props} />);
}

export { Badge, badgeVariants }

