'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

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
  const topTechs = technologies.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Trending Technologies</CardTitle>
        <CardDescription>Market demand and trend analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topTechs.map((tech, index) => {
            const hasSkill = userSkillsSet.has(tech.name.toLowerCase())
            const TrendIcon = tech.trend === 'RISING' ? TrendingUp : 
                            tech.trend === 'DECLINING' ? TrendingDown : Minus
            
            return (
              <div
                key={tech.name}
                className={`p-3 rounded-lg border transition-all ${
                  hasSkill 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-semibold truncate">{tech.name}</span>
                    {hasSkill && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary flex-shrink-0">
                        You know this
                      </span>
                    )}
                    <TrendIcon 
                      className={`h-4 w-4 flex-shrink-0 ${
                        tech.trend === 'RISING' ? 'text-green-500' :
                        tech.trend === 'DECLINING' ? 'text-red-500' :
                        'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {tech.popularity.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(tech.popularity / topTechs[0].popularity) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

