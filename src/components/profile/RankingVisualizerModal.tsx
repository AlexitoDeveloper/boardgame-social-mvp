import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, Loader2, X } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Button } from '../ui/button'
import { useGameLocale } from '../../hooks/useGameLocale'
import { useTranslation } from 'react-i18next'

const MotionDiv = motion.div

const BACKGROUNDS: Record<string, string> = {
  default: 'from-[#141b29] via-[#0e121b] to-[#0a362e]',
  sunset: 'from-indigo-950 via-purple-950 to-pink-900',
  cyberpunk: 'from-slate-950 via-violet-950 to-indigo-900',
  ocean: 'from-slate-950 via-sky-950 to-cyan-900',
  volcanic: 'from-stone-950 via-stone-900 to-red-950',
  'midnight-gold': 'from-zinc-950 via-zinc-900 to-amber-950',
  minimal: 'from-zinc-950 via-zinc-900 to-zinc-950',
};

const GLOWS: Record<string, { g1: string; g2: string; g3: string }> = {
  default: {
    g1: 'from-primary/20 to-teal-600/20',
    g2: 'from-teal-500/20 to-emerald-600/20',
    g3: 'bg-primary/10'
  },
  sunset: {
    g1: 'from-pink-500/10 to-transparent',
    g2: 'from-purple-500/10 to-transparent',
    g3: 'bg-pink-500/5'
  },
  cyberpunk: {
    g1: 'from-fuchsia-500/10 to-transparent',
    g2: 'from-violet-500/10 to-transparent',
    g3: 'bg-fuchsia-500/5'
  },
  ocean: {
    g1: 'from-sky-500/15 to-transparent',
    g2: 'from-blue-500/10 to-transparent',
    g3: 'bg-cyan-500/5'
  },
  volcanic: {
    g1: 'from-red-500/10 to-transparent',
    g2: 'from-orange-650/10 to-transparent',
    g3: 'bg-red-500/5'
  },
  'midnight-gold': {
    g1: 'from-amber-500/10 to-transparent',
    g2: 'from-yellow-600/10 to-transparent',
    g3: 'bg-amber-500/5'
  },
  minimal: {
    g1: 'from-white/5 to-transparent',
    g2: 'from-white/5 to-transparent',
    g3: 'bg-white/5'
  }
};

interface RankingVisualizerModalProps {
  selectedRanking: any | null;
  onClose: () => void;
}

export function RankingVisualizerModal({
  selectedRanking,
  onClose
}: RankingVisualizerModalProps) {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()
  const exportModalRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const handleExportModalImage = async () => {
    if (!exportModalRef.current || !selectedRanking) return
    setExporting(true)

    try {
      // Small timeout to allow styles/animations to settle before rendering
      await new Promise(resolve => setTimeout(resolve, 180))

      const dataUrl = await toPng(exportModalRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        backgroundColor: '#030712',
        cacheBust: true,
        includeQueryParams: true,
        style: {
          margin: '0',
          transform: 'none',
        },
      })

      const filename = `${selectedRanking.title.replace(/\s+/g, '-').toLowerCase() || 'ranking'}.png`
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Error exporting image from modal:", err)
    } finally {
      setExporting(false)
    }
  }

  if (!selectedRanking) return null;

  const rData = selectedRanking.data || {}
  const mode = selectedRanking.mode
  const bgClass = BACKGROUNDS[rData.selectedBg] || BACKGROUNDS.default;
  const glow = GLOWS[rData.selectedBg] || GLOWS.default;
  const effectiveAspectRatio = exporting ? rData.aspectRatio : 'standard';
  const isLandscape = effectiveAspectRatio === 'landscape';

  // Set aspect classes dynamically
  let aspectClass = "min-h-[350px] w-full p-5 text-sm";
  if (effectiveAspectRatio === 'square') {
    aspectClass = "w-full max-w-[480px] aspect-square p-5 mx-auto justify-between";
  } else if (effectiveAspectRatio === 'story') {
    aspectClass = "w-full max-w-[340px] aspect-[9/16] p-6 mx-auto justify-between";
  } else if (effectiveAspectRatio === 'landscape') {
    aspectClass = "w-full max-w-[750px] aspect-[16/9] p-4 mx-auto justify-between text-xs";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-black/85 backdrop-blur-md overflow-y-auto !mt-0">
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0b0f19] border-0 lg:border border-white/10 rounded-none lg:rounded-2xl max-w-3xl w-full h-full lg:h-auto overflow-hidden shadow-2xl flex flex-col max-h-screen lg:max-h-[95vh]"
        >
          {/* Modal Header bar */}
          <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] lg:pt-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/60 z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="font-extrabold text-sm text-white truncate max-w-xs sm:max-w-md">
                {t('profile.escaparate')}: {selectedRanking.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleExportModalImage}
                disabled={exporting}
                className="cursor-pointer font-bold text-xs h-9 w-9 sm:w-auto p-0 sm:px-3.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0"
                title={t('common.savePhoto')}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span className="hidden sm:inline">{t('common.generating')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t('common.savePhoto')}</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="border border-white/10 hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Printable container view */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-6 flex justify-center items-center bg-[#070b13]/85 custom-scrollbar min-h-0">
            <div 
              ref={exportModalRef} 
              className={`border border-white/10 rounded-2xl bg-gradient-to-br ${bgClass} shadow-2xl relative overflow-hidden flex flex-col justify-between select-none ${aspectClass}`}
            >
              {/* Ambient Glow nodes inside print card */}
              <div className={`absolute top-0 right-0 w-[60%] h-[50%] bg-gradient-to-br ${glow.g1} rounded-full blur-[70px] -z-10 pointer-events-none`} />
              <div className={`absolute bottom-0 left-0 w-[60%] h-[50%] bg-gradient-to-tr ${glow.g2} rounded-full blur-[70px] -z-10 pointer-events-none`} />
              <div className={`absolute top-[35%] left-[25%] w-[35%] h-[35%] ${glow.g3} rounded-full blur-[70px] -z-10 pointer-events-none`} />

              {/* Branding text inside printed graphic */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 border-b border-white/5 pb-2.5">
                <h3 className={`font-black text-white px-1 leading-snug truncate w-full flex-1 text-left ${isLandscape ? 'text-xs' : 'text-sm sm:text-base'}`}>
                  {selectedRanking.title}
                </h3>
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-primary uppercase tracking-widest flex items-center gap-1 select-none self-end sm:self-auto px-1">
                  <Sparkles className="w-2.5 h-2.5" /> boardgamesocial.app
                </span>
              </div>

              {/* Content Area Rendering list structure details */}
              <div className="flex-1 mt-3">
                {mode === 'tier' ? (
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 bg-zinc-900/90 shadow-lg">
                    {Array.isArray(rData.tiers) && rData.tiers.map((tier: any) => (
                      <div key={tier.id} className={`flex ${isLandscape ? 'min-h-[44px]' : 'min-h-[76px]'}`}>
                        <div className={`flex items-center justify-center font-extrabold text-center select-none ${tier.color} text-white shrink-0 ${
                          isLandscape ? 'w-12 text-[10px] p-1' : 'w-16 sm:w-20 text-xs p-2'
                        }`}>
                          {tier.name}
                        </div>
                        <div className={`flex-1 flex flex-wrap items-center ${isLandscape ? 'p-1 gap-1' : 'p-2.5 gap-2'}`}>
                          {Array.isArray(tier.games) && tier.games.map((g: any) => (
                            <div 
                              key={g.bgg_id} 
                              className={`relative rounded-lg overflow-hidden border border-white/10 shadow bg-zinc-950 shrink-0 ${
                                isLandscape ? 'w-8 h-8' : 'w-12 h-12 sm:w-14 sm:h-14'
                              }`}
                            >
                              {g.image_url ? (
                                <img 
                                  src={`https://images.weserv.nl/?url=${encodeURIComponent(g.image_url)}&w=65&h=65&fit=cover`} 
                                  alt={getGameTitle(g)} 
                                  className="h-full w-full object-cover" 
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center p-0.5 text-[8px] font-black text-center bg-black/60 text-white">
                                  {getGameTitle(g)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-1.5 ${isLandscape ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {Array.isArray(rData.top10) && rData.top10.map((game: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`flex items-center ${isLandscape ? 'gap-1.5 p-1' : 'gap-2.5 p-2'} rounded-xl border border-white/5 bg-white/5`}
                      >
                        <div className={`rounded-lg flex items-center justify-center font-sans font-extrabold border shrink-0 bg-primary/20 border-primary/35 text-primary ${
                          isLandscape ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs'
                        }`}>
                          {idx + 1}
                        </div>
                        {game ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`rounded overflow-hidden border border-white/10 bg-zinc-950 shrink-0 relative flex items-center justify-center ${isLandscape ? 'w-6 h-6' : 'w-8 h-8'}`}>
                              {game.image_url ? (
                                <img 
                                  src={`https://images.weserv.nl/?url=${encodeURIComponent(game.image_url)}&w=40&h=40&fit=cover`} 
                                  alt={getGameTitle(game)} 
                                  className="w-full h-full object-cover" 
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <span className="text-[7px] text-zinc-500 font-extrabold">{getGameTitle(game).slice(0,2)}</span>
                              )}
                            </div>
                            <span className="font-extrabold text-zinc-100 truncate text-[11px] sm:text-xs">
                              {getGameTitle(game)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-650 font-bold italic">{t('tops.vacant')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer watermark details inside canvas */}
              <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[9px] text-zinc-400">
                <span>{t('tops.watermarkLabelBottom')}</span>
                <span className="font-extrabold text-white">#BoardgameSocial</span>
              </div>

            </div>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  )
}
export default RankingVisualizerModal
