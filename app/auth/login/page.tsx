"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { GoogleIcon } from "@/components/ui/google-icon"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { signInWithGoogle, user, loading } = useAuth()

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [user, loading, router])

  const handleGoogleAuth = () => {
    setIsLoading(true)
    setError("")

    signInWithGoogle()
      .then(() => {
        // Success - redirect will happen via useEffect
      })
      .catch((err: any) => {
        // Always reset loading state immediately
        setIsLoading(false)
        
        // Handle specific error cases
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
          // User cancelled - no error message needed
          return
        }
        
        if (err.code === 'auth/unauthorized-domain') {
          setError("This domain is not authorized. Please contact support.")
        } else if (err.code === 'auth/network-request-failed') {
          setError("Network error. Please check your connection.")
        } else {
          setError("Authentication failed. Please try again.")
        }
      })
  }

  // Show loading if user is authenticated (redirecting)
  if (!loading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center mb-3">
            <span className="text-white text-xl font-bold">AIA</span>
          </div>
          <h1 className="text-lg font-medium text-gray-900">Insurance Advisor</h1>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="p-3 bg-red-50 rounded-lg"
          >
            <p className="text-sm text-red-600 text-center">{error}</p>
          </motion.div>
        )}

        {/* Google Sign In Button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            className="h-10 px-6 bg-white border-gray-200 hover:bg-gray-50 font-normal text-sm shadow-sm"
            disabled={isLoading}
          >
            <GoogleIcon className="w-4 h-4 mr-2" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </motion.div>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center">
          By continuing, you agree to our{" "}
          <a href="/terms" className="hover:text-gray-600">
            Terms
          </a>{" "}
          &{" "}
          <a href="/privacy" className="hover:text-gray-600">
            Privacy
          </a>
        </p>
      </div>
    </div>
  )
}