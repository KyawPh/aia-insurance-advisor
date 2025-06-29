"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { universalLifePlans } from "@/data/universal-life-premium-data"
import html2canvas from "html2canvas"
import { motion } from "framer-motion"
import Image from "next/image"
import { clearSession } from "@/lib/session-storage"
import { useQuota } from "@/hooks/use-quota"
import { useAuth } from "@/contexts/auth-context"
import { logger } from "@/lib/logger"

// Constants
const CONSTANTS = {
  // OHS Plans
  OHS_PLAN_IDS: [1, 2, 3, 4, 5, 6, 7] as const,
  DEFAULT_OHS_PLAN_ID: 1,
  
  // Image generation
  IMAGE_GENERATION_DELAY: 100, // ms
  CANVAS_SCALE: 3,
  MIN_WINDOW_WIDTH: 1200,
  BASE_WIDTH: 400,
  PLAN_COLUMN_WIDTH: 180,
  
  // Coverage amounts
  CANCER_COVERAGE_AMOUNT: 100000000, // 100 million MMK
  LIFETIME_MULTIPLIER: 10, // Lifetime coverage = annual * 10
  
  // Styling
  MAX_IMAGE_HEIGHT: '800px',
  TABLE_MIN_WIDTH: '600px',
  
  // Tracking
  TRACK_ACTION_TYPE: 'pdf_downloaded' as const, // Keep as pdf_downloaded for compatibility
} as const

interface ReportGenerationStepProps {
  clientData: ClientData
  productSelections: ProductSelections
  onNewQuote?: () => void
}

// Helper functions
const getSelectedProductNames = (
  productSelections: ProductSelections,
  ohsPlans: OHSPlanWithPremium[]
): string[] => {
  return [
    ...ohsPlans.map(plan => `OHS Plan ${plan.id}`),
    ...(productSelections.universalLife ? [`Universal Life ${productSelections.universalLife.planId}`] : []),
    ...(productSelections.termLife ? [`Term Life ${productSelections.termLife.planId}`] : []),
    ...(productSelections.cancerRider ? ['Cancer Care'] : [])
  ]
}

const calculateReportWidth = (plansCount: number): number => {
  const calculatedWidth = CONSTANTS.BASE_WIDTH + (plansCount * CONSTANTS.PLAN_COLUMN_WIDTH)
  return Math.max(CONSTANTS.MIN_WINDOW_WIDTH, calculatedWidth)
}

// Coverage type interface
interface CoverageType {
  title: string
  myanmarTitle: string
  getValue: (plan: OHSPlanWithPremium, ulCoverage?: string, tlCoverage?: string) => string
}

// Generate a coverage row
const generateCoverageRow = (
  coverage: CoverageType,
  selectedOHSPlans: OHSPlanWithPremium[],
  ulCoverage?: string,
  tlCoverage?: string
) => {
  return `
    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td class="font-medium text-gray-800 border-r border-gray-200 py-3 text-sm bg-gray-50">
        <div class="space-y-1">
          <div>${coverage.title}</div>
          <div class="text-xs text-gray-600">${coverage.myanmarTitle}</div>
        </div>
      </td>
      ${selectedOHSPlans.map((plan) => `
        <td class="text-center border-r border-gray-200 last:border-r-0 py-3 text-gray-900 text-sm">
          ${coverage.getValue(plan, ulCoverage, tlCoverage)}
        </td>
      `).join('')}
    </tr>
  `
}

// Generate report styles
const generateReportStyles = () => {
  return `
    /* Reset and base font */
    * {
      box-sizing: border-box;
    }
    body, div, table, th, td {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }
    
    /* Myanmar text specific styling */
    .myanmar-text, div:lang(my) {
      font-family: "Padauk", "Pyidaungsu", "Myanmar3", "Noto Sans Myanmar", sans-serif !important;
      line-height: 1.8 !important;
    }
    
    /* Table structure */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }
    
    /* Preserve exact Tailwind padding values */
    .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
    .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
    .py-5 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
    .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
    .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
    .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
    
    /* Header cells specific padding - less top, more bottom */
    th[colspan] {
      padding: 0.75rem 1rem 1.75rem 1rem !important;
      height: auto !important;
      line-height: 1.5 !important;
    }
    th:not([colspan]) {
      padding: 0.5rem 1rem 1.5rem 1rem !important;
      height: auto !important;
    }
    
    /* Data cells specific padding - less top, more bottom */
    td {
      padding: 0.25rem 1rem 1.25rem 1rem !important;
      height: auto !important;
      vertical-align: middle !important;
    }
    
    /* Left column cells - with bilingual text */
    td.bg-gray-50 {
      padding: 0.25rem 1rem 1.25rem 1rem !important;
      background-color: #f9fafb !important;
      vertical-align: middle !important;
    }
    
    /* Use flexbox for better vertical centering in cells */
    td.text-center {
      display: table-cell !important;
      vertical-align: middle !important;
      text-align: center !important;
    }
    
    /* Ensure divs inside cells don't add extra spacing */
    td > div, th > div {
      line-height: inherit !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Specific fix for cells with space-y-1 class */
    td > div.space-y-1, th > div.space-y-1 {
      display: block !important;
    }
    
    /* For value cells (not the left column), ensure center alignment */
    td:not(.bg-gray-50):not(:first-child) {
      text-align: center !important;
    }
    
    /* Space between text lines in bilingual cells */
    .space-y-1 > * + * { 
      margin-top: 0.25rem !important; /* Original spacing */
    }
    
    /* Ensure Myanmar text has proper line height */
    div.text-xs {
      line-height: 1.2 !important; /* Tighter line height to match original */
    }
    
    /* Text sizing - matching Tailwind exactly */
    .text-xs { 
      font-size: 0.75rem !important; 
      line-height: 1rem !important; 
    }
    .text-sm { 
      font-size: 0.875rem !important; 
      line-height: 1.25rem !important; 
    }
    .text-base { 
      font-size: 1rem !important; 
      line-height: 1.5rem !important; 
    }
    
    /* Font weights */
    .font-medium { font-weight: 500 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-bold { font-weight: 700 !important; }
    
    /* Colors */
    .text-gray-600 { color: #4b5563 !important; }
    .text-gray-800 { color: #1f2937 !important; }
    .text-gray-900 { color: #111827 !important; }
    .text-white { color: #ffffff !important; }
    
    /* Premium row styling */
    .bg-gradient-to-r {
      background: #fef2f2 !important;
    }
    
    /* Premium row first cell - ensure left alignment */
    tr.bg-gradient-to-r td:first-child {
      text-align: left !important;
    }
    
    /* Premium row cells - same asymmetric padding */
    tr.bg-gradient-to-r td {
      padding: 0.25rem 1rem 1.25rem 1rem !important;
    }
    
    /* Red text for premium amounts */
    .text-red-700 { color: #b91c1c !important; }
    .font-bold.text-red-700 { 
      font-weight: 700 !important;
    }
    
    /* Table minimum widths */
    .min-w-\\[200px\\] { min-width: 200px !important; }
    .min-w-\\[120px\\] { min-width: 120px !important; }
    
    /* Flex layouts */
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .items-center { align-items: center !important; }
    .justify-center { justify-content: center !important; }
    .gap-1 { gap: 0.25rem !important; }
    
    /* Fix client info bar vertical alignment */
    div[style*="grid"] > div {
      margin: 0 !important;
      padding: 0 !important;
    }
  `
}

export default function ReportGenerationStep({ clientData, productSelections, onNewQuote }: ReportGenerationStepProps) {
  const { trackActivity } = useQuota()
  const { user } = useAuth()
  const age = calculateAge(clientData.dateOfBirth)
  const insuranceAge = age + 1
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

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
  const ohsPlansData = CONSTANTS.OHS_PLAN_IDS.map(planId => {
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
    const defaultPlan = ohsPlansData.find((p) => p.id === CONSTANTS.DEFAULT_OHS_PLAN_ID)
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
    const ulPlan = universalLifePlans.find(
      plan => plan.planId === productSelections.universalLife!.planId
    )
    universalLifeCoverage = ulPlan ? formatMMK(ulPlan.sumAssured) : ""
  }

  // Term Life Premium
  let termLifePremium = 0
  let termLifeCoverage = ""
  if (productSelections.termLife) {
    termLifePremium = getTermLifePremium(productSelections.termLife.planId, insuranceAge, clientData.gender)
    totalPremium += termLifePremium
    // Get the actual coverage amount for display
    const termPlan = shortTermEndowmentPlans.find(plan => plan.id === productSelections.termLife!.planId)
    termLifeCoverage = termPlan ? formatMMK(termPlan.coverage) : ""
  }

  // Cancer Rider Premium
  let cancerRiderPremium = 0
  if (productSelections.cancerRider) {
    cancerRiderPremium = getCancerRiderPremium(insuranceAge, clientData.gender)
    totalPremium += cancerRiderPremium
  }

  // Calculate combined premium for each column
  const getColumnPremium = (ohsPremium: number) => {
    return ohsPremium + universalLifePremium + termLifePremium + cancerRiderPremium
  }

  // Auto-generate image on component mount
  useEffect(() => {
    if (selectedOHSPlans.length > 0 && !generatedImageUrl) {
      generateImageInBackground()
    }
  }, [selectedOHSPlans.length]) // Only depend on length to avoid regenerating when premium changes

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (generatedImageUrl && generatedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImageUrl)
      }
    }
  }, [generatedImageUrl])
  
  // Define coverage types
  const getCoverageTypes = (
    lifetimeMultiplier: number,
    cancerCoverageFormatted: string,
    productSelections: ProductSelections,
    getColumnPremium: (premium: number) => number
  ): CoverageType[] => [
    {
      title: 'Annual Hospitalization/Medical Coverage',
      myanmarTitle: 'နှစ်စဉ်ဆေးကုသနိုင်မည့်ခံစားခွင့်ပမာဏ',
      getValue: (plan) => plan?.isDefault ? "—" : formatMMK(plan?.annualLimit || 0)
    },
    {
      title: 'Life Time Hospitalization/Medical Coverage',
      myanmarTitle: 'တစ်သက်တာဆေးကုသနိုင်မည့်ခံစားခွင့်ပမာဏ',
      getValue: (plan) => plan?.isDefault ? "—" : formatMMK((plan?.annualLimit || 0) * lifetimeMultiplier)
    },
    {
      title: 'One Day Room Fees',
      myanmarTitle: 'တစ်ရက်ဆေးရုံအခန်းခ',
      getValue: (plan) => plan?.isDefault ? "—" : formatMMK(plan?.dailyLimit || 0)
    },
    {
      title: 'Accidental Death Coverage',
      myanmarTitle: 'မတော်တဆမှုကြောင့်သေဆုံးခြင်းခံစားခွင့်',
      getValue: (plan) => plan?.isDefault ? "—" : formatMMK(plan?.accidentalDeath || 0)
    },
    {
      title: 'Death Coverage',
      myanmarTitle: 'သေဆုံးခြင်းခံစားခွင့် / TPD ခံစားခွင့်',
      getValue: (plan, ulCoverage, tlCoverage) => ulCoverage || tlCoverage || "—"
    },
    {
      title: 'Cancer Coverage',
      myanmarTitle: 'ကင်ဆာအကာအကွယ်',
      getValue: (plan) => productSelections.cancerRider ? cancerCoverageFormatted : "—"
    }
  ]

  // Generate report header HTML
  const generateReportHeader = (clientData: ClientData, age: number, insuranceAge: number, user: any) => {
    return `
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
        <div style="color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 5px;">AIA</div>
        <div style="color: #374151; font-size: 18px;">Insurance Recommendation Report</div>
      </div>
      <div style="border-bottom: 2px solid #dc2626; margin-bottom: 20px;"></div>
      
      <!-- Client Information Bar matching the report style -->
      <div style="background: linear-gradient(to right, #fef2f2, #ffffff); border: 1px solid #fecaca; border-radius: 8px; padding: 6px 16px 18px 16px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 14px; align-items: center;">
          <div style="line-height: 1.5;">
            <span style="color: #6b7280;">Client:</span>
            <span style="margin-left: 8px; font-weight: 500; color: #111827;">${clientData.name}</span>
          </div>
          <div style="line-height: 1.5;">
            <span style="color: #6b7280;">Age:</span>
            <span style="margin-left: 8px; font-weight: 500; color: #111827;">
              ${age} years (Insurance Age: ${insuranceAge})
            </span>
          </div>
          <div style="line-height: 1.5;">
            <span style="color: #6b7280;">Gender:</span>
            <span style="margin-left: 8px; font-weight: 500; color: #111827;">
              ${clientData.gender === "male" ? "Male" : "Female"}
            </span>
          </div>
        </div>
      </div>
    `
  }

  // Generate report footer HTML
  const generateReportFooter = (user: any) => {
    return `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="color: #6b7280; font-size: 10px; margin: 0;">Generated on: ${new Date().toLocaleDateString()}</p>
            <p style="color: #6b7280; font-size: 10px; margin: 4px 0 0 0;">Generated by: ${user?.displayName || user?.email || 'Insurance Advisor'}</p>
          </div>
          <p style="color: #6b7280; font-size: 10px; margin: 0;">Insurance Advisor Pro - Advisory Tool</p>
        </div>
      </div>
    `
  }

  // Apply table styles
  const applyTableStyles = (table: HTMLElement) => {
    table.style.borderCollapse = 'collapse'
    table.style.border = '1px solid #e5e7eb'
  }

  // Apply cell styles
  const applyCellStyles = (cells: NodeListOf<Element>) => {
    cells.forEach((cell) => {
      const element = cell as HTMLElement
      element.style.border = '1px solid #e5e7eb'
      element.style.verticalAlign = 'middle'
    })
  }

  // Common function to prepare HTML for export
  const prepareReportHTML = (forPNG = false, customWidth?: string) => {
    // Get coverage values that are used in the table
    const ulCoverage = universalLifeCoverage
    const tlCoverage = termLifeCoverage
    const cancerCoverageFormatted = formatMMK(CONSTANTS.CANCER_COVERAGE_AMOUNT)
    const lifetimeMultiplier = CONSTANTS.LIFETIME_MULTIPLIER
    
    // Get coverage types
    const coverageTypes = getCoverageTypes(
      lifetimeMultiplier,
      cancerCoverageFormatted,
      productSelections,
      getColumnPremium
    )
    
    // Create the table HTML dynamically
    const tableHTML = `
      <div id="insurance-report-table" class="bg-white">
        <div class="overflow-x-auto" style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
          <table class="w-full border-collapse" style="width: 100%; min-width: 600px; border-collapse: collapse; border: 1px solid #e5e7eb;">
            <thead>
              <!-- Full width header row -->
              <tr class="bg-gradient-to-r from-gray-700 to-gray-800 border-0">
                <th colspan="${selectedOHSPlans.length + 1}" class="text-center text-white font-bold text-base py-5 border-0 align-middle">
                  <div class="flex flex-col items-center justify-center gap-1">
                    <div>Comprehensive Health Insurance and Cancer Protection Table</div>
                    <div class="text-sm font-medium">အလုံးစုံအသက်ကျန်းမာရေးအာမခံနှင့် ကင်ဆာအကာကွယ် ဇယား</div>
                  </div>
                </th>
              </tr>
              <tr class="bg-gradient-to-r from-red-600 to-red-700 border-0">
                <th class="font-semibold text-white border-r border-red-500 text-left text-sm min-w-[200px] py-4">
                  Coverage Details
                </th>
                ${selectedOHSPlans.map((plan) => `
                  <th key="${plan?.id}" class="font-semibold text-white text-center border-r border-red-500 last:border-r-0 text-sm min-w-[120px] py-4">
                    ${plan?.isDefault ? "Selected Coverage" : `Plan ${plan?.id}`}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${coverageTypes.map(coverage => generateCoverageRow(coverage, selectedOHSPlans, ulCoverage, tlCoverage)).join('')}

              <!-- Premium Payments -->
              <tr class="bg-gradient-to-r from-red-50 to-red-25 border-b-2 border-red-200">
                <td class="font-bold text-red-900 border-r border-red-200 py-3 text-sm">
                  <div class="space-y-1">
                    <div>Premium Payments (Annual)</div>
                    <div class="text-xs font-semibold text-red-700">တစ်နှစ်စာပရီမီယံသွင်းငွေ</div>
                  </div>
                </td>
                ${selectedOHSPlans.map((plan) => `
                  <td class="text-center font-bold text-red-700 border-r border-red-200 last:border-r-0 py-3 text-sm">
                    ${plan?.isDefault && getColumnPremium(0) === 0 ? "—" : `${formatMMK(getColumnPremium(plan?.premium || 0))}/year`}
                  </td>
                `).join('')}
              </tr>
              
              <!-- Full width footer row -->
              <tr class="bg-gradient-to-r from-gray-700 to-gray-800">
                <td colspan="${selectedOHSPlans.length + 1}" class="text-center text-white py-5 border-0 align-middle">
                  <div class="flex flex-col items-center justify-center gap-1">
                    <div class="text-sm font-medium">International Treatment Coverage & Cashless Claim Available</div>
                    <div class="text-xs">နိုင်ငံတကာဆေးကုသခွင့်ရနိုင်ခြင်းနှင့် ငွေသားကြိုသွင်းစရာမလို cashless claim နိုင်ခြင်း။</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `
    
    // Create a temporary div to hold the table HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = tableHTML
    const clonedElement = tempDiv.firstElementChild as HTMLElement
        
        // Fix table styling for PDF rendering
        const table = clonedElement.querySelector('table')
        if (table) {
          applyTableStyles(table)
          
          // Fix all cells to have proper borders
          const cells = clonedElement.querySelectorAll('th, td')
          applyCellStyles(cells)
          
          // Fix header cells
          const headerCells = clonedElement.querySelectorAll('th')
          headerCells.forEach((cell) => {
            const element = cell as HTMLElement
            element.style.backgroundColor = '#dc2626'
            element.style.color = 'white'
            element.style.fontWeight = 'bold'
            
            // Special styling for full-width header/footer cells
            if (element.getAttribute('colspan')) {
              element.style.textAlign = 'center'
              element.style.verticalAlign = 'middle'
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
            }
          })
          
          // Fix specific row backgrounds
          const rows = clonedElement.querySelectorAll('tr')
          rows.forEach((row) => {
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
          })
        }
        
        // Create a temporary container
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.width = customWidth || '210mm' // Use custom width for PNG, A4 width for PDF
        tempContainer.style.backgroundColor = 'white'
        tempContainer.style.padding = '20px'
        
        // Add comprehensive styles to match the original display
        const styleTag = document.createElement('style')
        styleTag.innerHTML = generateReportStyles()
        tempContainer.appendChild(styleTag)
        
        // Add header
        const header = document.createElement('div')
        header.innerHTML = generateReportHeader(clientData, age, insuranceAge, user)
        
        tempContainer.appendChild(header)
        tempContainer.appendChild(clonedElement)
        
        // Add footer
        const footer = document.createElement('div')
        footer.innerHTML = generateReportFooter(user)
        tempContainer.appendChild(footer)
        
    document.body.appendChild(tempContainer)
    
    return {
      tempContainer,
      cleanup: () => {
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer)
        }
      }
    }
  }
  
  
  // Generate image in background without loading overlay
  const generateImageInBackground = async () => {
    setIsGenerating(true)
    
    try {
      // Calculate dynamic width based on number of plans
      const windowWidth = calculateReportWidth(selectedOHSPlans.length)
      const customWidth = `${windowWidth}px`
      const { tempContainer, cleanup } = prepareReportHTML(true, customWidth)
      
      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, CONSTANTS.IMAGE_GENERATION_DELAY))
      
      // Generate canvas
      const canvas = await html2canvas(tempContainer, {
        scale: CONSTANTS.CANVAS_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: windowWidth,
        imageTimeout: 0,
        allowTaint: true,
        foreignObjectRendering: false
      })
      
      cleanup()
      
      // Convert canvas to blob for better save functionality
      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob)
          // Revoke old blob URL if exists
          if (generatedImageUrl && generatedImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(generatedImageUrl)
          }
          setGeneratedImageUrl(blobUrl)
        }
        setIsGenerating(false)
      }, 'image/png')
    } catch (error) {
      logger.error("Error generating image in background", error)
      setIsGenerating(false)
    }
  }

  const downloadPNG = async () => {
    if (!generatedImageUrl) return
    
    try {
      // Fetch the blob from the blob URL
      const response = await fetch(generatedImageUrl)
      const blob = await response.blob()
      
      // Create a download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AIA_Insurance_Report_${clientData.name.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Track download activity
      await trackActivity(CONSTANTS.TRACK_ACTION_TYPE, {
        clientName: clientData.name,
        selectedProducts: getSelectedProductNames(productSelections, selectedOHSPlans),
        viewMethod: 'download',
        format: 'PNG'
      })
    } catch (error) {
      logger.error('Error downloading PNG', error)
      alert('Failed to download image. Please try saving by right-clicking the image.')
    }
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
                <div className="relative h-16 w-32">
                  <Image
                    src="/logo.png"
                    alt="IA Pro Logo"
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

          {/* Generating Report Message */}
          {isGenerating && (
            <div className="bg-white rounded-lg border border-gray-200 py-12 text-center mb-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="text-gray-600">Generating your insurance report...</p>
              </div>
            </div>
          )}

          {/* Image Preview Section */}
          {generatedImageUrl && (
            <div className="mt-8">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg shadow-xl">
                  <img 
                    src={generatedImageUrl} 
                    alt="Insurance Report Preview"
                    className="w-full h-auto"
                    style={{ maxHeight: CONSTANTS.MAX_IMAGE_HEIGHT, objectFit: 'contain' }}
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    💡 Press and hold (mobile) or right-click (desktop) to save • Pinch to zoom on mobile
                  </p>
                </div>
              </div>
            </div>
          )}

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

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-8">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={downloadPNG}
            variant="outline"
            className="w-full sm:w-auto px-4 sm:px-6 h-11 sm:h-12 border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm sm:text-base shadow-sm"
            disabled={!generatedImageUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report (PNG)
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
