"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { ClientData } from "@/types/insurance"
import { calculateAge, formatDateInput } from "@/utils/calculations"
import { saveClientData } from "@/lib/session-storage"
import { motion } from "framer-motion"

interface ClientDataStepProps {
  clientData: ClientData
  setClientData: (data: ClientData) => void
  onNext: () => void
}

export default function ClientDataStep({ clientData, setClientData, onNext }: ClientDataStepProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [ageInputMethod, setAgeInputMethod] = useState<"dob" | "age">("dob")
  const [ageInput, setAgeInput] = useState("")

  const handleDateChange = (value: string) => {
    const formatted = formatDateInput(value)
    setClientData({ ...clientData, dateOfBirth: formatted })

    // Clear age input when DOB is entered
    if (formatted && ageInput) {
      setAgeInput("")
    }
  }

  const handleAgeChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "")
    if (numericValue && Number.parseInt(numericValue) > 0 && Number.parseInt(numericValue) <= 100) {
      setAgeInput(numericValue)

      // Calculate approximate DOB based on age
      const currentYear = new Date().getFullYear()
      const birthYear = currentYear - Number.parseInt(numericValue)
      const approximateDOB = `01/01/${birthYear}`
      setClientData({ ...clientData, dateOfBirth: approximateDOB })
    } else if (numericValue === "") {
      setAgeInput("")
      setClientData({ ...clientData, dateOfBirth: "" })
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []

    if (!clientData.name.trim()) newErrors.push("Client name is required")
    if (!clientData.dateOfBirth) newErrors.push("Date of birth or age is required")
    if (!clientData.gender) newErrors.push("Gender is required")

    // Validate date format only if using DOB method
    if (ageInputMethod === "dob" && clientData.dateOfBirth && !clientData.dateOfBirth.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      newErrors.push("Date of birth must be in DD/MM/YYYY format")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Save client data only when moving to next step
      saveClientData(clientData)
      onNext()
    }
  }

  const age = clientData.dateOfBirth ? calculateAge(clientData.dateOfBirth) : null
  const insuranceAge = age ? age + 1 : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 sm:space-y-8"
    >
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-[1px]"
        >
          <div className="relative bg-white rounded-xl p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl" />
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Please fix the following errors:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-8 flex flex-col items-center">
        {/* Client Name Row */}
        <div className="space-y-3 w-full sm:w-2/3">
          <Label htmlFor="name" className="text-gray-700 font-normal text-sm sm:text-base block text-left">
            Client Name *
          </Label>
          <Input
            id="name"
            value={clientData.name}
            onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
            placeholder="Enter client's full name"
            autoComplete="name"
            tabIndex={1}
            className="h-11 sm:h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-lg text-sm sm:text-base w-full shadow-sm transition-all"
          />
        </div>

        {/* Gender Row */}
        <div className="space-y-3 w-full sm:w-2/3">
          <Label className="text-gray-700 font-normal text-sm sm:text-base block text-left">Gender *</Label>
          <RadioGroup
            value={clientData.gender}
            onValueChange={(value) => setClientData({ ...clientData, gender: value })}
            className="flex flex-row gap-12"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" tabIndex={2} className="border-red-600 text-red-600" />
              <Label htmlFor="male" className="text-sm sm:text-base cursor-pointer">
                Male
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" tabIndex={3} className="border-red-600 text-red-600" />
              <Label htmlFor="female" className="text-sm sm:text-base cursor-pointer">
                Female
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Age Information Row */}
        <div className="space-y-3 w-full sm:w-2/3">
          <Label className="text-gray-700 font-normal text-sm sm:text-base block text-left">Age Information *</Label>

          <Tabs
            value={ageInputMethod}
            onValueChange={(value) => setAgeInputMethod(value as "dob" | "age")}
            className="w-full"
            activationMode="manual"
          >
            <TabsList className="grid w-full max-w-xs grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg h-auto">
              <TabsTrigger
                value="dob"
                tabIndex={4}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
              >
                Date of Birth
              </TabsTrigger>
              <TabsTrigger
                value="age"
                tabIndex={5}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
              >
                Age Only
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <TabsContent value="dob" className="mt-0">
                <Input
                  id="dateOfBirth"
                  value={clientData.dateOfBirth}
                  onChange={(e) => handleDateChange(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  autoComplete="bday"
                  tabIndex={6}
                  className="h-11 sm:h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-lg text-sm sm:text-base w-full shadow-sm transition-all"
                />
              </TabsContent>

              <TabsContent value="age" className="mt-0">
                <Input
                  id="ageInput"
                  value={ageInput}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  placeholder="Enter age (e.g., 35)"
                  maxLength={3}
                  autoComplete="off"
                  tabIndex={6}
                  className="h-11 sm:h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-lg text-sm sm:text-base w-full shadow-sm transition-all"
                />
              </TabsContent>

              {insuranceAge && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100 shadow-sm"
                >
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    <span className="block">
                      Current Age: <span className="font-medium text-red-700">{age} years</span>
                    </span>
                    <span className="block">
                      Insurance Age: <span className="font-medium text-red-700">{insuranceAge} years</span>
                    </span>
                  </p>
                </motion.div>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleNext}
          tabIndex={7}
          className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-normal rounded-lg transition-all text-sm sm:text-base shadow-md hover:shadow-lg"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
}
