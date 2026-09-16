import { useState } from 'react'
import { Crown, RotateCw } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

interface FirstPlayerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FirstPlayerModal({ open, onOpenChange }: FirstPlayerModalProps) {
  const [players, setPlayers] = useState<string[]>(['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'])
  const [chosenPlayer, setChosenPlayer] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleUpdateName = (index: number, name: string) => {
    const updated = [...players]
    updated[index] = name
    setPlayers(updated)
  }

  const handleAddPlayer = () => {
    if (players.length < 8) {
      setPlayers([...players, `Jugador ${players.length + 1}`])
    }
  }

  const handleRemovePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const handlePickFirstPlayer = () => {
    setIsSpinning(true)
    setChosenPlayer(null)

    let counter = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * players.length)
      setChosenPlayer(players[randomIndex])
      counter++

      if (counter > 15) {
        clearInterval(interval)
        const finalWinner = players[Math.floor(Math.random() * players.length)]
        setChosenPlayer(finalWinner)
        setIsSpinning(false)
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        })
      }
    }, 80)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <Crown className="w-5 h-5 text-amber-500" />
            ¿Quién empieza la partida?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sortea de forma justa y rápida el jugador inicial de la ronda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Winner Banner */}
          {chosenPlayer && (
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isSpinning 
                ? 'bg-muted/40 border-border/40 opacity-70 scale-95' 
                : 'bg-amber-500/15 border-amber-500/30 scale-100 shadow-xl'
            }`}>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-500">
                {isSpinning ? 'Sorteando...' : '👑 ¡Comienza el turno!'}
              </span>
              <h3 className="text-2xl font-black text-foreground mt-0.5">
                {chosenPlayer}
              </h3>
            </div>
          )}

          {/* Players Input List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {players.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant="outline" className="w-7 h-7 flex items-center justify-center font-bold text-xs shrink-0">
                  {i + 1}
                </Badge>
                <Input
                  value={name}
                  onChange={(e) => handleUpdateName(i, e.target.value)}
                  className="h-8 text-xs font-semibold"
                  placeholder={`Jugador ${i + 1}`}
                />
                {players.length > 2 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePlayer(i)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddPlayer}
              disabled={players.length >= 8}
              className="text-xs font-bold"
            >
              + Añadir Jugador
            </Button>

            <Button
              onClick={handlePickFirstPlayer}
              disabled={isSpinning}
              className="font-bold text-xs shadow-md shadow-primary/20"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Girando...' : 'Sortear Inicial'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
