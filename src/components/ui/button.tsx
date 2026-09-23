import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display text-sm font-extrabold tracking-tight transition-[transform,color,background-color,border-color,box-shadow,opacity] duration-100 ease-out-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:translate-y-[1.5px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-foreground/20 shadow-[0_2.5px_0_0_hsl(var(--felt-emerald-depth)),0_4px_8px_-1px_rgba(0,0,0,0.2)] hover:brightness-105 active:shadow-[0_1px_0_0_hsl(var(--felt-emerald-depth)),0_2px_4px_-1px_rgba(0,0,0,0.15)]",
        destructive:
          "bg-destructive text-destructive-foreground border border-white/20 shadow-[0_2.5px_0_0_hsl(354,78%,35%),0_4px_8px_-1px_rgba(0,0,0,0.25)] hover:brightness-105 active:shadow-[0_1px_0_0_hsl(354,78%,35%)]",
        outline:
          "border border-border/80 bg-card/80 dark:bg-surface-elevated/40 backdrop-blur-sm text-foreground shadow-[0_2px_0_0_hsl(var(--keycap-shadow)),0_2px_4px_-1px_rgba(0,0,0,0.1)] hover:bg-surface-elevated hover:border-border active:shadow-[0_0.5px_0_0_hsl(var(--keycap-shadow))]",
        secondary:
          "bg-surface-elevated text-foreground border border-border shadow-[0_2px_0_0_hsl(var(--keycap-shadow)),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:bg-surface-plate active:shadow-[0_0.5px_0_0_hsl(var(--keycap-shadow))]",
        ghost:
          "text-foreground hover:bg-surface-elevated hover:text-foreground active:bg-surface-plate active:translate-y-[1px]",
        link:
          "text-primary underline-offset-4 hover:underline active:translate-y-0",
        recessed:
          "bg-surface-void text-muted-foreground border border-border/50 shadow-recessed hover:text-foreground active:bg-surface-ground",
        purple:
          "bg-purple-600 hover:bg-purple-700 text-white border border-purple-400/30 shadow-[0_2.5px_0_0_#581c87,0_4px_8px_-1px_rgba(0,0,0,0.2)] active:shadow-[0_1px_0_0_#581c87]",
        premium:
          "bg-gradient-to-r from-primary via-emerald-500 to-teal-400 hover:brightness-105 text-white border border-white/25 shadow-[0_3px_0_0_hsl(var(--felt-emerald-depth)),0_6px_14px_-2px_rgba(16,185,129,0.35)] active:shadow-[0_1px_0_0_hsl(var(--felt-emerald-depth))]",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm: "h-9 rounded-xl px-3.5 text-xs font-bold",
        xs: "h-7 rounded-lg px-2.5 text-[11px] font-bold",
        lg: "h-12 rounded-xl px-6 text-base font-black",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-xl",
        "icon-xs": "h-7 w-7 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon: Icon,
      label,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isIconButton = Icon && !label && !children
    const computedSize = size || (isIconButton ? "icon" : "default")
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size: computedSize, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? "true" : undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <Loader2 className="size-4 animate-fast-spin shrink-0" />
            ) : (
              Icon && <Icon className="size-4 shrink-0" />
            )}
            {label && <span>{label}</span>}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
