import * as React from "react"
import { cn } from "@/lib/utils"
import { Image as ImageIcon, Loader2 } from "lucide-react"

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  alt: string;
  className?: string;
  widthSize?: number; // e.g. 120, 250, 400
  heightSize?: number; // e.g. 120, 250, 400
  fit?: "cover" | "contain" | "inside" | "outside";
  fallbackClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  widthSize,
  heightSize,
  fit = "cover",
  fallbackClassName,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  // Reset states when src changes
  React.useEffect(() => {
    setLoading(true)
    setError(false)
  }, [src])

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/30 border border-border/30 rounded-xl text-muted-foreground",
          fallbackClassName || className
        )}
      >
        <ImageIcon className="h-5 w-5 opacity-40 shrink-0" />
      </div>
    )
  }

  // Check if we should proxy the URL (only external http/https URLs)
  const isExternal = src.startsWith("http://") || src.startsWith("https://")
  const isLocalHost = src.includes("localhost") || src.includes("127.0.0.1")
  
  let finalSrc = src
  if (isExternal && !isLocalHost) {
    // Generate optimized CDN url using weserv.nl
    const params = new URLSearchParams()
    params.set("url", src)
    if (widthSize) params.set("w", widthSize.toString())
    if (heightSize) params.set("h", heightSize.toString())
    params.set("fit", fit)
    params.set("output", "webp") // Dynamic WebP compression
    params.set("q", "85") // Quality
    finalSrc = `https://images.weserv.nl/?${params.toString()}`
  }

  return (
    <div className={cn("relative overflow-hidden shrink-0 flex items-center justify-center", className)}>
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-muted/30 flex items-center justify-center animate-pulse z-10">
          <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
        </div>
      )}
      
      <img
        src={finalSrc}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        crossOrigin="anonymous"
        {...props}
      />
    </div>
  )
}
