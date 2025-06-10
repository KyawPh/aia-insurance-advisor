"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function TermsOfServicePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-20 sm:h-12 sm:w-24">
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
              <h1 className="text-xl lg:text-2xl font-light text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/auth/login?tab=signup")}
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Signup
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-light text-gray-900">
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing and using the AIA Insurance Advisor platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">2. Description of Service</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    AIA Insurance Advisor is a digital platform that provides:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Insurance product recommendations based on client data</li>
                    <li>Premium calculations for AIA insurance products</li>
                    <li>Quote generation and management tools</li>
                    <li>Client data management capabilities</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">3. User Responsibilities</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    As a user of this service, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Provide accurate and complete information when creating accounts or entering client data</li>
                    <li>Maintain the security and confidentiality of your account credentials</li>
                    <li>Use the service only for lawful purposes and in accordance with these terms</li>
                    <li>Respect the privacy and confidentiality of client information</li>
                    <li>Not attempt to reverse engineer, modify, or compromise the security of the platform</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">4. Data Privacy and Security</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We take data privacy seriously. All client information entered into the system is encrypted and stored securely. We do not share personal information with third parties except as required by law or as outlined in our Privacy Policy. Users are responsible for ensuring they have proper consent from clients before entering their information into the system.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">5. Limitations of Liability</h2>
                  <p className="text-gray-700 leading-relaxed">
                    The information provided by this platform is for guidance purposes only. While we strive for accuracy, premium calculations and product recommendations should be verified with official AIA documentation. AIA and the platform developers are not liable for any decisions made based solely on the information provided by this tool.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">6. Intellectual Property</h2>
                  <p className="text-gray-700 leading-relaxed">
                    All content, features, and functionality of the AIA Insurance Advisor platform are owned by AIA and are protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">7. Service Availability</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We strive to maintain high availability of our service, but we do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">8. Modifications to Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the service constitutes acceptance of the modified terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">9. Termination</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend access to the service immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">10. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us through the official AIA customer service channels or through the platform's support features.
                  </p>
                </section>
              </div>

              <div className="mt-12 p-6 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-red-800">
                  <strong>Important:</strong> These terms are legally binding. By using the AIA Insurance Advisor platform, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AIA Insurance Advisor. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}