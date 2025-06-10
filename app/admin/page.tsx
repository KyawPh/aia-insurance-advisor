"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Save, Edit, ChevronDown, ChevronUp, Plus, Trash } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AuthGuard from "@/components/auth/auth-guard"

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
}: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; itemsPerPage: number }) => {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-500">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)} of {totalPages * itemsPerPage} entries
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`h-8 w-8 p-0 ${page === currentPage ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("ohs")
  const [searchTerm, setSearchTerm] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("ohs-plans")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Sample data for OHS plans
  const ohsPlans = [
    { id: 1, name: "Plan 1", dailyLimit: 23000, annualLimit: 3750000, accidentalDeath: 1000000 },
    { id: 2, name: "Plan 2", dailyLimit: 38000, annualLimit: 7500000, accidentalDeath: 2000000 },
    { id: 3, name: "Plan 3", dailyLimit: 53000, annualLimit: 15000000, accidentalDeath: 3000000 },
    { id: 4, name: "Plan 4", dailyLimit: 75000, annualLimit: 30000000, accidentalDeath: 4000000 },
    { id: 5, name: "Plan 5", dailyLimit: 150000, annualLimit: 45000000, accidentalDeath: 5000000 },
    { id: 6, name: "Plan 6", dailyLimit: 300000, annualLimit: 75000000, accidentalDeath: 6000000 },
    { id: 7, name: "Plan 7", dailyLimit: 525000, annualLimit: 120000000, accidentalDeath: 7000000 },
  ]

  // Sample data for OHS premiums (first few rows)
  const ohsPremiumsFemale = [
    {
      ageGroup: "0",
      plan1: 332000,
      plan2: 564000,
      plan3: 763000,
      plan4: 1128000,
      plan5: 1641000,
      plan6: 2735000,
      plan7: 4310000,
    },
    {
      ageGroup: "1",
      plan1: 288000,
      plan2: 490000,
      plan3: 663000,
      plan4: 980000,
      plan5: 1426000,
      plan6: 2376000,
      plan7: 3744000,
    },
    {
      ageGroup: "2",
      plan1: 222000,
      plan2: 378000,
      plan3: 511000,
      plan4: 755000,
      plan5: 1099000,
      plan6: 1832000,
      plan7: 2886000,
    },
    {
      ageGroup: "3",
      plan1: 194000,
      plan2: 329000,
      plan3: 446000,
      plan4: 658000,
      plan5: 958000,
      plan6: 1597000,
      plan7: 2516000,
    },
    {
      ageGroup: "4-5",
      plan1: 155000,
      plan2: 263000,
      plan3: 356000,
      plan4: 526000,
      plan5: 765000,
      plan6: 1275000,
      plan7: 2009000,
    },
  ]

  const ohsPremiumsMale = [
    {
      ageGroup: "0",
      plan1: 389000,
      plan2: 661000,
      plan3: 894000,
      plan4: 1321000,
      plan5: 1924000,
      plan6: 3206000,
      plan7: 5051000,
    },
    {
      ageGroup: "1",
      plan1: 324000,
      plan2: 551000,
      plan3: 746000,
      plan4: 1102000,
      plan5: 1604000,
      plan6: 2673000,
      plan7: 4212000,
    },
    {
      ageGroup: "2",
      plan1: 257000,
      plan2: 437000,
      plan3: 590000,
      plan4: 873000,
      plan5: 1270000,
      plan6: 2117000,
      plan7: 3335000,
    },
    {
      ageGroup: "3",
      plan1: 224000,
      plan2: 380000,
      plan3: 515000,
      plan4: 760000,
      plan5: 1107000,
      plan6: 1844000,
      plan7: 2906000,
    },
    {
      ageGroup: "4-5",
      plan1: 146000,
      plan2: 248000,
      plan3: 335000,
      plan4: 495000,
      plan5: 721000,
      plan6: 1201000,
      plan7: 1892000,
    },
  ]

  // Sample data for Cancer Rider premiums (first few rows)
  const cancerRiderPremiumsFemale = [
    { age: 1, premium: 48000 },
    { age: 2, premium: 55000 },
    { age: 3, premium: 61000 },
    { age: 4, premium: 68000 },
    { age: 5, premium: 74000 },
  ]

  const cancerRiderPremiumsMale = [
    { age: 1, premium: 98000 },
    { age: 2, premium: 93000 },
    { age: 3, premium: 88000 },
    { age: 4, premium: 83000 },
    { age: 5, premium: 80000 },
  ]

  // Sample data for Term Life premiums (first few rows)
  const termLifePremiumsFemale = [
    {
      age: 17,
      coverage10M: 31700,
      coverage50M: 158500,
      coverage100M: 317000,
      coverage150M: 475500,
      coverage200M: 634000,
    },
    {
      age: 18,
      coverage10M: 32000,
      coverage50M: 160000,
      coverage100M: 320000,
      coverage150M: 480000,
      coverage200M: 640000,
    },
    {
      age: 19,
      coverage10M: 32200,
      coverage50M: 161000,
      coverage100M: 322000,
      coverage150M: 483000,
      coverage200M: 644000,
    },
    {
      age: 20,
      coverage10M: 32400,
      coverage50M: 162000,
      coverage100M: 324000,
      coverage150M: 486000,
      coverage200M: 648000,
    },
    {
      age: 21,
      coverage10M: 33300,
      coverage50M: 166500,
      coverage100M: 333000,
      coverage150M: 499500,
      coverage200M: 666000,
    },
  ]

  const termLifePremiumsMale = [
    {
      age: 17,
      coverage10M: 36900,
      coverage50M: 184500,
      coverage100M: 369000,
      coverage150M: 553500,
      coverage200M: 738000,
    },
    {
      age: 18,
      coverage10M: 37100,
      coverage50M: 185500,
      coverage100M: 371000,
      coverage150M: 556500,
      coverage200M: 742000,
    },
    {
      age: 19,
      coverage10M: 37300,
      coverage50M: 186500,
      coverage100M: 373000,
      coverage150M: 559500,
      coverage200M: 746000,
    },
    {
      age: 20,
      coverage10M: 37500,
      coverage50M: 187500,
      coverage100M: 375000,
      coverage150M: 562500,
      coverage200M: 750000,
    },
    {
      age: 21,
      coverage10M: 38700,
      coverage50M: 193500,
      coverage100M: 387000,
      coverage150M: 580500,
      coverage200M: 774000,
    },
  ]

  // Sample data for Universal Life premiums (first few rows)
  const universalLifePremiums = [
    {
      id: "1000L",
      name: "10L",
      premiums: [
        { ageGroup: "0-19", minimum: 667000, default: 1334000, maximum: 1666000 },
        { ageGroup: "20-24", minimum: 715000, default: 1429000, maximum: 1818000 },
        { ageGroup: "25-29", minimum: 770000, default: 1429000, maximum: 1818000 },
      ],
    },
    {
      id: "1500L",
      name: "15L",
      premiums: [
        { ageGroup: "0-19", minimum: 1005000, default: 2001000, maximum: 2499000 },
        { ageGroup: "20-24", minimum: 1072000, default: 2144000, maximum: 2727000 },
        { ageGroup: "25-29", minimum: 1155000, default: 2144000, maximum: 2727000 },
      ],
    },
  ]

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  const formatMMK = (amount: number): string => {
    return new Intl.NumberFormat("en-US").format(amount)
  }

  const getPaginatedData = (data: any[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSaveChanges = () => {
    // In a real application, this would save changes to a database
    setEditMode(false)
    alert("Changes saved successfully!")
  }

  return (
    <AuthGuard requireAuth={true} adminOnly={true}>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with AIA Logo */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative h-12 w-24">
              <Image
                src="/aia-logo.png"
                alt="AIA Logo"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-sm"
              />
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-light text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage insurance products and premium tables</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {editMode ? (
              <Button
                onClick={handleSaveChanges}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Products
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border-gray-200 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger
              value="ohs"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-sm py-2"
            >
              OHS Plans
            </TabsTrigger>
            <TabsTrigger
              value="cancer"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-sm py-2"
            >
              Cancer Rider
            </TabsTrigger>
            <TabsTrigger
              value="term"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-sm py-2"
            >
              Term Life
            </TabsTrigger>
            <TabsTrigger
              value="universal"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-sm py-2"
            >
              Universal Life
            </TabsTrigger>
          </TabsList>

          {/* OHS Plans Tab */}
          <TabsContent value="ohs" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* OHS Plans Configuration */}
              <Card className="shadow-md">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("ohs-plans")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    OHS Plans Configuration
                    <Badge className="ml-3 bg-red-100 text-red-600 hover:bg-red-100 border-0">
                      {ohsPlans.length} Plans
                    </Badge>
                  </CardTitle>
                  {expandedSection === "ohs-plans" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "ohs-plans" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Plan ID</TableHead>
                            <TableHead className="font-semibold">Plan Name</TableHead>
                            <TableHead className="font-semibold">Daily Limit (MMK)</TableHead>
                            <TableHead className="font-semibold">Annual Limit (MMK)</TableHead>
                            <TableHead className="font-semibold">Accidental Death (MMK)</TableHead>
                            {editMode && <TableHead className="font-semibold">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ohsPlans.map((plan) => (
                            <TableRow key={plan.id} className="hover:bg-gray-50">
                              <TableCell>{plan.id}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input defaultValue={plan.name} className="w-full max-w-[150px] h-8 text-sm" />
                                ) : (
                                  plan.name
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={plan.dailyLimit.toString()}
                                    className="w-full max-w-[150px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(plan.dailyLimit)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={plan.annualLimit.toString()}
                                    className="w-full max-w-[150px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(plan.annualLimit)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={plan.accidentalDeath.toString()}
                                    className="w-full max-w-[150px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(plan.accidentalDeath)
                                )}
                              </TableCell>
                              {editMode && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Plan
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* OHS Premium Table - Female */}
              <Card className="shadow-md mt-6">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("ohs-premiums-female")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    OHS Premium Table - Female
                    <Badge className="ml-3 bg-pink-100 text-pink-600 hover:bg-pink-100 border-0">Female</Badge>
                  </CardTitle>
                  {expandedSection === "ohs-premiums-female" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "ohs-premiums-female" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Age Group</TableHead>
                            <TableHead className="font-semibold">Plan 1 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 2 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 3 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 4 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 5 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 6 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 7 (MMK)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(ohsPremiumsFemale, currentPage, itemsPerPage).map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{row.ageGroup}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan1.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan1)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan2.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan2)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan3.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan3)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan4.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan4)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan5.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan5)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan6.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan6)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan7.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan7)
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={8}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Age Group
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(ohsPremiumsFemale.length, itemsPerPage)}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </CardContent>
                )}
              </Card>

              {/* OHS Premium Table - Male */}
              <Card className="shadow-md mt-6">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("ohs-premiums-male")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    OHS Premium Table - Male
                    <Badge className="ml-3 bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">Male</Badge>
                  </CardTitle>
                  {expandedSection === "ohs-premiums-male" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "ohs-premiums-male" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Age Group</TableHead>
                            <TableHead className="font-semibold">Plan 1 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 2 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 3 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 4 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 5 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 6 (MMK)</TableHead>
                            <TableHead className="font-semibold">Plan 7 (MMK)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(ohsPremiumsMale, currentPage, itemsPerPage).map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{row.ageGroup}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan1.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan1)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan2.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan2)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan3.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan3)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan4.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan4)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan5.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan5)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan6.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan6)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.plan7.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.plan7)
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={8}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Age Group
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(ohsPremiumsMale.length, itemsPerPage)}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* Cancer Rider Tab */}
          <TabsContent value="cancer" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Cancer Rider Premium Table - Female */}
              <Card className="shadow-md">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("cancer-premiums-female")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    Cancer Rider Premium Table - Female
                    <Badge className="ml-3 bg-pink-100 text-pink-600 hover:bg-pink-100 border-0">Female</Badge>
                  </CardTitle>
                  {expandedSection === "cancer-premiums-female" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "cancer-premiums-female" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Age</TableHead>
                            <TableHead className="font-semibold">Premium (MMK)</TableHead>
                            {editMode && <TableHead className="font-semibold">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(cancerRiderPremiumsFemale, currentPage, itemsPerPage).map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{row.age}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.premium.toString()}
                                    className="w-full max-w-[150px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.premium)
                                )}
                              </TableCell>
                              {editMode && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={3}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Age
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(cancerRiderPremiumsFemale.length, itemsPerPage)}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Cancer Rider Premium Table - Male */}
              <Card className="shadow-md mt-6">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("cancer-premiums-male")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    Cancer Rider Premium Table - Male
                    <Badge className="ml-3 bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">Male</Badge>
                  </CardTitle>
                  {expandedSection === "cancer-premiums-male" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "cancer-premiums-male" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Age</TableHead>
                            <TableHead className="font-semibold">Premium (MMK)</TableHead>
                            {editMode && <TableHead className="font-semibold">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(cancerRiderPremiumsMale, currentPage, itemsPerPage).map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{row.age}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.premium.toString()}
                                    className="w-full max-w-[150px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.premium)
                                )}
                              </TableCell>
                              {editMode && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={3}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Age
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(cancerRiderPremiumsMale.length, itemsPerPage)}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* Term Life Tab */}
          <TabsContent value="term" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Term Life Premium Table - Female */}
              <Card className="shadow-md">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("term-premiums-female")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    Term Life Premium Table - Female
                    <Badge className="ml-3 bg-pink-100 text-pink-600 hover:bg-pink-100 border-0">Female</Badge>
                  </CardTitle>
                  {expandedSection === "term-premiums-female" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "term-premiums-female" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Age</TableHead>
                            <TableHead className="font-semibold">10M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">50M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">100M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">150M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">200M Coverage (MMK)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(termLifePremiumsFemale, currentPage, itemsPerPage).map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{row.age}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage10M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage10M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage50M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage50M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage100M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage100M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage150M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage150M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage200M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage200M)
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Age
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(termLifePremiumsFemale.length, itemsPerPage)}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Term Life Premium Table - Male */}
              <Card className="shadow-md mt-6">
                <CardHeader
                  className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection("term-premiums-male")}
                >
                  <CardTitle className="text-lg font-medium flex items-center">
                    Term Life Premium Table - Male
                    <Badge className="ml-3 bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">Male</Badge>
                  </CardTitle>
                  {expandedSection === "term-premiums-male" ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSection === "term-premiums-male" && (
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-semibold">Age</TableHead>
                            <TableHead className="font-semibold">10M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">50M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">100M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">150M Coverage (MMK)</TableHead>
                            <TableHead className="font-semibold">200M Coverage (MMK)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(termLifePremiumsMale, currentPage, itemsPerPage).map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{row.age}</TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage10M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage10M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage50M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage50M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage100M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage100M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage150M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage150M)
                                )}
                              </TableCell>
                              <TableCell>
                                {editMode ? (
                                  <Input
                                    defaultValue={row.coverage200M.toString()}
                                    className="w-full max-w-[120px] h-8 text-sm"
                                  />
                                ) : (
                                  formatMMK(row.coverage200M)
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {editMode && (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add New Age
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(termLifePremiumsMale.length, itemsPerPage)}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* Universal Life Tab */}
          <TabsContent value="universal" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {universalLifePremiums.map((plan) => (
                <Card key={plan.id} className="shadow-md mb-6">
                  <CardHeader
                    className="bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                    onClick={() => toggleSection(`universal-${plan.id}`)}
                  >
                    <CardTitle className="text-lg font-medium flex items-center">
                      Universal Life - {plan.name}
                      <Badge className="ml-3 bg-purple-100 text-purple-600 hover:bg-purple-100 border-0">
                        {plan.id}
                      </Badge>
                    </CardTitle>
                    {expandedSection === `universal-${plan.id}` ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </CardHeader>
                  {expandedSection === `universal-${plan.id}` && (
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead className="font-semibold">Age Group</TableHead>
                              <TableHead className="font-semibold">Minimum (MMK)</TableHead>
                              <TableHead className="font-semibold">Default (MMK)</TableHead>
                              <TableHead className="font-semibold">Maximum (MMK)</TableHead>
                              {editMode && <TableHead className="font-semibold">Actions</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {plan.premiums.map((premium, index) => (
                              <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell>{premium.ageGroup}</TableCell>
                                <TableCell>
                                  {editMode ? (
                                    <Input
                                      defaultValue={premium.minimum.toString()}
                                      className="w-full max-w-[150px] h-8 text-sm"
                                    />
                                  ) : (
                                    formatMMK(premium.minimum)
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editMode ? (
                                    <Input
                                      defaultValue={premium.default.toString()}
                                      className="w-full max-w-[150px] h-8 text-sm"
                                    />
                                  ) : (
                                    formatMMK(premium.default)
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editMode ? (
                                    <Input
                                      defaultValue={premium.maximum.toString()}
                                      className="w-full max-w-[150px] h-8 text-sm"
                                    />
                                  ) : (
                                    formatMMK(premium.maximum)
                                  )}
                                </TableCell>
                                {editMode && (
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                            {editMode && (
                              <TableRow>
                                <TableCell colSpan={5}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add New Age Group
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={getTotalPages(plan.premiums.length, itemsPerPage)}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
              {editMode && (
                <Button
                  variant="outline"
                  className="w-full py-3 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New Universal Life Plan
                </Button>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}
