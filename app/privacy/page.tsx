"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function PrivacyPolicyPage() {
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
              <h1 className="text-xl lg:text-2xl font-light text-gray-900">Privacy Policy</h1>
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
          {/* Privacy Commitment Banner */}
          <Alert className="mb-8 border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Your Privacy Matters:</strong> We are committed to protecting your personal information and maintaining the highest standards of data security.
            </AlertDescription>
          </Alert>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-light text-gray-900">
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">1. Information We Collect</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                        <p className="text-gray-700 leading-relaxed">
                          When you create an account, we collect your full name, email address, and any optional information you provide such as company and position details.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Database className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Client Data</h3>
                        <p className="text-gray-700 leading-relaxed">
                          The platform allows you to enter client information including names, dates of birth, gender, and insurance preferences. This data is used solely for generating insurance recommendations and quotes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Lock className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Usage Information</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We automatically collect information about how you use the platform, including pages visited, features used, and time spent on the platform for improving our services.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">2. How We Use Your Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the information we collect for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>To provide and maintain the insurance advisor platform</li>
                    <li>To process and generate insurance quotes and recommendations</li>
                    <li>To authenticate users and maintain account security</li>
                    <li>To improve our services and user experience</li>
                    <li>To communicate with you about your account and service updates</li>
                    <li>To comply with legal obligations and regulatory requirements</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">3. Data Security</h2>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-4">
                    <h3 className="font-medium text-gray-900 mb-3">Our Security Measures:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>End-to-end encryption for all data transmission</li>
                      <li>Secure cloud storage with regular backups</li>
                      <li>Multi-factor authentication for user accounts</li>
                      <li>Regular security audits and monitoring</li>
                      <li>Access controls limiting data access to authorized personnel only</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    While we implement industry-standard security measures, no method of transmission over the internet is 100% secure. We continuously work to improve our security practices to protect your data.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations or court orders</li>
                    <li>To protect our rights, property, or safety, or that of our users</li>
                    <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
                    <li>In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">5. Data Retention</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Client data entered for quotes is retained for a period that allows for follow-up and service continuity, typically not exceeding 7 years unless required by law or regulation.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">6. Your Rights and Choices</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Access:</strong> Request access to your personal data</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                    <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                    <li><strong>Restriction:</strong> Request limitation of processing of your data</li>
                    <li><strong>Objection:</strong> Object to processing of your personal data</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">7. Cookies and Tracking</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. These help us remember your preferences, maintain your session, and analyze platform usage. You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">8. Children's Privacy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">9. International Data Transfers</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. We ensure that any such transfers comply with applicable data protection laws and provide adequate protection for your personal information.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">10. Changes to This Policy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">11. Contact Us</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have questions about this Privacy Policy or how we handle your personal information, please contact us through:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                    <li>The platform's support features</li>
                    <li>Official AIA customer service channels</li>
                    <li>Email: privacy@aia.com (example)</li>
                  </ul>
                </section>
              </div>

              <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-2">Your Trust is Important to Us</h3>
                <p className="text-sm text-blue-800">
                  We are committed to transparency in how we collect, use, and protect your information. This policy reflects our dedication to maintaining your trust while providing you with excellent insurance advisory services.
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