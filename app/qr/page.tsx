"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, Smartphone, ScanLine } from "lucide-react"
import { useRouter } from "next/navigation"

export default function QRCodePage() {
  const router = useRouter()
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const siteUrl = "https://aia-advisor.web.app/"

  useEffect(() => {
    // Generate QR code using qr-server.com API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(siteUrl)}&color=dc2626&bgcolor=ffffff`
    setQrCodeUrl(qrApiUrl)
  }, [])

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = 'AIA-Insurance-Advisor-QR.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -z-10 blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full -z-10 blur-3xl opacity-50"></div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="relative h-12 w-24">
            <Image
              src="/logo.png"
              alt="AIA Logo"
              fill
              style={{ objectFit: "contain" }}
              className="drop-shadow-sm"
            />
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
            AIA Insurance Advisor
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Professional Insurance Recommendation Tool
          </p>

          {/* QR Code Card */}
          <Card className="max-w-md mx-auto p-8 bg-white shadow-xl border-0">
            <div className="space-y-6">
              {/* QR Code */}
              <div className="relative bg-white p-6 rounded-xl border-2 border-gray-100">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for AIA Insurance Advisor"
                    className="w-full max-w-[300px] h-auto mx-auto"
                  />
                ) : (
                  <div className="w-[300px] h-[300px] mx-auto bg-gray-100 animate-pulse rounded-lg"></div>
                )}
                
                {/* AIA Logo overlay in center of QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white p-2 rounded-lg shadow-md">
                    <div className="text-red-600 font-bold text-xl">AIA</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <ScanLine className="h-5 w-5" />
                  <span className="font-medium">Scan to Access</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>Scan this QR code with your phone camera to access:</p>
                  <p className="font-medium text-gray-900">AIA Insurance Advisor Platform</p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mt-6 text-xs">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-900">Instant Quotes</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-900">All Products</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-900">Professional Reports</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-900">Myanmar Language</p>
                  </div>
                </div>

                {/* URL Display */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Or visit directly:</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{siteUrl}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                <Button
                  onClick={() => window.open(siteUrl, '_blank')}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open Website
                </Button>
              </div>
            </div>
          </Card>

          {/* Meeting Helper Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 p-4 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-lg">
              <h3 className="font-medium mb-2">For AIA Meeting Participants</h3>
              <p className="text-sm opacity-90">
                Simply point your phone camera at the QR code above to instantly access our Insurance Advisor platform. 
                No app download required!
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} AIA Myanmar Insurance Advisory Services</p>
            <p className="mt-1">Professional Insurance Solutions</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}