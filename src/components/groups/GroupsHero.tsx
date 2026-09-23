import { FC } from 'react'
import { Plus, QrCode, Users, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface GroupsHeroProps {
  totalGroups: number
  totalMembers: number
  onJoinClick: () => void
  onCreateClick: () => void
}

export const GroupsHero: FC<GroupsHeroProps> = ({
  totalGroups,
  totalMembers,
  onJoinClick,
  onCreateClick,
}) => {
  const { t } = useTranslation()

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-card via-card/80 to-card/40 border border-border/50 p-6 sm:p-8 shadow-sm">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs font-bold border-border/40">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{t('groups.title', 'Círculos de Mesa')}</span>
            </Badge>

            <span className="text-xs text-muted-foreground font-mono-tabular">
              {totalGroups} {totalGroups === 1 ? 'círculo activo' : 'círculos activos'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-display">
            Tus Mesas y Comunidades
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Organiza partidas periódicas, vota qué juego sacar a mesa y sincroniza la ludoteca compartida de cada grupo de juego.
          </p>

          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono-tabular font-bold text-foreground">{totalMembers}</span>
              <span>jugadores conectados</span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Button
            type="button"
            onClick={onJoinClick}
            variant="outline"
            icon={QrCode}
          >
            <span>{t('groups.joinWithCode', 'Unirse con Código')}</span>
          </Button>

          <Button
            type="button"
            onClick={onCreateClick}
            icon={Plus}
          >
            <span>{t('groups.createGroup', 'Crear Círculo')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
