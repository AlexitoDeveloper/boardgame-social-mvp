import { useState, useEffect } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Form } from '../ui/form'

interface ImportBggModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  importingCollection: boolean;
  importError: string;
  setImportError: (err: string) => void;
  importSuccessCount: number | null;
  setImportSuccessCount: (count: number | null) => void;
  onImport: (bggUsername: string) => Promise<void>;
}

export function ImportBggModal({
  isOpen,
  onOpenChange,
  importingCollection,
  importError,
  setImportError,
  importSuccessCount,
  setImportSuccessCount,
  onImport
}: ImportBggModalProps) {
  const [bggUsernameInput, setBggUsernameInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      setBggUsernameInput('')
      setImportError('')
      setImportSuccessCount(null)
    }
  }, [isOpen, setImportError, setImportSuccessCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bggUsernameInput.trim()) return
    try {
      await onImport(bggUsernameInput)
    } catch {
      // Errors are caught and handled by the parent useProfile hook setting importError
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !importingCollection && onOpenChange(open)}>
      <DialogContent className="max-w-md bg-card border-border/50 rounded-3xl p-6 shadow-2xl text-left gap-4">
        <DialogHeader className="border-b border-border/20 pb-2 flex flex-col space-y-1.5 text-left sm:text-left">
          <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Importar desde BGG
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            Ingresa tu usuario de BoardGameGeek para sincronizar tus juegos de propiedad.
          </DialogDescription>
        </DialogHeader>

        {importError && (
          <div className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            {importError}
          </div>
        )}

        {importSuccessCount !== null ? (
          <div className="text-center py-6 space-y-2.5 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-foreground">¡Importación Completada!</h4>
            <p className="text-xs text-muted-foreground">
              Se han importado <span className="font-bold text-emerald-500">{importSuccessCount}</span> juegos de propiedad a tu ludoteca.
            </p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="bgg-username" className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">Usuario de BoardGameGeek</Label>
              <Input
                id="bgg-username"
                type="text"
                required
                value={bggUsernameInput}
                onChange={(e) => setBggUsernameInput(e.target.value)}
                placeholder="Ej. alex_meeple_99"
                disabled={importingCollection}
              />
            </div>

            <div className="bg-muted/30 border border-border/20 rounded-2xl p-4 space-y-2.5 text-xs text-muted-foreground font-semibold leading-relaxed">
              <div className="flex gap-2">
                <span className="text-primary shrink-0">ℹ️</span>
                <p>
                  Importaremos únicamente los juegos marcados como de tu propiedad (<strong>"own=1"</strong>) en tu perfil de BGG.
                </p>
              </div>
              <div className="flex gap-2 border-t border-border/10 pt-2">
                <span className="text-amber-500 shrink-0">⚠️</span>
                <p>
                  Si es la primera vez en mucho tiempo que consultas tu perfil en BGG, la API de BGG podría tardar unos instantes en compilar tu colección. Esperaremos de forma segura en segundo plano.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={importingCollection}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={importingCollection || !bggUsernameInput.trim()}
              >
                {importingCollection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 shrink-0" />
                    Importando colección...
                  </>
                ) : (
                  'Empezar Importación'
                )}
              </Button>
            </div>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
