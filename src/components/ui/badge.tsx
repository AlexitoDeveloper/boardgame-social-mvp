import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border font-black uppercase tracking-wider transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary:
          "border-border/40 bg-muted/90 text-foreground",
        "primary-soft":
          "bg-primary/10 text-primary border-primary/20",
        success:
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        "success-solid":
          "border-transparent bg-emerald-600 text-white shadow-xs",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
        "destructive-solid":
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        warning:
          "bg-amber-500/10 text-amber-500 border-amber-500/20",
        "warning-solid":
          "border-transparent bg-amber-500 text-white shadow-xs",
        purple:
          "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
        "purple-solid":
          "border-transparent bg-purple-600 text-white shadow-xs",
        outline: "border-border/40 text-foreground bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-md",
        default: "px-2.5 py-0.5 text-xs rounded-full",
        lg: "px-3 py-1 text-xs rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
  size,
  pulse = false,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), pulse && "animate-pulse", className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
