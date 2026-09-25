import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Trophy,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

export function AwwwardsShowcase() {
  const [isJoined, setIsJoined] = React.useState(false)
  const [attendeeCount, setAttendeeCount] = React.useState(3)

  const handleToggleJoin = () => {
    if (isJoined) {
      setIsJoined(false)
      setAttendeeCount((prev) => prev - 1)
    } else {
      setIsJoined(true)
      setAttendeeCount((prev) => prev + 1)
    }
  }

  const colorTokens = [
    {
      name: "Crimson Raspberry",
      hex: "#C51F5D",
      bgClass: "bg-[#C51F5D]",
      textClass: "text-white",
      role: "CTA Primario & Acción Táctil",
      contrast: "5.0:1 AA",
    },
    {
      name: "Slate Navy",
      hex: "#243447",
      bgClass: "bg-[#243447]",
      textClass: "text-white",
      role: "Estructura & Superficie Secundaria",
      contrast: "9.8:1 AAA",
    },
    {
      name: "Abyssal Carbon Ink",
      hex: "#141D26",
      bgClass: "bg-[#141D26]",
      textClass: "text-[#E2E2D2]",
      role: "Lienzo Nocturno Inmersivo",
      contrast: "12.8:1 AAA",
    },
    {
      name: "Alabaster Linen",
      hex: "#E2E2D2",
      bgClass: "bg-[#E2E2D2]",
      textClass: "text-[#141D26]",
      role: "Lienzo Diurno Orgánico",
      contrast: "11.2:1 AAA",
    },
    {
      name: "Emerald Jade",
      hex: "#10B981",
      bgClass: "bg-[#10B981]",
      textClass: "text-white",
      role: "Acento Armónico & Certificación",
      contrast: "5.5:1 AA",
    },
  ]

  return (
    <Card className="p-6 md:p-8 bg-card border border-border/80 shadow-md">
      <CardHeader className="p-0 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2 rounded-full bg-[#C51F5D] animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary dark:text-[#FF80B0]">
                8BEES Foundation &amp; Interaction Architecture
              </span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-display">
              Identidad 8BEES: Estructura, Color y Ergonomía
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Sistema cromático de alta legibilidad y componentes táctiles diseñados para el flujo social real de jugadores de mesa.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="tag-emerald" className="gap-1 font-mono text-xs">
              <CheckCircle2 className="size-3" />
              WCAG AAA Validado
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-8">
        {/* 1. Core Color Swatches */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Paleta Fundamental (5 Tonos 8BEES)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {colorTokens.map((token) => (
              <div
                key={token.hex}
                className="p-3.5 rounded-xl border border-border/60 bg-surface-elevated/40 flex flex-col justify-between gap-3 group hover:border-border transition-all"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`size-6 rounded-lg ${token.bgClass} shadow-xs border border-white/10`}
                  />
                  <span className="text-xs font-mono font-black text-muted-foreground">
                    {token.contrast}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block truncate">
                    {token.name}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground block">
                    {token.hex}
                  </span>
                  <span className="text-xs text-muted-foreground/80 mt-1 block leading-tight">
                    {token.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Interactive Social Experience Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Composición Social en Vivo (Interactúa con el botón)
            </p>
            <span className="text-xs font-mono text-muted-foreground">
              Estado: {isJoined ? "Inscrito" : "Espectador"}
            </span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface-elevated/30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="slatenavy" className="font-bold text-xs">
                  Grupo: Exploradores BCN
                </Badge>
                <Badge
                  variant={attendeeCount >= 4 ? "outline" : "tag-emerald"}
                  className="font-bold text-xs"
                >
                  {attendeeCount >= 4 ? "Mesa Completa" : "Plazas para el Grupo"}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  Terraforming Mars: Ares
                </Badge>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  Sábado 18:00
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-foreground">
                  Liga Interna del Grupo: Ronda 2
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Partida exclusiva para miembros del grupo con expansiones Crisis y Discovery.
                </p>
              </div>

              {/* Host & Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 border border-border">
                    <AvatarFallback className="bg-primary/20 text-primary dark:text-[#FF80B0] text-xs font-black">
                      AL
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-foreground">Alejandro V.</span>
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                </div>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-primary" />
                  Mesa Central 04
                </span>
              </div>
            </div>

            {/* Interactive RSVP Action Panel */}
            <div className="lg:border-l lg:border-border/60 lg:pl-6 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#243447] text-white text-xs font-black border-2 border-background">
                    MR
                  </span>
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#10B981] text-white text-xs font-black border-2 border-background">
                    CG
                  </span>
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#4F46E5] text-white text-xs font-black border-2 border-background">
                    LP
                  </span>
                  {isJoined && (
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#C51F5D] text-white text-xs font-black border-2 border-background animate-in zoom-in-50 duration-200">
                      TÚ
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <span className="font-mono text-sm font-black text-foreground block">
                    {attendeeCount} / 4
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {4 - attendeeCount === 0 ? "Sin plazas" : `${4 - attendeeCount} libre(s)`}
                  </span>
                </div>
              </div>

              <Button
                variant={isJoined ? "secondary" : "default"}
                size="default"
                onClick={handleToggleJoin}
                icon={isJoined ? CheckCircle2 : ArrowRight}
                label={isJoined ? "Abandonar Plaza" : "Apuntarme Ahora"}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {/* 3. Micro-Typography & Precision Tabular Specs */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tipografía Tabular para Métricas de Juego
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-border/60 bg-surface-elevated/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                  Índice Elo Grupal
                </span>
                <span className="font-mono-tabular text-xl font-black text-foreground">
                  1,842.50
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                <TrendingUp className="size-3.5" />
                +14.2
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-surface-elevated/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                  Tiempo Total Jugado
                </span>
                <span className="font-mono-tabular text-xl font-black text-foreground">
                  148h 35m
                </span>
              </div>
              <Clock className="size-4 text-muted-foreground" />
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-surface-elevated/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                  Tasa de Victoria
                </span>
                <span className="font-mono-tabular text-xl font-black text-primary dark:text-[#FF80B0]">
                  64.8 %
                </span>
              </div>
              <Trophy className="size-4 text-amber-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
