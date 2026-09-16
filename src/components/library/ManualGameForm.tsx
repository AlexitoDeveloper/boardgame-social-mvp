import { FC, useState, FormEvent } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Game } from '../../types'

interface ManualGameFormProps {
  onAddGame: (game: Game) => Promise<void>
  onClose: () => void
}

export const ManualGameForm: FC<ManualGameFormProps> = ({ onAddGame, onClose }) => {
  const [title, setTitle] = useState('')
  const [minPlayers, setMinPlayers] = useState('2')
  const [maxPlayers, setMaxPlayers] = useState('5')
  const [playingTime, setPlayingTime] = useState('45')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || submitting) return

    setSubmitting(true)
    try {
      // Generate unique negative integer pseudo bgg_id for custom games to avoid any BGG collision
      const customId = -Math.floor(Date.now() / 1000)
      const customGame: Game = {
        bgg_id: customId,
        title: title.trim(),
        min_players: parseInt(minPlayers, 10) || 2,
        max_players: parseInt(maxPlayers, 10) || 5,
        playing_time: parseInt(playingTime, 10) || 45,
        year_published: new Date().getFullYear(),
        image_url: null,
      }

      await onAddGame(customGame)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error('Error creating custom game:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
      <div className="space-y-1">
        <Label htmlFor="custom-title" className="text-xs font-bold text-foreground">
          Nombre del juego *
        </Label>
        <Input
          id="custom-title"
          type="text"
          required
          placeholder="Ej. Mi Prototipo, Virus!, etc."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl h-9 text-xs"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <Label htmlFor="custom-min" className="text-xs font-bold text-muted-foreground">
            Mín. Jug.
          </Label>
          <Input
            id="custom-min"
            type="number"
            min="1"
            max="99"
            value={minPlayers}
            onChange={(e) => setMinPlayers(e.target.value)}
            className="rounded-xl h-8 text-xs font-mono-tabular"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="custom-max" className="text-xs font-bold text-muted-foreground">
            Máx. Jug.
          </Label>
          <Input
            id="custom-max"
            type="number"
            min="1"
            max="99"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            className="rounded-xl h-8 text-xs font-mono-tabular"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="custom-time" className="text-xs font-bold text-muted-foreground">
            Tiempo (min)
          </Label>
          <Input
            id="custom-time"
            type="number"
            min="5"
            step="5"
            value={playingTime}
            onChange={(e) => setPlayingTime(e.target.value)}
            className="rounded-xl h-8 text-xs font-mono-tabular"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="rounded-xl font-bold text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || submitting || success}
          className="rounded-xl font-bold text-xs px-4"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : success ? (
            <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
          ) : (
            <Plus className="w-3.5 h-3.5 mr-1" />
          )}
          <span>{success ? '¡Añadido!' : 'Guardar y Añadir'}</span>
        </Button>
      </div>
    </Form>
  )
}
