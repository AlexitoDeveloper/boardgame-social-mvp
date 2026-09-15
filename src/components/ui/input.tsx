import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl border bg-background/30 px-3.5 py-2 shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 text-xs px-3 rounded-lg",
        default: "h-11 text-sm px-3.5 rounded-xl",
        lg: "h-12 text-base px-4 rounded-xl",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive/25 focus-visible:border-destructive text-destructive",
        false: "border-border/40 focus-visible:ring-primary/25 focus-visible:border-primary focus-visible:bg-background/50",
      },
    },
    defaultVariants: {
      size: "default",
      error: false,
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, error, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
