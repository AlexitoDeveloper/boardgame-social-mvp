import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Users, Loader2, Code, Search, Clipboard, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { useGroups } from '../hooks/useGroups'
import { motion } from 'framer-motion'

const MotionDiv = motion.div
const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
} as const
const itemVars = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
} as const

export function GroupsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { groups, loading, error, createGroup, joinGroup } = useGroups()

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Modals States
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Listen to ?create=true search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('create') === 'true') {
      setIsCreateOpen(true)
      // Remove query parameter from URL to prevent reopening on reload
      navigate('/grupos', { replace: true })
    }
  }, [location.search, navigate])

  // Join Form State
  const [inviteCode, setInviteCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Create Form State
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Copy success feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setJoinLoading(true)
    setJoinError(null)
    try {
      const joined = await joinGroup(inviteCode)
      setIsJoinOpen(false)
      setInviteCode('')
      navigate(`/grupos/${joined.id}`)
    } catch (err: any) {
      setJoinError(err.message || 'No se pudo unir al grupo.')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    setCreateLoading(true)
    setCreateError(null)
    try {
      const created = await createGroup(groupName, groupDesc)
      setIsCreateOpen(false)
      setGroupName('')
      setGroupDesc('')
      navigate(`/grupos/${created.id}`)
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear el grupo.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCopyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter groups
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <section className="space-y-6 pb-20 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/75 bg-clip-text text-transparent">
            Grupos de Juego
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea ludotecas compartidas con tus amigos y votad qué jugar en vuestra próxima quedada.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => { setIsJoinOpen(true); setJoinError(null); setInviteCode('') }}
            variant="outline"
            className="cursor-pointer font-bold rounded-2xl flex items-center gap-1.5 h-11"
          >
            <Code className="h-4 w-4 text-primary" />
            <span>Unirse con código</span>
          </Button>

          <Button
            onClick={() => { setIsCreateOpen(true); setCreateError(null); setGroupName(''); setGroupDesc('') }}
            className="cursor-pointer font-bold rounded-2xl flex items-center gap-1.5 h-11 shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Crear grupo</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold">
          Error al cargar los grupos: {error}
        </div>
      )}

      {/* Main content grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border/10" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        /* Empty State */
        <div className="text-center py-24 border border-dashed border-border/60 rounded-2xl bg-muted/10 max-w-xl mx-auto space-y-4">
          <Users className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <p className="text-muted-foreground font-bold text-lg">No perteneces a ningún grupo lúdico aún</p>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto leading-normal">
              Crea un grupo e invita a tus amigos, o pide que te pasen un código para unir tu ludoteca personal.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={() => { setIsJoinOpen(true); setJoinError(null) }}
              variant="outline"
              size="sm"
              className="cursor-pointer font-bold rounded-xl"
            >
              Unirse con código
            </Button>
            <Button
              onClick={() => { setIsCreateOpen(true); setCreateError(null) }}
              size="sm"
              className="cursor-pointer font-bold rounded-xl shadow-sm"
            >
              Crear primer grupo
            </Button>
          </div>
        </div>
      ) : (
        /* Groups List with search */
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Ningún grupo coincide con tu búsqueda.
            </div>
          ) : (
            <MotionDiv
              variants={containerVars}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredGroups.map((group) => (
                <MotionDiv
                  key={group.id}
                  variants={itemVars}
                  onClick={() => navigate(`/grupos/${group.id}`)}
                  className="group relative block p-5 rounded-2xl bg-card/65 border border-border/30 hover:border-primary/30 shadow-md hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden text-left"
                >
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-primary/20 transition-all duration-300" />

                  <div className="flex flex-col justify-between h-full space-y-4">
                    {/* Header */}
                    <div className="space-y-1.5">
                      <h4 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {group.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {group.description || 'Sin descripción.'}
                      </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                        <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{group.member_count || 1} {group.member_count === 1 ? 'miembro' : 'miembros'}</span>
                      </div>

                      {/* Code button */}
                      <button
                        onClick={(e) => handleCopyCode(e, group.invite_code, group.id)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors z-10"
                        title="Copiar código de invitación"
                      >
                        {copiedId === group.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="h-3 w-3" />
                            <span>{group.invite_code}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          )}
        </div>
      )}

      {/* ── MODAL: UNIRSE A GRUPO ────────────────────────────── */}
      <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <DialogContent className="max-w-sm bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
          <DialogHeader className="border-b border-border/25 pb-2">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" /> Unirse a Grupo
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              Introduce el código de invitación del grupo para agregarte como miembro y fusionar tu ludoteca.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Input
                type="text"
                placeholder="Ej. GP-XXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono text-center uppercase tracking-wider text-sm font-bold"
                required
                disabled={joinLoading}
              />
              {joinError && (
                <p className="text-xs font-semibold text-destructive px-1">{joinError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsJoinOpen(false)}
                className="rounded-xl font-bold text-xs"
                disabled={joinLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-bold text-xs px-4"
                disabled={joinLoading || !inviteCode.trim()}
              >
                {joinLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Unirse</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREAR GRUPO ───────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
          <DialogHeader className="border-b border-border/25 pb-2">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Crear Nuevo Grupo
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              Forma una comunidad privada para las quedadas de tu grupo de amigos habitual.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">
                Nombre del Grupo
              </label>
              <Input
                type="text"
                placeholder="Ej. Los Reyes del Cartón"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={45}
                required
                disabled={createLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">
                Descripción (Opcional)
              </label>
              <Textarea
                placeholder="Ej. Quedamos los fines de semana en casa de Dani para jugar wargames y eurogames..."
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                maxLength={150}
                className="resize-none h-20 text-xs"
                disabled={createLoading}
              />
            </div>

            {createError && (
              <p className="text-xs font-semibold text-destructive px-1">{createError}</p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl font-bold text-xs"
                disabled={createLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-bold text-xs px-4"
                disabled={createLoading || !groupName.trim()}
              >
                {createLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Crear grupo</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
export default GroupsPage;
