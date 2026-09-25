import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl transition-[transform,box-shadow,border-color,background-color] duration-150 ease-out-custom text-card-foreground",
  {
    variants: {
      variant: {
        default:
          "border border-border/80 bg-card shadow-xs",
        glass:
          "glass-panel bg-card/90 backdrop-blur-md border border-border/80 shadow-md",
        interactive:
          "border border-border/80 bg-card hover:border-primary/50 hover:shadow-tactile-sm active:translate-y-[1px] cursor-pointer shadow-xs",
        flat:
          "border border-border/30 bg-surface-elevated/40 shadow-none",
        notch:
          "card-notch border border-border/80 bg-card shadow-xs hover:border-primary/50 transition-colors",
        chamfer:
          "card-chamfer rounded-none border border-border/80 bg-card shadow-punchboard hover:border-primary/50 transition-all",
        punchboard:
          "border-2 border-border/90 bg-card shadow-punchboard hover:border-primary/60 transition-all relative overflow-hidden",
        neoprene:
          "border border-white/[0.08] bg-surface-void shadow-subpixel-rim text-foreground",
        elevated:
          "border border-border bg-surface-elevated shadow-[0_2px_0_0_hsl(var(--keycap-shadow)),0_4px_8px_-1px_rgba(0,0,0,0.15)]",
        foil:
          "border border-white/20 bg-gradient-to-b from-card to-card/90 shadow-subpixel-rim text-card-foreground",
        gradient:
          "border border-border/80 bg-card shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  spotlight?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, spotlight = false, onMouseMove, ...props }, ref) => {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (spotlight) {
        const rect = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
      }
      onMouseMove?.(e)
    }

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={cn(
          cardVariants({ variant }),
          spotlight && "spotlight-card",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
