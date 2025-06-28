"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Image as ImageIcon } from "lucide-react"
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
import html2canvas from "html2canvas"
import { motion } from "framer-motion"
import Image from "next/image"
import { clearSession, initializeSession } from "@/lib/session-storage"
import { useQuota } from "@/hooks/use-quota"
import { useAuth } from "@/contexts/auth-context"

interface ReportGenerationStepProps {
  clientData: ClientData
  productSelections: ProductSelections
  onNewQuote?: () => void
}


export default function ReportGenerationStep({ clientData, productSelections, onNewQuote }: ReportGenerationStepProps) {
  const { trackActivity } = useQuota()
  const { user } = useAuth()
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


  
  // Common function to prepare HTML for export
  const prepareReportHTML = (forPNG = false, customWidth?: string) => {
    const reportElement = document.getElementById('insurance-report-table')
    if (!reportElement) {
      throw new Error('Report element not found')
    }
    
    // Clone the element to modify it for export
    const clonedElement = reportElement.cloneNode(true) as HTMLElement
        
        // Fix table styling for PDF rendering
        const table = clonedElement.querySelector('table')
        if (table) {
          // Add explicit border styles
          table.style.borderCollapse = 'collapse'
          table.style.border = '1px solid #e5e7eb'
          
          // Fix all cells to have proper borders only
          const cells = clonedElement.querySelectorAll('th, td')
          cells.forEach((cell) => {
            const element = cell as HTMLElement
            element.style.border = '1px solid #e5e7eb'
            element.style.verticalAlign = 'middle'
            // Don't touch padding - let CSS classes handle it
            
            // Keep the original div structure and spacing
            // Don't hide any text - show both English and Myanmar
          })
          
          // Fix header cells
          const headerCells = clonedElement.querySelectorAll('th')
          headerCells.forEach((cell) => {
            const element = cell as HTMLElement
            element.style.backgroundColor = '#dc2626'
            element.style.color = 'white'
            element.style.fontWeight = 'bold'
            
            // Don't override padding - preserve original classes
            
            // Special styling for full-width header/footer cells
            if (element.getAttribute('colspan')) {
              element.style.textAlign = 'center'
              element.style.verticalAlign = 'middle'
              // Preserve original padding
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
              // Preserve original padding
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
            // Preserve original padding
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
        styleTag.innerHTML = `
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
        
        tempContainer.appendChild(header)
        tempContainer.appendChild(clonedElement)
        
        // Add footer
        const footer = document.createElement('div')
        footer.innerHTML = `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <p style="color: #6b7280; font-size: 10px; margin: 0;">Generated on: ${new Date().toLocaleDateString()}</p>
                <p style="color: #6b7280; font-size: 10px; margin: 4px 0 0 0;">Generated by: ${user?.displayName || user?.email || 'Insurance Advisor'}</p>
              </div>
              <p style="color: #6b7280; font-size: 10px; margin: 0;">AIA Myanmar Insurance Advisory Services</p>
            </div>
          </div>
        `
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
  
  
  // View report as PNG in new tab
  const viewPNGReport = async () => {
    const overlay = createLoadingOverlay()
    const loadingMessage = overlay.querySelector('#loading-message') as HTMLElement
    if (loadingMessage) {
      loadingMessage.textContent = 'Generating image report...'
    }
    
    try {
      // Calculate dynamic width based on number of plans
      // Base width for the left column + width per plan column
      const baseWidth = 400 // Width for the coverage details column
      const planColumnWidth = 180 // Width per plan column
      const totalPlans = selectedOHSPlans.length
      const calculatedWidth = baseWidth + (totalPlans * planColumnWidth)
      const windowWidth = Math.max(1200, calculatedWidth) // Minimum 1200px
      
      // Pass custom width for PNG
      const customWidth = `${windowWidth}px`
      const { tempContainer, cleanup } = prepareReportHTML(true, customWidth)
      
      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Generate canvas with dynamic width for full table capture
      const canvas = await html2canvas(tempContainer, {
        scale: 3, // Higher scale for better text rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: windowWidth, // Dynamic width based on number of plans
        imageTimeout: 0,
        allowTaint: true,
        foreignObjectRendering: false
      })
      
      // Clean up
      cleanup()
      
      // Get image URL
      const imageUrl = canvas.toDataURL('image/png')
      
      // Convert data URL to blob for better mobile support
      const dataURLtoBlob = (dataURL: string) => {
        const parts = dataURL.split(',')
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
        const bstr = atob(parts[1])
        const n = bstr.length
        const u8arr = new Uint8Array(n)
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i)
        }
        return new Blob([u8arr], { type: mime })
      }
      
      // Create blob URL for better compatibility
      const blob = dataURLtoBlob(imageUrl)
      const blobUrl = URL.createObjectURL(blob)
      
      // Try to open in new tab - open blank page first
      const newTab = window.open('', '_blank')
      
      if (newTab) {
        // Successfully opened in new tab - write the HTML page immediately
          newTab.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <title>AIA Insurance Report - ${clientData.name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta charset="UTF-8">
            <style>
              body { 
                margin: 0; 
                padding: 10px;
                background: #f3f4f6;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .container {
                max-width: 100%;
                text-align: center;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                background: white;
              }
              .actions {
                margin: 20px 0;
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
              }
              button {
                background: #dc2626;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background 0.2s;
              }
              button:hover {
                background: #b91c1c;
              }
              button:active {
                transform: scale(0.98);
              }
              .info {
                background: #fef3c7;
                padding: 12px 20px;
                border-radius: 6px;
                margin: 20px auto;
                max-width: 600px;
                font-size: 14px;
                color: #92400e;
                line-height: 1.5;
              }
              @media print {
                .actions, .info { display: none; }
                body { background: white; padding: 0; }
                img { box-shadow: none; max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="actions">
                <button onclick="downloadImage()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Image
                </button>
                <button onclick="window.print()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print
                </button>
              </div>
              <img src="${imageUrl}" alt="Insurance Report for ${clientData.name}">
              <div class="info">
                💡 <strong>Tip:</strong> On mobile devices, press and hold the image to save it to your photo gallery. You can also pinch to zoom for better viewing.
              </div>
            </div>
            <script>
              function downloadImage() {
                const link = document.createElement('a');
                link.download = 'AIA_Insurance_Report_${clientData.name.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.png';
                link.href = '${imageUrl}';
                link.click();
              }
            </script>
          </body>
          </html>
        `);
        newTab.document.close();
      } else {
        // Fallback if popup is blocked - show options to user
        const shouldDownload = confirm(
          'Unable to open in new tab. Would you like to download the report instead?\n\n' +
          'Tip: You can also try disabling popup blocker for this site.'
        )
        
        if (shouldDownload) {
          const link = document.createElement('a')
          link.download = `AIA_Insurance_Report_${clientData.name.replace(/\s+/g, "_")}.png`
          link.href = imageUrl
          link.click()
        }
        
        // We're using data URL in the new tab, so we can clean up blob URL
        // But keep a small delay in case the download happens
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 5000) // Clean up after 5 seconds
      }
      
      // Track PNG view/download activity
      await trackActivity('pdf_downloaded', {
        clientName: clientData.name,
        selectedProducts: [
          ...productSelections.ohsPlans.map(id => `OHS Plan ${id}`),
          ...(productSelections.universalLife ? [`Universal Life ${productSelections.universalLife.planId}`] : []),
          ...(productSelections.termLife ? [`Term Life ${productSelections.termLife.planId}`] : []),
          ...(productSelections.cancerRider ? ['Cancer Care'] : [])
        ],
        viewMethod: newTab ? 'new_tab' : 'direct_download',
        format: 'PNG'
      })
      
      if (overlay.parentNode) {
        document.body.removeChild(overlay)
      }
    } catch (error) {
      console.error("Error generating PNG report:", error)
      if (overlay.parentNode) {
        document.body.removeChild(overlay)
      }
      alert('Failed to generate image report. Please try the PDF option instead.')
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
                        {plan?.isDefault ? "Selected Coverage" : `Plan ${plan?.id}`}
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
                        {plan?.isDefault && getColumnPremium(0) === 0 ? "—" : `${formatMMK(getColumnPremium(plan?.premium || 0))}/year`}
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
                        <div className="text-xs">နိုင်ငံတကာဆေးကုသခွင့်ရနိုင်ခြင်းနှင့် ငွေသားကြိုသွင်းစရာမလို cashless claim နိုင်ခြင်း။</div>
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
            onClick={viewPNGReport}
            variant="outline"
            className="w-full sm:w-auto px-4 sm:px-6 h-11 sm:h-12 border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm sm:text-base shadow-sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            View/Print Report
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
