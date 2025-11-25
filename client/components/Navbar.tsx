'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Code, Home, Briefcase, User, BarChart3, LogOut, Shield } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  const checkUser = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    checkUser()
  }, [pathname])

  useEffect(() => {
    const handleStorageChange = () => {
      checkUser()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/95 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
      <div className="container mx-auto px-4 relative">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">DevConnect</p>
              <p className="text-xs uppercase tracking-[0.4rem] text-white/60">Signal first</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Regular user navigation - hide for admins and companies */}
                {user.role === 'USER' && (
                  <>
                    <Link href="/dashboard" className="hidden lg:block">
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/jobs" className="hidden lg:block">
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Jobs
                      </Button>
                    </Link>
                    <Link href="/profile" className="hidden lg:block">
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="hidden lg:block">
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    </Link>
                  </>
                )}
                {/* Company navigation */}
                {user.role === 'COMPANY' && (
                  <Link href="/company" className="hidden lg:block">
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Company Dashboard
                    </Button>
                  </Link>
                )}
                {/* Admin navigation */}
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="hidden lg:block">
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Link href="/register">
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/register-company">
                    <Button className="bg-white text-slate-900 hover:bg-white/90">
                      Post Jobs
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

