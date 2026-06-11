import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface MeetupDetailDescriptionProps {
  description: string | null;
}

export function MeetupDetailDescription({ description }: MeetupDetailDescriptionProps) {
  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-lg">
      <CardHeader className="pb-3 border-b border-border/20">
        <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">Detalles de la Reunión</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {description ? (
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line">
            {description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No se ha proporcionado una descripción detallada para esta reunión. ¡Pregunta al master si tienes dudas!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
