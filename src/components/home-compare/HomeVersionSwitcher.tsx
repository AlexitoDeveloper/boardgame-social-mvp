import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Dices } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export type HomeVersion = 'classic' | 'table'

interface HomeVersionSwitcherProps {
  current: HomeVersion
}

export function HomeVersionSwitcher({ current }: HomeVersionSwitcherProps) {
  const navigate = useNavigate()

  return (
    <div className="w-full bg-card/85 border border-primary/20 backdrop-blur-xl rounded-2xl p-2.5 shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground px-2 select-none">
        <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary uppercase text-[10px] tracking-wider font-black">
          Vista
        </Badge>
        <span className="hidden md:inline">Alterna entre el catálogo de descubrimiento y las herramientas de mesa:</span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          variant={current === 'classic' ? 'default' : 'ghost'}
          onClick={() => navigate('/')}
          className="text-xs font-bold flex-1 sm:flex-initial h-8 px-3.5 rounded-xl"
        >
          <LayoutGrid className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          Explorar y Tops
        </Button>

        <Button
          size="sm"
          variant={current === 'table' ? 'default' : 'ghost'}
          onClick={() => navigate('/mesa-hub')}
          className="text-xs font-bold flex-1 sm:flex-initial h-8 px-3.5 rounded-xl"
        >
          <Dices className="w-3.5 h-3.5 mr-1.5 shrink-0 text-primary" />
          Hub de Mesa
        </Button>
      </div>
    </div>
  )
}
