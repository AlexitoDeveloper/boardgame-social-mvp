import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-bold transition-[transform,color,background-color,border-color,box-shadow] duration-100 ease-out-custom select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default:
          "border border-border/70 bg-surface-elevated/70 text-muted-foreground hover:bg-surface-elevated hover:text-foreground hover:border-border data-[selected=true]:bg-primary/15 data-[selected=true]:text-primary data-[selected=true]:border-primary/40 data-[selected=true]:shadow-xs",
        primary:
          "border border-border/70 bg-surface-elevated/70 text-muted-foreground hover:bg-surface-elevated hover:text-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:border-primary-foreground/20 data-[selected=true]:shadow-[0_2px_0_0_hsl(var(--felt-emerald-depth)),0_3px_6px_-1px_rgba(0,0,0,0.2)]",
        emerald:
          "border border-border/70 bg-surface-elevated/70 text-muted-foreground hover:bg-surface-elevated hover:text-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:border-primary-foreground/20 data-[selected=true]:shadow-[0_2px_0_0_hsl(var(--felt-emerald-depth)),0_3px_6px_-1px_rgba(0,0,0,0.2)]",
        purple:
          "border border-border/70 bg-surface-elevated/70 text-muted-foreground hover:bg-surface-elevated hover:text-foreground data-[selected=true]:bg-purple-500/15 data-[selected=true]:text-purple-700 dark:data-[selected=true]:text-purple-300 data-[selected=true]:border-purple-500/40 data-[selected=true]:shadow-xs",
        chit:
          "border border-border/80 bg-surface-elevated text-foreground hover:bg-surface-plate data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:border-primary-foreground/20 data-[selected=true]:shadow-[0_2px_0_0_hsl(var(--felt-emerald-depth))]",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-lg [&_svg]:size-3",
        sm: "h-8 px-2.5 text-xs rounded-lg [&_svg]:size-3.5",
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
  meepleColor?: "red" | "blue" | "yellow" | "green" | "purple" | "orange"
}

const meepleDotMap = {
  red: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
  blue: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]",
  yellow: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]",
  green: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
  purple: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]",
  orange: "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]",
} as const

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
      meepleColor,
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
        {meepleColor && (
          <span
            className={cn("size-2 rounded-full shrink-0", meepleDotMap[meepleColor])}
            aria-hidden="true"
          />
        )}
        {Icon && <Icon className="shrink-0" />}
        {children}
        {badge && <span className="shrink-0">{badge}</span>}
      </Comp>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants, Chip as FilterChip }
