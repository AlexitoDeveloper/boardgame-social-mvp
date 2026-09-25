import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Play, Trash2, ArrowRight, ShieldCheck } from "lucide-react"

export function ButtonShowcase() {
  const [loading, setLoading] = React.useState(false)

  return (
    <Card className="p-6 bg-card border border-border/80">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>01. Sistema de Pulsadores Táctiles</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Travel Físico de 1px, Sombras Calibradas y Jerarquía)
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Botones con tacto físico real y recorrido mecánico. Sin brillos artificiales ni bordes estridentes.
        </p>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Variantes y Jerarquía de Acción
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" icon={Play} label="Crimson Raspberry (Principal)" />
            <Button variant="secondary" label="Slate Navy (Secundario)" />
            <Button variant="emerald" icon={ShieldCheck} label="Emerald Jade (Verificado)" />
            <Button variant="outline" label="Outline Neutro" />
            <Button variant="ghost" label="Ghost Minimal" />
            <Button variant="destructive" icon={Trash2} label="Destructivo (Outline Sin Rojo)" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Escalas y Estados Dinámicos
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" label="Acción Principal (LG)" icon={ArrowRight} />
            <Button size="default" label="Estándar (MD)" />
            <Button size="sm" label="Compacto (SM)" />
            <Button size="xs" label="Micro (XS)" />
            <Button size="icon" icon={Play} aria-label="Play Action" />
            <Button
              size="default"
              variant="default"
              loading={loading}
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1500)
              }}
              label={loading ? "Procesando..." : "Test de Carga Táctil"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
