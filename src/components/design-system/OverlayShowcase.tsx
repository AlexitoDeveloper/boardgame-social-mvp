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
import { LayoutList, Layers, CheckCircle2, AlertCircle, Share2, Trash2 } from "lucide-react"

export function OverlayShowcase() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  return (
    <Card className="p-6 bg-card border border-border/80">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>05. Capas Flotantes, Hojas Móviles y Toasts</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Bottom Sheets, Diálogos de Confirmación y Notificaciones)
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Interacciones fluidas para móvil con safe-areas nativas y diálogos de acción destructiva segura.
        </p>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bottom Sheet Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                icon={LayoutList}
                label="Abrir Ficha Rápida (Bottom Sheet)"
                className="w-full justify-start"
              />
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Detalle Rápido de Mesa: Scythe</SheetTitle>
                <SheetDescription>
                  Revisa los detalles de la sesión sin abandonar la vista del mapa o lista.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="p-4 rounded-xl border border-border/70 bg-surface-elevated/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Club Kaburi · Mesa 02</span>
                    <span className="text-primary dark:text-[#FF80B0] font-black font-mono">19:30h</span>
                  </div>
                  <p className="text-muted-foreground">
                    Partida a 4 jugadores con módulos de edificios alternativos. Duración estimada 2h.
                  </p>
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  variant="default"
                  label="Confirmar Mi Asistencia"
                  onClick={() => {
                    setIsSheetOpen(false)
                    toast.success("¡Plaza confirmada!", {
                      description: "Te hemos añadido a la lista de asistentes de la mesa.",
                    })
                  }}
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
                label="Diálogo de Salida (Confirmación Segura)"
                className="w-full justify-start"
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Abandonar esta mesa?</DialogTitle>
                <DialogDescription>
                  Tu plaza quedará libre inmediatamente para que otro jugador de la comunidad pueda unirse.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="p-3.5 rounded-xl border border-border/60 bg-surface-elevated/30 text-xs text-muted-foreground">
                  Si cambias de idea, podrás volver a solicitar plaza siempre que el aforo no se haya completado.
                </div>
              </DialogBody>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  label="Mantener mi Plaza"
                  onClick={() => setIsDialogOpen(false)}
                />
                <Button
                  variant="destructive"
                  icon={Trash2}
                  label="Abandonar Mesa"
                  onClick={() => {
                    setIsDialogOpen(false)
                    toast.info("Has abandonado la mesa", {
                      description: "Tu plaza se ha liberado para otros jugadores.",
                    })
                  }}
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Toasts Test Row */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Notificaciones Táctiles (Feedback Instantáneo)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle2}
              label="Toast: Éxito"
              onClick={() =>
                toast.success("Partida registrada", {
                  description: "Los puntos y el Elo de los 4 jugadores se han guardado.",
                })
              }
            />
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              label="Toast: Enlace Copiado"
              onClick={() =>
                toast.info("Enlace de mesa copiado", {
                  description: "Compártelo con tu grupo de Telegram o WhatsApp.",
                })
              }
            />
            <Button
              variant="outline"
              size="sm"
              icon={AlertCircle}
              label="Toast: Alerta"
              onClick={() =>
                toast.error("Queda solo 1 plaza", {
                  description: "La mesa de Ark Nova está a punto de completarse.",
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
