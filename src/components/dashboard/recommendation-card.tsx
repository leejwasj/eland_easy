'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, Clock, X, ChevronDown, ChevronUp, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecommendationItem } from '@/types/database'

type FeedbackType = 'like' | 'hold' | 'exclude' | null

interface RecommendationCardProps {
  categoryName: string
  gapScore: number
  recommendations: RecommendationItem[]
}

function FeedbackButton({
  type,
  active,
  onClick,
}: {
  type: FeedbackType
  active: boolean
  onClick: () => void
}) {
  const config = {
    like: { icon: ThumbsUp, label: '좋아요', activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-300' },
    hold: { icon: Clock, label: '보류', activeClass: 'bg-amber-50 text-amber-600 border-amber-300' },
    exclude: { icon: X, label: '제외', activeClass: 'bg-red-50 text-red-600 border-red-300' },
  }
  if (!type) return null
  const { icon: Icon, label, activeClass } = config[type]

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-all',
        active
          ? activeClass
          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  )
}

function BrandItem({ rec }: { rec: RecommendationItem }) {
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [expanded, setExpanded] = useState(false)

  const toggle = (type: FeedbackType) =>
    setFeedback(prev => (prev === type ? null : type))

  return (
    <div className={cn(
      'border rounded-lg p-3 space-y-2 transition-colors',
      feedback === 'exclude' ? 'opacity-50 bg-slate-50' : 'bg-white'
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm truncate">{rec.brand}</span>
              {rec.is_eland_brand && (
                <Badge className="text-[10px] px-1 py-0 h-4 bg-[#1E3A5F]">이랜드</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full"
                  style={{ width: `${rec.score}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">적합도 {rec.score}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <FeedbackButton type="like" active={feedback === 'like'} onClick={() => toggle('like')} />
          <FeedbackButton type="hold" active={feedback === 'hold'} onClick={() => toggle('hold')} />
          <FeedbackButton type="exclude" active={feedback === 'exclude'} onClick={() => toggle('exclude')} />
        </div>
      </div>

      {rec.reason && (
        <div>
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            추천 근거
          </button>
          {expanded && (
            <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 rounded-md px-3 py-2 leading-relaxed">
              {rec.reason}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function RecommendationCard({ categoryName, gapScore, recommendations }: RecommendationCardProps) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? recommendations : recommendations.slice(0, 3)

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#1E3A5F]">{categoryName}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">공백 점수</span>
            <Badge
              className={
                gapScore >= 70 ? 'bg-emerald-500' :
                gapScore >= 40 ? 'bg-amber-500' : 'bg-slate-400'
              }
            >
              {gapScore}
            </Badge>
          </div>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-1">
          <div
            className={`h-full rounded-full ${
              gapScore >= 70 ? 'bg-emerald-500' :
              gapScore >= 40 ? 'bg-amber-500' : 'bg-slate-400'
            }`}
            style={{ width: `${gapScore}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {displayed.map((rec) => (
          <BrandItem key={rec.brand} rec={rec} />
        ))}
        {recommendations.length > 3 && (
          <button
            onClick={() => setShowAll(p => !p)}
            className="w-full text-xs text-[#2563EB] hover:underline py-1"
          >
            {showAll ? '접기' : `+${recommendations.length - 3}개 더 보기`}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
