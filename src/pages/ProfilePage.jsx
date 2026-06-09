import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { MOCK_REVIEWS } from '../lib/mockData'
import { Star, PencilLine, UploadCloud, Check, X, CalendarDays, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'

const MotionDiv = motion.div

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function ProfilePage() {
  const { user } = useAuth()
  const [reviews, setReviews]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [editingName, setEditingName]   = useState(false)
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario'
  const initials = username.slice(0, 2).toUpperCase()
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : ''

  const [newUsername, setNewUsername]   = useState(username)
  const [savingName, setSavingName]     = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl]       = useState(user?.user_metadata?.avatar_url || null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function fetchUserReviews() {
      if (!user?.id) { setLoading(false); return }
      const { data, error } = await supabase
        .from('reviews')
        .select('*, games(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error || !data?.length) {
        setReviews(MOCK_REVIEWS.map(r => ({
          ...r,
          users: { username, avatar_url: avatarUrl },
          games: r.games || { title: r.games_cache?.name || 'Juego desconocido' }
        })))
      } else {
        setReviews(data)
      }
      setLoading(false)
    }
    fetchUserReviews()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, avatarUrl, username])

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '–'

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || newUsername === username) { setEditingName(false); return }
    setSavingName(true)
    await supabase.auth.updateUser({ data: { username: newUsername.trim() } })
    setSavingName(false)
    setEditingName(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 256, useWebWorker: true })
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('review-photos').upload(path, compressed, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('review-photos').getPublicUrl(path)
        const url = data.publicUrl
        await supabase.auth.updateUser({ data: { avatar_url: url } })
        setAvatarUrl(url)
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <section className="max-w-xl mx-auto pb-24 space-y-6">

      {/* ── Header card ─────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border/40 bg-card/70 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden">
          {/* Gradient banner */}
          <div className="h-24 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent" />
          <CardContent className="pt-0 px-6 pb-6 -mt-12">
            <div className="flex items-end gap-4">
              {/* Avatar with upload */}
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-extrabold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Username + edit */}
              <div className="flex-1 min-w-0 pb-1">
                <AnimatePresence mode="wait">
                  {editingName ? (
                    <MotionDiv key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Input
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        className="h-9 text-base font-bold bg-background/50"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveUsername(); if (e.key === 'Escape') setEditingName(false) }}
                      />
                      <button onClick={handleSaveUsername} className="text-primary hover:text-primary/80 transition-colors">
                        {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditingName(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </MotionDiv>
                  ) : (
                    <MotionDiv key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <p className="text-xl font-extrabold tracking-tight truncate">{username}</p>
                      <button onClick={() => { setNewUsername(username); setEditingName(true); }} className="text-muted-foreground hover:text-primary transition-colors">
                        <PencilLine className="h-3.5 w-3.5" />
                      </button>
                    </MotionDiv>
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <CalendarDays className="h-3 w-3" />
                  Miembro desde {joinedDate}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Reseñas', value: reviews.length },
                { label: 'Media', value: avgRating },
                { label: 'Juegos', value: [...new Set(reviews.map(r => r.games?.title).filter(Boolean))].length },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl bg-muted/30 border border-border/30 py-3 px-2">
                  <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </MotionDiv>

      {/* ── Reviews ─────────────────────────────── */}
      <div>
        <h2 className="text-lg font-extrabold tracking-tight mb-4 flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-primary" />
          Mis Reseñas
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/60">
            <p className="text-muted-foreground">Aún no has escrito ninguna reseña.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/review/new'}>
              Escribir primera reseña
            </Button>
          </div>
        ) : (
          <MotionDiv variants={containerVars} initial="hidden" animate="show" className="space-y-4">
            {reviews.map(review => (
              <MotionDiv key={review.id} variants={itemVars}>
                <Card className="border-border/40 bg-card/70 backdrop-blur-md hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  {review.photo_url && (
                    <div className="relative h-36 overflow-hidden rounded-t-xl">
                      <img src={review.photo_url} alt={review.games?.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    </div>
                  )}
                  <CardContent className="pt-4 pb-5 px-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-base leading-tight text-primary">
                        {review.games?.title || 'Juego desconocido'}
                      </h3>
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        {review.rating}/10
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{review.review_text}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </MotionDiv>
        )}
      </div>
    </section>
  )
}
