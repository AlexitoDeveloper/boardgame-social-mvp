import { AwwwardsShowcase } from "@/components/design-system/AwwwardsShowcase"
import { ButtonShowcase } from "@/components/design-system/ButtonShowcase"
import { CardShowcase } from "@/components/design-system/CardShowcase"
import { BadgeShowcase } from "@/components/design-system/BadgeShowcase"
import { FormShowcase } from "@/components/design-system/FormShowcase"
import { OverlayShowcase } from "@/components/design-system/OverlayShowcase"
import { Badge } from "@/components/ui/badge"
import { Trophy, Sparkles } from "lucide-react"

export function DesignSystemPlaygroundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-6 px-4 max-w-5xl mx-auto space-y-8">
      {/* Playground Header */}
      <div className="border-b border-border/80 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-8 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Trophy className="size-4" />
            </span>
            <Badge variant="raspberry">
              Sistema 8BEES
            </Badge>
            <Badge variant="tag-emerald">
              Emerald Jade #10B981
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              WCAG AAA Contrast
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display">
            Design System Playground
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Catálogo interactivo con los tokens táctiles <strong>8BEES</strong>:
            Lienzo Alabaster Linen (<code>#E2E2D2</code>), Disparador táctil Crimson Raspberry (<code>#C51F5D</code>), Slate Navy (<code>#243447</code>), Abyssal Carbon Ink (<code>#141D26</code>) y Acento armónico Emerald Jade (<code>#10B981</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
            <Sparkles className="size-3 text-primary dark:text-[#FF80B0]" />
            <span className="font-mono text-xs">Tokens v3.0</span>
          </Badge>
        </div>
      </div>

      {/* Showcase Sections */}
      <div className="space-y-8">
        <AwwwardsShowcase />
        <ButtonShowcase />
        <CardShowcase />
        <BadgeShowcase />
        <FormShowcase />
        <OverlayShowcase />
      </div>
    </div>
  )
}
