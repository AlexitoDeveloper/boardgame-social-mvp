import { useState, FC, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Plus, Minus, UserPlus, Trash2, Crown, Save, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { PlayerScore, MeepleColor } from '../../types'
import { cn } from '../../lib/utils'

interface LiveScoreTrackerProps {
  initialScores?: PlayerScore[] | null
  attendees?: { id: string; name: string; avatarUrl?: string | null }[]
  isEditable?: boolean
  onSaveScores?: (scores: PlayerScore[]) => Promise<void>
}

const AVAILABLE_COLORS: MeepleColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'orange']

const COLOR_BADGES: Record<MeepleColor, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  yellow: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  green: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
}

export const LiveScoreTracker: FC<LiveScoreTrackerProps> = ({
  initialScores,
  attendees = [],
  isEditable = true,
  onSaveScores,
}) => {
  const [scores, setScores] = useState<PlayerScore[]>([])
  const [newGuestName, setNewGuestName] = useState('')
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize scores from props or registered attendees
  useEffect(() => {
    if (initialScores && initialScores.length > 0) {
      setScores(initialScores)
    } else if (attendees.length > 0) {
      const generated: PlayerScore[] = attendees.map((a, idx) => ({
        userId: a.id,
        name: a.name,
        score: 0,
        meepleColor: AVAILABLE_COLORS[idx % AVAILABLE_COLORS.length],
      }))
      setScores(generated)
    }
  }, [initialScores, attendees])

  // Compute leader and ranks
  const maxScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0
  const hasLeader = maxScore > 0

  const handleAdjustScore = (index: number, delta: number) => {
    if (!isEditable) return
    setScores((prev) => {
      const updated = [...prev]
      const current = updated[index].score || 0
      updated[index] = { ...updated[index], score: Math.max(0, current + delta) }
      return updated
    })
    setSaveSuccess(false)
  }

  const handleSetExactScore = (index: number, value: number) => {
    if (!isEditable) return
    setScores((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], score: Math.max(0, value) }
      return updated
    })
    setSaveSuccess(false)
  }

  const handleAddGuest = () => {
    const trimmed = newGuestName.trim()
    if (!trimmed) return

    const newGuest: PlayerScore = {
      guestId: `guest-${Date.now()}`,
      name: trimmed,
      score: 0,
      meepleColor: AVAILABLE_COLORS[scores.length % AVAILABLE_COLORS.length],
    }

    setScores((prev) => [...prev, newGuest])
    setNewGuestName('')
    setShowAddGuest(false)
    setSaveSuccess(false)
  }

  const handleRemovePlayer = (index: number) => {
    if (!isEditable) return
    setScores((prev) => prev.filter((_, idx) => idx !== index))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!onSaveScores) return
    setIsSaving(true)
    try {
      // Sort and assign ranks and winner flag
      const sorted = [...scores].sort((a, b) => b.score - a.score)
      const ranked: PlayerScore[] = sorted.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        isWinner: idx === 0 && item.score > 0,
      }))

      await onSaveScores(ranked)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err) {
      console.error('Error saving player scores:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border/40 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-foreground tracking-tight">
              Marcador de Mesa
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Anotad los puntos de la partida en vivo
            </p>
          </div>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddGuest(true)}
              className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invitado</span>
            </Button>

            {onSaveScores && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  'h-8 px-3 rounded-xl text-xs font-bold gap-1.5 cursor-pointer transition-all',
                  saveSuccess && 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardado</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add guest inline form */}
      {showAddGuest && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-muted/40 rounded-2xl border border-border/40 flex items-center gap-2"
        >
          <Input
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            placeholder="Nombre del amigo o invitado..."
            className="h-9 text-xs rounded-xl bg-background"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddGuest()
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddGuest}
            disabled={!newGuestName.trim()}
            className="h-9 text-xs font-bold rounded-xl shrink-0"
          >
            Añadir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAddGuest(false)}
            className="h-9 px-2 rounded-xl text-xs shrink-0"
          >
            Cancelar
          </Button>
        </motion.div>
      )}

      {/* Players Score Cards Grid */}
      {scores.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-xs font-medium bg-muted/20 rounded-2xl border border-dashed border-border/40">
          No hay jugadores anotados en este marcador.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scores.map((player, idx) => {
            const isLeader = hasLeader && player.score === maxScore
            const badge = COLOR_BADGES[player.meepleColor] || COLOR_BADGES.green

            return (
              <div
                key={player.userId || player.guestId || idx}
                className={cn(
                  'p-4 rounded-2xl border transition-all duration-200 bg-card/60 backdrop-blur-md flex flex-col justify-between gap-3 relative overflow-hidden',
                  isLeader
                    ? 'border-amber-400/50 shadow-md shadow-amber-500/5 bg-amber-500/[0.03]'
                    : 'border-border/40 hover:border-border/60'
                )}
              >
                {/* Player identity & Rank badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black uppercase shrink-0',
                        badge.bg,
                        badge.text,
                        badge.border
                      )}
                    >
                      {player.name.substring(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs md:text-sm text-foreground truncate block">
                          {player.name}
                        </span>
                        {isLeader && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      {player.guestId && (
                        <span className="text-[10px] text-muted-foreground font-medium block">
                          Invitado
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditable && player.guestId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlayer(idx)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                      title="Eliminar invitado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                {/* Score display & Adjust buttons */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/20">
                  {/* Score big number */}
                  <div className="flex items-baseline gap-1">
                    <Input
                      type="number"
                      value={player.score}
                      disabled={!isEditable}
                      onChange={(e) => handleSetExactScore(idx, parseInt(e.target.value) || 0)}
                      className="w-20 h-10 font-mono font-black text-xl text-foreground text-center rounded-xl bg-background/50 border-border/40"
                    />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      pts
                    </span>
                  </div>

                  {/* Increment / Decrement buttons */}
                  {isEditable && (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustScore(idx, -5)}
                        className="h-8 px-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground"
                        title="-5 puntos"
                      >
                        -5
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustScore(idx, -1)}
                        className="h-8 w-8 p-0 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground"
                        title="-1 punto"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustScore(idx, 1)}
                        className="h-8 w-8 p-0 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 border-primary/30"
                        title="+1 punto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustScore(idx, 5)}
                        className="h-8 px-2 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 border-primary/30"
                        title="+5 puntos"
                      >
                        +5
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
