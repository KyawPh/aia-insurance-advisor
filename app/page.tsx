"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"
import ClientDataStep from "@/components/client-data-step"
import ProductSelectionStep from "@/components/product-selection-step"
import ReportGenerationStep from "@/components/report-generation-step"
import AuthGuard from "@/components/auth/auth-guard"
import { QuotaGuard } from "@/components/quota-guard"
import { useAuth } from "@/contexts/auth-context"
import { useQuota } from "@/hooks/use-quota"
import { useRouter, useSearchParams } from "next/navigation"
import { getInitials } from "@/lib/user-utils"
import { 
  loadClientData,
  initializeSession, 
  hasClientData,
  clearSession
} from "@/lib/session-storage"
import type { ClientData, ProductSelections } from "@/types/insurance"

const STEPS = [
  {
    number: 1,
    title: "Client Data",
    description: "Basic information",
    shortTitle: "Data",
  },
  {
    number: 2,
    title: "Product Selection",
    description: "Insurance options",
    shortTitle: "Products",
  },
  {
    number: 3,
    title: "Report",
    description: "Final quote",
    shortTitle: "Report",
  },
] as const

function AIAInsuranceAdvisorContent() {
  const { user, logout } = useAuth()
  const { quota, consumeQuota, isLowQuota, quotaRemaining, quotaUsed, quotaLimit, loading: quotaLoading } = useQuota()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [clientDataLoaded, setClientDataLoaded] = useState(false)
  const [showDataRestored, setShowDataRestored] = useState(false)
  const [isNewQuote, setIsNewQuote] = useState(false)
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)
  const [isQuotaBadgeDismissed, setIsQuotaBadgeDismissed] = useState(false)

  // Reset badge dismissal when quota changes
  useEffect(() => {
    setIsQuotaBadgeDismissed(false)
  }, [quotaRemaining])
  
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    dateOfBirth: "",
    gender: ""
  })

  const [productSelections, setProductSelections] = useState<ProductSelections>({
    ohsPlans: [],
    universalLife: null,
    termLife: null,
    cancerRider: false, // Now optional - start unselected
  })

  // Check for new quote or view quote parameters
  useEffect(() => {
    const isNewQuoteFromUrl = searchParams.get('new') === 'true'
    const isViewQuoteFromUrl = searchParams.get('view') === 'true'
    const stepFromUrl = searchParams.get('step')
    
    if (isNewQuoteFromUrl) {
      setIsNewQuote(true)
      // Remove the parameter from URL
      router.replace('/')
    } else if (isViewQuoteFromUrl) {
      // Load quote data from session storage
      const viewQuoteData = sessionStorage.getItem('viewQuoteData')
      if (viewQuoteData) {
        try {
          const quoteData = JSON.parse(viewQuoteData)
          
          setClientData(quoteData.clientData)
          setProductSelections(quoteData.productSelections)
          setClientDataLoaded(true) // Mark as loaded to prevent overwrites
          
          // Set to step 3 (report page) if specified with a small delay
          if (stepFromUrl === '3') {
            setTimeout(() => {
              setCurrentStep(3)
            }, 100)
          }
          
          // Clear the session storage after loading
          sessionStorage.removeItem('viewQuoteData')
          
          // Remove the parameters from URL
          router.replace('/')
        } catch (error) {
          console.error('Error loading quote data:', error)
        }
      }
    }
  }, [searchParams, router])

  // Load client data if available
  useEffect(() => {
    if (user && !clientDataLoaded && !isNewQuote) {
      const savedClientData = loadClientData()
      
      if (savedClientData) {
        console.log('🔄 Restoring client data:', savedClientData)
        setClientData(savedClientData)
        setShowDataRestored(true)
        setTimeout(() => setShowDataRestored(false), 5000)
      }
      
      // Initialize session if needed
      if (!localStorage.getItem('aia_session_id')) {
        initializeSession()
      }
      
      setClientDataLoaded(true)
    } else if (user && !clientDataLoaded && isNewQuote) {
      console.log('🆕 Starting fresh session')
      clearSession()
      initializeSession()
      setClientDataLoaded(true)
      setIsNewQuote(false)
    }
  }, [user, clientDataLoaded, isNewQuote])

  const handleNextStep = async () => {
    if (currentStep === 2) {
      // Show loading state for quote generation
      setIsGeneratingQuote(true)
      
      try {
        // Consume quota when generating report (moving from step 2 to 3)
        const success = await consumeQuota('quote_generated', 1, {
          clientName: clientData.name,
          clientDateOfBirth: clientData.dateOfBirth,
          clientGender: clientData.gender,
          productSelections: productSelections,
          selectedProducts: [
            ...productSelections.ohsPlans.map(id => `OHS Plan ${id}`),
            ...(productSelections.universalLife ? [`Universal Life ${productSelections.universalLife.planId}`] : []),
            ...(productSelections.termLife ? [`Term Life ${productSelections.termLife.planId}`] : []),
            ...(productSelections.cancerRider ? ['Cancer Care'] : [])
          ]
        })
        
        if (!success) {
          // Quota consumption failed, don't proceed
          return
        }
      } finally {
        setIsGeneratingQuote(false)
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / 3) * 100

  const handleNewQuote = () => {
    console.log('🆕 Starting new quote...')
    
    // Set flag to prevent session restoration
    setIsNewQuote(true)
    
    // Clear session and start fresh
    clearSession()
    setCurrentStep(1)
    setClientData({ name: "", dateOfBirth: "", gender: "" })
    setProductSelections({ ohsPlans: [], universalLife: null, termLife: null, cancerRider: false })
    
    // Reset client data loaded state
    setClientDataLoaded(false)
    setShowDataRestored(false)
    
    // Initialize new session after a brief delay to ensure cleanup
    setTimeout(() => {
      initializeSession()
      setClientDataLoaded(true)
      setIsNewQuote(false)
      console.log('🆕 New quote session initialized')
    }, 200)
  }

  const handleLogout = async () => {
    try {
      // Clear session on logout
      clearSession()
      await logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
      alert("Failed to logout. Please try again.")
    }
  }



  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-3 sm:p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header - Clean and Minimal */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-red-900 mb-2">Insurance Advisor</h1>
            <p className="text-sm sm:text-base text-gray-500">Professional Insurance Recommendation Tool</p>
          </div>

          {/* Data Loading Indicator */}
          {user && !clientDataLoaded && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 py-3 px-4 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span>Loading...</span>
              </div>
            </div>
          )}

          {/* Data Restored Notification */}
          {showDataRestored && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-green-700 bg-green-50 py-3 px-4 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Previous data restored!</span>
              </div>
            </div>
          )}


          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -z-10 blur-3xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100 rounded-full -z-10 blur-3xl opacity-50"></div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {step.number}
                </div>
                <div className="text-center mt-2">
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      currentStep >= step.number ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.shortTitle}</span>
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Progress
            value={progress}
            className="w-full h-1.5"
            indicatorClassName="bg-gradient-to-r from-red-500 to-red-600"
          />
        </div>

        {/* Step Content */}
        <QuotaGuard action="quote_generated" requiredQuota={currentStep === 2 ? 1 : 0}>
          <Card className="mb-6 sm:mb-10 border-0 shadow-xl rounded-xl overflow-hidden bg-white backdrop-blur-sm bg-opacity-95">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-red-600 to-red-700 py-3 sm:py-4 px-4 sm:px-6">
                <h2 className="text-lg sm:text-xl font-light text-white flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-white bg-opacity-20 rounded-full mr-2 text-sm">
                    {currentStep}
                  </span>
                  {STEPS[currentStep - 1].title}
                </h2>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                {currentStep === 1 && (
                  <ClientDataStep clientData={clientData} setClientData={setClientData} onNext={handleNextStep} />
                )}
                {currentStep === 2 && (
                  <ProductSelectionStep
                    clientData={clientData}
                    productSelections={productSelections}
                    setProductSelections={setProductSelections}
                    onNext={handleNextStep}
                    onPrevious={handlePreviousStep}
                    isGeneratingQuote={isGeneratingQuote}
                  />
                )}
                {currentStep === 3 && (
                  <ReportGenerationStep
                    clientData={clientData}
                    productSelections={productSelections}
                    onNewQuote={handleNewQuote}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </QuotaGuard>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AIA Insurance Advisor</p>
        </div>
      </div>

      {/* Floating Profile Widget - Bottom Left Corner */}
      {user && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center">
            {/* Profile Avatar with Badge */}
            <div className="relative">
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full 
                             bg-gradient-to-r from-red-600 to-red-700 
                             hover:from-red-700 hover:to-red-800 
                             border border-red-600 
                             shadow-md hover:shadow-lg 
                             backdrop-blur-sm z-20 
                             transition-all duration-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-medium">
                      {getInitials(user.displayName || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mb-2 ml-2" align="start" side="top">
                <div className="flex flex-col space-y-1 p-3">
                  <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500">Plan:</span>
                      <span className="font-medium text-gray-700 capitalize">{quota?.plan || 'Free'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Quota:</span>
                      <span className={`font-medium ${isLowQuota ? 'text-red-600' : 'text-gray-700'}`}>
                        {quotaRemaining}/{quotaLimit}
                      </span>
                    </div>
                    {quota?.subscription?.isInGracePeriod && (
                      <div className="mt-1 text-xs text-gray-400">
                        Daily quota resets at midnight
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile?tab=settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Next.js style quota warning badge - seamlessly blending with avatar */}
            {!quotaLoading && isLowQuota && quotaRemaining > 0 && !isQuotaBadgeDismissed && (
              <div 
                onClick={() => setIsQuotaBadgeDismissed(true)}
                className="absolute left-7 top-1/2 transform -translate-y-1/2 
                           bg-gradient-to-r from-red-600 to-red-700 
                           hover:from-red-700 hover:to-red-800 
                           text-white 
                           pl-5 pr-3 h-8 
                           rounded-l-none rounded-r-md 
                           border border-red-600 border-l-0 
                           shadow-md z-10 
                           flex items-center text-xs font-medium whitespace-nowrap 
                           cursor-pointer transition-colors"
              >
                <span>{quotaRemaining} {quotaRemaining === 1 ? 'Quote' : 'Quotes'} Left</span>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  )
}

export default function AIAInsuranceAdvisor() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-r from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AIAInsuranceAdvisorContent />
    </Suspense>
  )
}
