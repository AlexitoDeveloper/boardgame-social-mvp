import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Trophy } from "lucide-react"

export function CardShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>02. Linen &amp; Die-Cut Decks</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Cards, Notches &amp; Spotlight)
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Die-Cut Ticket Notch Card */}
        <Card variant="notch" className="p-5 flex flex-col justify-between">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="meeple-yellow" shape="chit" tabular>
                Match Pass #402
              </Badge>
              <span className="text-[11px] font-mono text-muted-foreground">
                Die-Cut Corners
              </span>
            </div>
            <CardTitle className="text-base font-black">Ark Nova: Tournament</CardTitle>
            <CardDescription className="text-xs">
              Mesa privada · 4 Jugadores · Tableros de mapa alternativo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 flex items-center justify-between border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-primary" />
              <span>Sábado, 19:30</span>
            </div>
            <Button size="xs" variant="default" label="Unirse" />
          </CardContent>
        </Card>

        {/* Midnight Neoprene Mat Card */}
        <Card variant="neoprene" className="p-5 flex flex-col justify-between">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="meeple-green" shape="chit">
                Active Table
              </Badge>
              <span className="text-[11px] font-mono text-emerald-400">
                Felt Void
              </span>
            </div>
            <CardTitle className="text-base font-black">Dune: Imperium</CardTitle>
            <CardDescription className="text-xs">
              Sesión competitiva en curso con expansión Immortality
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 flex items-center justify-between border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5 text-primary" />
              <span>3/4 Jugadores</span>
            </div>
            <Button size="xs" variant="secondary" label="Ver Mesa" />
          </CardContent>
        </Card>

        {/* Spotlight Dynamic Card */}
        <Card
          variant="interactive"
          spotlight
          className="p-5 flex flex-col justify-between"
        >
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="meeple-purple" shape="chit">
                Spotlight Physics
              </Badge>
              <Trophy className="size-4 text-amber-400" />
            </div>
            <CardTitle className="text-base font-black">Hall of Fame #1</CardTitle>
            <CardDescription className="text-xs">
              Mueve el cursor sobre esta carta para ver el reflejo de luz dinámico
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 flex items-center justify-between border-t border-border/50">
            <span className="text-xs font-mono font-bold text-primary">
              1,840 Elo
            </span>
            <Button size="xs" variant="outline" label="Explorar" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
