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
  onStepClick?: (stepId: any) => void
  className?: string
}

export function Stepper({
  steps,
  activeStep,
  onStepClick,
  className,
}: StepperProps) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep)

  return (
    <nav
      aria-label="Progreso del formulario"
      className={cn("w-full select-none", className)}
    >
      <ol className="grid grid-cols-3 gap-1.5 sm:gap-2.5 items-center">
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
                  "w-full flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 text-left relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  isClickable ? "cursor-pointer active:scale-[0.98]" : "cursor-default",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
                    : isCompleted
                    ? "border-border/60 bg-muted/30 text-foreground/80 hover:bg-muted/50"
                    : "border-border/30 bg-muted/10 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20"
                )}
              >
                {/* Active ambient glow pill */}
                {isActive && (
                  <motion.div
                    layoutId="stepper-active-indicator"
                    className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Step Circle Badge */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-2 ring-primary/25 scale-105"
                      : isCompleted
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border/40"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : Icon ? (
                    <Icon className="w-3 h-3" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Labels */}
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-xs">
                    {step.shortTitle && (
                      <span className="sm:hidden">{step.shortTitle}</span>
                    )}
                    <span className={cn(step.shortTitle ? "hidden sm:inline" : "inline")}>
                      {step.title}
                    </span>
                  </span>
                  {step.description && (
                    <span className="hidden md:block truncate text-[10px] text-muted-foreground font-medium mt-0.5">
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
