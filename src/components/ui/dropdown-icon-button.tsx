import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical } from "lucide-react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

export interface DropdownItem {
  label: React.ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export interface DropdownIconButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  icon?: React.ComponentType<{ className?: string }>
  items: DropdownItem[]
  menuClassName?: string
}

export function DropdownIconButton({
  icon: Icon = MoreVertical,
  items,
  variant = "outline",
  size = "sm",
  className,
  menuClassName,
  ...props
}: DropdownIconButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <Button
        variant={variant}
        size={size}
        className={cn("w-9 h-9 p-0 flex items-center justify-center cursor-pointer", className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        <Icon className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 mt-2 w-48 bg-card border border-border/60 rounded-2xl shadow-xl py-1.5 z-50 flex flex-col divide-y divide-border/20 text-left animate-none overflow-hidden",
              menuClassName
            )}
          >
            {items.map((item, index) => {
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    if (item.disabled) return
                    item.onClick(e)
                    setOpen(false)
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left cursor-pointer border-0 bg-transparent outline-none",
                    item.className
                  )}
                >
                  {item.icon && <div className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</div>}
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
