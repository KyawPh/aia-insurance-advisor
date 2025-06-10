"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import AccessDenied from "./access-denied"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  adminOnly?: boolean
}

export default function AuthGuard({ children, requireAuth = false, adminOnly = false }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Redirect logic
    if (requireAuth && !user) {
      router.push("/auth/login")
      return
    }

    // TODO: Add admin check when admin role is implemented
    // if (adminOnly && !isAdmin) {
    //   router.push("/auth/login")
    //   return
    // }

    // Redirect authenticated users away from login page
    if (pathname === "/auth/login" && user) {
      router.push("/")
      return
    }
  }, [user, loading, requireAuth, adminOnly, router, pathname])

  if (loading) {
    return <LoadingSpinner />
  }

  // Don't render anything while redirecting - let the redirect happen
  if (requireAuth && !user) {
    return null // Router will handle redirect
  }

  // Don't render anything while redirecting - let the redirect happen  
  if (adminOnly && !user) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}