"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Shield, FileText, Calculator, CheckCircle2, Users, Lock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to the advisor app
  useEffect(() => {
    if (!loading && user) {
      router.push("/advisor")
    }
  }, [user, loading, router])

  const features = [
    {
      icon: <Users className="h-6 w-6 text-red-600" />,
      title: "Client Information",
      description: "Easily input client details including age and preferences"
    },
    {
      icon: <Calculator className="h-6 w-6 text-red-600" />,
      title: "Product Selection",
      description: "Choose from multiple insurance products with real-time premium calculations"
    },
    {
      icon: <FileText className="h-6 w-6 text-red-600" />,
      title: "Professional Reports",
      description: "Generate detailed PNG reports for your clients instantly"
    }
  ]

  const products = [
    {
      name: "One Health Solution (OHS)",
      description: "Comprehensive medical insurance with 7 plan options"
    },
    {
      name: "Universal Life Insurance",
      description: "Flexible life coverage with investment benefits"
    },
    {
      name: "Term Life Insurance",
      description: "Affordable protection for specific time periods"
    },
    {
      name: "Cancer Care Coverage",
      description: "Specialized protection against cancer-related expenses"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Insurance Advisor"
                width={48}
                height={48}
                className="drop-shadow-sm sm:w-16 sm:h-16"
              />
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Button 
                onClick={() => router.push("/auth/login")}
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              Professional Insurance Advisory Tool
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-3 sm:mb-4">
              For Insurance Agents
            </p>
            <p className="text-sm sm:text-lg text-gray-500 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Calculate premiums and generate professional reports for AIA insurance products in Myanmar. 
              Streamline your workflow with our easy-to-use 3-step process.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                size="lg"
                onClick={() => router.push("/auth/login")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              50 free quotes per month • No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-xl text-gray-600 px-4">
              Create professional insurance quotes in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4">{feature.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Supported Insurance Products
            </h2>
            <p className="text-base sm:text-xl text-gray-600 px-4">
              Professional calculations for AIA Myanmar's product portfolio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 sm:h-6 w-5 sm:w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{product.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Transparency Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Shield className="h-10 sm:h-12 w-10 sm:w-12 text-red-600 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Your Data, Your Privacy
            </h2>
            <p className="text-base sm:text-xl text-gray-600">
              We take your privacy seriously
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center">
                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-red-600 mr-2" />
                Why We Use Google Sign-In
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Secure authentication without managing passwords</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Quick access to your saved quotes and history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Personalized experience with your profile</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center">
                <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-red-600 mr-2" />
                Data We Collect
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Your name and email from Google account</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Client information you enter for quotes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Quote history for your reference</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <p className="text-center text-sm sm:text-base text-gray-700">
              <strong>Our Promise:</strong> We never share your client data with third parties. 
              Your information is encrypted and stored securely.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Ready to Streamline Your Insurance Advisory?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Join insurance agents who trust Insurance Advisor for accurate calculations
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/auth/login")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
          >
            Start Your Free Account
            <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-xs sm:text-sm">
                © {new Date().getFullYear()} Insurance Advisor by Advisory Solutions
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Professional tool for insurance agents
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:kyaw.debug@gmail.com" className="text-xs sm:text-sm hover:text-gray-300 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}