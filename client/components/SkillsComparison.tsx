'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface SkillsComparisonProps {
  userSkills: string[]
  trendingTechs: Array<{
    name: string
    popularity: number
    trend: 'RISING' | 'STABLE' | 'DECLINING'
  }>
}

export default function SkillsComparison({ userSkills, trendingTechs }: SkillsComparisonProps) {
  if (!userSkills || !trendingTechs) return null

  const userSkillsSet = new Set(userSkills.map(s => s.toLowerCase()))
  
  // Find skills user has that are trending
  const matchingSkills = trendingTechs
    .filter(tech => userSkillsSet.has(tech.name.toLowerCase()))
    .slice(0, 10)

  // Find trending skills user doesn't have
  const missingSkills = trendingTechs
    .filter(tech => !userSkillsSet.has(tech.name.toLowerCase()))
    .slice(0, 10)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Skills You Have */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Trending Skills You Know
          </CardTitle>
          <CardDescription>
            {matchingSkills.length} of your skills are currently trending
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchingSkills.length > 0 ? (
            <div className="space-y-2">
              {matchingSkills.map(skill => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/30 gap-2 min-w-0"
                >
                  <span className="text-sm font-medium truncate flex-1 min-w-0">{skill.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      #{trendingTechs.findIndex(t => t.name === skill.name) + 1}
                    </span>
                    {skill.trend === 'RISING' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-500">
                        Rising
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              None of your current skills match trending technologies. Consider learning new ones!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills You Should Learn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Recommended Skills to Learn
          </CardTitle>
          <CardDescription>
            Top trending technologies you don't know yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missingSkills.length > 0 ? (
            <div className="space-y-2">
              {missingSkills.map(skill => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 gap-2 min-w-0"
                >
                  <span className="text-sm font-medium truncate flex-1 min-w-0">{skill.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {skill.popularity.toLocaleString()} popularity
                    </span>
                    {skill.trend === 'RISING' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-500">
                        Hot
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Great! You already know most trending technologies.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

