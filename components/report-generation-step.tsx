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
import html2canvas from "html2canvas"
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
      // Try to use html2canvas for better Myanmar text support
      const reportElement = document.getElementById('insurance-report-table')
      if (reportElement) {
        // Clone the element to modify it for PDF
        const clonedElement = reportElement.cloneNode(true) as HTMLElement
        
        // Fix table styling for PDF rendering
        const table = clonedElement.querySelector('table')
        if (table) {
          // Add explicit border styles
          table.style.borderCollapse = 'collapse'
          table.style.border = '1px solid #e5e7eb'
          
          // Fix all cells to have proper borders
          const cells = clonedElement.querySelectorAll('th, td')
          cells.forEach((cell) => {
            const element = cell as HTMLElement
            element.style.border = '1px solid #e5e7eb'
            element.style.padding = '12px' // Back to default padding
            element.style.verticalAlign = 'middle'
            element.style.lineHeight = '1.5'
            element.style.minHeight = '60px'
            element.style.height = 'auto'
            
            // Remove space-y classes that might affect alignment
            element.className = element.className.replace(/space-y-\d+/g, '')
            
            // Fix div containers inside cells for better vertical centering
            const divs = element.querySelectorAll('div')
            divs.forEach((div, index) => {
              const divElement = div as HTMLElement
              divElement.style.margin = '0'
              divElement.style.padding = '0'
              
              // Check if this is a container div with nested divs
              const nestedDivs = divElement.querySelectorAll('div')
              if (nestedDivs.length > 0) {
                // This is a container with English and Myanmar text
                const innerDivs = Array.from(nestedDivs)
                innerDivs.forEach((innerDiv, innerIndex) => {
                  const innerElement = innerDiv as HTMLElement
                  if (innerIndex === 0) {
                    // Hide English text
                    innerElement.style.display = 'none'
                  } else {
                    // Show Myanmar text with proper styling
                    innerElement.style.display = 'block'
                    innerElement.style.lineHeight = '1.8'
                  }
                })
              } else if (divs.length > 1) {
                // Direct divs without nesting
                if (index === 0) {
                  // Hide English text
                  divElement.style.display = 'none'
                } else {
                  // Show Myanmar text
                  divElement.style.display = 'block'
                  divElement.style.lineHeight = '1.8'
                }
              }
            })
          })
          
          // Fix header cells
          const headerCells = clonedElement.querySelectorAll('th')
          headerCells.forEach((cell) => {
            const element = cell as HTMLElement
            element.style.backgroundColor = '#dc2626'
            element.style.color = 'white'
            element.style.fontWeight = 'bold'
            
            // Override padding for header cells
            if (!element.getAttribute('colspan')) {
              element.style.padding = '12px'
            }
            
            // Special styling for full-width header/footer cells
            if (element.getAttribute('colspan')) {
              element.style.textAlign = 'center'
              element.style.verticalAlign = 'middle'
              element.style.padding = '12px' // Back to original padding
              if (element.closest('tr')?.classList.contains('from-gray-700')) {
                element.style.backgroundColor = '#374151'
              }
            }
          })
          
          // Fix footer cells
          const footerCells = clonedElement.querySelectorAll('td[colspan]')
          footerCells.forEach((cell) => {
            const element = cell as HTMLElement
            if (element.closest('tr')?.classList.contains('from-gray-700')) {
              element.style.backgroundColor = '#374151'
              element.style.color = 'white'
              element.style.textAlign = 'center'
              element.style.verticalAlign = 'middle'
              element.style.padding = '12px' // Back to original padding
            }
          })
          
          // Fix specific row backgrounds
          const rows = clonedElement.querySelectorAll('tr')
          rows.forEach((row, index) => {
            const element = row as HTMLElement
            if (element.classList.contains('bg-gradient-to-r')) {
              element.style.background = '#fef2f2'
            } else if (element.classList.contains('bg-gray-50')) {
              element.style.backgroundColor = '#f9fafb'
            }
          })
          
          // Special handling for left column cells with bilingual text
          const leftColumnCells = clonedElement.querySelectorAll('td.bg-gray-50')
          leftColumnCells.forEach((cell) => {
            const element = cell as HTMLElement
            element.style.textAlign = 'left'
            element.style.padding = '12px' // Back to original padding
          })
        }
        
        // Create a temporary container
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.width = '210mm' // A4 width
        tempContainer.style.backgroundColor = 'white'
        tempContainer.style.padding = '20px'
        
        // Add style for Myanmar text
        const styleTag = document.createElement('style')
        styleTag.innerHTML = `
          .myanmar-text {
            line-height: 1.8 !important;
            font-family: "Padauk", "Pyidaungsu", "Myanmar3", sans-serif !important;
          }
        `
        tempContainer.appendChild(styleTag)
        
        // Add header
        const header = document.createElement('div')
        header.innerHTML = `
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
            <div style="color: #dc2626; font-size: 24px; font-weight: bold;">AIA</div>
            <div style="color: #374151; font-size: 18px;">Insurance Recommendation Report</div>
          </div>
          <div style="border-bottom: 2px solid #dc2626; margin-bottom: 20px;"></div>
          
          <!-- Client Information Bar matching the report style -->
          <div style="background: linear-gradient(to right, #fef2f2, #ffffff); border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 14px;">
              <div>
                <span style="color: #6b7280;">Client:</span>
                <span style="margin-left: 8px; font-weight: 500; color: #111827;">${clientData.name}</span>
              </div>
              <div>
                <span style="color: #6b7280;">Age:</span>
                <span style="margin-left: 8px; font-weight: 500; color: #111827;">
                  ${age} years (Insurance Age: ${insuranceAge})
                </span>
              </div>
              <div>
                <span style="color: #6b7280;">Gender:</span>
                <span style="margin-left: 8px; font-weight: 500; color: #111827;">
                  ${clientData.gender === "male" ? "Male" : "Female"}
                </span>
              </div>
            </div>
          </div>
        `
        
        tempContainer.appendChild(header)
        tempContainer.appendChild(clonedElement)
        
        // Add footer
        const footer = document.createElement('div')
        footer.innerHTML = `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 10px;">Generated on: ${new Date().toLocaleDateString()}</p>
            <p style="color: #6b7280; font-size: 10px; text-align: right;">AIA Myanmar Insurance Advisory Services</p>
          </div>
        `
        tempContainer.appendChild(footer)
        
        document.body.appendChild(tempContainer)
        
        // Small delay to ensure styles are applied
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Generate canvas from HTML
        const canvas = await html2canvas(tempContainer, {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794, // A4 width in pixels at 96 DPI
          imageTimeout: 0, // Disable image timeout
          allowTaint: true, // Allow cross-origin images
          foreignObjectRendering: false, // Better CSS rendering
        })
        
        // Remove temporary container
        document.body.removeChild(tempContainer)
        
        // Convert to PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
        
        pdf.save(`AIA_Insurance_Report_${clientData.name.replace(/\s+/g, "_")}.pdf`)
        return
      }
      
      // Fallback to original jsPDF method without Myanmar text
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
              <Table className="w-full border-collapse" style={{ minWidth: "600px", borderCollapse: "collapse", border: "1px solid #e5e7eb" }}>
                <TableHeader>
                  {/* Full width header row */}
                  <TableRow className="bg-gradient-to-r from-gray-700 to-gray-800 border-0">
                    <TableHead 
                      colSpan={selectedOHSPlans.length + 1} 
                      className="text-center text-white font-bold text-base py-5 border-0 align-middle"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div>Comprehensive Health Insurance and Cancer Protection Table</div>
                        <div className="text-sm font-medium">အလုံးစုံအသက်ကျန်းမာရေးအာမခံနှင့် ကင်ဆာအကာကွယ် ဇယား</div>
                      </div>
                    </TableHead>
                  </TableRow>
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
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
                      <div className="space-y-1">
                        <div>Annual Hospitalization/Medical Coverage</div>
                        <div className="text-xs text-gray-600">နှစ်စဉ်ဆေးကုသနိုင်မည့်ခံစားခွင့်ပမာဏ</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`annual-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK(plan?.annualLimit || 0)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Life Time Hospitalization/Medical Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
                      <div className="space-y-1">
                        <div>Life Time Hospitalization/Medical Coverage</div>
                        <div className="text-xs text-gray-600">တစ်သက်တာဆေးကုသနိုင်မည့်ခံစားခွင့်ပမာဏ</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`lifetime-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK((plan?.annualLimit || 0) * 10)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* One Day Room Fees */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
                      <div className="space-y-1">
                        <div>One Day Room Fees</div>
                        <div className="text-xs text-gray-600">တစ်ရက်ဆေးရုံအခန်းခ</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`daily-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK(plan?.dailyLimit || 0)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Accidental Death Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
                      <div className="space-y-1">
                        <div>Accidental Death Coverage</div>
                        <div className="text-xs text-gray-600">မတော်တဆမှုကြောင့်သေဆုံးခြင်းခံစားခွင့်</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`accident-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm"
                      >
                        {plan?.isDefault ? "—" : formatMMK(plan?.accidentalDeath || 0)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Death Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
                      <div className="space-y-1">
                        <div>Death Coverage</div>
                        <div className="text-xs text-gray-600">သေဆုံးခြင်းခံစားခွင့် / TPD ခံစားခွင့်</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`death-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm"
                      >
                        {universalLifeCoverage || termLifeCoverage || "—"}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Cancer Coverage */}
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
                      <div className="space-y-1">
                        <div>Cancer Coverage</div>
                        <div className="text-xs text-gray-600">ကင်ဆာအကာအကွယ်</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`cancer-${plan?.id}`}
                        className="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm"
                      >
                        {productSelections.cancerRider ? formatMMK(100000000) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Premium Payments */}
                  <TableRow className="bg-gradient-to-r from-red-50 to-red-25 border-b-2 border-red-200">
                    <TableCell className="font-bold text-red-900 border-r border-red-200 py-3 text-sm">
                      <div className="space-y-1">
                        <div>Premium Payments (Annual)</div>
                        <div className="text-xs font-semibold text-red-700">တစ်နှစ်စာပရီမီယံသွင်းငွေ</div>
                      </div>
                    </TableCell>
                    {selectedOHSPlans.map((plan) => (
                      <TableCell
                        key={`premium-${plan?.id}`}
                        className="text-center font-bold text-red-700 border-r border-red-200 last:border-r-0 py-3 text-sm"
                      >
                        {plan?.isDefault ? "—" : `${formatMMK(getColumnPremium(plan?.premium || 0))}/year`}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Full width footer row */}
                  <TableRow className="bg-gradient-to-r from-gray-700 to-gray-800">
                    <TableCell 
                      colSpan={selectedOHSPlans.length + 1} 
                      className="text-center text-white py-5 border-0 align-middle"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="text-sm font-medium">International Treatment Coverage & Cashless Claim Available</div>
                        <div className="text-xs">နိုင်ငံတကာဆေးကုသခွင့်နိုင်ခြင်းနှင့် ငွေသားကြိုဆက်စရာမလို cashless claim နိုင်ခြင်း။</div>
                      </div>
                    </TableCell>
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
