"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, CreditCard, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import AuthGuard from "@/components/auth/auth-guard"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { updateProfile } from "firebase/auth"
import { getInitials, formatMMK, formatDate } from "@/lib/user-utils"

// Types for quote history
type QuoteStatus = 'completed' | 'draft'

interface QuoteHistoryItem {
  id: string
  date: string
  clientName: string
  products: string[]
  premium: number
  status: QuoteStatus
}

// Sample quote history data - TODO: Replace with real data fetching
const SAMPLE_QUOTE_HISTORY: QuoteHistoryItem[] = [
  {
    id: "Q-1001",
    date: "2024-06-10",
    clientName: "John Smith",
    products: ["OHS Plan 3", "Term Life 100M"],
    premium: 1250000,
    status: "completed",
  },
  {
    id: "Q-1002",
    date: "2024-06-08",
    clientName: "Sarah Johnson",
    products: ["OHS Plan 5", "Universal Life 30L", "Cancer Rider"],
    premium: 2340000,
    status: "completed",
  },
  {
    id: "Q-1003",
    date: "2024-06-05",
    clientName: "Michael Wong",
    products: ["OHS Plan 2"],
    premium: 564000,
    status: "draft",
  },
  {
    id: "Q-1004",
    date: "2024-06-01",
    clientName: "Lisa Chen",
    products: ["OHS Plan 4", "Cancer Rider"],
    premium: 1196000,
    status: "completed",
  },
  {
    id: "Q-1005",
    date: "2024-05-28",
    clientName: "Robert Taylor",
    products: ["Universal Life 15L"],
    premium: 1429000,
    status: "completed",
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [totalQuota, setTotalQuota] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [quoteHistory, setQuoteHistory] = useState<QuoteHistoryItem[]>(SAMPLE_QUOTE_HISTORY)

  // Form state for profile editing
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    company: "",
    position: "",
  })

  useEffect(() => {
    if (user) {
      // Load user data and set form values
      setProfileForm({
        fullName: user.displayName || "",
        company: localStorage.getItem("userCompany") || "",
        position: localStorage.getItem("userPosition") || "",
      })

      // Get quota from localStorage or set default
      const storedQuotaUsed = Number.parseInt(localStorage.getItem("quotaUsed") || "0")
      const storedTotalQuota = Number.parseInt(localStorage.getItem("totalQuota") || "10")
      
      setQuotaUsed(storedQuotaUsed)
      setTotalQuota(storedTotalQuota)
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (user) {
        // Update Firebase user profile
        await updateProfile(user, {
          displayName: profileForm.fullName
        })

        // Update localStorage with additional profile data
        localStorage.setItem("userCompany", profileForm.company)
        localStorage.setItem("userPosition", profileForm.position)

        setProfileUpdateSuccess(true)
        setTimeout(() => setProfileUpdateSuccess(false), 5000)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseQuota = (amount: number) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newTotalQuota = totalQuota + amount
      setTotalQuota(newTotalQuota)
      localStorage.setItem("totalQuota", newTotalQuota.toString())

      setShowPurchaseSuccess(true)
      setTimeout(() => setShowPurchaseSuccess(false), 5000)

      setIsLoading(false)
    }, 1500)
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
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-3 sm:p-4 md:p-8">
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
          {showPurchaseSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Quota purchased successfully! Your new total is {totalQuota} quotes.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
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
                    <h3 className="text-base sm:text-lg font-medium">{user.displayName || "User"}</h3>
                    <p className="text-sm sm:text-base text-gray-500">{user.email}</p>
                    <Badge className="mt-2 bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 text-xs sm:text-sm">
                      Insurance Advisor
                    </Badge>
                  </div>

                  <Separator />

                  {/* Quota Information */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Quote Quota</h4>
                      <Badge
                        className={
                          quotaUsed >= totalQuota
                            ? "bg-red-100 text-red-600"
                            : quotaUsed / totalQuota > 0.7
                              ? "bg-amber-100 text-amber-600"
                              : "bg-green-100 text-green-600"
                        }
                      >
                        {totalQuota - quotaUsed} remaining
                      </Badge>
                    </div>
                    <Progress
                      value={(quotaUsed / totalQuota) * 100}
                      className="h-2"
                      indicatorClassName={
                        quotaUsed >= totalQuota
                          ? "bg-red-600"
                          : quotaUsed / totalQuota > 0.7
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }
                    />
                    <p className="text-sm text-gray-500">
                      You've used {quotaUsed} of {totalQuota} quotes this month
                    </p>
                  </div>

                  <Separator />

                  {/* Purchase More Quota */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Need More Quotes?</h4>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <Button
                        onClick={() => handlePurchaseQuota(5)}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
                        disabled={isLoading}
                      >
                        +5
                        <span className="hidden sm:inline ml-1">Quotes</span>
                      </Button>
                      <Button
                        onClick={() => handlePurchaseQuota(10)}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
                        disabled={isLoading}
                      >
                        +10
                        <span className="hidden sm:inline ml-1">Quotes</span>
                      </Button>
                      <Button
                        onClick={() => handlePurchaseQuota(20)}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
                        disabled={isLoading}
                      >
                        +20
                        <span className="hidden sm:inline ml-1">Quotes</span>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Contact admin for custom quota packages</p>
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
                          {user.metadata.creationTime ? 
                            new Date(user.metadata.creationTime).toLocaleDateString() : 
                            new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-500">Last login:</span>
                        <span className="ml-auto">
                          {user.metadata.lastSignInTime ? 
                            new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                            new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-500">Subscription:</span>
                        <span className="ml-auto">Free Tier</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs */}
            <div className="xl:col-span-2">
              <Tabs defaultValue="quotes" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg h-auto">
                  <TabsTrigger
                    value="quotes"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Quote History</span>
                    <span className="sm:hidden">Quotes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Profile Settings</span>
                    <span className="sm:hidden">Settings</span>
                  </TabsTrigger>
                </TabsList>

                {/* Quote History Tab */}
                <TabsContent value="quotes" className="space-y-6">
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Recent Quotes</CardTitle>
                      <CardDescription>View and manage your recent insurance quotes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-full px-4 sm:px-0">
                          <Table className="min-w-[600px]">
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-medium">Quote ID</TableHead>
                                <TableHead className="font-medium">Date</TableHead>
                                <TableHead className="font-medium">Client</TableHead>
                                <TableHead className="font-medium">Products</TableHead>
                                <TableHead className="font-medium">Premium</TableHead>
                                <TableHead className="font-medium">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {quoteHistory.map((quote) => (
                                <TableRow key={quote.id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{quote.id}</TableCell>
                                  <TableCell>{formatDate(quote.date)}</TableCell>
                                  <TableCell>{quote.clientName}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {quote.products.map((product, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="bg-gray-50 text-gray-700 text-xs"
                                        >
                                          {product}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatMMK(quote.premium)} MMK</TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        quote.status === "completed"
                                          ? "bg-green-100 text-green-600 hover:bg-green-100"
                                          : "bg-amber-100 text-amber-600 hover:bg-amber-100"
                                      }
                                    >
                                      {quote.status === "completed" ? "Completed" : "Draft"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {quoteHistory.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600">No quotes yet</h3>
                          <p className="text-gray-500 mt-1">You haven't created any insurance quotes yet.</p>
                          <Button
                            onClick={() => router.push("/")}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                          >
                            Create New Quote
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Quota Usage</CardTitle>
                      <CardDescription>Track your monthly quote usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Current Month Usage</p>
                            <p className="text-xs text-gray-500">
                              {quotaUsed} of {totalQuota} quotes used
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{Math.round((quotaUsed / totalQuota) * 100)}% used</p>
                            <p className="text-xs text-gray-500">
                              Resets on{" "}
                              {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Progress
                          value={(quotaUsed / totalQuota) * 100}
                          className="h-2"
                          indicatorClassName={
                            quotaUsed >= totalQuota
                              ? "bg-red-600"
                              : quotaUsed / totalQuota > 0.7
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }
                        />

                        {quotaUsed >= totalQuota && (
                          <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              You've reached your quota limit for this month. Purchase additional quotes to continue.
                            </AlertDescription>
                          </Alert>
                        )}

                        {quotaUsed / totalQuota > 0.7 && quotaUsed < totalQuota && (
                          <Alert className="mt-4 bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-sm text-amber-800">
                              You're approaching your quota limit. Consider purchasing additional quotes.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
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
                            <Input id="email" type="email" value={user.email || ""} autoComplete="email" className="pl-10 h-10 sm:h-11" disabled />
                          </div>
                          <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>


                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              value={profileForm.company}
                              onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                              autoComplete="organization"
                              className="h-10 sm:h-11"
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
                            />
                          </div>
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
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} AIA Insurance Advisor. All rights reserved.</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}