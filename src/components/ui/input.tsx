import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl border bg-surface-void/80 border-border/70 text-foreground px-3.5 py-2 shadow-recessed transition-[border-color,box-shadow,background-color] duration-120 ease-out-custom file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground placeholder:text-muted-foreground/75 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      size: {
        sm: "h-9 text-xs px-3 rounded-lg",
        default: "h-11 text-sm px-3.5 rounded-xl",
        lg: "h-12 text-base px-4 rounded-xl",
      },
      error: {
        true: "border-destructive text-destructive placeholder:text-destructive/50 focus-visible:ring-destructive/30 focus-visible:border-destructive",
        false: "focus-visible:ring-primary/25 focus-visible:border-primary focus-visible:bg-surface-void",
      },
      variant: {
        default: "",
        tabular: "font-mono-tabular tracking-tight",
      },
    },
    defaultVariants: {
      size: "default",
      error: false,
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  tabular?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, error = false, variant, tabular = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({
            size,
            error,
            variant: tabular ? "tabular" : variant,
          }),
          tabular && "font-mono-tabular tracking-tight",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
