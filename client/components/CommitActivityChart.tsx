'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCommit } from 'lucide-react'

interface CommitActivityChartProps {
  activity: {
    totalCommits: number
    dailyActivity: Array<{ date: string; commits: number }>
    recentCommits: any[]
  }
}

export default function CommitActivityChart({ activity }: CommitActivityChartProps) {
  if (!activity || !activity.dailyActivity) return null

  const maxCommits = Math.max(...activity.dailyActivity.map(d => d.commits), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="h-5 w-5" />
          Commit Activity (Last 30 Days)
        </CardTitle>
        <CardDescription>
          {activity.totalCommits} total commits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-end gap-1 h-32">
            {activity.dailyActivity.map((day, index) => {
              const height = maxCommits > 0 ? (day.commits / maxCommits) * 100 : 0
              const isToday = new Date(day.date).toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center group relative"
                  title={`${day.date}: ${day.commits} commits`}
                >
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 ${
                      day.commits > 0
                        ? 'bg-gradient-to-t from-primary to-primary/60'
                        : 'bg-secondary'
                    } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  {day.commits > 0 && (
                    <span className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.commits}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{activity.dailyActivity[0]?.date}</span>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

