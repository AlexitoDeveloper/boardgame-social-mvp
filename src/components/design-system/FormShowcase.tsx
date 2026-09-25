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
import { Stepper, StepItem } from "@/components/ui/stepper"
import { Search, Trophy, Clock, Dices, Users, CheckCircle } from "lucide-react"

export function FormShowcase() {
  const [timerEnabled, setTimerEnabled] = React.useState(true)
  const [score, setScore] = React.useState("85")
  const [activeStep, setActiveStep] = React.useState<number>(2)

  const stepperDemoSteps: StepItem[] = [
    {
      id: 1,
      title: "1. Juego de Mesa",
      shortTitle: "Juego",
      description: "Scythe + Expansión",
      icon: Dices,
    },
    {
      id: 2,
      title: "2. Parámetros de Mesa",
      shortTitle: "Mesa",
      description: "4 Jugadores, 19:30h",
      icon: Users,
    },
    {
      id: 3,
      title: "3. Confirmación",
      shortTitle: "Listo",
      description: "Publicar en Grupo",
      icon: CheckCircle,
    },
  ]

  return (
    <Card className="p-6 bg-card border border-border/80">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>04. Controles de Formulario &amp; Registro</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Búsqueda, Selección Accesible y Puntuación Tabular)
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Inputs ergonómicos optimizados para registro rápido móvil y selección sin saltos de layout.
        </p>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Input with Icon */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Buscador de Biblioteca / Quedadas
          </Label>
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Buscar por juego, diseñador o anfitrión..."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Contraste de borde optimizado para modo diurno y nocturno.
          </p>
        </div>

        {/* Tabular Score Input */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Puntos de Victoria (Tabular)
          </Label>
          <div className="relative">
            <Trophy className="size-4 text-primary dark:text-[#FF80B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              tabular
              type="number"
              className="pl-9 font-mono-tabular font-bold"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0"
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Tabular-nums previene el jitter horizontal en pantallas de conteo.
          </p>
        </div>

        {/* Setting Switch & Select */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-surface-elevated/40">
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Temporizador de Turno
              </p>
              <p className="text-xs text-muted-foreground">
                Alerta de tiempo por jugador activada
              </p>
            </div>
            <Switch
              checked={timerEnabled}
              onCheckedChange={setTimerEnabled}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selector de Juego
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

        {/* 8BEES Tactile Stepper Demonstration */}
        <div className="md:col-span-3 pt-4 border-t border-border/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Stepper 8BEES (Progreso de Mesa / Wizard)
              </Label>
              <p className="text-xs text-muted-foreground">
                Indicadores táctiles con Raspberry activo, Emerald Jade completado y tipografía accesible sin degradación en modo oscuro.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-xs font-mono-tabular text-muted-foreground">
                Paso actual: <strong>{activeStep}</strong>/3
              </span>
            </div>
          </div>

          <Stepper
            steps={stepperDemoSteps}
            activeStep={activeStep}
            onStepClick={(id) => setActiveStep(Number(id))}
          />
        </div>
      </CardContent>
    </Card>
  )
}
