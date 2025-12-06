'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { matchingAPI, analyticsAPI } from '@/lib/api'
import { Briefcase, TrendingUp, Users, Code, Github, Linkedin, User, Zap, ArrowUpRight, Bell } from 'lucide-react'
import Link from 'next/link'
import TrendingChart from '@/components/TrendingChart'
import SkillsComparison from '@/components/SkillsComparison'
import { notificationsAPI } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(userStr)
    setUser(parsed)
    
    // Redirect admins to admin dashboard
    if (parsed.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [router])

  const { data: jobMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: async () => {
      const res = await matchingAPI.getJobMatches(5)
      return res.data.matches
    },
    enabled: !!user && user.role !== 'ADMIN'
  })

  const { data: skillAnalytics, isLoading: skillsLoading } = useQuery({
    queryKey: ['skillAnalytics'],
    queryFn: async () => {
      const res = await analyticsAPI.getSkillAnalytics()
      return res.data.analytics
    },
    enabled: !!user && user.role !== 'ADMIN'
  })

  const { data: trendingTechs, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingTechnologies'],
    queryFn: async () => {
      const res = await analyticsAPI.getTrending()
      return res.data.trends
    },
    enabled: !!user && user.role !== 'ADMIN',
    refetchInterval: 3600000, // Refetch every hour
    staleTime: 1800000 // Consider stale after 30 minutes
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsAPI.getNotifications()
      return res.data.notifications
    },
    enabled: !!user && user.role !== 'ADMIN',
    refetchInterval: 300000 // Refetch every 5 minutes
  })

  if (!user) return null
  
  // Don't render dashboard for admins (they'll be redirected)
  if (user.role === 'ADMIN') return null

  return (
    <div className="page-shell-wide space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-white/60">Personal cockpit</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome back, {user.name}!</h1>
        <p className="mt-2 text-muted-foreground">
          Your live signal graph, matching engine, and quick actions live here.
        </p>
      </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobMatches?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Top matches found</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillAnalytics?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Tracked skills</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Showcased projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.experience || 0}</div>
              <p className="text-xs text-muted-foreground">Years of experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Matches */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Job Matches</CardTitle>
              <CardDescription>Jobs that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {matchesLoading ? (
                <p>Loading matches...</p>
              ) : jobMatches && jobMatches.length > 0 ? (
                <div className="space-y-4">
                  {jobMatches.slice(0, 3).map((job: any) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-primary">
                          {job.matchScore?.toFixed(0)}% match
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/jobs">View All Matches</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No matches yet</p>
              )}
            </CardContent>
          </Card>

          {/* Skill Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Analytics</CardTitle>
              <CardDescription>Your top skills by proficiency</CardDescription>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <p>Loading analytics...</p>
              ) : skillAnalytics && skillAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {skillAnalytics.slice(0, 5).map((skill: any) => (
                    <div key={skill.skill}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <span className="text-sm text-muted-foreground">
                          {skill.proficiency.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/profile">View Full Analytics</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No skills tracked yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {notifications && notifications.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                New Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notif: any) => (
                  <div key={notif.id} className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Comparison */}
        {user.skills && trendingTechs?.technologies && (
          <SkillsComparison 
            userSkills={user.skills} 
            trendingTechs={trendingTechs.technologies} 
          />
        )}

        {/* Trending Technologies Chart */}
        {trendingTechs?.technologies && (
          <TrendingChart 
            technologies={trendingTechs.technologies}
            userSkills={user.skills}
          />
        )}

        {/* Trending Technologies Badges */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trending Technologies</CardTitle>
                <CardDescription>
                  Current hot technologies in the market (Updated regularly)
                </CardDescription>
              </div>
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {trendingLoading ? (
              <p className="text-muted-foreground">Loading trends...</p>
            ) : trendingTechs?.technologies && trendingTechs.technologies.length > 0 ? (
              <div className="w-full overflow-hidden">
                <div className="flex flex-wrap gap-2 mb-4 w-full">
                  {trendingTechs.technologies.slice(0, 15).map((tech: any, index: number) => (
                    <div
                      key={tech.name}
                      className="group relative px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 hover:border-primary/50 transition-all cursor-pointer flex-shrink-0 max-w-full"
                    >
                      <div className="flex items-center gap-2 max-w-full">
                        <span className="text-sm font-medium truncate max-w-[120px]">{tech.name}</span>
                        {index < 5 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary flex-shrink-0">
                            🔥
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-lg z-10 whitespace-nowrap">
                        Popularity: {tech.popularity.toLocaleString()}
                        {tech.trend === 'RISING' && ' • Rising'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
                  <span>
                    Last updated: {trendingTechs.updatedAt ? new Date(trendingTechs.updatedAt).toLocaleString() : 'Just now'}
                  </span>
                  <span className="flex items-center gap-1">
                    Sources: {trendingTechs.sources?.join(', ') || 'GitHub'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No trending data available</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Update Profile */}
              <Link href="/profile" className="group">
                <div className="relative h-24 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-4 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex flex-col h-full justify-between">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Update Profile</p>
                      <p className="text-xs text-white/70">Edit your information</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Browse Jobs */}
              <Link href="/jobs" className="group">
                <div className="relative h-24 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-4 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex flex-col h-full justify-between">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Browse Jobs</p>
                      <p className="text-xs text-white/70">Find opportunities</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Sync GitHub */}
              <Link href="/profile" className="group">
                <div className="relative h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-4 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex flex-col h-full justify-between">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Sync GitHub</p>
                      <p className="text-xs text-white/70">Update repositories</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Connect LinkedIn */}
              <Link href="/profile" className="group">
                <div className="relative h-24 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 p-4 hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex flex-col h-full justify-between">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white">
                      <Linkedin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Connect LinkedIn</p>
                      <p className="text-xs text-white/70">Link your profile</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

