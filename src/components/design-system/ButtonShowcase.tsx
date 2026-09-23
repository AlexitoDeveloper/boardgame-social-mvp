import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Play, Sparkles, Trash2, ArrowRight } from "lucide-react"

export function ButtonShowcase() {
  const [loading, setLoading] = React.useState(false)

  return (
    <Card variant="neoprene" className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>01. Machined Tabletop Keycaps</span>
          <span className="text-xs font-mono font-normal text-muted-foreground">
            (Physical Depth &amp; Travel)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Variants &amp; Depth Collapse
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" icon={Play} label="Emerald Felt (Default)" />
            <Button variant="secondary" label="Machined Steel" />
            <Button variant="outline" label="Sub-pixel Outline" />
            <Button variant="recessed" label="Sunken Bezel" />
            <Button variant="destructive" icon={Trash2} label="Ruby Destructive" />
            <Button variant="premium" icon={Sparkles} label="Holographic Foil" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Sizes &amp; States
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" label="Large CTA Keycap" icon={ArrowRight} />
            <Button size="default" label="Standard Key" />
            <Button size="sm" label="Compact Key" />
            <Button size="xs" label="Micro Key" />
            <Button size="icon" icon={Play} aria-label="Play Action" />
            <Button
              size="default"
              variant="default"
              loading={loading}
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1500)
              }}
              label={loading ? "Rolling..." : "Test Spring State"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
