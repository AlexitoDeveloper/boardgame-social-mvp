import * as React from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function FormShowcase() {
  const [timerEnabled, setTimerEnabled] = React.useState(true)
  const [score, setScore] = React.useState("85")

  return (
    <Card variant="neoprene" className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>04. Form Ergonomics &amp; Bezel Wells</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Recessed Insets, Tabular Steppers &amp; Knurled Detents)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recessed Search/Text Input */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Recessed Input Well
          </Label>
          <Input placeholder="Buscar juego, expansión o jugador..." />
          <p className="text-[11px] text-muted-foreground">
            Bisel interior con contraste WCAG AA
          </p>
        </div>

        {/* Tabular Score Input */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Puntuación (Tabular Monospace)
          </Label>
          <Input
            tabular
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="0"
          />
          <p className="text-[11px] text-muted-foreground font-mono">
            Tabular-nums previene el jitter horizontal
          </p>
        </div>

        {/* Analogue Switch & Select */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-surface-void">
            <div>
              <p className="text-xs font-bold">Reloj de Turno Analógico</p>
              <p className="text-[10px] text-muted-foreground">
                Interruptor con relieve estriado
              </p>
            </div>
            <Switch
              checked={timerEnabled}
              onCheckedChange={setTimerEnabled}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bandeja Select
            </Label>
            <Select defaultValue="scythe">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar juego..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scythe">Scythe (Expansión Invaders)</SelectItem>
                <SelectItem value="terraforming">Terraforming Mars</SelectItem>
                <SelectItem value="wingspan">Wingspan: Oceanía</SelectItem>
                <SelectItem value="castles">The Castles of Burgundy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
