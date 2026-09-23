import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: "sm" | "default"
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = "default", ...props }, ref) => {
  const isSm = size === "sm"
  return (
    <SwitchPrimitives.Root
      className={cn(
        "group peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border/80 bg-surface-void shadow-recessed transition-[background-color,border-color,box-shadow] duration-150 ease-out-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40",
        isSm ? "h-5 w-9 p-0.5" : "h-6.5 w-12 p-0.5",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary/80 data-[state=checked]:shadow-[0_0_12px_rgba(16,185,129,0.3)]",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none flex items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-150 ease-out-custom group-active:scale-x-110",
          isSm
            ? "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            : "h-5 w-5 data-[state=checked]:translate-x-5.5 data-[state=unchecked]:translate-x-0"
        )}
      >
        <span className="flex items-center gap-[1.5px] opacity-30" aria-hidden="true">
          <span className="w-[1px] h-2 bg-slate-900 rounded-full" />
          <span className="w-[1px] h-2 bg-slate-900 rounded-full" />
        </span>
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
