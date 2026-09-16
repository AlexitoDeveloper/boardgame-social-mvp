import * as React from "react"
import { cn } from "@/lib/utils"
import { Dices } from "lucide-react"

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  widthSize?: number;
  heightSize?: number;
  fit?: "cover" | "contain" | "inside" | "outside";
  fallbackClassName?: string;
  hidePlaceholderText?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  imgClassName,
  widthSize,
  heightSize,
  fit = "cover",
  fallbackClassName,
  hidePlaceholderText = false,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement | null>(null)

  // Check if image is already completed in browser cache
  const checkCompletion = React.useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node
    if (!node) return

    if (node.complete) {
      if (node.naturalWidth === 0 && node.naturalHeight === 0) {
        setError(true)
        setLoading(false)
      } else if (node.naturalWidth > 0) {
        setLoading(false)
        setError(false)
      }
    }
  }, [])

  // Reset states only when src changes
  React.useEffect(() => {
    if (!src || src === 'null' || src === 'undefined' || src.trim() === '') {
      setError(true)
      setLoading(false)
      return
    }

    // Check if the current DOM node has already loaded this src from cache
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setLoading(false)
        setError(false)
        return
      }
    }

    setLoading(true)
    setError(false)
  }, [src])

  // Dummy cover fallback when image is genuinely missing or failed to load
  if (!src || src === 'null' || src === 'undefined' || src.trim() === '' || error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-3 text-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-border/40 text-muted-foreground select-none relative overflow-hidden shadow-inner w-full h-full",
          fallbackClassName || className
        )}
      >
        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 mb-1 text-primary/60 shrink-0">
          <Dices className="h-6 w-6" />
        </div>
        {!hidePlaceholderText && alt && (
          <span className="text-[11px] font-bold text-foreground/75 line-clamp-2 px-1 leading-tight tracking-tight">
            {alt}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden shrink-0 flex items-center justify-center bg-muted/20", className)}>
      {/* Subtle pulse skeleton while image loads */}
      {loading && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse z-10" />
      )}
      
      <img
        ref={checkCompletion}
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          fit === "contain" 
            ? "max-h-full max-w-full h-auto w-auto object-contain" 
            : fit === "inside" 
              ? "object-scale-down h-full w-full" 
              : "h-full w-full object-cover",
          loading ? "opacity-0" : "opacity-100",
          imgClassName
        )}
        onLoad={() => {
          setLoading(false)
          setError(false)
        }}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        referrerPolicy="no-referrer"
        loading={props.loading || "lazy"}
        {...props}
      />
    </div>
  )
}
