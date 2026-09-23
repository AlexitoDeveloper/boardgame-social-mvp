import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-[transform,color,background-color,border-color,box-shadow,opacity] duration-150 ease-out-custom focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-border/60 bg-transparent shadow-sm hover:bg-muted/50 hover:text-foreground",
        secondary:
          "bg-muted/90 text-foreground border border-border/50 shadow-xs hover:bg-muted hover:border-border",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        purple:
          "bg-purple-600 hover:bg-purple-700 text-white shadow-sm border border-purple-500/40",
        premium:
          "bg-gradient-to-r from-primary to-emerald-400 hover:from-primary/95 hover:to-emerald-500 text-white border border-primary/20 shadow-md shadow-primary/15",
      },
      size: {
        default: "h-11 px-4 py-2 text-sm",
        sm: "h-9 rounded-md px-3 text-xs",
        xs: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9 rounded-md",
        "icon-xs": "h-7 w-7 rounded-md",
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
