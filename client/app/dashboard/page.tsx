'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { matchingAPI, analyticsAPI } from '@/lib/api'
import { Briefcase, TrendingUp, Users, Code } from 'lucide-react'
import Link from 'next/link'

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

  if (!user) return null
  
  // Don't render dashboard for admins (they'll be redirected)
  if (user.role === 'ADMIN') return null

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your profile
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild>
                <Link href="/profile">Update Profile</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/profile">Sync GitHub</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

