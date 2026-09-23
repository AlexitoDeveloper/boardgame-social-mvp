import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border font-black uppercase tracking-wider transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs shadow-primary/20",
        secondary:
          "border-border/60 bg-surface-elevated text-foreground shadow-xs",
        "primary-soft":
          "bg-primary/10 text-primary border-primary/25",
        success:
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
        "success-solid":
          "border-transparent bg-emerald-600 text-white shadow-xs",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/25",
        "destructive-solid":
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        warning:
          "bg-amber-500/10 text-amber-500 border-amber-500/25",
        "warning-solid":
          "border-transparent bg-amber-500 text-slate-950 shadow-xs",
        purple:
          "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
        "purple-solid":
          "border-transparent bg-purple-600 text-white shadow-xs",
        outline:
          "border-border/60 text-foreground bg-transparent",
        chit:
          "border-border/80 bg-surface-elevated text-foreground shadow-subpixel-rim",
        // Semantic Meeple Player Badges
        "meeple-red":
          "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        "meeple-blue":
          "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        "meeple-yellow":
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        "meeple-green":
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        "meeple-purple":
          "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        "meeple-orange":
          "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      },
      shape: {
        chit: "rounded-lg",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "chit",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
  tabular?: boolean
}

function Badge({
  className,
  variant,
  size,
  shape,
  pulse = false,
  tabular = false,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size, shape }),
        pulse && "animate-pulse",
        tabular && "font-mono-tabular tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
