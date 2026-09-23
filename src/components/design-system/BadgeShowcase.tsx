import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Chip } from "@/components/ui/chip"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MeepleColorKey } from "@/lib/design-tokens"

export function BadgeShowcase() {
  const [selectedChip, setSelectedChip] = React.useState<string>("worker")
  const [selectedMeeple, setSelectedMeeple] = React.useState<MeepleColorKey>("green")

  const meepleKeys: MeepleColorKey[] = [
    "red",
    "blue",
    "yellow",
    "green",
    "purple",
    "orange",
  ]

  return (
    <Card variant="neoprene" className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>03. Punchboard Chits &amp; Player Tokens</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Chits, Meeple Accents &amp; Tabular Scores)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Semantic Meeple Player Colors
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {meepleKeys.map((key) => (
              <Badge
                key={key}
                variant={`meeple-${key}` as any}
                shape="chit"
                className="cursor-pointer"
              >
                Player: {key}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tabular Score Badges &amp; Shapes (Chit vs Pill)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default" shape="chit" tabular>
              +142 Victory Points
            </Badge>
            <Badge variant="secondary" shape="chit" tabular>
              3.85 / 5 Weight
            </Badge>
            <Badge variant="success" shape="pill" tabular>
              Rank #01
            </Badge>
            <Badge variant="warning" shape="pill" tabular pulse>
              Live Turn 04
            </Badge>
            <Badge variant="chit" tabular>
              Chit Border Relief
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tactile Filter Chips &amp; Meeple Indicators
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip
              variant="chit"
              selected={selectedChip === "worker"}
              onClick={() => setSelectedChip("worker")}
            >
              Colocación de Trabajadores
            </Chip>
            <Chip
              variant="chit"
              selected={selectedChip === "deckbuilding"}
              onClick={() => setSelectedChip("deckbuilding")}
            >
              Construcción de Mazos
            </Chip>
            <Chip
              variant="chit"
              selected={selectedChip === "euro"}
              onClick={() => setSelectedChip("euro")}
            >
              Eurogame Pesado
            </Chip>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            {meepleKeys.map((key) => (
              <Chip
                key={key}
                meepleColor={key}
                selected={selectedMeeple === key}
                onClick={() => setSelectedMeeple(key)}
                size="sm"
              >
                Jugador {key}
              </Chip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
