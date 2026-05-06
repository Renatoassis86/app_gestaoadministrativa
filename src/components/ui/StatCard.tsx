'use client'

import { type LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clsx } from 'clsx'

type StatVariant = 'default' | 'blue' | 'amber' | 'success' | 'danger' | 'warning' | 'teal' | 'purple'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  trend?: number          // ex: +12 ou -5 (percentual)
  trendLabel?: string
  variant?: StatVariant
  href?: string
  loading?: boolean
}

const VARIANT_MAP: Record<StatVariant, {
  bar: string
  iconBg: string
  iconColor: string
  valuColor: string
}> = {
  default:  { bar: 'bg-amber-500',      iconBg: 'bg-amber-50',    iconColor: 'text-amber-600',   valuColor: 'text-slate-900' },
  blue:     { bar: 'bg-blue-700',       iconBg: 'bg-blue-50',     iconColor: 'text-blue-700',    valuColor: 'text-blue-900' },
  amber:    { bar: 'bg-amber-500',      iconBg: 'bg-amber-50',    iconColor: 'text-amber-600',   valuColor: 'text-slate-900' },
  success:  { bar: 'bg-emerald-500',    iconBg: 'bg-emerald-50',  iconColor: 'text-emerald-600', valuColor: 'text-emerald-900' },
  danger:   { bar: 'bg-red-500',        iconBg: 'bg-red-50',      iconColor: 'text-red-600',     valuColor: 'text-red-900' },
  warning:  { bar: 'bg-orange-400',     iconBg: 'bg-orange-50',   iconColor: 'text-orange-600',  valuColor: 'text-orange-900' },
  teal:     { bar: 'bg-teal-500',       iconBg: 'bg-teal-50',     iconColor: 'text-teal-600',    valuColor: 'text-teal-900' },
  purple:   { bar: 'bg-violet-500',     iconBg: 'bg-violet-50',   iconColor: 'text-violet-600',  valuColor: 'text-violet-900' },
}

function TrendIndicator({ trend, label }: { trend: number; label?: string }) {
  if (trend === 0) return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
      <Minus size={12} />
      {label ?? 'Estável'}
    </span>
  )
  const isUp = trend > 0
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs font-semibold',
      isUp ? 'text-emerald-600' : 'text-red-500'
    )}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isUp ? '+' : ''}{trend}%
      {label && <span className="text-slate-400 font-normal">{label}</span>}
    </span>
  )
}

function SkeletonStat() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="h-2 w-full rounded-t-xl bg-slate-200 -mt-5 -mx-5 mb-5 rounded-t-xl" />
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-7 bg-slate-200 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-32" />
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
      </div>
    </div>
  )
}

export default function StatCard({
  label, value, sub, icon: Icon, trend, trendLabel, variant = 'default', href, loading
}: StatCardProps) {
  if (loading) return <SkeletonStat />

  const v = VARIANT_MAP[variant]

  const content = (
    <div className={clsx(
      'group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm',
      'transition-all duration-200',
      href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-slate-300'
    )}>
      {/* accent bar top */}
      <div className={clsx('h-[3px] w-full', v.bar)} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-500 mb-1.5 font-sans">
              {label}
            </p>
            <p className={clsx('text-3xl font-extrabold leading-none tabular-nums', v.valuColor)}>
              {value}
            </p>
            {sub && (
              <p className="text-[0.72rem] text-slate-400 mt-1.5">{sub}</p>
            )}
            {trend !== undefined && (
              <div className="mt-2">
                <TrendIndicator trend={trend} label={trendLabel} />
              </div>
            )}
          </div>

          {Icon && (
            <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', v.iconBg)}>
              <Icon size={20} className={v.iconColor} strokeWidth={1.8} />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (href) {
    return <a href={href} className="block no-underline">{content}</a>
  }
  return content
}
