import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { motion } from 'framer-motion'
import { MOCK_REVIEWS } from '../lib/mockData'

const MotionDiv = motion.div;

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVars = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function FeedPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            users (*),
            games_cache (*)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error("Error fetching reviews:", error)
          setReviews(MOCK_REVIEWS)
        } else {
          setReviews(data?.length ? data : MOCK_REVIEWS)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Buscando las mejores partidas...</p>
      </div>
    )
  }

  return (
    <section className="space-y-4 pb-20 p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Feed de Reseñas</h1>
      
      {reviews.length === 0 ? (
        <div className="text-center py-20 px-4 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <p className="text-muted-foreground text-lg mb-2">No hay reseñas disponibles aún.</p>
          <p className="text-sm text-foreground/60">¡Sé el primero en compartir tu experiencia de juego!</p>
        </div>
      ) : (
        <MotionDiv 
          variants={containerVars} 
          initial="hidden" 
          animate="show" 
          className="space-y-6"
        >
          {reviews.map(review => (
            <MotionDiv key={review.id} variants={itemVars}>
              <Card className="overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 group">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={review.users?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {review.users?.username?.slice(0,2)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-bold bg-clip-text">
                      {review.users?.username || review.users?.full_name || 'Usuario Anónimo'}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">
                      {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {review.photo_url && (
                    <div className="overflow-hidden rounded-xl mb-5">
                      <img 
                        src={review.photo_url} 
                        alt="Review photo" 
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" 
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h3 className="font-extrabold text-xl tracking-tight text-primary leading-tight mb-2">
                    {review.games_cache?.name || 'Juego Desconocido'}
                  </h3>
                  <p className="text-foreground/90 text-sm leading-relaxed">{review.review_text || review.content}</p>
                </CardContent>
                <CardFooter className="pt-0 pb-5">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold shadow-inner">
                    ⭐ {review.rating}/10
                  </div>
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      )}
    </section>
  )
}
