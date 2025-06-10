"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Home, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function AccessDenied() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* AIA Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative h-16 w-32 sm:h-20 sm:w-40">
              <Image
                src="/logo.png"
                alt="AIA Logo"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-sm"
              />
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-12 w-12 text-red-600" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                Access Denied
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base">
                You don't have permission to access this page.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <p className="text-gray-500 text-sm">
                  This might be because:
                </p>
                <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    You need to sign in to access this page
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    Your account doesn't have the required permissions
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    This page requires administrator access
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              >
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-11"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 h-11"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="pt-6 border-t border-gray-100"
              >
                <p className="text-xs text-gray-500">
                  Need help? Contact your administrator or AIA support.
                </p>
              </motion.div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} AIA Insurance Advisor. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}