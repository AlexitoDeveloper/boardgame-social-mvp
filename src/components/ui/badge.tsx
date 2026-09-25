import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border font-extrabold transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground font-black shadow-xs shadow-primary/20",
        // 8BEES Physical Core Palette
        raspberry:
          "border-transparent bg-[#C51F5D] text-white font-black shadow-tactile-raspberry",
        "sticker-raspberry":
          "bg-card text-[#C51F5D] dark:text-[#FF4A8D] border-l-4 border-l-[#C51F5D] border-t border-r border-b border-border shadow-xs px-2 py-0.5",
        slatenavy:
          "border-transparent bg-[#243447] text-white font-extrabold shadow-tactile-slatenavy",
        "sticker-slatenavy":
          "bg-card text-[#243447] dark:text-[#67B5E6] border-l-4 border-l-[#243447] border-t border-r border-b border-border shadow-xs px-2 py-0.5",
        carbonink:
          "border-transparent bg-[#141D26] text-[#E2E2D2] font-extrabold shadow-tactile-carbonink",
        alabaster:
          "border-transparent bg-[#E2E2D2] text-[#141D26] font-black border border-[#141D26]/20 shadow-xs",
        emerald:
          "border-transparent bg-[#10B981] text-white font-black shadow-tactile-emerald",
        "tag-emerald":
          "bg-[#10B981]/12 text-[#065F46] dark:text-[#34D399] border border-[#10B981]/30 font-extrabold px-2.5 py-0.5 rounded-md text-xs",
        "sticker-emerald":
          "bg-[#10B981]/12 text-[#047857] dark:text-[#34D399] border-l-4 border-l-[#10B981] border-t border-r border-b border-[#10B981]/25 shadow-xs px-2 py-0.5",
        azure:
          "border-transparent bg-[#0284C7] text-white font-black shadow-tactile-azure",
        "tag-azure":
          "bg-[#0284C7]/12 text-[#0369A1] dark:text-[#38BDF8] border border-[#0284C7]/30 font-extrabold px-2.5 py-0.5 rounded-md text-xs",
        "sticker-azure":
          "bg-card text-[#0369A1] dark:text-[#38BDF8] border-l-4 border-l-[#0284C7] border-t border-r border-b border-border shadow-xs px-2 py-0.5",
        amber:
          "border-transparent bg-[#D97706] text-white font-extrabold shadow-tactile-amber",
        "tag-amber":
          "bg-[#D97706]/12 text-[#B45309] dark:text-[#FBBF24] border border-[#D97706]/30 font-extrabold px-2.5 py-0.5 rounded-md text-xs",
        "sticker-amber":
          "bg-card text-[#B45309] dark:text-[#FBBF24] border-l-4 border-l-[#D97706] border-t border-r border-b border-border shadow-xs px-2 py-0.5",
        secondary:
          "border-border/60 bg-surface-elevated text-foreground shadow-xs",
        "primary-soft":
          "bg-primary/10 text-primary dark:text-[#FF80B0] border border-primary/25 font-bold",
        outline:
          "border-border/60 text-foreground bg-transparent",
        chit:
          "border-border/80 bg-surface-elevated text-foreground shadow-subpixel-rim",
        destructive:
          "border border-border/80 bg-card text-muted-foreground shadow-xs",
        success:
          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25",
        warning:
          "bg-amber-500/10 text-amber-500 border border-amber-500/25",
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
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      },
      shape: {
        chit: "rounded-md",
        pill: "rounded-full",
        chamfer: "card-chamfer rounded-none",
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
