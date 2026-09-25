import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { ExpansionBadge } from "@/components/ui/expansion-badge"
import { Chip } from "@/components/ui/chip"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, ShieldCheck, Flame, Users, Clock, Award } from "lucide-react"

export function BadgeShowcase() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedPlayerColor, setSelectedPlayerColor] = React.useState<string>("green")

  return (
    <Card className="p-6 bg-card border border-border/80">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>03. Metadatos, Estados y Filtros Táctiles</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Badges de Mesa, Tags de Edición &amp; Chips Ergonómicas)
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Indicadores ligeros y funcionales integrados con la paleta 8BEES, sin bordes toscos de cartón.
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* 1. Status Badges */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Estados de Mesa y Partida
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="tag-emerald" className="gap-1.5 font-bold">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              Mesa de Grupo (Abierta)
            </Badge>
            <Badge variant="slatenavy" className="font-bold">
              Solo Miembros del Grupo
            </Badge>
            <Badge variant="raspberry" className="font-bold">
              Última Plaza
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Mesa Completa
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Flame className="size-3 text-primary dark:text-[#FF80B0]" />
              Partida en Curso
            </Badge>
          </div>
        </div>

        {/* 2. Catalog & Edition Tags */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Etiquetas de Edición &amp; Certificación (8BEES)
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="tag-emerald" className="gap-1 font-bold">
              <ShieldCheck className="size-3.5" />
              Edición en español
            </Badge>
            <ExpansionBadge size="sm" />
            <Badge variant="tag-emerald" className="gap-1 font-bold">
              <Sparkles className="size-3.5" />
              Copia verificada en club
            </Badge>
            <Badge variant="outline" className="gap-1 font-mono text-xs font-semibold">
              <Award className="size-3 text-amber-400" />
              Spiel des Jahres
            </Badge>
            <Badge variant="outline" className="gap-1 font-mono text-xs">
              <Users className="size-3 text-primary" />
              2 – 5 Jugadores
            </Badge>
            <Badge variant="outline" className="gap-1 font-mono text-xs">
              <Clock className="size-3 text-primary" />
              90 – 120 min
            </Badge>
            <Badge variant="outline" className="font-mono text-xs font-bold text-primary dark:text-[#FF80B0]">
              3.85 / 5 Peso
            </Badge>
          </div>
        </div>

        {/* 3. Interactive Filter Chips */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Chips de Filtro Interactivas (Accesibilidad WCAG AAA)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              selected={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
              badge={<span className="text-[10px] font-mono-tabular opacity-80">24</span>}
            >
              Todas las Mesas
            </Chip>
            <Chip
              selected={selectedCategory === "my-games"}
              onClick={() => setSelectedCategory("my-games")}
              size="sm"
              badge={<span className="text-[10px] font-mono-tabular opacity-80">4</span>}
            >
              Mis Quedadas
            </Chip>
            <Chip
              selected={selectedCategory === "eurogames"}
              onClick={() => setSelectedCategory("eurogames")}
              size="sm"
              badge={<span className="text-[10px] font-mono-tabular opacity-80">11</span>}
            >
              Eurogames
            </Chip>
            <Chip
              selected={selectedCategory === "ameritrash"}
              onClick={() => setSelectedCategory("ameritrash")}
              size="sm"
              badge={<span className="text-[10px] font-mono-tabular opacity-80">6</span>}
            >
              Temáticos
            </Chip>
            <Chip
              selected={selectedCategory === "party"}
              onClick={() => setSelectedCategory("party")}
              size="sm"
              badge={<span className="text-[10px] font-mono-tabular opacity-80">3</span>}
            >
              Party / Fillers
            </Chip>
          </div>
        </div>

        {/* 4. Player Color Selector Chips */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Asignación de Color de Jugador / Facción
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(["green", "blue", "red", "yellow", "purple", "orange"] as const).map((color) => (
              <Chip
                key={color}
                meepleColor={color}
                size="sm"
                selected={selectedPlayerColor === color}
                onClick={() => setSelectedPlayerColor(color)}
                className="capitalize text-xs font-bold"
              >
                {color === "green" ? "Verde (Tú)" : color}
              </Chip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
