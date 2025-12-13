'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Code, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const isAuthPage = ['/login', '/register', '/register-company'].some((segment) =>
    pathname?.startsWith(segment)
  )

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
    setIsHydrated(true)
    checkUser()
  }, [])

  useEffect(() => {
    if (isHydrated) {
      checkUser()
    }
  }, [pathname, isHydrated])

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

  const navItems = useMemo(() => {
    const links = [
      { label: 'Home', href: '/', show: true },
      { label: 'Jobs', href: '/jobs', show: true },
      {
        label: 'Dashboard',
        href: '/dashboard',
        show: !!user && user.role === 'USER',
      },
      {
        label: 'Company',
        href: '/company',
        show: !!user && (user.role === 'COMPANY' || user.role === 'ADMIN'),
      },
      {
        label: 'Admin',
        href: '/admin',
        show: !!user && user.role === 'ADMIN',
      },
      {
        label: 'Profile',
        href: '/profile',
        show: !!user && user.role !== 'ADMIN',
      },
    ]
    return links.filter((link) => link.show)
  }, [user])

  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
  const isLoading = !isHydrated

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/30 backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-cyan-400/10" />
      <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-400 text-white shadow-[0_10px_35px_rgba(14,165,233,0.35)]">
            <Code className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none tracking-wider uppercase text-white">DevConnect</span>
            <span className="text-xs font-medium uppercase tracking-[0.4em] text-white/60">Signal first</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
          {isLoading ? (
            <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse" />
          ) : (
            navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'nav-link',
                    active && 'bg-white/15 text-white'
                  )}
                >
                  {item.label}
                </Link>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
                <span>{user.role}</span>
              </div>
              <Button variant="ghost" className="hidden sm:inline-flex text-white/80 hover:text-white" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Link href="/profile">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-semibold uppercase text-white cursor-pointer hover:bg-white/20 transition-colors">
                  {initials}
                </div>
              </Link>
            </>
          ) : (
            <>
              {!isAuthPage && (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-white/80 hover:text-white">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      Launch workspace
                    </Button>
                  </Link>
                  <Link href="/register-company" className="hidden xl:block">
                    <Button variant="secondary">
                      Post jobs
                    </Button>
                  </Link>
                </>
              )}
              {isAuthPage && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  {pathname === '/login' ? (
                    <span>Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link></span>
                  ) : (
                    <span>Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></span>
                  )}
                </div>
              )}
            </>
          )}
          <button className="inline-flex lg:hidden items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
