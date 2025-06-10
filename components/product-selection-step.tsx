"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ClientData, ProductSelections, OHSPlan, UniversalLifePlan, TermLifePlan } from "@/types/insurance"
import { calculateAge } from "@/utils/calculations"
import { formatMMK } from "@/utils/formatting"
import {
  getOHSPremium,
  getUniversalLifePremium,
  getTermLifePremium,
  getCancerRiderPremium,
} from "@/utils/premium-tables"
import { isUniversalLifeAgeCovered, getUniversalLifeAgeRange } from "@/data/universal-life-premium-data"
import { isShortTermEndowmentAgeCovered, getShortTermEndowmentAgeRange } from "@/data/short-term-endowment-premium-data"
import { isCancerCareAgeCovered, getCancerCareAgeRange } from "@/data/cancer-care-premium-data"
import { getOHSCoverage } from "@/data/ohs-premium-data"
import { universalLifePlans as realUniversalLifePlans } from "@/data/universal-life-premium-data"
import { shortTermEndowmentPlans } from "@/data/short-term-endowment-premium-data"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion } from "framer-motion"

interface ProductSelectionStepProps {
  clientData: ClientData
  productSelections: ProductSelections
  setProductSelections: (selections: ProductSelections) => void
  onNext: () => void
  onPrevious: () => void
}

export default function ProductSelectionStep({
  clientData,
  productSelections,
  setProductSelections,
  onNext,
  onPrevious,
}: ProductSelectionStepProps) {
  const [showMutualExclusionWarning, setShowMutualExclusionWarning] = useState(false)

  // All products now start unselected - no forced defaults

  const age = calculateAge(clientData.dateOfBirth)
  const insuranceAge = age + 1
  
  // Age validation for products using dynamic functions
  const isUniversalLifeAvailable = isUniversalLifeAgeCovered(insuranceAge)
  const isTermLifeAvailable = isShortTermEndowmentAgeCovered(insuranceAge) 
  const isCancerCareAvailable = isCancerCareAgeCovered(age) // Cancer Care uses real age, not insurance age
  
  // Get dynamic age ranges for error messages
  const ulAgeRange = getUniversalLifeAgeRange()
  const tlAgeRange = getShortTermEndowmentAgeRange()
  const ccAgeRange = getCancerCareAgeRange()

  const ohsPlans: OHSPlan[] = [1, 2, 3, 4, 5, 6, 7].map(planId => {
    const coverage = getOHSCoverage(planId)
    return {
      id: planId,
      name: `Plan ${planId}`,
      dailyLimit: coverage?.dailyLimit || 0,
      annualLimit: coverage?.annualLimit || 0,
      accidentalDeath: coverage?.accidentalDeath || 0
    }
  })

  // Use real Universal Life plans from data file
  const universalLifePlans = realUniversalLifePlans.map(plan => ({
    id: plan.planId,
    name: plan.name,
    sumAssured: plan.sumAssured,
    healthTiers: ["Minimum", "Default", "Maximum"]
  }))

  // Use real Term Life plans from data file
  const termLifePlans = shortTermEndowmentPlans

  const handleOHSSelection = (planId: number, checked: boolean) => {
    const currentPlans = productSelections.ohsPlans || []
    if (checked) {
      setProductSelections({
        ...productSelections,
        ohsPlans: [...currentPlans, planId],
      })
    } else {
      setProductSelections({
        ...productSelections,
        ohsPlans: currentPlans.filter((id) => id !== planId),
      })
    }
  }

  const handleUniversalLifeSelection = (planId: string, healthTier: string) => {
    // If empty planId, deselect universal life
    if (planId === "") {
      setProductSelections({
        ...productSelections,
        universalLife: null,
      })
      return
    }

    // Clear term life if universal life is selected
    if (productSelections.termLife) {
      setShowMutualExclusionWarning(true)
      setTimeout(() => setShowMutualExclusionWarning(false), 3000)
    }

    setProductSelections({
      ...productSelections,
      universalLife: { planId, healthTier },
      termLife: null,
    })
  }

  const handleTermLifeSelection = (planId: string) => {
    // If empty string, deselect term life
    if (planId === "") {
      setProductSelections({
        ...productSelections,
        termLife: null,
      })
      return
    }

    // Clear universal life if term life is selected
    if (productSelections.universalLife) {
      setShowMutualExclusionWarning(true)
      setTimeout(() => setShowMutualExclusionWarning(false), 3000)
    }

    setProductSelections({
      ...productSelections,
      termLife: { planId },
      universalLife: null,
    })
  }

  const handleCancerRiderToggle = (checked: boolean) => {
    setProductSelections({
      ...productSelections,
      cancerRider: checked,
    })
  }

  // Check if at least one product is selected
  const hasAnySelection = 
    productSelections.ohsPlans.length > 0 ||
    productSelections.universalLife !== null ||
    productSelections.termLife !== null ||
    productSelections.cancerRider

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 sm:space-y-10"
    >
      {showMutualExclusionWarning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <Alert className="border-red-100 bg-red-50 rounded-lg shadow-sm">
            <AlertDescription className="text-red-800 text-sm">
              Universal Life and Term Life Insurance are mutually exclusive. Previous selection has been cleared.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* One Health Solution */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">One Health Solution (OHS)</h3>
            <p className="text-xs sm:text-sm text-gray-500">All-in-one Protection for Every Medical Need!</p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 text-xs self-start sm:self-auto">
            Multiple Selection
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ohsPlans.map((plan) => {
            const premium = getOHSPremium(plan.id, insuranceAge, clientData.gender)
            const isSelected = productSelections.ohsPlans?.includes(plan.id)

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-red-200 bg-gradient-to-br from-red-50 to-white shadow-sm"
                    : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
                }`}
                onClick={() => handleOHSSelection(plan.id, !isSelected)}
              >
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleOHSSelection(plan.id, checked as boolean)}
                    className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label className="font-medium text-gray-900 text-sm sm:text-base">{plan.name}</Label>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>
                    <span className="text-gray-500">Daily Limit:</span> {formatMMK(plan.dailyLimit)}
                  </p>
                  <p>
                    <span className="text-gray-500">Annual Limit:</span> {formatMMK(plan.annualLimit)}
                  </p>
                  <p>
                    <span className="text-gray-500">Accidental Death:</span> {formatMMK(plan.accidentalDeath)}
                  </p>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <p className="font-medium text-red-600 text-xs sm:text-sm">Premium: {formatMMK(premium)}/year</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Life Insurance - Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Life Insurance Coverage</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Choose either Universal Life or Short Term Endowment (mutually exclusive)
            </p>
          </div>
        </div>

        {!isUniversalLifeAvailable && !isTermLifeAvailable ? (
          <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm sm:text-base text-center">
              Life Insurance products are not available for age {age}. Coverage available: Universal Life (age {ulAgeRange.minAge}-{ulAgeRange.maxAge - 1}) and Short Term Endowment (age {tlAgeRange.minAge}-{tlAgeRange.maxAge - 1}).
            </p>
          </div>
        ) : (
          <Tabs defaultValue="term" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger
              value="term"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Short Term Endowment</span>
              <span className="sm:hidden">Endowment</span>
            </TabsTrigger>
            <TabsTrigger
              value="universal"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Universal Life Insurance</span>
              <span className="sm:hidden">Universal Life</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="term" className="space-y-4 sm:space-y-6">
            <div className="mb-4">
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 text-xs">
                Single Selection
              </Badge>
            </div>
            <RadioGroup value={productSelections.termLife?.planId || ""} onValueChange={handleTermLifeSelection}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* None option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-3 p-4 sm:p-5 border rounded-xl hover:bg-gray-50 hover:border-red-200 transition-all"
                >
                  <RadioGroupItem value="" id="term-none" className="border-red-600 text-red-600" />
                  <Label htmlFor="term-none" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">None</p>
                      <p className="text-xs sm:text-sm text-gray-600">No Short Term Endowment</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">—</p>
                    </div>
                  </Label>
                </motion.div>
                {termLifePlans.map((plan) => {
                  const premium = getTermLifePremium(plan.id, age, clientData.gender)
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-3 p-4 sm:p-5 border rounded-xl hover:bg-gray-50 hover:border-red-200 transition-all"
                    >
                      <RadioGroupItem value={plan.id} id={plan.id} className="border-red-600 text-red-600" />
                      <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{plan.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Coverage: {formatMMK(plan.coverage)}</p>
                          <p className="text-xs sm:text-sm font-medium text-red-600">{formatMMK(premium)}/year</p>
                        </div>
                      </Label>
                    </motion.div>
                  )
                })}
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="universal" className="space-y-4 sm:space-y-6">
            <div className="mb-4">
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 text-xs">
                Single Selection
              </Badge>
            </div>
            
            {/* None option for Universal Life */}
            <div className="border rounded-xl p-4 sm:p-5 hover:border-red-200 hover:shadow-sm transition-all mb-4">
              <RadioGroup
                value={productSelections.universalLife ? "selected" : "none"}
                onValueChange={(value) => value === "none" ? handleUniversalLifeSelection("", "") : null}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value="none" id="universal-none" className="border-red-600 text-red-600" />
                  <Label htmlFor="universal-none" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">None</p>
                      <p className="text-xs sm:text-sm text-gray-600">No Universal Life Insurance</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">—</p>
                    </div>
                  </Label>
                </motion.div>
              </RadioGroup>
            </div>
            
            {universalLifePlans.map((plan) => (
              <div
                key={plan.id}
                className="border rounded-xl p-4 sm:p-5 hover:border-red-200 hover:shadow-sm transition-all"
              >
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  {plan.name} - Sum Assured: {formatMMK(plan.sumAssured)}
                </h4>
                <RadioGroup
                  value={
                    productSelections.universalLife?.planId === plan.id
                      ? productSelections.universalLife.healthTier
                      : ""
                  }
                  onValueChange={(value) => handleUniversalLifeSelection(plan.id, value)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {plan.healthTiers.map((tier) => {
                      const premium = getUniversalLifePremium(plan.id, tier, insuranceAge, clientData.gender)
                      return (
                        <motion.div
                          key={tier}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem
                            value={tier}
                            id={`${plan.id}-${tier}`}
                            className="border-red-600 text-red-600"
                          />
                          <Label htmlFor={`${plan.id}-${tier}`} className="flex-1 cursor-pointer">
                            <div>
                              <p className="text-gray-700 text-sm sm:text-base">{tier}</p>
                              <p className="text-xs sm:text-sm font-medium text-red-600">{formatMMK(premium)}/year</p>
                            </div>
                          </Label>
                        </motion.div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        )}
      </div>

      {/* Cancer Rider */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">AIA Cancer Care</h3>
            <p className="text-xs sm:text-sm text-gray-500">Protection to reduce the impact of cancer on your life</p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 text-xs self-start sm:self-auto">
            Optional Add-on
          </Badge>
        </div>

        {!isCancerCareAvailable ? (
          <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm sm:text-base text-center">
              Cancer Care is not available for age {age}. Coverage available for age {ccAgeRange.minAge}-{ccAgeRange.maxAge}.
            </p>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`flex items-center space-x-4 p-4 sm:p-5 border rounded-xl cursor-pointer transition-all ${
              productSelections.cancerRider
                ? "border-red-200 bg-gradient-to-br from-red-50 to-white shadow-sm"
                : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
            }`}
            onClick={() => handleCancerRiderToggle(!productSelections.cancerRider)}
          >
          <Checkbox
            checked={productSelections.cancerRider}
            onCheckedChange={handleCancerRiderToggle}
            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm sm:text-base">AIA Cancer Care Coverage</p>
            <p className="text-xs sm:text-sm text-gray-600">Coverage: {formatMMK(100000000)}</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs sm:text-sm font-medium text-red-600">
                Premium: {formatMMK(getCancerRiderPremium(age, clientData.gender))}/year
              </p>
            </div>
          </div>
        </motion.div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="w-full sm:w-auto px-6 h-11 sm:h-12 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm sm:text-base shadow-sm"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasAnySelection}
          className="w-full sm:w-auto px-6 h-11 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg disabled:shadow-none"
        >
          Generate Report
        </Button>
      </div>
    </motion.div>
  )
}
