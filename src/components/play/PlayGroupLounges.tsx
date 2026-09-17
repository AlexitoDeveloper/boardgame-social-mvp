import { FC } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'

interface PlayGroupLoungesProps {
  groups: Array<{
    id: string
    name: string
    description?: string | null
    member_count?: number
  }>
}

export const PlayGroupLounges: FC<PlayGroupLoungesProps> = ({ groups }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span>{t('play.groupLounges')}</span>
        </h2>
        <Link
          to="/grupos"
          className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('play.viewGroups')}</span>
        </Link>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {groups.slice(0, 3).map((grp) => (
            <div
              key={grp.id}
              onClick={() => navigate(`/grupos/${grp.id}`)}
              className="p-4 rounded-2xl glass-panel border border-border/40 hover:border-border/80 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between gap-3 group active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {grp.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {grp.description || t('groups.noDescription')}
                </p>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 pt-0.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span>
                    {grp.member_count || 1}{' '}
                    {grp.member_count === 1 ? t('groups.memberCard') : t('groups.membersCard')}
                  </span>
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-medium">
            {t('play.noGroupsPrompt')}
          </p>
          <Button
            type="button"
            onClick={() => navigate('/grupos?create=true')}
            size="sm"
            className="rounded-xl font-bold text-xs shrink-0"
          >
            <span>{t('play.createGroupAction')}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
