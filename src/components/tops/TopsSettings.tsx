import { useState } from 'react'
import { Crown, Check, Layout, Image, Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Tag } from '../ui/tag'
import { Tabs } from '../ui/tabs'
import { Input } from '../ui/input'
import { Game } from '../../types'
import { PremiumUpgradeModal } from '../PremiumUpgradeModal'

interface TopsSettingsProps {
  mode: 'tier' | 'top10';
  setMode: (mode: 'tier' | 'top10') => void;
  setSelectedGameForPlacement: (game: Game | null) => void;
  isPremium: boolean;
  setIsPremium: (val: boolean) => void;
  showWatermark: boolean;
  setShowWatermark: (val: boolean) => void;
  customWatermark: string;
  setCustomWatermark: (val: string) => void;
  selectedBg: string;
  setSelectedBg: (val: string) => void;
  aspectRatio: 'standard' | 'square' | 'story' | 'landscape';
  setAspectRatio: (val: 'standard' | 'square' | 'story' | 'landscape') => void;
}

export function TopsSettings({
  mode,
  setMode,
  setSelectedGameForPlacement,
  isPremium,
  setIsPremium,
  showWatermark,
  setShowWatermark,
  customWatermark,
  setCustomWatermark,
  selectedBg,
  setSelectedBg,
  aspectRatio,
  setAspectRatio,
}: TopsSettingsProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Configuration Card */}
      <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-bold">Tipo de Ranking</CardTitle>
          <CardDescription className="text-xs">Elige la estructura de tu lista.</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <Tabs
            options={[
              { id: 'tier', label: 'Tier List' },
              { id: 'top10', label: 'Top 10 List' }
            ]}
            activeTab={mode}
            onChange={(val) => { setMode(val); setSelectedGameForPlacement(null) }}
          />
        </CardContent>
      </Card>

      {/* Premium Pro Simulated Simulator & Options */}
      {!isPremium ? (
        <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-emerald-500/5 to-primary/5 opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-extrabold flex items-center gap-1.5 text-primary">
              <Crown className="w-4.5 h-4.5 animate-bounce shrink-0 text-primary" /> Generador PRO
            </CardTitle>
            <CardDescription className="text-[11px]">
              Exporta sin marcas de agua, fondos premium y ratios adaptados.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 relative z-10 space-y-2">
            <p className="text-[10px] text-zinc-300 leading-normal">
              Desbloquea formatos listos para tus redes sociales (1:1, 9:16, 16:9).
            </p>
            <Button
              variant="premium"
              size="sm"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full h-8 rounded-xl flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all animate-pulse"
            >
              <Crown className="w-3.5 h-3.5" /> Activar PRO (Simulado)
            </Button>
            <PremiumUpgradeModal 
              isOpen={isUpgradeModalOpen}
              onClose={() => setIsUpgradeModalOpen(false)}
              onSuccess={() => setIsPremium(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl relative">
          <Tag variant="default" size="xs" className="absolute top-2.5 right-2.5 shrink-0 select-none uppercase tracking-wider">
            <Crown className="w-2.5 h-2.5" /> PRO Activo
          </Tag>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-extrabold text-primary">Opciones PRO</CardTitle>
            <CardDescription className="text-[11px]">Ajustes de exportación avanzados.</CardDescription>
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {/* 1. Ratio selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Layout className="w-3 h-3 text-primary" /> Formato / Aspecto
              </label>
              <Tabs
                options={[
                  { id: 'standard', label: 'Fluido' },
                  { id: 'square', label: '1:1' },
                  { id: 'story', label: '9:16' },
                  { id: 'landscape', label: '16:9' }
                ]}
                activeTab={aspectRatio}
                onChange={setAspectRatio}
              />
            </div>

            {/* 2. Gradient background selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Image className="w-3 h-3" /> Fondo Premium
              </label>
              <div className="flex flex-wrap gap-1.5 py-1">
                {[
                  { id: 'default', class: 'from-[#141b29] via-[#0e121b] to-[#0a362e]', name: 'Jade' },
                  { id: 'sunset', class: 'from-indigo-950 via-purple-950 to-pink-900', name: 'Atardecer' },
                  { id: 'cyberpunk', class: 'from-slate-950 via-violet-950 to-indigo-900', name: 'Cyberpunk' },
                  { id: 'ocean', class: 'from-slate-950 via-sky-950 to-cyan-900', name: 'Océano' },
                  { id: 'volcanic', class: 'from-stone-950 via-stone-900 to-red-950', name: 'Volcánico' },
                  { id: 'midnight-gold', class: 'from-zinc-950 via-zinc-900 to-amber-950', name: 'Oro' },
                  { id: 'minimal', class: 'from-zinc-950 via-zinc-900 to-zinc-950', name: 'Carbono' }
                ].map((bg) => {
                  const isSelected = selectedBg === bg.id
                  return (
                    <Button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id)}
                      title={bg.name}
                      variant="ghost"
                      className={`p-0 min-w-0 min-h-0 w-5 h-5 rounded-full bg-gradient-to-br ${bg.class} border transition-all relative flex items-center justify-center cursor-pointer hover:bg-transparent ${
                        isSelected ? 'border-amber-400 scale-110 shadow shadow-amber-400/50 ring-1 ring-amber-400/50' : 'border-white/10 hover:scale-105'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-amber-400 font-extrabold drop-shadow" />}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* 3. Watermark settings */}
            <div className="space-y-2 border-t border-border/20 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1 select-none">
                  {showWatermark ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />} Marca de Agua
                </label>
                <Button
                  onClick={() => setShowWatermark(!showWatermark)}
                  variant="ghost"
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none p-0 min-h-0 min-w-0 ${
                    showWatermark ? 'bg-primary' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showWatermark ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </Button>
              </div>

              {showWatermark && (
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="Firma (ej. @tuusuario)"
                    value={customWatermark}
                    onChange={(e) => setCustomWatermark(e.target.value)}
                    className="h-7 text-[10px] rounded-lg bg-background/30 border-border/30 focus:ring-amber-500 focus:border-amber-500 placeholder:text-muted-foreground py-1 px-2"
                  />
                </div>
              )}
            </div>

            {/* Revert link */}
            <div className="text-center pt-1.5 border-t border-border/20">
              <Button
                variant="link"
                onClick={() => {
                  setIsPremium(false)
                  setShowWatermark(true)
                  setCustomWatermark('')
                  setSelectedBg('default')
                  setAspectRatio('standard')
                }}
                className="text-[9.5px] font-extrabold text-muted-foreground hover:text-destructive transition-colors cursor-pointer h-auto p-0 hover:no-underline"
              >
                Desactivar Cuenta PRO
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
export default TopsSettings;
