import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TabOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  options,
  activeTab,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div className={cn("bg-muted/40 p-1.5 rounded-2xl border border-border/20 flex gap-1.5 w-full select-none relative z-10", className)}>
      {options.map((opt) => {
        const isActive = activeTab === opt.id
        const Icon = opt.icon
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-black relative transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer",
              isActive ? "text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tabs-pill"
                className="absolute inset-0 bg-primary rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {opt.label}
              {opt.count !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[9px] font-bold border border-current",
                  isActive ? "bg-primary-foreground/15 border-transparent" : "bg-muted text-muted-foreground border-border/40"
                )}>
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
