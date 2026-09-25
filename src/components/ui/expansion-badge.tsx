import * as React from 'react'
import { Badge } from './badge'
import { Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export interface ExpansionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'xs'
  className?: string
  showIcon?: boolean
}

export function ExpansionBadge({
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: ExpansionBadgeProps) {
  const { t } = useTranslation()
  const badgeSize = size === 'xs' ? 'sm' : size

  return (
    <Badge
      variant="azure"
      size={badgeSize}
      className={cn(
        'font-extrabold shrink-0 gap-1 select-none',
        size === 'xs' && 'px-1.5 py-0 text-[10px]',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Layers
          className={cn(size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3', 'stroke-[2.5]')}
          aria-hidden="true"
        />
      )}
      <span>{t('common.expansion')}</span>
    </Badge>
  )
}
