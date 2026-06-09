import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import { MOCK_MEETUPS } from '../lib/mockData'
import { MapPin, CalendarDays } from 'lucide-react'

const MotionDiv = motion.div

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVars = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function RadarPage() {
  const [meetups, setMeetups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMeetups() {
      try {
        const { data, error } = await supabase
          .from('meetups')
          .select(`*, users (*), games (*)`)
          .order('date', { ascending: true })

        if (error) {
          console.error("Error fetching meetups:", error)
          setMeetups(MOCK_MEETUPS)
        } else {
          setMeetups(data?.length ? data : MOCK_MEETUPS)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setMeetups(MOCK_MEETUPS)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetups()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Buscando partidas en tu radar...</p>
      </div>
    )
  }

  return (
    <section className="space-y-4 pb-20 p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Radar Local</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Descubre partidas y reuniones de juegos de mesa cerca de ti.
      </p>

      {meetups.length === 0 ? (
        <div className="text-center py-20 px-4 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <p className="text-muted-foreground text-lg mb-1">No hay partidas en el radar aún.</p>
          <p className="text-sm text-foreground/60">¡Sé el primero en organizar una!</p>
        </div>
      ) : (
        <MotionDiv variants={containerVars} initial="hidden" animate="show" className="space-y-5">
          {meetups.map(meetup => (
            <MotionDiv key={meetup.id} variants={itemVars}>
              <Card className="overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-extrabold leading-tight">
                    {meetup.title || meetup.games?.title || meetup.game_name || 'Partida de Juego de Mesa'}
                  </CardTitle>
                  {meetup.title && (meetup.games?.title || meetup.game_name) && (
                    <div className="mt-1 text-xs font-semibold text-primary">
                      Juego: {meetup.games?.title || meetup.game_name}
                    </div>
                  )}
                  <CardDescription className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {new Date(meetup.date || meetup.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {meetup.location || 'Ubicación por definir'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                  <p className="text-sm text-foreground/80 leading-relaxed">{meetup.description || 'Sin descripción adicional.'}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <Avatar className="w-7 h-7 border border-background">
                      <AvatarImage src={meetup.users?.avatar_url} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {meetup.users?.username?.slice(0,2)?.toUpperCase() || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      Organizado por <span className="font-semibold text-foreground">{meetup.users?.username || 'anónimo'}</span>
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pb-5">
                  <Button variant="outline" className="w-full rounded-xl font-semibold border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    Ver Detalles
                  </Button>
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      )}
    </section>
  )
}
