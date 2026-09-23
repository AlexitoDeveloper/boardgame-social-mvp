import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Bell, LayoutList, Layers, CheckCircle2, AlertTriangle } from "lucide-react"

export function OverlayShowcase() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  return (
    <Card variant="neoprene" className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>05. Mobile Fluidity, Trays &amp; Floating HUD</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Bottom Sheets, Dialogs &amp; Toasts)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bottom Sheet Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                icon={LayoutList}
                label="Abrir Bandeja Neopreno (Sheet)"
                className="w-full justify-start"
              />
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Bandeja de Partida en Curso</SheetTitle>
                <SheetDescription>
                  Bandeja táctil con asa de goma grabada y soporte para safe-area móvil.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="p-4 rounded-xl border border-border/70 bg-surface-void text-xs space-y-1">
                  <p className="font-bold text-foreground">Ronda 4 / 6 · Fase de Producción</p>
                  <p className="text-muted-foreground">
                    Los jugadores reciben recursos según sus tableros de facción.
                  </p>
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  variant="default"
                  label="Confirmar y Continuar"
                  onClick={() => setIsSheetOpen(false)}
                />
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Dialog Trigger */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                icon={Layers}
                label="Abrir Modal Chasis (Dialog)"
                className="w-full justify-start"
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Finalizar Partida</DialogTitle>
                <DialogDescription>
                  Se calcularán los puntos de victoria finales y se actualizará el Elo del grupo.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p className="text-xs text-muted-foreground">
                  ¿Estás seguro de registrar el resultado de esta partida?
                </p>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="outline"
                  label="Cancelar"
                  onClick={() => setIsDialogOpen(false)}
                />
                <Button
                  variant="destructive"
                  label="Registrar Partida"
                  onClick={() => {
                    setIsDialogOpen(false)
                    toast.success("Partida registrada", {
                      description: "Puntuaciones sincronizadas con éxito.",
                    })
                  }}
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Floating HUD Toast Triggers */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Notificaciones HUD en Zona de Pulgar (Toasts)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle2}
              label="Toast Victoria (Success)"
              onClick={() =>
                toast.success("¡Partida Ganada!", {
                  description: "Has sumado +32 puntos Elo en el ranking.",
                })
              }
            />
            <Button
              variant="outline"
              size="sm"
              icon={AlertTriangle}
              label="Toast Alerta (Error)"
              onClick={() =>
                toast.error("Turno Perdido", {
                  description: "Tiempo agotado en el reloj de turno.",
                })
              }
            />
            <Button
              variant="outline"
              size="sm"
              icon={Bell}
              label="Toast Información (Info)"
              onClick={() =>
                toast.info("Nuevo Miembro", {
                  description: "Alex se ha unido a la mesa de juego.",
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
