import { FC } from 'react'
import { Calendar, Trophy, Layers, Award, Dices, Users } from 'lucide-react'
import { Chip } from '../ui/chip'

export type GroupDetailTabId =
  | 'meetups'
  | 'matches'
  | 'ludoteca'
  | 'hall_of_fame'
  | 'table_tools'
  | 'members'

interface GroupDetailSegmentedNavProps {
  activeTab: GroupDetailTabId
  onChange: (tab: GroupDetailTabId) => void
  meetupsCount: number
  matchesCount: number
  gamesCount: number
  membersCount: number
}

export const GroupDetailSegmentedNav: FC<GroupDetailSegmentedNavProps> = ({
  activeTab,
  onChange,
  meetupsCount,
  matchesCount,
  gamesCount,
  membersCount,
}) => {
  return (
    <nav
      aria-label="Secciones del Grupo"
      className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1"
    >
      <Chip
        size="default"
        selected={activeTab === 'meetups'}
        onClick={() => onChange('meetups')}
        icon={Calendar}
        badge={
          meetupsCount > 0 ? (
            <span className="font-mono-tabular text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-bold">
              {meetupsCount}
            </span>
          ) : undefined
        }
      >
        Quedadas
      </Chip>

      <Chip
        size="default"
        selected={activeTab === 'matches'}
        onClick={() => onChange('matches')}
        icon={Trophy}
        badge={
          matchesCount > 0 ? (
            <span className="font-mono-tabular text-[10px] bg-muted-foreground/20 px-1.5 py-0.2 rounded-full font-bold">
              {matchesCount}
            </span>
          ) : undefined
        }
      >
        Partidas
      </Chip>

      <Chip
        size="default"
        selected={activeTab === 'ludoteca'}
        onClick={() => onChange('ludoteca')}
        icon={Layers}
        badge={
          gamesCount > 0 ? (
            <span className="font-mono-tabular text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-bold">
              {gamesCount}
            </span>
          ) : undefined
        }
      >
        Ludoteca
      </Chip>

      <Chip
        size="default"
        selected={activeTab === 'hall_of_fame'}
        onClick={() => onChange('hall_of_fame')}
        icon={Award}
      >
        Salón de la Fama
      </Chip>

      <Chip
        size="default"
        selected={activeTab === 'table_tools'}
        onClick={() => onChange('table_tools')}
        icon={Dices}
      >
        Herramientas
      </Chip>

      <Chip
        size="default"
        selected={activeTab === 'members'}
        onClick={() => onChange('members')}
        icon={Users}
        badge={
          membersCount > 0 ? (
            <span className="font-mono-tabular text-[10px] bg-muted-foreground/20 px-1.5 py-0.2 rounded-full font-bold">
              {membersCount}
            </span>
          ) : undefined
        }
      >
        Miembros
      </Chip>
    </nav>
  )
}
