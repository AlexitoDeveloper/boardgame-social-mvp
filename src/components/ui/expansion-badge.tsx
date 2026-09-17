import * as React from 'react'
import { Tag } from './tag'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export interface ExpansionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'xs'
  className?: string
}

export function ExpansionBadge({ size = 'sm', className, ...props}: ExpansionBadgeProps) {
  const { t } = useTranslation()
  return (
    <Tag
      variant="purple"
      size={size}
      className={cn('font-bold tracking-normal shrink-0', className)}
      {...props}
    >
      {t('common.expansion')}
    </Tag>
  )
}
