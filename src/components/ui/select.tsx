import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "bg-background/50 hover:bg-background/80 border border-border/50 rounded-xl pl-2.5 pr-7 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none h-8 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }
