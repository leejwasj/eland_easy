import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, TrendingUp, ChevronRight } from 'lucide-react'

interface BranchCardProps {
  id: string
  name: string
  location: string
  type: string
  gapScore?: number
  lastUpdated?: string
  hasNewUpdate?: boolean
}

function GapScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-emerald-500' :
    score >= 40 ? 'bg-amber-500' :
    'bg-slate-300'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>공백 점수</span>
        <span className="font-semibold text-foreground">{score}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function BranchCard({
  id, name, location, type, gapScore, lastUpdated, hasNewUpdate,
}: BranchCardProps) {
  return (
    <Link href={`/dashboard/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1E3A5F] truncate group-hover:text-[#2563EB] transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">{type}</Badge>
              {hasNewUpdate && (
                <Badge className="text-xs bg-[#2563EB] hover:bg-[#2563EB]">NEW</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {gapScore !== undefined ? (
            <GapScoreBar score={gapScore} />
          ) : (
            <div className="h-8 flex items-center">
              <p className="text-xs text-muted-foreground">분석 데이터 없음</p>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {lastUpdated ? (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{lastUpdated}</span>
              </div>
            ) : (
              <span>업로드 필요</span>
            )}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
