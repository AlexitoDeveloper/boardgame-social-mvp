import * as React from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface StepItem {
  id: number | string
  title: string
  shortTitle?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface StepperProps {
  steps: StepItem[]
  activeStep: number | string
  onStepClick?: (stepId: number | string) => void
  className?: string
}

const gridColsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

export function Stepper({
  steps,
  activeStep,
  onStepClick,
  className,
}: StepperProps) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep)
  const colsClass = gridColsMap[steps.length] || 'grid-cols-3'

  return (
    <nav
      aria-label="Progreso del formulario"
      className={cn("w-full select-none", className)}
    >
      <ol className={cn("grid gap-2 sm:gap-2.5 items-stretch", colsClass)}>
        {steps.map((step, index) => {
          const isActive = step.id === activeStep
          const isCompleted = activeIndex > index
          const isClickable = Boolean(onStepClick && !step.disabled)
          const Icon = step.icon

          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'step' : undefined}
                disabled={step.disabled || !onStepClick}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={cn(
                  "w-full h-full min-h-[44px] flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-xs transition-all duration-150 text-left relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isClickable ? "cursor-pointer active:translate-y-[1px]" : "cursor-default",
                  isActive
                    ? "border-primary/50 bg-primary/10 text-foreground dark:text-white font-black shadow-tactile-sm ring-1 ring-primary/25"
                    : isCompleted
                    ? "border-border/80 bg-surface-elevated/80 text-foreground font-bold shadow-tactile-sm hover:bg-surface-elevated hover:border-border"
                    : "border-border/30 bg-surface-void/50 text-muted-foreground/60 hover:text-muted-foreground hover:bg-surface-void/80"
                )}
              >
                {/* Active ambient indicator */}
                {isActive && (
                  <motion.div
                    layoutId="stepper-active-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl pointer-events-none -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Tactile Keycap Badge */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground font-black shadow-tactile-raspberry scale-105"
                      : isCompleted
                      ? "bg-[#10B981] text-white font-black shadow-tactile-emerald"
                      : "bg-surface-void text-muted-foreground border border-border/60 font-bold"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : Icon ? (
                    <Icon className="w-3 h-3" />
                  ) : (
                    <span className="font-mono-tabular font-black">{index + 1}</span>
                  )}
                </div>

                {/* Step Labels */}
                <div className="min-w-0 flex-1">
                  <span className={cn(
                    "block truncate text-xs leading-tight",
                    isActive ? "font-black text-foreground dark:text-white" : isCompleted ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                  )}>
                    {step.shortTitle && (
                      <span className="sm:hidden">{step.shortTitle}</span>
                    )}
                    <span className={cn(step.shortTitle ? "hidden sm:inline" : "inline")}>
                      {step.title}
                    </span>
                  </span>
                  {step.description && (
                    <span className={cn(
                      "hidden md:block truncate text-[10px] mt-0.5",
                      isActive ? "text-foreground/80 dark:text-white/80 font-bold" : "text-muted-foreground font-medium"
                    )}>
                      {step.description}
                    </span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
