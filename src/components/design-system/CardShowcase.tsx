import * as React from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Clock, MapPin, Star, ChevronRight } from "lucide-react"

export function CardShowcase() {
  const [joined, setJoined] = React.useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <span>02. Arquitectura de Tarjetas de Producto</span>
            <span className="text-xs font-mono font-normal text-muted-foreground">
              (Social Meetup, Match Log &amp; Library Deck)
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tarjetas limpias, orientadas a producto real: sin artificios de cartón, con jerarquía visual y contraste AAA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Proposal 1: Modern Meetup Discovery Card */}
        <Card
          spotlight
          className="p-5 flex flex-col justify-between bg-card border border-border/80 hover:border-primary/50 transition-all duration-200"
        >
          <div>
            {/* Header: Status & Group Affiliation */}
            <div className="flex items-center justify-between mb-3">
              <Badge variant="slatenavy" className="text-[11px] font-bold">
                Grupo: Eurogamers BCN
              </Badge>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                Hoy, 19:30
              </span>
            </div>

            {/* Game & Title */}
            <div className="space-y-1 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary dark:text-[#FF80B0]">
                Ark Nova + Marine Worlds
              </span>
              <CardTitle className="text-base font-black text-foreground tracking-tight">
                Mesa de Grupo: Tableros Asimétricos
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Partida exclusiva para miembros del grupo. Se juegan mapas alternativos con cartas de acuario.
              </p>
            </div>

            {/* Location & Host */}
            <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-elevated/60 border border-border/60 text-xs mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="size-6 border border-border">
                  <AvatarFallback className="bg-primary/20 text-primary dark:text-[#FF80B0] text-[10px] font-black">
                    MR
                  </AvatarFallback>
                </Avatar>
                <div className="text-left leading-tight">
                  <span className="font-bold text-foreground block">Marc R.</span>
                  <span className="text-[10px] text-muted-foreground">Anfitrión Verificado</span>
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3 text-primary" />
                Club Kaburi
              </span>
            </div>
          </div>

          {/* Footer: Attendees & Action */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#243447] text-white text-[9px] font-black border-2 border-card">
                  JD
                </span>
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#C51F5D] text-white text-[9px] font-black border-2 border-card">
                  AL
                </span>
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#10B981] text-white text-[9px] font-black border-2 border-card">
                  ES
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                3/4 jug.
              </span>
            </div>

            <Button
              size="xs"
              variant={joined ? "secondary" : "default"}
              onClick={() => setJoined(!joined)}
              label={joined ? "Apuntado ✓" : "Apuntarme"}
            />
          </div>
        </Card>

        {/* Proposal 2: Dense Match Log Card (BG Stats style) */}
        <Card
          spotlight
          className="p-5 flex flex-col justify-between bg-card border border-border/80 hover:border-border transition-all duration-200"
        >
          <div>
            {/* Header: Result badge & Date */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <Trophy className="size-3.5 text-amber-400" />
                Victoria Registrada
              </span>
              <span className="text-xs font-mono text-muted-foreground">Ayer · 105 min</span>
            </div>

            <div className="space-y-1 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Dune: Imperium – Uprising
              </span>
              <CardTitle className="text-base font-black text-foreground tracking-tight">
                Final de Liga de Primavera
              </CardTitle>
            </div>

            {/* Scoreboard Matrix */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black text-xs font-mono">#1</span>
                  <span className="font-black text-foreground">Carlos M.</span>
                  <span className="text-[10px] text-muted-foreground">(Fremen)</span>
                </div>
                <span className="font-mono font-black text-xs text-primary dark:text-[#FF80B0]">
                  11 VP
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/40 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-bold text-xs font-mono">#2</span>
                  <span className="font-medium text-foreground">Laura G.</span>
                  <span className="text-[10px] text-muted-foreground">(Bene G.)</span>
                </div>
                <span className="font-mono font-bold text-xs text-muted-foreground">
                  10 VP
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/40 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-bold text-xs font-mono">#3</span>
                  <span className="font-medium text-foreground">Alex B.</span>
                  <span className="text-[10px] text-muted-foreground">(Atreides)</span>
                </div>
                <span className="font-mono font-bold text-xs text-muted-foreground">
                  8 VP
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Tags & Detail CTA */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono">
                +24 ELO
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono text-muted-foreground">
                Competición
              </Badge>
            </div>
            <Button size="xs" variant="ghost" icon={ChevronRight} label="Acta" />
          </div>
        </Card>

        {/* Proposal 3: Clean Game Shelf Deck */}
        <Card
          spotlight
          className="p-5 flex flex-col justify-between bg-card border border-border/80 hover:border-border transition-all duration-200"
        >
          <div>
            {/* Header: Weight & BGG Rating */}
            <div className="flex items-center justify-between mb-3">
              <Badge variant="tag-emerald" className="gap-1 text-[11px] font-black">
                <Star className="size-3 fill-current" />
                8.6 BGG
              </Badge>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                3.85 / 5 Dificultad
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Alexander Pfister · 2019
              </span>
              <CardTitle className="text-base font-black text-foreground tracking-tight">
                Maracaibo
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Navegación caribeña, gestión de mano de cartas multifunción y modo campaña con tablero mutable.
              </p>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-elevated/60 border border-border/60 text-center mb-4">
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-bold">Jugadores</span>
                <span className="font-mono text-xs font-black text-foreground">1 – 4</span>
              </div>
              <div className="border-x border-border/60">
                <span className="block text-[10px] text-muted-foreground uppercase font-bold">Tiempo</span>
                <span className="font-mono text-xs font-black text-foreground">120 min</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-bold">En Club</span>
                <span className="font-mono text-xs font-black text-emerald-400">3 Copias</span>
              </div>
            </div>
          </div>

          {/* Footer: Library status & CTA */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Disponible en Ludoteca
            </span>
            <Button size="xs" variant="outline" label="Ver Ficha" />
          </div>
        </Card>
      </div>
    </div>
  )
}
