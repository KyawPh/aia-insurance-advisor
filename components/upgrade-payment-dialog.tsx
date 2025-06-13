"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Copy, Phone, CreditCard, Building2, AlertCircle } from "lucide-react"
import { UpgradeService } from "@/lib/upgrade-service"
import { getBillingOption, formatPriceMMK, getBillingPeriodLabel } from "@/data/subscription-plans-data"

interface UpgradePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billingPeriod: 'monthly' | '6months' | '12months'
  userId: string
  userEmail: string
  userName: string
  onSuccess?: () => void
}

export function UpgradePaymentDialog({
  open,
  onOpenChange,
  billingPeriod,
  userId,
  userEmail,
  userName,
  onSuccess
}: UpgradePaymentDialogProps) {
  const [step, setStep] = useState<'payment-method' | 'instructions' | 'confirm'>('payment-method')
  const [paymentMethod, setPaymentMethod] = useState<'wave_money' | 'kbz_pay' | 'bank_transfer'>('wave_money')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  const billingOption = getBillingOption(billingPeriod)
  const amount = billingOption?.totalPrice || 0

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show a temporary success message
    const copyButton = document.activeElement as HTMLElement
    if (copyButton) {
      const originalText = copyButton.innerHTML
      copyButton.innerHTML = '✓'
      setTimeout(() => {
        copyButton.innerHTML = originalText
      }, 1000)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const id = await UpgradeService.createUpgradeRequest(
        userId,
        userEmail,
        userName,
        billingPeriod,
        paymentMethod,
        phoneNumber,
        notes
      )
      setRequestId(id)
      setStep('confirm')
      if (onSuccess) onSuccess()
    } catch (error) {
      // Show error in a modern way instead of alert
      console.error("Failed to submit upgrade request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentInstructions = UpgradeService.getPaymentInstructions(paymentMethod, amount)

  const resetDialog = () => {
    setStep('payment-method')
    setPaymentMethod('wave_money')
    setPhoneNumber('')
    setNotes('')
    setRequestId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetDialog()
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'payment-method' && (
          <>
            <DialogHeader>
              <DialogTitle>Upgrade to Unlimited Plan</DialogTitle>
              <DialogDescription>
                {getBillingPeriodLabel(billingPeriod)} Plan - {formatPriceMMK(amount)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Plan Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Unlimited Plan - {getBillingPeriodLabel(billingPeriod)}</p>
                      <p className="text-sm text-gray-600">Unlimited quotes, PDF reports, full analytics</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{formatPriceMMK(amount)}</p>
                      {billingOption?.savings && (
                        <p className="text-sm text-green-600">{billingOption.savings}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-2">
                    <Card className="cursor-pointer" onClick={() => setPaymentMethod('wave_money')}>
                      <CardContent className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="wave_money" />
                        <Phone className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium">Wave Money</p>
                          <p className="text-sm text-gray-600">Mobile payment via Wave Money app</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer" onClick={() => setPaymentMethod('kbz_pay')}>
                      <CardContent className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="kbz_pay" />
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium">KBZ Pay</p>
                          <p className="text-sm text-gray-600">Mobile payment via KBZ Pay app</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer" onClick={() => setPaymentMethod('bank_transfer')}>
                      <CardContent className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="bank_transfer" />
                        <Building2 className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-gray-600">Direct bank transfer</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <Label htmlFor="phone">Your Phone Number (for payment confirmation)</Label>
                <Input
                  id="phone"
                  placeholder="09-XXX-XXX-XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or reference number"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep('instructions')}>
                Continue to Payment
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'instructions' && (
          <>
            <DialogHeader>
              <DialogTitle>{paymentInstructions.title}</DialogTitle>
              <DialogDescription>
                Follow these steps to complete your payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Payment Details */}
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">Payment Details</h4>
                  <div className="space-y-2">
                    {paymentInstructions.accountInfo.map((info, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{info.label}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{info.value}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(info.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg text-red-600">{formatPriceMMK(amount)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(amount.toString())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-medium">Payment Instructions:</h4>
                <ol className="space-y-2">
                  {paymentInstructions.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-[1px]">
                <div className="relative bg-white rounded-xl p-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl" />
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Important</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        Please use your email ({userEmail}) as the payment reference. 
                        Your upgrade will be processed within 24 hours after payment confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('payment-method')}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'I Have Made the Payment'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Upgrade Request Submitted</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Thank you for your payment!</h3>
                <p className="text-gray-600">
                  Your upgrade request has been submitted successfully.
                </p>
              </div>

              <Card className="bg-green-50">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request ID:</span>
                      <span className="font-mono">{requestId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span>Unlimited - {getBillingPeriodLabel(billingPeriod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span>{formatPriceMMK(amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-[1px]">
                <div className="relative bg-white rounded-xl p-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl" />
                  <div className="relative">
                    <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• We'll verify your payment within 24 hours</li>
                      <li>• You'll receive an email confirmation once approved</li>
                      <li>• Your unlimited access will be activated immediately</li>
                      <li>• If you have any questions, contact support with your Request ID</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}