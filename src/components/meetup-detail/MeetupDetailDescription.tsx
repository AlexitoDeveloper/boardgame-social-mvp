import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useTranslation } from 'react-i18next'

interface MeetupDetailDescriptionProps {
  description: string | null;
}

export function MeetupDetailDescription({ description }: MeetupDetailDescriptionProps) {
  const { t } = useTranslation()
  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-lg">
      <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/20">
        <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">{t('meetup.descriptionTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6 space-y-4">
        {description ? (
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line">
            {description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            {t('meetup.noDescription')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
