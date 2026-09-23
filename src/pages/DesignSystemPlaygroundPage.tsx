import { ButtonShowcase } from "@/components/design-system/ButtonShowcase"
import { CardShowcase } from "@/components/design-system/CardShowcase"
import { BadgeShowcase } from "@/components/design-system/BadgeShowcase"
import { FormShowcase } from "@/components/design-system/FormShowcase"
import { OverlayShowcase } from "@/components/design-system/OverlayShowcase"
import { Badge } from "@/components/ui/badge"
import { Dices, Sparkles } from "lucide-react"

export function DesignSystemPlaygroundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-6 px-4 max-w-5xl mx-auto space-y-8">
      {/* Playground Header */}
      <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-8 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Dices className="size-4" />
            </span>
            <Badge variant="meeple-green" shape="chit">
              Kinetic Tabletop v2.0
            </Badge>
            <Badge variant="secondary" shape="chit">
              Avant-Garde
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display">
            Design System Playground
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Catálogo interactivo de componentes táctiles inspirados en la materialidad
            del juego de mesa físico, Teenage Engineering y Linear.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
            <Sparkles className="size-3 text-primary" />
            <span className="font-mono text-xs">Phases 1-4 Active</span>
          </Badge>
        </div>
      </div>

      {/* Showcase Sections */}
      <div className="space-y-8">
        <ButtonShowcase />
        <CardShowcase />
        <BadgeShowcase />
        <FormShowcase />
        <OverlayShowcase />
      </div>
    </div>
  )
}
