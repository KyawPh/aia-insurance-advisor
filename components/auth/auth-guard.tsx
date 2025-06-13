"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import AccessDenied from "./access-denied"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Redirect logic
    if (requireAuth && !user) {
      router.replace("/auth/login")
      return
    }

    // Redirect authenticated users away from login page
    if (pathname === "/auth/login" && user) {
      router.replace("/")
      return
    }
  }, [user, loading, requireAuth, router, pathname])

  if (loading) {
    return <LoadingSpinner />
  }

  // Don't render anything while redirecting - let the redirect happen
  if (requireAuth && !user) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}