'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Trophy, Zap, Star } from 'lucide-react'

interface TrendingChartProps {
  technologies: Array<{
    name: string
    popularity: number
    source: string
    trend: 'RISING' | 'STABLE' | 'DECLINING'
  }>
  userSkills?: string[]
}

export default function TrendingChart({ technologies, userSkills = [] }: TrendingChartProps) {
  if (!technologies || technologies.length === 0) return null

  const userSkillsSet = new Set(userSkills.map(s => s.toLowerCase()))
  const topTechs = technologies.slice(0, 5)
  const maxPopularity = topTechs[0]?.popularity || 1

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
    if (index === 1) return { icon: Star, color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' }
    if (index === 2) return { icon: Star, color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30' }
    return null
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'RISING') return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (trend === 'DECLINING') return 'text-red-400 bg-red-500/20 border-red-500/30'
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Top Trending Technologies
            </CardTitle>
            <CardDescription className="mt-1">
              Market leaders ranked by popularity & demand
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3">
          {topTechs.map((tech, index) => {
            const hasSkill = userSkillsSet.has(tech.name.toLowerCase())
            const TrendIcon = tech.trend === 'RISING' ? TrendingUp : 
                            tech.trend === 'DECLINING' ? TrendingDown : Minus
            const rankBadge = getRankBadge(index)
            const percentage = (tech.popularity / maxPopularity) * 100
            const trendColorClass = getTrendColor(tech.trend)
            
            return (
              <div
                key={tech.name}
                className={`group relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  hasSkill 
                    ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-primary/40 shadow-primary/10' 
                    : 'bg-card/50 border-border/50 backdrop-blur-sm'
                } ${index < 3 ? 'ring-2 ring-offset-2 ring-offset-background' : ''} ${
                  index === 0 ? 'ring-yellow-500/50' : 
                  index === 1 ? 'ring-gray-400/50' : 
                  index === 2 ? 'ring-orange-500/50' : 
                  'ring-transparent'
                }`}
              >
                {/* Rank Badge */}
                {rankBadge && (
                  <div className={`absolute -top-2 -left-2 flex items-center justify-center w-8 h-8 rounded-full ${rankBadge.bg} ${rankBadge.border} border-2 shadow-lg`}>
                    {index === 0 && <Trophy className={`h-4 w-4 ${rankBadge.color}`} />}
                    {(index === 1 || index === 2) && <Star className={`h-4 w-4 ${rankBadge.color}`} />}
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Rank Number */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index < 3 
                        ? 'bg-gradient-to-br from-primary to-cyan-500 text-white' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Tech Name & Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground truncate">{tech.name}</h3>
                        {hasSkill && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                            ✓ You know
                          </span>
                        )}
                        <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${trendColorClass}`}>
                          <TrendIcon className="inline h-3 w-3 mr-1" />
                          {tech.trend === 'RISING' ? 'Rising' : tech.trend === 'DECLINING' ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tech.popularity.toLocaleString()} popularity points
                      </p>
                    </div>
                  </div>

                  {/* Percentage Badge */}
                  <div className="flex-shrink-0">
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                      index < 3 
                        ? 'bg-gradient-to-br from-primary/20 to-cyan-500/20 text-primary' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300' :
                      index === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                      'bg-gradient-to-r from-primary to-cyan-500'
                    } shadow-lg`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-xl border z-20 whitespace-nowrap">
                  <div className="font-semibold mb-1">{tech.name}</div>
                  <div className="text-muted-foreground">
                    Rank #{index + 1} • {tech.popularity.toLocaleString()} points
                  </div>
                  <div className="text-muted-foreground">
                    Source: {tech.source} • Trend: {tech.trend}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span>Top 3 Leaders</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Rising Trends</span>
              </div>
            </div>
            <span className="text-xs">
              Rankings update in real-time
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

