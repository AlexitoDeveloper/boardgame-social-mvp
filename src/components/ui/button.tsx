import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display text-sm font-extrabold tracking-tight transition-[transform,color,background-color,border-color,box-shadow,opacity] duration-100 ease-out-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:translate-y-[2.5px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-black border border-[#660D2E]/40 shadow-tactile-raspberry hover:bg-[#B01750] active:shadow-tactile-raspberry-active",
        raspberry:
          "bg-[#C51F5D] text-white font-black border border-[#660D2E]/40 shadow-tactile-raspberry hover:bg-[#B01750] active:shadow-tactile-raspberry-active",
        secondary:
          "bg-surface-elevated text-foreground border border-border shadow-[0_2px_0_0_hsl(var(--keycap-shadow)),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:bg-surface-plate active:shadow-[0_0.5px_0_0_hsl(var(--keycap-shadow))]",
        slatenavy:
          "bg-[#243447] text-white font-extrabold border border-[#141D26]/40 shadow-tactile-slatenavy hover:bg-[#1A2634] active:shadow-tactile-slatenavy-active",
        carbonink:
          "bg-[#141D26] text-[#E2E2D2] font-bold border border-black/30 shadow-tactile-carbonink hover:bg-[#0B1015] active:shadow-tactile-carbonink-active",
        alabaster:
          "bg-[#E2E2D2] text-[#141D26] font-black border border-[#141D26]/20 shadow-tactile-alabaster hover:bg-[#D5D5C3] active:shadow-tactile-alabaster-active",
        emerald:
          "bg-[#10B981] text-white font-black border border-[#064E3B]/40 shadow-tactile-emerald hover:bg-[#059669] active:shadow-tactile-emerald-active",
        azure:
          "bg-[#0284C7] text-white font-black border border-[#03456B]/40 shadow-tactile-azure hover:bg-[#0369A1] active:shadow-tactile-azure-active",
        amber:
          "bg-[#D97706] text-white font-black border border-[#78350F]/40 shadow-tactile-amber hover:bg-[#B45309] active:shadow-tactile-amber-active",
        premium:
          "bg-primary text-primary-foreground font-black border border-[#660D2E]/40 shadow-tactile-raspberry hover:bg-[#B01750] active:shadow-tactile-raspberry-active",
        destructive:
          "border border-border/80 bg-card dark:bg-surface-elevated/60 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-surface-plate hover:border-border shadow-[0_2px_0_0_hsl(var(--keycap-shadow))] active:shadow-[0_0.5px_0_0_hsl(var(--keycap-shadow))]",
        outline:
          "border border-border/90 bg-card dark:bg-surface-elevated/40 backdrop-blur-sm text-foreground shadow-[0_2px_0_0_hsl(var(--keycap-shadow)),0_2px_4px_-1px_rgba(0,0,0,0.1)] hover:bg-surface-elevated hover:border-border active:shadow-[0_0.5px_0_0_hsl(var(--keycap-shadow))]",
        ghost:
          "text-foreground hover:bg-surface-elevated hover:text-foreground active:bg-surface-plate active:translate-y-[1px]",
        link:
          "text-primary underline-offset-4 hover:underline active:translate-y-0",
        recessed:
          "bg-surface-void text-muted-foreground border border-border/50 shadow-recessed hover:text-foreground active:bg-surface-ground",
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
