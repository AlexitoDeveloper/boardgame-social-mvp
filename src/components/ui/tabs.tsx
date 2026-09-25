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
  hideLabelsOnMobile?: boolean;
  scrollable?: boolean;
}

export function Tabs<T extends string>({
  options,
  activeTab,
  onChange,
  className,
  hideLabelsOnMobile = false,
  scrollable = false,
}: TabsProps<T>) {
  const layoutId = `tabs-pill-${options.map(o => o.id).join('-')}`

  return (
    <div
      role="tablist"
      className={cn(
        "bg-muted/40 p-1.5 rounded-2xl border border-border/20 flex gap-1.5 select-none relative z-10",
        scrollable ? "w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" : "w-full",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = activeTab === opt.id
        const Icon = opt.icon
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.id)}
            className={cn(
              scrollable ? "flex-1 shrink-0 px-3.5 min-w-max h-9 sm:h-10" : "flex-1 h-9 sm:h-10",
              "rounded-xl text-xs font-bold relative transition-colors duration-150 ease-out-custom active:scale-[0.98] flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 cursor-pointer select-none whitespace-nowrap",
              isActive ? "text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-primary rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span className={cn(hideLabelsOnMobile && !scrollable && Icon ? "hidden min-[440px]:inline" : "")}>{opt.label}</span>
              {opt.count !== undefined && (
                <span className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-xs font-black leading-none shrink-0 border",
                  isActive ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : "bg-muted text-muted-foreground border-border/40"
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
