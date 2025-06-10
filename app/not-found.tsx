import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div>
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-4">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-red-600">404</span>
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                Page Not Found
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-500 text-sm">
                  This might have happened because:
                </p>
                <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center">
                    <Search className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    The URL was typed incorrectly
                  </li>
                  <li className="flex items-center">
                    <Search className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    The page has been removed or relocated
                  </li>
                  <li className="flex items-center">
                    <Search className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    You don't have permission to access this page
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 h-11 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-11 w-full sm:w-auto"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Need help? Contact support through the AIA Insurance Advisor platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} AIA Insurance Advisor. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}