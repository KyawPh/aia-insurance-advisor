"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText } from "lucide-react"
import type { ClientData, ProductSelections, OHSPlanWithPremium } from "@/types/insurance"
import { calculateAge } from "@/utils/calculations"
import { formatMMK } from "@/utils/formatting"
import {
  getOHSPremium,
  getUniversalLifePremium,
  getTermLifePremium,
  getCancerRiderPremium,
} from "@/utils/premium-tables"
import { getOHSCoverage } from "@/data/ohs-premium-data"
import { shortTermEndowmentPlans } from "@/data/short-term-endowment-premium-data"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { motion } from "framer-motion"
import Image from "next/image"
import { clearSession, initializeSession } from "@/lib/session-storage"
import { useQuota } from "@/hooks/use-quota"

interface ReportGenerationStepProps {
  clientData: ClientData
  productSelections: ProductSelections
  onNewQuote?: () => void
}


export default function ReportGenerationStep({ clientData, productSelections, onNewQuote }: ReportGenerationStepProps) {
  const { trackActivity } = useQuota()
  const age = calculateAge(clientData.dateOfBirth)
  const insuranceAge = age + 1

  const handleNewQuote = () => {
    // Clear session and trigger parent new quote handler if provided
    clearSession()
    if (onNewQuote) {
      onNewQuote()
    } else {
      // Fallback: reload the page (but this should be handled by parent)
      window.location.reload()
    }
  }


  // Import OHS plan details from actual data
  const ohsPlansData = [1, 2, 3, 4, 5, 6, 7].map(planId => {
    const coverage = getOHSCoverage(planId)
    return {
      id: planId,
      name: `Plan ${planId}`,
      dailyLimit: coverage?.dailyLimit || 0,
      annualLimit: coverage?.annualLimit || 0,
      accidentalDeath: coverage?.accidentalDeath || 0
    }
  })

  // Calculate total premiums and get selected plans
  let totalPremium = 0
  let selectedOHSPlans: OHSPlanWithPremium[] = (productSelections.ohsPlans || [])
    .sort((a, b) => a - b) // Sort plans from smallest to largest
    .map((planId) => {
      const planData = ohsPlansData.find((p) => p.id === planId)
      const premium = getOHSPremium(planId, insuranceAge, clientData.gender)
      totalPremium += premium
      return { ...planData, premium, isDefault: false } as OHSPlanWithPremium
    })

  // If no OHS selected but other products are selected, show default Plan 1 for comparison
  const hasOtherProducts = productSelections.universalLife || productSelections.termLife || productSelections.cancerRider
  if (selectedOHSPlans.length === 0 && hasOtherProducts) {
    const defaultPlan = ohsPlansData.find((p) => p.id === 1) // Use Plan 1 as default
    const defaultPremium = 0 // Don't include in total since not selected
    selectedOHSPlans = [{ ...defaultPlan, premium: defaultPremium, isDefault: true } as OHSPlanWithPremium]
  }

  // Universal Life Premium
  let universalLifePremium = 0
  let universalLifeCoverage = ""
  if (productSelections.universalLife) {
    universalLifePremium = getUniversalLifePremium(
      productSelections.universalLife.planId,
      productSelections.universalLife.healthTier,
      insuranceAge,
      clientData.gender,
    )
    totalPremium += universalLifePremium
    // Get the actual sum assured amount for display
    const ulPlan = require("@/data/universal-life-premium-data").universalLifePlans.find(
      (plan: any) => plan.planId === productSelections.universalLife!.planId
    )
    universalLifeCoverage = ulPlan ? formatMMK(ulPlan.sumAssured) : ""
  }

  // Term Life Premium
  let termLifePremium = 0
  let termLifeCoverage = ""
  if (productSelections.termLife) {
    termLifePremium = getTermLifePremium(productSelections.termLife.planId, age, clientData.gender)
    totalPremium += termLifePremium
    // Get the actual coverage amount for display
    const termPlan = shortTermEndowmentPlans.find(plan => plan.id === productSelections.termLife!.planId)
    termLifeCoverage = termPlan ? formatMMK(termPlan.coverage) : ""
  }

  // Cancer Rider Premium
  let cancerRiderPremium = 0
  if (productSelections.cancerRider) {
    cancerRiderPremium = getCancerRiderPremium(age, clientData.gender)
    totalPremium += cancerRiderPremium
  }

  // Calculate combined premium for each column
  const getColumnPremium = (ohsPremium: number) => {
    return ohsPremium + universalLifePremium + termLifePremium + cancerRiderPremium
  }

  // Utility functions for download
  const createLoadingOverlay = () => {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
    `
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 300px; padding: 20px;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #dc2626; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <p id="loading-message" style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Generating PDF report...</p>
        ${isMobile ? '<p style="color: #6b7280; font-size: 14px; margin: 0;">This may take longer on mobile devices</p>' : ''}
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `
    document.body.appendChild(overlay)
    
    // Add timeout message for mobile
    if (isMobile) {
      setTimeout(() => {
        const messageEl = overlay.querySelector('#loading-message')
        if (messageEl && overlay.parentNode) {
          messageEl.textContent = 'Still working... Mobile processing takes time'
        }
      }, 5000)
    }
    
    return overlay
  }


  const handleDownloadReport = async () => {
    const overlay = createLoadingOverlay()
    
    try {
      await generatePDFReport()
      
      // Track PDF download activity for analytics
      await trackActivity('pdf_downloaded', {
        clientName: clientData.name,
        selectedProducts: [
          ...productSelections.ohsPlans.map(id => `OHS Plan ${id}`),
          ...(productSelections.universalLife ? [`Universal Life ${productSelections.universalLife.planId}`] : []),
          ...(productSelections.termLife ? [`Term Life ${productSelections.termLife.planId}`] : []),
          ...(productSelections.cancerRider ? ['Cancer Care'] : [])
        ]
      })
      
      if (overlay.parentNode) {
        document.body.removeChild(overlay)
      }
    } catch (error) {
      console.error("Error generating PDF report:", error)
      if (overlay.parentNode) {
        document.body.removeChild(overlay)
      }
      // Fallback to text download
      downloadTextReport()
    }
  }
  
  const generatePDFReport = async () => {
    try {
      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor: [number, number, number] = [220, 38, 38] // Red
    const grayColor: [number, number, number] = [107, 114, 128]
    const darkGray: [number, number, number] = [55, 65, 81]
    
    // Add AIA Header
    doc.setFontSize(24)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('AIA', 20, 25)
    
    doc.setFontSize(18)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.text('Insurance Recommendation Report', 45, 25)
    
    // Add line separator
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(20, 30, pageWidth - 20, 30)
    
    // Client Information
    doc.setFontSize(14)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.text('Client Information', 20, 45)
    
    doc.setFontSize(11)
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    let yPos = 55
    doc.text(`Name: ${clientData.name}`, 25, yPos)
    yPos += 7
    doc.text(`Date of Birth: ${clientData.dateOfBirth}`, 25, yPos)
    yPos += 7
    doc.text(`Age: ${age} years (Insurance Age: ${insuranceAge})`, 25, yPos)
    yPos += 7
    doc.text(`Gender: ${clientData.gender === 'male' ? 'Male' : 'Female'}`, 25, yPos)
    yPos += 15
    
    // Coverage Details Table
    doc.setFontSize(14)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.text('Coverage Details', 20, yPos)
    yPos += 10
    
    // Prepare table data
    const tableHeaders = ['Coverage Type', ...selectedOHSPlans.map(plan => 
      plan?.isDefault ? 'Default Plan' : `Plan ${plan?.id}`
    )]
    
    const tableData = []
    
    // Annual Hospitalization Coverage
    tableData.push([
      'Annual Hospitalization/Medical Coverage',
      ...selectedOHSPlans.map(plan => 
        plan?.isDefault ? '—' : formatMMK(plan?.annualLimit || 0)
      )
    ])
    
    // Life Time Coverage
    tableData.push([
      'Life Time Hospitalization/Medical Coverage',
      ...selectedOHSPlans.map(plan => 
        plan?.isDefault ? '—' : formatMMK((plan?.annualLimit || 0) * 10)
      )
    ])
    
    // Daily Room Fees
    tableData.push([
      'One Day Room Fees',
      ...selectedOHSPlans.map(plan => 
        plan?.isDefault ? '—' : formatMMK(plan?.dailyLimit || 0)
      )
    ])
    
    // Accidental Death Coverage
    tableData.push([
      'Accidental Death Coverage',
      ...selectedOHSPlans.map(plan => 
        plan?.isDefault ? '—' : formatMMK(plan?.accidentalDeath || 0)
      )
    ])
    
    // Death Coverage
    tableData.push([
      'Death Coverage',
      ...selectedOHSPlans.map(() => 
        universalLifeCoverage || termLifeCoverage || '—'
      )
    ])
    
    // Cancer Coverage
    tableData.push([
      'Cancer Coverage',
      ...selectedOHSPlans.map(() => 
        productSelections.cancerRider ? formatMMK(100000000) : '—'
      )
    ])
    
    // Premium Payments
    tableData.push([
      'Premium Payments (Annual)',
      ...selectedOHSPlans.map(plan => 
        plan?.isDefault ? '—' : `${formatMMK(getColumnPremium(plan?.premium || 0))}/year`
      )
    ])
    
    // Generate table using autoTable
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkGray
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto'
    })
    
    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 15
    
    // Professional Summary
    if (finalY < pageHeight - 60) {
      doc.setFontSize(14)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.text('Professional Recommendation', 20, finalY)
      
      doc.setFontSize(10)
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
      const summaryText = `This comprehensive insurance recommendation has been meticulously crafted for ${clientData.name}, taking into account their current age of ${age} years (insurance age: ${insuranceAge}) and gender profile. Our analysis ensures optimal coverage while maintaining competitive premium rates.

The selected coverage options provide comprehensive protection across medical, life, and specialized cancer coverage, delivering peace of mind and financial security for you and your loved ones.`
      
      const splitText = doc.splitTextToSize(summaryText, pageWidth - 40)
      doc.text(splitText, 20, finalY + 10)
    }
    
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, pageHeight - 20)
    doc.text('AIA Myanmar Insurance Advisory Services', pageWidth - 20, pageHeight - 20, { align: 'right' })
    
    // Save the PDF
    doc.save(`AIA_Insurance_Report_${clientData.name.replace(/\s+/g, "_")}.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw error // Re-throw to trigger fallback
    }
  }
  
  const downloadTextReport = () => {
    const reportContent = `
AIA INSURANCE RECOMMENDATION REPORT

Client Information:
- Name: ${clientData.name}
- Date of Birth: ${clientData.dateOfBirth}
- Age: ${age} (Insurance Age: ${insuranceAge})
- Gender: ${clientData.gender}

Selected Coverage:
${selectedOHSPlans.map((plan) => `- OHS Plan ${plan?.id}: ${formatMMK(plan?.premium || 0)}/year`).join("\n")}
${productSelections.universalLife ? `- Universal Life ${productSelections.universalLife.planId} (${productSelections.universalLife.healthTier}): ${formatMMK(universalLifePremium)}/year` : ""}
${productSelections.termLife ? `- Term Life ${productSelections.termLife.planId}: ${formatMMK(termLifePremium)}/year` : ""}
${productSelections.cancerRider ? `- Cancer Rider: ${formatMMK(cancerRiderPremium)}/year` : ""}

Total Annual Premium: ${formatMMK(totalPremium)}

Generated on: ${new Date().toLocaleDateString()}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `AIA_Insurance_Report_${clientData.name.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-0"
    >
      {selectedOHSPlans.length > 0 ? (
        <>
          {/* Report Header */}
          <div className="bg-white border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-24">
                  <Image
                    src="/logo.png"
                    alt="AIA Logo"
                    fill
                    style={{ objectFit: "contain" }}
                    className="drop-shadow-sm"
                  />
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-light text-gray-900">Insurance Recommendation Report</h1>
                  <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Client Information Bar */}
            <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Client:</span>
                  <span className="ml-2 font-medium text-gray-900">{clientData.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {age} years (Insurance Age: {insuranceAge})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {clientData.gender === "male" ? "Male" : "Female"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Recommendation Table */}
          <div id="insurance-report-table" className="bg-white">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
              <Table className="w-full border-collapse" style={{ minWidth: "600px" }}>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-red-600 to-red-700 border-0">
                    <TableHead className="font-semibold text-white border-r border-red-500 text-left text-sm min-w-[200px] py-4">
                      Coverage Details
                    </TableHead>
                    {selectedOHSPlans.map((plan) => (
                      <TableHead
                        key={plan?.id}
                        className="font-semibold text-white text-center border-r border-red-500 last:border-r-0 text-sm min-w-[120px] py-4"
                      >
                        {plan?.isDefault ? "Default Plan" : `Plan ${plan?.id}`}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Annual Hospitalization/Medical Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-4 text-sm bg-gray-50">
                      Annual Hospitalization/Medical Coverage
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`annual-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-4 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK(plan?.annualLimit || 0)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Life Time Hospitalization/Medical Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-4 text-sm bg-gray-50">
                      Life Time Hospitalization/Medical Coverage
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`lifetime-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-4 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK((plan?.annualLimit || 0) * 10)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* One Day Room Fees */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-4 text-sm bg-gray-50">
                      One Day Room Fees
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`daily-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-4 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK(plan?.dailyLimit || 0)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Accidental Death Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-4 text-sm bg-gray-50">
                      Accidental Death Coverage
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`accident-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-4 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK(plan?.accidentalDeath || 0)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Death Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-4 text-sm bg-gray-50">
                      Death Coverage
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`death-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-4 text-gray-900 text-sm"
                      >
                        {universalLifeCoverage || termLifeCoverage || "—"}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Cancer Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-4 text-sm bg-gray-50">
                      Cancer Coverage
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`cancer-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-4 text-gray-900 text-sm"
                      >
                        {productSelections.cancerRider ? formatMMK(100000000) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Premium Payments */}
                  <TableRow className="bg-gradient-to-r from-red-50 to-red-25 border-b-2 border-red-200">
                    <TableCell className="font-bold text-red-900 border-r border-red-200 py-4 text-sm">
                      Premium Payments (Annual)
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`premium-${plan?.id}`}
                        className="text-center font-bold text-red-700 border-r border-red-200 last:border-r-0 py-4 text-sm"
                      >
                        {plan?.isDefault ? "—" : `${formatMMK(getColumnPremium(plan?.premium || 0))}/year`}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white border-t border-gray-200 pt-8 mt-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Recommendation</h3>
                <div className="prose prose-sm text-gray-600 leading-relaxed">
                  <p>
                    This comprehensive insurance recommendation has been meticulously crafted for{" "}
                    <strong>{clientData.name}</strong>, taking into account their current age of {age} years (insurance
                    age: {insuranceAge}) and gender profile. Our analysis ensures optimal coverage while maintaining
                    competitive premium rates.
                  </p>
                  <p className="mt-3">
                    The selected coverage options provide comprehensive protection across medical, life, and specialized
                    cancer coverage, delivering peace of mind and financial security for you and your loved ones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
          <div className="text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No Plans Selected</p>
            <p className="text-sm text-gray-500 mt-2">Please select at least one OHS plan to generate the report.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-8 border-t border-gray-200">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleDownloadReport}
            variant="outline"
            className="w-full sm:w-auto px-6 h-11 sm:h-12 border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm sm:text-base shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </motion.div>
        <Button
          onClick={handleNewQuote}
          className="w-full sm:w-auto px-6 h-11 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg"
        >
          Create New Quote
        </Button>
      </div>
    </motion.div>
  )
}
