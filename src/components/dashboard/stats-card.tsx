import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: 'blue' | 'emerald' | 'amber'
}

const accentMap = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

export function StatsCard({ title, value, sub, icon: Icon, accent = 'blue' }: StatsCardProps) {
  return (
    <Card className="border-slate-200">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={cn('p-3 rounded-xl', accentMap[accent])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-[#1E3A5F]">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
