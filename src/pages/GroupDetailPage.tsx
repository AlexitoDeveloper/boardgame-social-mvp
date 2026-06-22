import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Clipboard, Check, Plus, Trash2, LogOut, Crown, Layers, Calendar, Search, CheckSquare, Loader2, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs } from '../components/ui/tabs'
import { GameCoverCard } from '../components/GameCoverCard'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useAuth } from '../lib/authContext'
import { CalendarDatePicker } from '../components/CalendarDatePicker'

function formatMeetupDate(dateStr: string) {
  try {
    if (dateStr.length === 10 && dateStr.includes('-') && !dateStr.includes('T')) {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

export function GroupDetailPage() {
  const { id: groupId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    group,
    members,
    mergedCollection,
    polls,
    loading,
    error,
    createPoll,
    voteGame,
    closePoll,
    leaveGroup,
    kickMember,
    deleteGroup
  } = useGroupDetail(groupId)

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'ludoteca' | 'polls' | 'members'>('ludoteca')

  // Search inside merged collection
  const [collectionSearch, setCollectionSearch] = useState('')

  // Invite code copy feedback
  const [copied, setCopied] = useState(false)

  // Create Poll Modal State
  const [isPollOpen, setIsPollOpen] = useState(false)
  const [pollTitle, setPollTitle] = useState('')
  const [pollDesc, setPollDesc] = useState('')
  const [pollDate, setPollDate] = useState('')
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([])
  const [pollLoading, setPollLoading] = useState(false)
  const [pollError, setPollError] = useState<string | null>(null)
  const [pollGameSearch, setPollGameSearch] = useState('')
  const [hasPollDate, setHasPollDate] = useState(false)

  // Local Action Error Banner State
  const [actionError, setActionError] = useState<string | null>(null)

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const triggerConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText = 'Confirmar',
    isDestructive = false
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmText,
      isDestructive
    })
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-bold">Cargando detalles del grupo...</p>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold">
          {error || 'Grupo no encontrado.'}
        </div>
        <Button onClick={() => navigate('/grupos')} className="rounded-xl flex items-center gap-1.5 mx-auto">
          <ArrowLeft className="h-4 w-4" /> Volver a Grupos
        </Button>
      </div>
    )
  }

  const isCreator = group.creator_id === user?.id
  const isAdmin = members.find(m => m.user_id === user?.id)?.role === 'admin' || isCreator

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = () => {
    triggerConfirm(
      '¿Salir del Grupo?',
      '¿Seguro que quieres salir de este grupo? Su ludoteca ya no estará fusionada con la del resto de miembros.',
      async () => {
        setActionError(null)
        try {
          await leaveGroup()
          navigate('/grupos')
        } catch (err: any) {
          setActionError(err.message || 'Error al abandonar el grupo.')
        }
      },
      'Salir del grupo',
      true
    )
  }

  const handleDelete = () => {
    triggerConfirm(
      '¿Eliminar Grupo?',
      '¿Seguro que quieres ELIMINAR este grupo? Esta acción es irreversible y borrará permanentemente todas las encuestas, miembros y registros de votación.',
      async () => {
        setActionError(null)
        try {
          await deleteGroup()
          navigate('/grupos')
        } catch (err: any) {
          setActionError(err.message || 'Error al eliminar el grupo.')
        }
      },
      'Eliminar permanentemente',
      true
    )
  }

  const handleKick = (targetUserId: string, username: string) => {
    triggerConfirm(
      '¿Expulsar Miembro?',
      `¿Seguro que quieres expulsar a ${username} del grupo? Sus juegos ya no estarán incluidos en la ludoteca compartida.`,
      async () => {
        setActionError(null)
        try {
          await kickMember(targetUserId)
        } catch (err: any) {
          setActionError(err.message || 'Error al expulsar al miembro.')
        }
      },
      'Expulsar',
      true
    )
  }

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pollTitle.trim()) return
    if (selectedGameIds.length === 0) {
      setPollError('Debes nominar al menos un juego de la ludoteca compartida.')
      return
    }

    setPollLoading(true)
    setPollError(null)
    try {
      await createPoll(pollTitle, pollDesc, hasPollDate && pollDate ? pollDate : null, selectedGameIds)
      setIsPollOpen(false)
      setPollTitle('')
      setPollDesc('')
      setPollDate('')
      setSelectedGameIds([])
    } catch (err: any) {
      setPollError(err.message || 'Error al crear la encuesta.')
    } finally {
      setPollLoading(false)
    }
  }

  const handleToggleGameNomination = (gameId: number) => {
    setSelectedGameIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    )
  }

  // Filter merged games
  const filteredMerged = mergedCollection.filter(item =>
    item.game.title.toLowerCase().includes(collectionSearch.toLowerCase()) ||
    (item.game.title_es && item.game.title_es.toLowerCase().includes(collectionSearch.toLowerCase()))
  )

  return (
    <section className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Back navigation and admin controls (sticky on mobile with safe-area spacing) */}
      <div className="sticky top-[-2px] z-30 flex items-center justify-between pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/90 backdrop-blur-md border-b border-border/20 transition-all duration-200">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/grupos')} 
          className="rounded-xl flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 border border-border/20 hover:bg-muted/50 cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Volver a Grupos</span><span className="xs:hidden">Volver</span>
        </Button>

        <div className="flex gap-2">
          {isCreator ? (
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-9 flex items-center gap-1 cursor-pointer border border-transparent hover:border-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">Eliminar Grupo</span><span className="xs:hidden">Eliminar</span>
            </Button>
          ) : (
            <Button
              onClick={handleLeave}
              variant="ghost"
              className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-9 flex items-center gap-1 cursor-pointer border border-transparent hover:border-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">Salir del Grupo</span><span className="xs:hidden">Salir</span>
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold flex justify-between items-center animate-in fade-in duration-200">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs hover:underline font-bold bg-transparent border-none text-destructive cursor-pointer">Cerrar</button>
        </div>
      )}

      {/* Group Detail Card / Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 p-6 rounded-2xl bg-card/65 border border-border/30 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-7 w-7 text-primary shrink-0" />
              <span>{group.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {group.description || 'Este grupo privado no tiene descripción lúdica establecida.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold pt-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span>{members.length} {members.length === 1 ? 'miembro activo' : 'miembros activos'}</span>
          </div>
        </div>

        {/* Invite Code card */}
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-primary tracking-widest">Código de Invitación</h4>
            <p className="text-[10px] text-muted-foreground font-semibold leading-normal">
              Comparte este código con tus amigos para que puedan unirse y fusionar su ludoteca.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-center text-lg font-black bg-card border border-border/30 rounded-xl py-2 px-3 tracking-wider text-foreground">
              {group.invite_code}
            </div>

            <Button
              onClick={handleCopyCode}
              variant={copied ? 'default' : 'outline'}
              className="rounded-xl h-11 px-3.5 shrink-0"
              title="Copiar código"
            >
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <Tabs
        options={[
          { id: 'ludoteca', label: 'Ludoteca Compartida', icon: Layers, count: mergedCollection.length },
          { id: 'polls', label: 'Quedadas y Votos', icon: Calendar, count: polls.length },
          { id: 'members', label: 'Miembros', icon: Users, count: members.length }
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        hideLabelsOnMobile
      />

      {/* Tabs Content */}
      <div className="min-h-[300px]">
        {/* ── TAB: MERGED LUDOTECA ───────────────────────────── */}
        {activeTab === 'ludoteca' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar en la ludoteca fusionada..."
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Ludotecas unificadas de todos los miembros del grupo</span>
              </div>
            </div>

            {filteredMerged.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-muted/15 max-w-md mx-auto space-y-3">
                <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground font-bold text-sm">La ludoteca compartida está vacía</p>
                <p className="text-xs text-foreground/50 px-6 max-w-sm mx-auto leading-normal">
                  Los miembros del grupo deben importar su colección de BGG desde la pantalla de su **Perfil** para poblar la ludoteca compartida.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredMerged.map((item) => (
                  <div key={item.game.bgg_id} className="space-y-2 flex flex-col justify-between">
                    <GameCoverCard game={item.game} />
                    <div className="text-[10px] bg-muted/30 p-2 rounded-xl border border-border/20 space-y-1.5">
                      <p className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider leading-none">Poseído por:</p>
                      <div className="flex flex-wrap gap-1 items-center">
                        {item.owners.map((owner) => {
                          const initials = owner.username.slice(0, 2).toUpperCase()
                          return (
                            <div
                              key={owner.user_id}
                              className="flex items-center gap-1 bg-background/60 hover:bg-background px-1.5 py-1 rounded-lg border border-border/15 font-semibold text-foreground/80 text-[10px] shadow-sm select-all transition-colors cursor-default"
                              title={owner.username}
                            >
                              <Avatar className="h-4 w-4 shrink-0 border border-primary/20">
                                <AvatarImage src={owner.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-[6px] font-bold">{initials}</AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[70px]">
                                {owner.user_id === user?.id ? 'Tú' : owner.username}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: POLLS & MEETUPS ───────────────────────────── */}
        {activeTab === 'polls' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header / Create Poll */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight text-foreground">Encuestas de Quedadas</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Vota los juegos candidatos para organizar la próxima mesa de juego.</p>
              </div>

              {isAdmin && (
                <Button
                  onClick={() => { setIsPollOpen(true); setPollError(null); setPollTitle(''); setPollDesc(''); setPollDate(''); setSelectedGameIds([]); setPollGameSearch(''); setHasPollDate(false) }}
                  className="rounded-xl flex items-center gap-1.5 font-bold text-xs h-9 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Encuesta</span>
                </Button>
              )}
            </div>

            {polls.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-muted/15 max-w-md mx-auto space-y-3">
                <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground font-bold text-sm">No hay encuestas activas</p>
                <p className="text-xs text-foreground/50 px-6 max-w-sm mx-auto leading-normal">
                  Crea una encuesta para nominar varios juegos de la ludoteca compartida y comenzar las votaciones.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {polls.map((poll) => {
                  // Find winning option(s) if closed
                  let winningGameIds: number[] = []
                  if (poll.status === 'closed') {
                    let maxVotes = 0
                    poll.options.forEach(opt => {
                      if (opt.votes.length > maxVotes) {
                        maxVotes = opt.votes.length
                        winningGameIds = [opt.game_id]
                      } else if (opt.votes.length === maxVotes && maxVotes > 0) {
                        winningGameIds.push(opt.game_id)
                      }
                    })
                  }

                  return (
                    <Card key={poll.id} className="p-5 border-border/30 bg-card/65 rounded-2xl shadow-sm relative overflow-hidden flex flex-col space-y-4">
                      {/* Poll Title & Header info */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/20 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-black tracking-tight text-foreground">
                              {poll.title}
                            </h4>
                            <Badge variant={poll.status === 'open' ? 'success' : 'secondary'}>
                              {poll.status === 'open' ? 'Activa' : 'Cerrada'}
                            </Badge>
                          </div>
                          {poll.description && (
                            <p className="text-xs text-muted-foreground leading-normal max-w-2xl">{poll.description}</p>
                          )}
                          {poll.meetup_date && (
                            <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-1 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-lg w-fit">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Fecha propuesta: {formatMeetupDate(poll.meetup_date)}</span>
                            </div>
                          )}
                        </div>

                        {/* Poll action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {poll.status === 'open' && isAdmin && (
                            <Button
                              onClick={() => {
                                triggerConfirm(
                                  '¿Cerrar Votación?',
                                  '¿Seguro que quieres cerrar la votación y declarar el juego ganador? Los miembros ya no podrán votar más.',
                                  async () => {
                                    setActionError(null)
                                    try {
                                      await closePoll(poll.id)
                                    } catch (err: any) {
                                      setActionError(err.message || 'Error al cerrar la encuesta.')
                                    }
                                  },
                                  'Cerrar Votación',
                                  false
                                )
                              }}
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-[10px] font-black uppercase tracking-wider h-8 cursor-pointer"
                            >
                              Cerrar Votación
                            </Button>
                          )}

                          {poll.status === 'closed' && (
                            <div className="flex items-center gap-1.5">
                              {winningGameIds.length > 0 ? (
                                <Button
                                  onClick={() => {
                                    const firstWinner = poll.options.find(o => o.game_id === winningGameIds[0])?.game
                                    const winnerTitle = firstWinner?.title_es || firstWinner?.title || 'Juego Ganador'
                                    navigate(`/tablero/new?game_id=${winningGameIds[0]}&title=${encodeURIComponent(`Quedada: ${poll.title}`)}&description=${encodeURIComponent(`Quedada del grupo para jugar a ${winnerTitle}.`)}`)
                                  }}
                                  size="sm"
                                  className="rounded-xl text-[10px] font-black uppercase tracking-wider h-8 shadow-sm flex items-center gap-1"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  <span>Crear Mesa</span>
                                </Button>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-extrabold uppercase">Sin ganadores (0 votos)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nominated Candidates options */}
                      <div className="space-y-3.5">
                        {poll.options.map((opt) => {
                          const hasVoted = opt.votes.some(v => v.user_id === user?.id)
                          const totalVotes = opt.votes.length
                          const isWinner = winningGameIds.includes(opt.game_id)

                          // Calculate relative percentage
                          const totalPollVotes = poll.options.reduce((a, b) => a + b.votes.length, 0)
                          const percentage = totalPollVotes > 0 ? (totalVotes / totalPollVotes) * 100 : 0

                          return (
                            <div
                              key={opt.id}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all gap-4 relative overflow-hidden ${
                                isWinner
                                  ? 'bg-amber-500/5 border-amber-500/30'
                                  : 'bg-background/45 border-border/20'
                              }`}
                            >
                              {/* Background vote filling bar */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 pointer-events-none rounded-l-xl transition-all duration-500 ${
                                  isWinner ? 'bg-amber-500/10' : 'bg-primary/10'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />

                              {/* Game Cover & name */}
                              <div className="flex items-center gap-3 flex-1 min-w-0 z-10">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center p-0.5 border border-border/30 shrink-0">
                                  {opt.game.image_url ? (
                                    <img src={opt.game.image_url} alt={opt.game.title} className="w-full h-full object-cover rounded-md" />
                                  ) : (
                                    <span className="text-[8px] font-bold text-center leading-tight">No IMG</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-sm text-foreground truncate block max-w-[250px]">
                                      {opt.game.title_es || opt.game.title}
                                    </span>
                                    {isWinner && (
                                      <Badge variant="warning" className="text-[8px] px-1.5 py-0.5">
                                        <Crown className="h-2 w-2 fill-amber-500" /> Ganador
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                      {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                                    </span>
                                    {totalVotes > 0 && (
                                      <>
                                        <span className="text-muted-foreground/30 text-[9px]">•</span>
                                        {/* Avatars row */}
                                        <div className="flex -space-x-1.5">
                                          {opt.votes.map((v, idx) => (
                                            <Avatar key={idx} className="w-4 h-4 border border-card shrink-0">
                                              <AvatarImage src={v.avatar_url || undefined} />
                                              <AvatarFallback className="text-[6px] bg-muted font-bold">
                                                {v.username.slice(0, 1).toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Vote action button */}
                              {poll.status === 'open' && (
                                <Button
                                  onClick={() => voteGame(poll.id, opt.game_id)}
                                  variant={hasVoted ? 'default' : 'outline'}
                                  size="sm"
                                  className={`rounded-xl font-bold text-[11px] h-8 px-4 z-10 shrink-0 flex items-center gap-1 cursor-pointer transition-all ${
                                    hasVoted
                                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                                      : 'text-foreground border-border/80 hover:bg-muted/40'
                                  }`}
                                >
                                  {hasVoted ? (
                                    <>
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Votado</span>
                                    </>
                                  ) : (
                                    <span>Votar</span>
                                  )}
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MEMBERS LIST ──────────────────────────────── */}
        {activeTab === 'members' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-black tracking-tight text-foreground">Participantes del Grupo</h3>

            <div className="bg-card/65 border border-border/30 rounded-2xl shadow-sm overflow-hidden divide-y divide-border/20">
              {members.map((member) => {
                const isMe = member.user_id === user?.id
                const isMemberCreator = member.user_id === group.creator_id

                return (
                  <div key={member.user_id} className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {member.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-foreground leading-none">
                            {member.username}
                          </span>
                          {isMe && (
                            <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 leading-none">
                              Tú
                            </Badge>
                          )}
                          {isMemberCreator && (
                            <Badge variant="warning" className="text-[8px] px-1.5 py-0.5 leading-none flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 fill-amber-500" /> Creador
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                          Miembro desde el {new Date(member.joined_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Kick Action */}
                    {isAdmin && !isMemberCreator && !isMe && (
                      <Button
                        onClick={() => handleKick(member.user_id, member.username)}
                        variant="ghost"
                        className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-[10px] h-8 px-2.5"
                      >
                        Expulsar
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: NUEVA ENCUESTA ────────────────────────────── */}
      <Dialog open={isPollOpen} onOpenChange={setIsPollOpen}>
        <DialogContent className="max-w-md bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
          <DialogHeader className="border-b border-border/25 pb-2">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Abrir Votación
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              Elige los juegos candidatos de la ludoteca compartida para que los miembros elijan su favorito.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePollSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Título de la Encuesta</label>
              <Input
                type="text"
                placeholder="Ej. Quedada del Sábado"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                maxLength={45}
                required
                disabled={pollLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Instrucciones / Notas</label>
              <Textarea
                placeholder="Ej. Votad qué eurogame os apetece más jugar. Empezaremos sobre las 17:00..."
                value={pollDesc}
                onChange={(e) => setPollDesc(e.target.value)}
                className="resize-none h-16 text-xs"
                maxLength={150}
                disabled={pollLoading}
              />
            </div>

            <div className="flex items-center justify-between px-1 py-1">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">¿Proponer fecha y hora para la quedada?</label>
              <input
                type="checkbox"
                checked={hasPollDate}
                onChange={(e) => setHasPollDate(e.target.checked)}
                className="accent-primary h-4 w-4 rounded border-border cursor-pointer"
                disabled={pollLoading}
              />
            </div>

            {hasPollDate && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Fecha y Hora Propuesta</label>
                <CalendarDatePicker value={pollDate} onChange={setPollDate} />
              </div>
            )}

            {/* Selection list of games */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">
                Nominar Juegos de la Ludoteca ({selectedGameIds.length} seleccionados)
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar juego para nominar..."
                  value={pollGameSearch}
                  onChange={(e) => setPollGameSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg bg-background/80"
                  disabled={pollLoading}
                />
              </div>
              <div className="border border-border/30 rounded-xl bg-background/50 max-h-40 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-border/10">
                {mergedCollection.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">Importa juegos a la ludoteca para poder nominarlos.</p>
                ) : (
                  (() => {
                    const filteredCollectionForPoll = mergedCollection.filter(item =>
                      item.game.title.toLowerCase().includes(pollGameSearch.toLowerCase()) ||
                      (item.game.title_es && item.game.title_es.toLowerCase().includes(pollGameSearch.toLowerCase()))
                    )
                    if (filteredCollectionForPoll.length === 0) {
                      return <p className="text-center text-xs text-muted-foreground py-4">No se encontraron juegos que coincidan.</p>
                    }
                    return filteredCollectionForPoll.map((item) => {
                      const isSelected = selectedGameIds.includes(item.game.bgg_id)
                      return (
                        <div
                          key={item.game.bgg_id}
                          onClick={() => handleToggleGameNomination(item.game.bgg_id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/30'
                          }`}
                        >
                          <CheckSquare className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/30'}`} />
                          <span className="text-xs font-bold text-foreground truncate flex-1 leading-none pt-0.5">
                            {item.game.title_es || item.game.title}
                          </span>
                        </div>
                      )
                    })
                  })()
                )}
              </div>
            </div>

            {pollError && (
              <p className="text-xs font-semibold text-destructive px-1">{pollError}</p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPollOpen(false)}
                className="rounded-xl font-bold text-xs"
                disabled={pollLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-bold text-xs px-4"
                disabled={pollLoading || !pollTitle.trim() || selectedGameIds.length === 0}
              >
                {pollLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Lanzar encuesta</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CONFIRMACIÓN GENERAL ────────────────────────── */}
      <Dialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-sm bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
          <DialogHeader className="border-b border-border/25 pb-2">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              {confirmConfig.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              {confirmConfig.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
              className="rounded-xl font-bold text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                confirmConfig.onConfirm()
                setConfirmConfig(prev => ({ ...prev, isOpen: false }))
              }}
              variant={confirmConfig.isDestructive ? 'destructive' : 'default'}
              className="rounded-xl font-bold text-xs px-4"
            >
              {confirmConfig.confirmText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
export default GroupDetailPage;
