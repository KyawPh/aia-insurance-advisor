"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { GoogleIcon } from "@/components/ui/google-icon"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth()

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      console.log("LoginPage: User authenticated, redirecting to home")
      setSuccess("Redirecting to dashboard...")
      router.replace("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Check URL for tab parameter using window.location (client-side only)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get("tab")
      if (tab === "signup") {
        setActiveTab("signup")
      }
    }
  }, [])

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn(loginData.email, loginData.password)
      setSuccess("Login successful! Redirecting...")
      // Remove manual redirect - let AuthGuard handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validation
      if (!signupData.fullName || !signupData.email || !signupData.password) {
        setError("Please fill in all required fields")
        return
      }

      if (signupData.password !== signupData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (signupData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return
      }

      await signUp(signupData.email, signupData.password, signupData.fullName)
      setSuccess("Account created successfully! Redirecting...")
      // Remove manual redirect - let AuthGuard handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError("")

    try {
      await signInWithGoogle()
      setSuccess("Google authentication successful! Redirecting...")
      // Remove manual redirect - let AuthGuard handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading if user is authenticated (redirecting)
  if (!loading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-light text-red-900 mb-2">Welcome</h1>
            <p className="text-sm sm:text-base text-gray-500">Access your insurance advisor platform</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg font-medium text-gray-900">Sign in to your account</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg h-auto">
                  <TabsTrigger
                    value="login"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-sm py-2"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-sm py-2"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Error/Success Messages */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-pink-500 p-[1px]">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <p className="text-sm font-medium text-gray-900">{error}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-[1px]">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <p className="text-sm font-medium text-gray-900">{success}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          className="pl-10 h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="pl-10 pr-10 h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        <span className="ml-2 text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGoogleAuth}
                      variant="outline"
                      className="w-full h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all"
                      disabled={isLoading}
                    >
                      <GoogleIcon className="w-5 h-5 mr-2" />
                      Sign in with Google
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="full-name"
                          type="text"
                          placeholder="Enter your full name"
                          autoComplete="name"
                          className="pl-10 h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          className="pl-10 h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          className="pl-10 pr-10 h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="pl-10 pr-10 h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="/terms" className="text-red-600 hover:text-red-700 font-medium">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-red-600 hover:text-red-700 font-medium">
                          Privacy Policy
                        </a>
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGoogleAuth}
                      variant="outline"
                      className="w-full h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all"
                      disabled={isLoading}
                    >
                      <GoogleIcon className="w-5 h-5 mr-2" />
                      {isLoading ? "Signing up with Google..." : "Sign up with Google"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} AIA Insurance Advisor. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}