import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-bold transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary",
        secondary:
          "border-border/30 bg-muted/70 text-muted-foreground hover:bg-muted/90",
        success:
          "border-success/25 bg-success/10 text-success",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive",
        warning:
          "border-amber-500/25 bg-amber-500/10 text-amber-500",
        outline:
          "border-border/40 text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  pulse?: boolean
}

function Tag({
  className,
  variant,
  pulse = false,
  ...props
}: TagProps) {
  return (
    <div
      className={cn(tagVariants({ variant }), pulse && "animate-pulse", className)}
      {...props}
    />
  )
}

export { Tag, tagVariants }
