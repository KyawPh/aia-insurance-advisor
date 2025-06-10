"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import ClientDataStep from "@/components/client-data-step"
import ProductSelectionStep from "@/components/product-selection-step"
import ReportGenerationStep from "@/components/report-generation-step"
import type { ClientData, ProductSelections } from "@/types/insurance"
import Image from "next/image"

export default function AIAInsuranceAdvisor() {
  const [currentStep, setCurrentStep] = useState(1)
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    dateOfBirth: "",
    gender: "",
  })

  const [productSelections, setProductSelections] = useState<ProductSelections>({
    ohsPlans: [],
    universalLife: null,
    termLife: null,
    cancerRider: false, // Now optional - start unselected
  })

  const steps = [
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
  ]

  const handleNextStep = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with AIA Logo */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="flex justify-center items-center mb-4">
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-red-900 mb-2">Insurance Advisor</h1>
          <p className="text-sm sm:text-base text-gray-500">Professional Insurance Recommendation Tool</p>

          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -z-10 blur-3xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100 rounded-full -z-10 blur-3xl opacity-50"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            {steps.map((step) => (
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
            className="w-full h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600"
          />
        </div>

        {/* Step Content */}
        <Card className="mb-6 sm:mb-10 border-0 shadow-xl rounded-xl overflow-hidden bg-white backdrop-blur-sm bg-opacity-95">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-red-600 to-red-700 py-3 sm:py-4 px-4 sm:px-6">
              <h2 className="text-lg sm:text-xl font-light text-white flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-white bg-opacity-20 rounded-full mr-2 text-sm">
                  {currentStep}
                </span>
                {steps[currentStep - 1].title}
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
                />
              )}
              {currentStep === 3 && (
                <ReportGenerationStep
                  clientData={clientData}
                  productSelections={productSelections}
                  onPrevious={handlePreviousStep}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AIA Insurance Advisor</p>
        </div>
      </div>
    </div>
  )
}
