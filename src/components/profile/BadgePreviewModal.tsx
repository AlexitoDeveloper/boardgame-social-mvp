import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Badge } from '../ui/badge'

export interface BadgePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  title: string
  subtitle?: string
  description?: string
  tierLabel?: string
  unlocked?: boolean
  progressText?: string
  progressPercent?: number
}

export function BadgePreviewModal({
  isOpen,
  onClose,
  imageSrc,
  title,
  subtitle,
  description,
  tierLabel,
  unlocked = true,
  progressText,
  progressPercent
}: BadgePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg text-center p-6 sm:p-8 flex flex-col items-center">
        <DialogHeader className="items-center text-center space-y-2">
          <div className="flex items-center gap-2 justify-center mb-0.5">
            {tierLabel && (
              <Badge variant={unlocked ? "primary-soft" : "secondary"} size="lg">
                {tierLabel}
              </Badge>
            )}
            {!unlocked && (
              <Badge variant="destructive" size="lg">Bloqueado</Badge>
            )}
          </div>
          <DialogTitle className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            {title}
          </DialogTitle>
          {subtitle && (
            <p className="text-xs sm:text-sm font-extrabold text-muted-foreground uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </DialogHeader>

        {/* Large Badge Graphic */}
        <div className="relative my-4 w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.7)] isolate">
          <img
            src={imageSrc}
            alt={title}
            className={`w-full h-full object-cover object-center scale-[1.05] transition-all duration-300 ${
              unlocked ? '' : 'filter grayscale contrast-75 brightness-40 opacity-60'
            }`}
          />
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <div className="w-14 h-14 rounded-full bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center shadow-2xl">
                <svg viewBox="0 0 16 16" className="w-7 h-7 text-zinc-300" fill="currentColor">
                  <path fillRule="evenodd" d="M4 6V4a4 4 0 118 0v2h.5A1.5 1.5 0 0114 7.5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5v-6A1.5 1.5 0 013.5 6H4zm2-2a2 2 0 104 0v2H6V4zm2 5a1 1 0 00-.707 1.707L7 12.414V13a1 1 0 102 0v-.586l-.293-.293A1 1 0 008 9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Description & Progress */}
        {description && (
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center px-4 max-w-sm">
            {description}
          </DialogDescription>
        )}

        {typeof progressPercent === 'number' && (
          <div className="w-full space-y-1.5 mt-2 pt-3 border-t border-border/20 text-left">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
              <span>Progreso</span>
              <span className="text-foreground">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-background border border-border/30 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            {progressText && (
              <span className="text-xs text-muted-foreground/80 block font-medium">
                {progressText}
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
