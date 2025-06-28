"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
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
import { User, Mail, Calendar, CreditCard, Clock, AlertCircle, CheckCircle2, Crown, TrendingUp, BarChart3, Download, Eye, Phone, AlertTriangle, Calendar as CalendarIcon, X, LogOut } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("quotes")
  const [firebaseUserData, setFirebaseUserData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [quotesPerPage] = useState(10)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | '6months' | '12months'>('monthly')
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [loadingUpgradeRequests, setLoadingUpgradeRequests] = useState(true)
  const [dismissedRequestId, setDismissedRequestId] = useState<string | null>(null)
  const [loadingQuoteId, setLoadingQuoteId] = useState<string | null>(null)

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
    if (tab && ["quotes", "analytics", "plans", "settings"].includes(tab)) {
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
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysInMonth = currentMonthEnd.getDate()
    const daysPassed = now.getDate()
    
    // Guard against empty or undefined usageHistory
    if (!usageHistory || usageHistory.length === 0) {
      return {
        totalQuotes: 0,
        totalDownloads: 0,
        totalViews: 0,
        quotesByDay: {},
        averageQuotesPerDay: 0,
        currentMonth: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        daysInMonth,
        daysPassed
      }
    }
    
    const currentMonth = usageHistory.filter(item => {
      const itemDate = new Date(item.timestamp)
      return itemDate >= currentMonthStart && itemDate <= now
    })

    const quotesByDay = currentMonth.reduce((acc, item) => {
      const day = item.timestamp.toDateString()
      acc[day] = (acc[day] || 0) + (item.action === 'quote_generated' ? 1 : 0)
      return acc
    }, {} as Record<string, number>)

    const totalQuotes = currentMonth.filter(item => item.action === 'quote_generated').length
    const totalDownloads = currentMonth.filter(item => item.action === 'pdf_downloaded').length
    const totalViews = currentMonth.filter(item => item.action === 'report_viewed').length

    return {
      totalQuotes,
      totalDownloads, 
      totalViews,
      quotesByDay,
      averageQuotesPerDay: daysPassed > 0 ? totalQuotes / daysPassed : 0,
      currentMonth: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      daysInMonth,
      daysPassed
    }
  }

  const analytics = useMemo(() => getAnalytics(), [usageHistory])
  const now = new Date()

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
    // Set loading state immediately
    setLoadingQuoteId(quoteItem.id)
    
    try {
      // Refresh quota to ensure we have the latest data
      await refreshQuota()
      
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
      
      // Clear loading state after navigation
      setLoadingQuoteId(null)
    } catch (error) {
      console.error('Error viewing quote:', error)
      
      // Clear loading state on error
      setLoadingQuoteId(null)
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
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
            >
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
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
                {/* TEMPORARY: Changed from grid-cols-5 to grid-cols-3 - Plans and Overview tabs hidden */}
                <TabsList className="w-full grid grid-cols-3 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg h-auto">
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
                  {/* TEMPORARY: Plans/Billing tab hidden for promotional period
                  <TabsTrigger
                    value="plans"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Billing</span>
                    <span className="sm:hidden">Billing</span>
                  </TabsTrigger>
                  */}
                  <TabsTrigger
                    value="settings"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-2"
                  >
                    <span className="hidden sm:inline">Settings</span>
                    <span className="sm:hidden">Settings</span>
                  </TabsTrigger>
                </TabsList>

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
                                    <TableHead className="font-medium text-center w-16">Action</TableHead>
                                    <TableHead className="font-medium w-24">Date</TableHead>
                                    <TableHead className="font-medium w-32">Client</TableHead>
                                    {hasPremiumData && (
                                      <TableHead className="font-medium w-24 text-right">Premium</TableHead>
                                    )}
                                    <TableHead className="font-medium">Products</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentQuotes.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                      <TableCell className="text-center py-2">
                                        <Button
                                          onClick={() => handleViewQuote(item)}
                                          variant="outline"
                                          size="sm"
                                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-7 px-2 text-xs"
                                          disabled={loadingQuoteId === item.id}
                                        >
                                          {loadingQuoteId === item.id ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                                          ) : (
                                            <Eye className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </TableCell>
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
                      <CardTitle className="text-lg font-medium">Usage Analytics - {analytics.currentMonth}</CardTitle>
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
                            <p className="text-sm text-green-700">This Month</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <Download className="h-5 w-5 text-blue-600" />
                              <h4 className="font-medium text-blue-900">Downloads</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{analytics.totalDownloads}</p>
                            <p className="text-sm text-blue-700">This Month</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-5 w-5 text-purple-600" />
                              <h4 className="font-medium text-purple-900">Report Views</h4>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 mt-2">{analytics.totalViews}</p>
                            <p className="text-sm text-purple-700">This Month</p>
                          </div>
                        </div>

                        {/* Daily Average */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">Activity Summary</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600">Daily average this month:</span>
                              <span className="font-medium sm:ml-2">{analytics.averageQuotesPerDay.toFixed(1)} quotes</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-gray-600">Days elapsed:</span>
                              <span className="font-medium sm:ml-2">{analytics.daysPassed} of {analytics.daysInMonth} days</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:col-span-2">
                              <span className="text-gray-600">Most active day:</span>
                              <span className="font-medium sm:ml-2">
                                {Object.entries(analytics.quotesByDay).length > 0 
                                  ? new Date(Object.entries(analytics.quotesByDay).reduce((a, b) => 
                                      analytics.quotesByDay[a[0]] > analytics.quotesByDay[b[0]] ? a : b
                                    )[0]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                  : 'No activity yet'
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
                              <p className="text-xs text-gray-500">{analytics.totalQuotes} of {quotaLimit} quotes used</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{quotaLimit > 0 ? Math.round((analytics.totalQuotes / quotaLimit) * 100) : 0}% used</p>
                              <p className="text-xs text-gray-500">Resets on {new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <Progress
                            value={quotaLimit > 0 ? (analytics.totalQuotes / quotaLimit) * 100 : 0}
                            className="h-3"
                            indicatorClassName={quotaLimit - analytics.totalQuotes < 3 ? "bg-red-600" : analytics.totalQuotes / quotaLimit > 0.7 ? "bg-amber-500" : "bg-green-500"}
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
                          ) : quota?.subscription?.plan === 'free' && (quotaLimit - analytics.totalQuotes) < 3 ? (
                            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-100 to-pink-100 p-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-900 font-medium">
                                  Low quota: Only {quotaLimit - analytics.totalQuotes} {(quotaLimit - analytics.totalQuotes) === 1 ? 'quote' : 'quotes'} left this month
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

                {/* TEMPORARY: Billing/Plans tab content hidden for promotional period
                <TabsContent value="plans" className="space-y-6">
                  Current Plan Display
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

                  Upgrade Request History
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

                  Subscription Plans
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
                */}

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

                  {/* Account Actions */}
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Account Actions</CardTitle>
                      <CardDescription>Manage your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                          <div>
                            <h4 className="font-medium text-gray-900">Sign out of your account</h4>
                            <p className="text-sm text-gray-600 mt-1">You'll need to sign in again to access your profile and quotes</p>
                          </div>
                          <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </Button>
                        </div>
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