import { MapPin, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'

interface MeetupDetailLocationProps {
  location: string;
  city: string;
}

export function MeetupDetailLocation({ location, city }: MeetupDetailLocationProps) {
  const { t } = useTranslation()
  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-lg">
      <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/20">
        <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">{t('meetup.locationTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6 space-y-4">
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-foreground">{t('meetup.tableAddress')}</h3>
            <p className="text-sm text-muted-foreground font-medium">{location}</p>
            <p className="text-sm text-foreground/80 font-bold">{city}</p>
          </div>
        </div>

        {/* Map Placeholder with premium layout */}
        <div className="relative overflow-hidden h-44 rounded-2xl border border-border/40 bg-muted/40 shadow-inner flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="absolute w-28 h-28 rounded-full border border-primary/20 bg-primary/5 animate-pulse [animation-duration:3s] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary animate-bounce" />
            </div>
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, ${city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-lg text-[11px] font-bold shadow-md flex items-center gap-1.5 border h-8 bg-card hover:bg-muted text-foreground border-border/40 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {t('meetup.howToGet')}
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
