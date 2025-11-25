'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileAPI } from '@/lib/api'

export default function EditProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    experience: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: '',
    githubUsername: '',
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(storedUser)
    setUserId(parsed.id)
  }, [router])

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const res = await profileAPI.getProfile(userId)
      return res.data.user
    },
    enabled: !!userId,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        location: profile.location || '',
        experience: profile.experience?.toString() || '',
        bio: profile.bio || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        githubUsername: profile.githubUsername || '',
      })
      setSkillsInput(Array.isArray(profile.skills) ? profile.skills.join(', ') : '')
    }
  }, [profile])

  const parsedSkills = useMemo(
    () =>
      skillsInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    [skillsInput]
  )

  const handleChange = (key: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [key]: event.target.value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Build payload - only include fields that have values
      const payload: any = {}
      
      // Name is required, always include if it has a value
      if (formData.name.trim()) {
        payload.name = formData.name.trim()
      }
      
      // Optional fields - only include if they have values
      if (formData.location.trim()) {
        payload.location = formData.location.trim()
      }
      
      if (formData.bio.trim()) {
        payload.bio = formData.bio.trim()
      }
      
      if (formData.website.trim()) {
        payload.website = formData.website.trim()
      }
      
      if (formData.linkedin.trim()) {
        payload.linkedin = formData.linkedin.trim()
      }
      
      if (formData.twitter.trim()) {
        payload.twitter = formData.twitter.trim()
      }
      
      if (formData.githubUsername.trim()) {
        payload.githubUsername = formData.githubUsername.trim()
      }
      
      // Experience - only include if it's a valid number
      if (formData.experience && !isNaN(Number(formData.experience))) {
        payload.experience = Number(formData.experience)
      }
      
      // Skills - only include if there are skills
      if (parsedSkills.length > 0) {
        payload.skills = parsedSkills
      }

      // Ensure at least name is being sent
      if (!payload.name) {
        setError('Name is required')
        setLoading(false)
        return
      }

      console.log('Sending payload:', payload)

      const response = await profileAPI.updateProfile(payload)
      
      // Update localStorage with new user data
      const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...response.data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['skillAnalytics'] })
      
      setSuccess('Profile updated successfully! Redirecting...')
      setError('')
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (err: any) {
      console.error('Update profile error:', err)
      const details = err.response?.data
      if (Array.isArray(details?.errors) && details.errors.length > 0) {
        const errorMessages = details.errors.map((e: any) => {
          const field = e.param || e.field || ''
          const msg = e.msg || e.message || 'Invalid value'
          return field ? `${field}: ${msg}` : msg
        })
        setError(errorMessages.join('. '))
      } else {
        setError(details?.message || err.message || 'Failed to update profile. Please check your input and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!userId || isLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.4rem] text-muted-foreground">Profile</p>
          <h1 className="text-3xl font-semibold">Edit your profile</h1>
          <p className="text-muted-foreground">Update your public information so recruiters see the latest signal.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Only fields you change will be updated on save.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
                  {success}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={handleChange('location')}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    value={formData.experience}
                    onChange={handleChange('experience')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUsername">GitHub username</Label>
                  <Input
                    id="githubUsername"
                    value={formData.githubUsername}
                    onChange={handleChange('githubUsername')}
                    placeholder="your-handle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  rows={4}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell recruiters about the impact you create."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  placeholder="Next.js, Go, AWS, GraphQL"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange('website')}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange('linkedin')}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={handleChange('twitter')}
                  placeholder="@handle"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? 'Saving...' : 'Save changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

