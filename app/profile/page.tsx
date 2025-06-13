"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, CreditCard, Clock, AlertCircle, CheckCircle2, Crown, TrendingUp, BarChart3, Download, Eye, Phone, AlertTriangle, Calendar as CalendarIcon, X } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import AuthGuard from "@/components/auth/auth-guard"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useQuota } from "@/hooks/use-quota"
import { QuotaService } from "@/lib/quota-service"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { clearSession } from "@/lib/session-storage"
import { getInitials } from "@/lib/user-utils"
import { formatMMK } from "@/utils/formatting"
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans"
import { UpgradePaymentDialog } from "@/components/upgrade-payment-dialog"
import { UpgradeService, type UpgradeRequest } from "@/lib/upgrade-service"

// Types for quote history and analytics
interface QuoteHistoryItem {
  id: string
  userId: string
  action: 'quote_generated' | 'pdf_downloaded' | 'report_viewed'
  timestamp: Date
  metadata: {
    clientName?: string
    totalPremium?: number
    selectedProducts?: string[]
    [key: string]: any
  }
  quotaConsumed: number
}

interface UserProfile {
  fullName: string
  company: string
  position: string
  phone: string
  preferences: {
    quotaAlerts: boolean
    theme: 'light' | 'dark' | 'system'
  }
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const { quota, usageHistory, loading: quotaLoading, refreshQuota, quotaRemaining, quotaUsed, quotaLimit, plan } = useQuota()
  const { plans, getPlanByInternalId, getPlanColors, formatPriceMMK, getBillingPeriodLabel, billingOptions, unlimitedPlan, freeTrial } = useSubscriptionPlans()
  
  const [isLoading, setIsLoading] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [firebaseUserData, setFirebaseUserData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [quotesPerPage] = useState(10)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | '6months' | '12months'>('monthly')
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [loadingUpgradeRequests, setLoadingUpgradeRequests] = useState(true)
  const [dismissedRequestId, setDismissedRequestId] = useState<string | null>(null)

  // Form state for profile editing
  const [profileForm, setProfileForm] = useState<UserProfile>({
    fullName: "",
    company: "",
    position: "",
    phone: "",
    preferences: {
      quotaAlerts: true,
      theme: 'system'
    }
  })

  // Fetch Firebase user data
  const fetchFirebaseUserData = async () => {
    if (!user) return
    
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        setFirebaseUserData(userData)
        
        // Initialize form with Firebase data
        setProfileForm(prev => ({
          ...prev,
          fullName: userData.fullName || user.displayName || "",
          company: userData.company || "",
          position: userData.position || "",
          phone: userData.phone || "",
          preferences: userData.preferences || prev.preferences
        }))
      } else {
        // Fallback to localStorage and user auth data
        setProfileForm(prev => ({
          ...prev,
          fullName: user.displayName || "",
          company: localStorage.getItem("userCompany") || "",
          position: localStorage.getItem("userPosition") || "",
          phone: localStorage.getItem("userPhone") || "",
        }))
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Fallback to localStorage
      setProfileForm(prev => ({
        ...prev,
        fullName: user.displayName || "",
        company: localStorage.getItem("userCompany") || "",
        position: localStorage.getItem("userPosition") || "",
        phone: localStorage.getItem("userPhone") || "",
      }))
    }
  }

  // Fetch user's upgrade requests
  const fetchUpgradeRequests = async () => {
    if (!user) return
    
    setLoadingUpgradeRequests(true)
    try {
      const requests = await UpgradeService.getUserUpgradeRequests(user.uid)
      setUpgradeRequests(requests)
    } catch (error) {
      console.error("Error fetching upgrade requests:", error)
    } finally {
      setLoadingUpgradeRequests(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchFirebaseUserData()
      fetchUpgradeRequests()
    }

    // Check for tab parameter in URL
    const tab = searchParams.get("tab")
    if (tab && ["overview", "quotes", "analytics", "plans", "settings"].includes(tab)) {
      setActiveTab(tab)
      // Reset pagination when switching tabs
      if (tab === "quotes") {
        setCurrentPage(1)
      }
    }
  }, [user, searchParams])

  // Reset pagination when usage history changes
  useEffect(() => {
    setCurrentPage(1)
  }, [usageHistory.length])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (user) {
        // Update Firebase user profile
        await updateProfile(user, {
          displayName: profileForm.fullName
        })

        // Update Firestore user document with additional profile data
        await updateDoc(doc(db, 'users', user.uid), {
          fullName: profileForm.fullName,
          company: profileForm.company,
          position: profileForm.position,
          phone: profileForm.phone,
          preferences: profileForm.preferences,
          updatedAt: new Date()
        })

        // Also update localStorage for immediate access
        localStorage.setItem("userCompany", profileForm.company)
        localStorage.setItem("userPosition", profileForm.position)
        localStorage.setItem("userPhone", profileForm.phone)

        // Refresh Firebase user data
        await fetchFirebaseUserData()
        
        setProfileUpdateSuccess(true)
        setTimeout(() => setProfileUpdateSuccess(false), 5000)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (planId: string, billing: 'monthly' | '6months' | '12months' = 'monthly') => {
    // Check if user already has a pending request
    if (user) {
      const hasPending = await UpgradeService.hasPendingRequest(user.uid)
      if (hasPending) {
        // Show error using modern alert instead
        const alertDiv = document.createElement('div')
        alertDiv.className = 'fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2'
        alertDiv.innerHTML = `
          <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-[1px]">
            <div class="relative bg-white rounded-xl p-4 shadow-lg">
              <div class="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl"></div>
              <div class="relative flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-900">
                  You already have a pending upgrade request. Please wait for it to be processed.
                </p>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(alertDiv)
        setTimeout(() => alertDiv.remove(), 5000)
        return
      }
    }
    
    setSelectedBillingPeriod(billing)
    setShowUpgradeDialog(true)
  }



  // Get analytics data from usage history
  const getAnalytics = () => {
    const last30Days = usageHistory.filter(item => {
      const itemDate = new Date(item.timestamp)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return itemDate >= thirtyDaysAgo
    })

    const quotesByDay = last30Days.reduce((acc, item) => {
      const day = item.timestamp.toDateString()
      acc[day] = (acc[day] || 0) + (item.action === 'quote_generated' ? 1 : 0)
      return acc
    }, {} as Record<string, number>)

    const totalQuotes = last30Days.filter(item => item.action === 'quote_generated').length
    const totalDownloads = last30Days.filter(item => item.action === 'pdf_downloaded').length
    const totalViews = last30Days.filter(item => item.action === 'report_viewed').length

    return {
      totalQuotes,
      totalDownloads, 
      totalViews,
      quotesByDay,
      averageQuotesPerDay: totalQuotes / 30
    }
  }

  const analytics = getAnalytics()

  // Pagination logic for quote history
  const quoteGenerationHistory = usageHistory.filter(item => item.action === 'quote_generated')
  const totalQuotes = quoteGenerationHistory.length
  const totalPages = Math.ceil(totalQuotes / quotesPerPage)
  const startIndex = (currentPage - 1) * quotesPerPage
  const endIndex = startIndex + quotesPerPage
  const currentQuotes = quoteGenerationHistory.slice(startIndex, endIndex)
  
  // Check if any quotes have premium values
  const hasPremiumData = quoteGenerationHistory.some(item => item.metadata.totalPremium && item.metadata.totalPremium > 0)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleNewQuote = () => {
    // Clear session and start fresh
    clearSession()
    // Navigate to main page with new quote parameter to force fresh start
    router.push("/?new=true")
  }

  const handleViewQuote = async (quoteItem: QuoteHistoryItem) => {
    try {
      // Track report view activity for analytics
      await refreshQuota() // Make sure we have the latest quota data
      
      if (user) {
        await QuotaService.trackActivity(user.uid, 'report_viewed', {
          clientName: quoteItem.metadata.clientName,
          selectedProducts: quoteItem.metadata.selectedProducts
        })
      }
      
      // Reconstruct product selections from selectedProducts array
      const reconstructProductSelections = () => {
        const products = quoteItem.metadata.selectedProducts || []
        const selections: any = {
          ohsPlans: [],
          universalLife: null,
          termLife: null,
          cancerRider: false
        }

        products.forEach((product: string) => {
          if (product.startsWith('OHS Plan ')) {
            const planId = parseInt(product.replace('OHS Plan ', ''))
            if (!isNaN(planId)) {
              selections.ohsPlans.push(planId)
            }
          } else if (product.startsWith('Universal Life ')) {
            const planId = product.replace('Universal Life ', '')
            selections.universalLife = {
              planId: planId,
              healthTier: 'standard' // Default since we don't store this
            }
          } else if (product.startsWith('Term Life ')) {
            const planId = product.replace('Term Life ', '')
            selections.termLife = {
              planId: planId
            }
          } else if (product === 'Cancer Care') {
            selections.cancerRider = true
          }
        })

        return selections
      }

      // Reconstruct the quote data from the usage history metadata
      const quoteData = {
        clientData: {
          name: quoteItem.metadata.clientName || '',
          dateOfBirth: quoteItem.metadata.clientDateOfBirth || '01/01/1990', // Fallback
          gender: quoteItem.metadata.clientGender || 'male' // Fallback
        },
        productSelections: quoteItem.metadata.productSelections || reconstructProductSelections(),
        timestamp: quoteItem.timestamp,
        totalPremium: quoteItem.metadata.totalPremium || 0
      }


      // Store the quote data in session storage for the report page
      sessionStorage.setItem('viewQuoteData', JSON.stringify(quoteData))
      
      // Navigate to main page and force it to step 3 (report page)
      router.push('/?view=true&step=3')
    } catch (error) {
      console.error('Error viewing quote:', error)
      // Show error using modern alert instead
      const alertDiv = document.createElement('div')
      alertDiv.className = 'fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2'
      alertDiv.innerHTML = `
        <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-[1px]">
          <div class="relative bg-white rounded-xl p-4 shadow-lg">
            <div class="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl"></div>
            <div class="relative flex items-center gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-900">
                Unable to load quote details. Please try again.
              </p>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(alertDiv)
      setTimeout(() => alertDiv.remove(), 5000)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }


  if (!user) {
    return null // AuthGuard will handle redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-3 sm:p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with AIA Logo */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative h-10 w-20 sm:h-12 sm:w-24 cursor-pointer" onClick={() => router.push("/")}>
                <Image
                  src="/logo.png"
                  alt="AIA Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="drop-shadow-sm"
                />
              </div>
              <div className="h-6 sm:h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-light text-gray-900">My Profile</h1>
                <p className="text-xs sm:text-sm text-gray-500">Manage your account and quotes</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
              >
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Success Messages */}

          {profileUpdateSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Profile updated successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1">
              <Card className="shadow-md border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Account Information</CardTitle>
                    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">User</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-3 sm:mb-4">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-red-100 text-red-600 text-lg sm:text-xl">
                        {getInitials(user.displayName || user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-base sm:text-lg font-medium">{firebaseUserData?.fullName || user.displayName || "User"}</h3>
                    <p className="text-sm sm:text-base text-gray-500">{user.email}</p>
                    {firebaseUserData?.company && (
                      <p className="text-xs text-gray-400">{firebaseUserData.company}</p>
                    )}
                    <Badge className="mt-2 bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 text-xs sm:text-sm">
                      {firebaseUserData?.position || "Insurance Advisor"}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Account Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Account Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-500">Joined:</span>
                        <span className="ml-auto">
                          {firebaseUserData?.createdAt ? 
                            firebaseUserData.createdAt.toDate().toLocaleDateString() : 
                            user.metadata.creationTime ? 
                              new Date(user.metadata.creationTime).toLocaleDateString() : 
                              new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-500">Last login:</span>
                        <span className="ml-auto">
                          {firebaseUserData?.lastLogin ? 
                            firebaseUserData.lastLogin.toDate().toLocaleDateString() : 
                            user.metadata.lastSignInTime ? 
                              new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                              new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      {firebaseUserData?.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-auto">{firebaseUserData.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-500">Subscription:</span>
                        <span className="ml-auto capitalize">{plan} Plan</span>
                      </div>
                      {firebaseUserData?.updatedAt && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-500">Last updated:</span>
                          <span className="ml-auto">
                            {firebaseUserData.updatedAt.toDate().toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg h-auto">
                  <TabsTrigger
                    value="overview"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="quotes"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Quotes</span>
                    <span className="sm:hidden">Quotes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="plans"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Billing</span>
                    <span className="sm:hidden">Billing</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Settings</span>
                    <span className="sm:hidden">Settings</span>
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 sm:gap-6">
                    {/* Quota Usage Card */}
                    <Card className="shadow-md border-0">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-medium">Current Plan</CardTitle>
                            <CardDescription>Your subscription and quota usage</CardDescription>
                          </div>
                          <Badge className={`${getPlanColors(plan)?.primary.replace('text-', 'text-')} ${getPlanColors(plan)?.background.replace('bg-', 'bg-').replace('-50', '-100')} border-0`}>
                            {getPlanByInternalId(plan)?.name || 'Unknown Plan'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {quotaLoading && (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading subscription status...</p>
                          </div>
                        )}
                        
                        {!quotaLoading && quota && (
                          <>
                        {/* Subscription Status Alerts */}
                        {quota?.subscription?.isInGracePeriod && quota.subscription.gracePeriodEnd && (
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-[1px]">
                            <div className="relative bg-white rounded-xl p-4">
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl" />
                              <div className="relative flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">Grace Period Active</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      You have {quota.dailyQuotaLimit} quotes per day during your grace period.
                                      <span className="block text-xs text-gray-500 mt-1">
                                        Expires {quota.subscription.gracePeriodEnd?.toLocaleDateString()}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-0 shadow-lg shadow-orange-200"
                                  onClick={() => router.push("/profile?tab=plans")}
                                >
                                  Renew Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Expiry Warning (7 days before) */}
                        {quota?.subscription?.subscriptionEnd && 
                         quota.subscription.isActive && 
                         !quota.subscription.isInGracePeriod && (
                          (() => {
                            const daysUntilExpiry = Math.ceil(
                              (quota.subscription.subscriptionEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                            )
                            
                            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0 && quota.subscription.subscriptionEnd) {
                              return (
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 p-[1px]">
                                  <div className="relative bg-white rounded-xl p-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl" />
                                    <div className="relative flex items-start justify-between gap-4">
                                      <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-lg flex items-center justify-center">
                                          <CalendarIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900">Subscription Expires Soon</h4>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} remaining
                                            <span className="block text-xs text-gray-500 mt-1">
                                              Expires on {quota.subscription.subscriptionEnd.toLocaleDateString()}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-yellow-200"
                                        onClick={() => router.push("/profile?tab=plans")}
                                      >
                                        Renew Early
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })()
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            {quota?.subscription?.plan === 'free' ? (
                              <>
                                <p className="text-sm font-medium">Free Trial Quota</p>
                                <p className="text-2xl font-bold">{quotaRemaining}<span className="text-sm text-gray-500">/{quotaLimit}</span></p>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">quotes remaining</p>
                                </div>
                              </>
                            ) : quota?.subscription?.isInGracePeriod ? (
                              <>
                                <p className="text-sm font-medium">Daily Grace Period Quota</p>
                                <p className="text-2xl font-bold">{quota.dailyQuotaLimit - quota.dailyQuotaUsed}<span className="text-sm text-gray-500">/{quota.dailyQuotaLimit}</span></p>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">quotes remaining today</p>
                                  <p className="text-xs text-orange-600">Resets daily at midnight</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium">Unlimited Plan</p>
                                <div className="flex items-baseline">
                                  <span className="text-2xl font-bold">∞</span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">unlimited quotes</p>
                                  <p className="text-xs text-green-600">Active subscription</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            {quota?.subscription?.plan === 'free' ? (
                              <>
                                <p className="text-sm font-medium">{Math.round((quotaUsed / quotaLimit) * 100)}% used</p>
                                <p className="text-xs text-gray-500">No expiry</p>
                              </>
                            ) : quota?.subscription?.isInGracePeriod ? (
                              <>
                                <p className="text-sm font-medium">{Math.round((quota.dailyQuotaUsed / quota.dailyQuotaLimit) * 100)}% used today</p>
                                <p className="text-xs text-orange-600">
                                  Grace period: {quota.subscription.gracePeriodEnd ? Math.ceil((quota.subscription.gracePeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-xs text-gray-500">
                                  {quota.subscription.autoRenew ? 'Auto-renews' : 'Expires'} {quota.subscription.subscriptionEnd?.toLocaleDateString()}
                                </p>
                                <Badge className="mt-1 bg-green-100 text-green-700 text-xs">
                                  {(() => {
                                    if (quota.subscription.subscriptionEnd) {
                                      const now = new Date();
                                      const end = quota.subscription.subscriptionEnd;
                                      const diffTime = end.getTime() - now.getTime();
                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                      const diffMonths = Math.round(diffDays / 30);
                                      
                                      if (diffMonths >= 1) {
                                        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
                                      } else if (diffDays >= 1) {
                                        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
                                      } else {
                                        return 'Expires today';
                                      }
                                    }
                                    return 'Active';
                                  })()}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bars */}
                        {quota?.subscription?.plan === 'free' && (
                          <Progress
                            value={(quotaUsed / quotaLimit) * 100}
                            className="h-2"
                            indicatorClassName={quotaRemaining < 3 ? "bg-red-600" : quotaUsed / quotaLimit > 0.7 ? "bg-amber-500" : "bg-green-500"}
                          />
                        )}
                        
                        {quota?.subscription?.isInGracePeriod && (
                          <Progress
                            value={(quota.dailyQuotaUsed / quota.dailyQuotaLimit) * 100}
                            className="h-2"
                            indicatorClassName="bg-orange-500"
                          />
                        )}
                        
                        {/* Upgrade Prompts for Free Users */}
                        {quota?.subscription?.plan === 'free' && (
                          <div className="mt-4 space-y-3">
                            {plans.filter(p => p.id !== 'free').map((planData) => (
                              <div key={planData.id} className={`p-4 bg-gradient-to-r ${planData.colors.background} rounded-lg ${planData.colors.border}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Crown className={`h-6 w-6 ${planData.colors.primary}`} />
                                    <div>
                                      <h4 className={`font-medium ${planData.colors.primary.replace('text-', 'text-').replace('-600', '-900')}`}>{planData.name}</h4>
                                      <p className={`text-sm ${planData.colors.text}`}>{planData.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-lg font-bold ${planData.colors.primary}`}>
                                      {planData.billingOptions?.[0] ? `${formatPriceMMK(planData.billingOptions[0].price)}` : 'Custom'}
                                      <span className="text-sm">{planData.billingOptions?.[0] ? '/mo' : ' pricing'}</span>
                                    </p>
                                    <Button 
                                      onClick={() => planData.billingOptions?.[0] ? handleUpgrade(planData.id, 'monthly') : router.push("/profile?tab=plans")} 
                                      size="sm" 
                                      className={`${planData.colors.button} ${planData.colors.buttonHover} mt-1`}
                                    >
                                      {planData.billingOptions?.[0] ? 'Upgrade' : 'Contact Sales'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                          </>
                        )}

                      </CardContent>
                    </Card>

                    {/* Latest Upgrade Request - Only show the most recent one */}
                    {upgradeRequests.length > 0 && (() => {
                      const latestRequest = upgradeRequests[0] // Already sorted by createdAt desc
                      if (dismissedRequestId === latestRequest.id) return null
                      
                      return (
                        <Card key={latestRequest.id} className={`shadow-md border-0 relative ${
                          latestRequest.status === 'pending' ? 'bg-amber-50' :
                          latestRequest.status === 'processing' ? 'bg-blue-50' :
                          latestRequest.status === 'completed' ? 'bg-green-50' :
                          'bg-red-50'
                        }`}>
                          <CardHeader className="pb-4">
                            {/* Dismiss button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200/50"
                              onClick={() => setDismissedRequestId(latestRequest.id || '')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center justify-between pr-8">
                              <div className="flex items-center space-x-2">
                                {latestRequest.status === 'pending' && <Clock className="h-5 w-5 text-amber-600" />}
                                {latestRequest.status === 'processing' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                                {latestRequest.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                {latestRequest.status === 'rejected' && <AlertCircle className="h-5 w-5 text-red-600" />}
                                <CardTitle className={`text-lg font-medium ${
                                  latestRequest.status === 'pending' ? 'text-amber-900' :
                                  latestRequest.status === 'processing' ? 'text-blue-900' :
                                  latestRequest.status === 'completed' ? 'text-green-900' :
                                  'text-red-900'
                                }`}>
                                  {latestRequest.status === 'pending' ? 'Payment Verification Pending' :
                                   latestRequest.status === 'processing' ? 'Processing Your Upgrade' :
                                   latestRequest.status === 'completed' ? 'Upgrade Completed' :
                                   'Request Rejected'}
                                </CardTitle>
                              </div>
                              <Badge variant="outline" className={`text-xs ${
                                latestRequest.status === 'pending' ? 'border-amber-300 text-amber-700' :
                                latestRequest.status === 'processing' ? 'border-blue-300 text-blue-700' :
                                latestRequest.status === 'completed' ? 'border-green-300 text-green-700' :
                                'border-red-300 text-red-700'
                              }`}>
                                {latestRequest.id?.slice(-6).toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Plan:</span>
                                <p className="font-medium">{getBillingPeriodLabel(latestRequest.billingPeriod)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Amount:</span>
                                <p className="font-medium">{formatPriceMMK(latestRequest.amount)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Payment Method:</span>
                                <p className="font-medium capitalize">{latestRequest.paymentMethod.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Submitted:</span>
                                <p className="font-medium">{latestRequest.createdAt.toLocaleDateString()}</p>
                              </div>
                            </div>
                            {latestRequest.status === 'pending' && (
                              <p className={`text-sm mt-3 text-amber-700`}>
                                We'll verify your payment within 24 hours. Keep your payment receipt for reference.
                              </p>
                            )}
                            {latestRequest.status === 'rejected' && latestRequest.notes && (
                              <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-red-100 to-pink-100">
                                <p className="text-sm text-red-900">
                                  <span className="font-semibold">Rejection reason:</span> {latestRequest.notes}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })()}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Card className="shadow-md border-0">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{analytics.totalQuotes}</p>
                          <p className="text-xs text-gray-500">Quotes (30 days)</p>
                        </CardContent>
                      </Card>
                      <Card className="shadow-md border-0">
                        <CardContent className="p-4 text-center">
                          <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{analytics.totalDownloads}</p>
                          <p className="text-xs text-gray-500">Downloads</p>
                        </CardContent>
                      </Card>
                      <Card className="shadow-md border-0">
                        <CardContent className="p-4 text-center">
                          <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{analytics.totalViews}</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </CardContent>
                      </Card>
                      <Card className="shadow-md border-0">
                        <CardContent className="p-4 text-center">
                          <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{analytics.averageQuotesPerDay.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">Avg/day</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Quote History Tab */}
                <TabsContent value="quotes" className="space-y-6">
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Quote History</CardTitle>
                      <CardDescription>View all your insurance quote activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quotaLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading quote history...</p>
                        </div>
                      ) : totalQuotes > 0 ? (
                        <div className="space-y-4">
                          <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="min-w-full px-4 sm:px-0">
                              <Table className={hasPremiumData ? "min-w-[700px]" : "min-w-[600px]"}>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="font-medium w-24">Date</TableHead>
                                    <TableHead className="font-medium w-32">Client</TableHead>
                                    {hasPremiumData && (
                                      <TableHead className="font-medium w-24 text-right">Premium</TableHead>
                                    )}
                                    <TableHead className="font-medium">Products</TableHead>
                                    <TableHead className="font-medium text-center w-16">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentQuotes.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                      <TableCell className="font-medium text-xs py-2">
                                        {new Date(item.timestamp).toLocaleDateString('en-US', { 
                                          month: '2-digit', 
                                          day: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <div className="max-w-32 truncate text-sm" title={item.metadata.clientName || 'N/A'}>
                                          {item.metadata.clientName || 'N/A'}
                                        </div>
                                      </TableCell>
                                      {hasPremiumData && (
                                        <TableCell className="text-right py-2">
                                          <div className="text-sm font-medium">
                                            {item.metadata.totalPremium ? 
                                              formatMMK(item.metadata.totalPremium) : 
                                              <span className="text-gray-400">-</span>
                                            }
                                          </div>
                                        </TableCell>
                                      )}
                                      <TableCell className="py-2">
                                        <div className="flex gap-1 overflow-x-auto pb-1" style={{ 
                                          scrollbarWidth: 'thin',
                                          scrollbarColor: '#d1d5db #f3f4f6'
                                        }}>
                                          {item.metadata.selectedProducts?.map((product, index) => (
                                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 text-xs whitespace-nowrap flex-shrink-0">
                                              {product}
                                            </Badge>
                                          )) || <span className="text-gray-400 text-xs">No products</span>}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center py-2">
                                        <Button
                                          onClick={() => handleViewQuote(item)}
                                          variant="outline"
                                          size="sm"
                                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-7 px-2 text-xs"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                          
                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                              <div className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalQuotes)} of {totalQuotes} quotes
                              </div>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious 
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) handlePageChange(currentPage - 1)
                                      }}
                                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                  
                                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber
                                    if (totalPages <= 5) {
                                      pageNumber = i + 1
                                    } else if (currentPage <= 3) {
                                      pageNumber = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNumber = totalPages - 4 + i
                                    } else {
                                      pageNumber = currentPage - 2 + i
                                    }
                                    
                                    return (
                                      <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(pageNumber)
                                          }}
                                          isActive={currentPage === pageNumber}
                                        >
                                          {pageNumber}
                                        </PaginationLink>
                                      </PaginationItem>
                                    )
                                  })}
                                  
                                  {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
                                  
                                  <PaginationItem>
                                    <PaginationNext 
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                      }}
                                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600">No quotes yet</h3>
                          <p className="text-gray-500 mt-1">You haven't created any insurance quotes yet.</p>
                          <Button onClick={handleNewQuote} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                            Create New Quote
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Usage Analytics</CardTitle>
                      <CardDescription>Detailed insights into your quote generation patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        {/* Usage Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <h4 className="font-medium text-green-900">Total Quotes</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-600 mt-2">{analytics.totalQuotes}</p>
                            <p className="text-sm text-green-700">Last 30 days</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <Download className="h-5 w-5 text-blue-600" />
                              <h4 className="font-medium text-blue-900">Downloads</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{analytics.totalDownloads}</p>
                            <p className="text-sm text-blue-700">PDF reports</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-5 w-5 text-purple-600" />
                              <h4 className="font-medium text-purple-900">Report Views</h4>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 mt-2">{analytics.totalViews}</p>
                            <p className="text-sm text-purple-700">Total views</p>
                          </div>
                        </div>

                        {/* Daily Average */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Activity Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Average quotes per day:</span>
                              <span className="font-medium ml-2">{analytics.averageQuotesPerDay.toFixed(1)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Most active day:</span>
                              <span className="font-medium ml-2">
                                {Object.entries(analytics.quotesByDay).length > 0 
                                  ? Object.entries(analytics.quotesByDay).reduce((a, b) => analytics.quotesByDay[a[0]] > analytics.quotesByDay[b[0]] ? a : b)[0]
                                  : 'N/A'
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Current Month Progress */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Monthly Quota Progress</h4>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Current Usage</p>
                              <p className="text-xs text-gray-500">{quotaUsed} of {quotaLimit} quotes used</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{Math.round((quotaUsed / quotaLimit) * 100)}% used</p>
                              <p className="text-xs text-gray-500">Resets {quota?.resetDate?.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Progress
                            value={(quotaUsed / quotaLimit) * 100}
                            className="h-3"
                            indicatorClassName={quotaRemaining < 3 ? "bg-red-600" : quotaUsed / quotaLimit > 0.7 ? "bg-amber-500" : "bg-green-500"}
                          />
                          
                          {/* Quota Warnings */}
                          {quota?.subscription?.isInGracePeriod ? (
                            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 p-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <p className="text-sm text-orange-900 font-medium">
                                  Grace Period: {quota.dailyQuotaLimit - quota.dailyQuotaUsed} quotes left today
                                </p>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="ml-auto h-7 text-xs text-orange-700 hover:text-orange-900 hover:bg-orange-200"
                                  onClick={() => router.push("/profile?tab=plans")}
                                >
                                  Renew →
                                </Button>
                              </div>
                            </div>
                          ) : quota?.subscription?.plan === 'free' && quotaRemaining < 3 ? (
                            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-100 to-pink-100 p-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-900 font-medium">
                                  Low quota: Only {quotaRemaining} {quotaRemaining === 1 ? 'quote' : 'quotes'} left
                                </p>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="ml-auto h-7 text-xs text-red-700 hover:text-red-900 hover:bg-red-200"
                                  onClick={() => router.push("/profile?tab=plans")}
                                >
                                  Upgrade →
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="plans" className="space-y-6">
                  {/* Current Plan Display */}
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-medium">Plan Management</CardTitle>
                      </div>
                      <CardDescription>Upgrade your plan or purchase additional quotes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Current Plan</h4>
                            <p className="text-sm text-gray-600 capitalize">{getPlanByInternalId(plan)?.name || plan} Plan</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold">{quota?.quotaLimit === -1 ? '∞' : (quota?.quotaLimit || 5)}</span>
                              <span className="text-sm text-gray-500">{quota?.quotaLimit === -1 ? 'unlimited' : 'quotes'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upgrade Request History */}
                  {upgradeRequests.length > 0 && (
                    <Card className="shadow-md border-0">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium">Upgrade Request History</CardTitle>
                        <CardDescription>Track your subscription upgrade requests</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {upgradeRequests.slice(0, 5).map((request) => (
                                <TableRow key={request.id}>
                                  <TableCell className="text-sm">
                                    {request.createdAt.toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {getBillingPeriodLabel(request.billingPeriod)}
                                  </TableCell>
                                  <TableCell className="text-sm font-medium">
                                    {formatPriceMMK(request.amount)}
                                  </TableCell>
                                  <TableCell>
                                    {request.status === 'pending' && (
                                      <Badge className="bg-amber-100 text-amber-700 border-0">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                    {request.status === 'processing' && (
                                      <Badge className="bg-blue-100 text-blue-700 border-0">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                        Processing
                                      </Badge>
                                    )}
                                    {request.status === 'completed' && (
                                      <Badge className="bg-green-100 text-green-700 border-0">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                    {request.status === 'rejected' && (
                                      <Badge className="bg-red-100 text-red-700 border-0">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Rejected
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Subscription Plans */}
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Subscription Plans</CardTitle>
                      <CardDescription>Choose the perfect billing period for your unlimited plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        {billingOptions.map((option: any) => {
                          // All cards are for unlimited plan, so use consistent styling
                          const isPopular = option.period === '12months'
                          // Use slightly muted colors for non-popular cards but keep buttons visible
                          const colors = isPopular ? unlimitedPlan.colors : {
                            primary: 'text-gray-900',
                            background: 'bg-white',
                            text: 'text-gray-700',
                            border: 'border-gray-200',
                            button: 'bg-gray-900',
                            buttonHover: 'hover:bg-gray-800'
                          }
                          
                          return (
                            <div key={option.period} className={`p-6 border rounded-lg ${colors.background} flex flex-col h-full relative ${
                              isPopular ? `border-2 ${colors.border.replace('border-', 'border-')}` : 'border'
                            }`}>
                              {isPopular && (
                                <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                                  <span className={`${colors.button} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                                    MOST POPULAR
                                  </span>
                                </div>
                              )}
                              <h3 className={`text-lg font-bold mb-2 ${colors.primary.replace('text-', 'text-').replace('-600', '-900')}`}>
                                {getBillingPeriodLabel(option.period)}
                              </h3>
                              <div className="mb-4">
                                <p className={`text-2xl font-bold ${colors.primary}`}>
                                  {formatPriceMMK(option.price)}
                                </p>
                                <p className={`text-sm ${colors.text}`}>
                                  {option.period === 'monthly' ? 'per month' : `${formatPriceMMK(option.totalPrice)} total`}
                                </p>
                                {option.savings && (
                                  <p className="text-xs text-green-600 font-medium mt-1">{option.savings}</p>
                                )}
                              </div>
                              <div className="space-y-2 mb-6 flex-grow">
                                {unlimitedPlan.features.map((feature: string, index: number) => (
                                  <p key={index} className={`text-sm ${colors.text}`}>✓ {feature}</p>
                                ))}
                              </div>
                              <Button 
                                className={`w-full ${colors.button} ${colors.buttonHover} text-white mt-auto font-medium`}
                                onClick={() => handleUpgrade('unlimited', option.period)}
                                size="lg"
                              >
                                {option.period === '12months' ? 'Upgrade to 12 Months' : 
                                 option.period === '6months' ? 'Upgrade to 6 Months' : 
                                 'Upgrade to Monthly'}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>


                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  {/* Personal Information */}
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="fullName"
                                value={profileForm.fullName}
                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                autoComplete="name"
                                className="pl-10 h-10 sm:h-11"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input id="email" type="email" value={user?.email || ""} autoComplete="email" className="pl-10 h-10 sm:h-11" disabled />
                            </div>
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              value={profileForm.company}
                              onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                              autoComplete="organization"
                              className="h-10 sm:h-11"
                              placeholder="AIA Myanmar"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                              id="position"
                              value={profileForm.position}
                              onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                              autoComplete="organization-title"
                              className="h-10 sm:h-11"
                              placeholder="Insurance Advisor"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            autoComplete="tel"
                            className="h-10 sm:h-11"
                            placeholder="+95 9 123 456 789"
                          />
                        </div>

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Notification Preferences</CardTitle>
                      <CardDescription>Manage how you receive updates and alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Quota Alerts</Label>
                          <p className="text-xs text-gray-500">Get notified when quota is running low</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.preferences.quotaAlerts}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              preferences: { ...profileForm.preferences, quotaAlerts: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} AIA Insurance Advisor. All rights reserved.</p>
          </div>
        </div>

      {/* Upgrade Payment Dialog */}
      {user && (
        <UpgradePaymentDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          billingPeriod={selectedBillingPeriod}
          userId={user.uid}
          userEmail={user.email || ''}
          userName={user.displayName || firebaseUserData?.fullName || 'User'}
          onSuccess={() => {
            refreshQuota()
            fetchUpgradeRequests()
            // Show success message
            setProfileUpdateSuccess(true)
            setTimeout(() => setProfileUpdateSuccess(false), 5000)
          }}
        />
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </AuthGuard>
  )
}