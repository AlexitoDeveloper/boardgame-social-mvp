import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export type ToastType = 'success' | 'error' | 'info' | 'default'

export interface ToastItem {
  id: string
  type: ToastType
  message: React.ReactNode
  description?: React.ReactNode
  duration?: number
}

export interface ToastOptions {
  description?: React.ReactNode
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

let toastsState: ToastItem[] = []
const listeners = new Set<ToastListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastsState]))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const toast = {
  show(type: ToastType, message: React.ReactNode, options?: ToastOptions): string {
    const id = generateId()
    const newToast: ToastItem = {
      id,
      type,
      message,
      description: options?.description,
      duration: options?.duration ?? 3200,
    }

    // Keep maximum 3 toasts visible at once to prevent clutter on mobile
    toastsState = [...toastsState.slice(-2), newToast]
    notifyListeners()

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toast.dismiss(id)
      }, newToast.duration)
    }

    return id
  },

  success(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show('success', message, options)
  },

  error(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show('error', message, options)
  },

  info(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show('info', message, options)
  },

  dismiss(id?: string) {
    if (id) {
      toastsState = toastsState.filter((t) => t.id !== id)
    } else {
      toastsState = []
    }
    notifyListeners()
  },
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(toastsState)

  React.useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  return {
    toasts,
    toast,
    success: toast.success,
    error: toast.error,
    info: toast.info,
    dismiss: toast.dismiss,
  }
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  default: Info,
}

const toastStyles: Record<
  ToastType,
  { card: string; iconBg: string; title: string; desc: string }
> = {
  success: {
    card: 'bg-[#f0fdf4]/95 dark:bg-[#06241a]/95 border-emerald-500/35 dark:border-emerald-500/30 shadow-emerald-500/15',
    iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    title: 'text-emerald-950 dark:text-emerald-100',
    desc: 'text-emerald-800/80 dark:text-emerald-300/80',
  },
  error: {
    card: 'bg-[#fff1f2]/95 dark:bg-[#280c12]/95 border-destructive/35 dark:border-destructive/30 shadow-destructive/15',
    iconBg: 'bg-destructive/20 text-destructive border border-destructive/30',
    title: 'text-destructive dark:text-rose-100',
    desc: 'text-rose-800/80 dark:text-rose-300/80',
  },
  info: {
    card: 'bg-[#eff6ff]/95 dark:bg-[#0d1e3a]/95 border-blue-500/35 dark:border-blue-500/30 shadow-blue-500/15',
    iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    title: 'text-blue-950 dark:text-blue-100',
    desc: 'text-blue-800/80 dark:text-blue-300/80',
  },
  default: {
    card: 'bg-card/95 dark:bg-[#121829]/95 border-border/60 shadow-black/10',
    iconBg: 'bg-muted text-muted-foreground border border-border/50',
    title: 'text-foreground',
    desc: 'text-muted-foreground',
  },
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed top-3 sm:top-5 inset-x-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-3 sm:px-4 pt-[env(safe-area-inset-top)] max-w-sm sm:max-w-md mx-auto"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => {
          const Icon = toastIcons[t.type] || Info
          const style = toastStyles[t.type] || toastStyles.default

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
              className={cn(
                'pointer-events-auto w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl shadow-xl backdrop-blur-xl border select-none',
                style.card
              )}
            >
              <div
                className={cn(
                  'h-8 w-8 shrink-0 rounded-xl flex items-center justify-center',
                  style.iconBg
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </div>

              <div className="flex-1 min-w-0 pr-1 text-left">
                <p className={cn('text-xs sm:text-sm font-black tracking-tight leading-snug', style.title)}>
                  {t.message}
                </p>
                {t.description && (
                  <p className={cn('text-[11px] sm:text-xs mt-0.5 leading-tight', style.desc)}>
                    {t.description}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => dismiss(t.id)}
                className="h-8 w-8 -mr-1 shrink-0 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
                aria-label="Cerrar notificación"
                icon={X}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}
