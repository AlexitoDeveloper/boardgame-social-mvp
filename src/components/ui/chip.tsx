import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-bold transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        // Unified Purple / Violet Accent (high contrast, distinct from primary green CTAs, perfectly legible on dark navy background)
        default:
          "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[selected=true]:bg-purple-500/15 data-[selected=true]:text-purple-700 dark:data-[selected=true]:text-purple-300 data-[selected=true]:border-purple-500/40 data-[selected=true]:shadow-xs",
        primary:
          "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[selected=true]:bg-primary/15 data-[selected=true]:text-primary data-[selected=true]:border-primary/35 data-[selected=true]:shadow-xs",
        emerald:
          "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[selected=true]:bg-primary/15 data-[selected=true]:text-primary data-[selected=true]:border-primary/35 data-[selected=true]:shadow-xs",
        purple:
          "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground data-[selected=true]:bg-purple-500/15 data-[selected=true]:text-purple-700 dark:data-[selected=true]:text-purple-300 data-[selected=true]:border-purple-500/40 data-[selected=true]:shadow-xs",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-lg [&_svg]:size-3",
        sm: "h-8 px-2.5 text-xs rounded-xl [&_svg]:size-3.5",
        default: "h-9 px-3.5 text-xs rounded-xl [&_svg]:size-3.5",
        lg: "h-10 px-4 text-sm rounded-xl [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  selected?: boolean
  asChild?: boolean
  icon?: React.ComponentType<{ className?: string }>
  badge?: React.ReactNode
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      className,
      variant,
      size,
      selected = false,
      asChild = false,
      icon: Icon,
      badge,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        type={type}
        ref={ref}
        data-selected={selected ? "true" : undefined}
        aria-pressed={selected}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        {Icon && <Icon className="shrink-0" />}
        {children}
        {badge && <span className="shrink-0">{badge}</span>}
      </Comp>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants, Chip as FilterChip }
