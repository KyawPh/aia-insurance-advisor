"use client"

import { useQuota } from '@/hooks/use-quota'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Crown, Zap, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface QuotaGuardProps {
  children: React.ReactNode
  action: 'quote_generated' | 'pdf_downloaded' | 'report_viewed'
  requiredQuota?: number
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

export function QuotaGuard({ 
  children, 
  action, 
  requiredQuota = 1, 
  fallback,
  showUpgrade = true
}: QuotaGuardProps) {
  const { quota, loading, canUseQuota, quotaRemaining } = useQuota()
  const router = useRouter()

  // Don't show loading - let app load normally while quota loads in background
  if (loading) {
    // Allow children to render while quota loads
    return <>{children}</>
  }

  if (!canUseQuota || (quota?.subscription?.plan === 'free' && quotaRemaining < requiredQuota) || 
      (quota?.subscription?.isInGracePeriod && (quota.dailyQuotaLimit - quota.dailyQuotaUsed) < requiredQuota)) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Different messages based on subscription status
    const getAlertContent = () => {
      if (quota?.subscription?.isInGracePeriod) {
        const dailyRemaining = quota.dailyQuotaLimit - quota.dailyQuotaUsed
        const graceDaysLeft = Math.ceil((quota.subscription.gracePeriodEnd!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          variant: "destructive" as const,
          className: "border-orange-200 bg-orange-50",
          icon: <Clock className="h-4 w-4 text-orange-600" />,
          title: "Grace Period - Daily Limit Reached",
          message: `You've used all ${quota.dailyQuotaLimit} quotes for today. Grace period ends in ${graceDaysLeft} days.`,
          resetInfo: "Daily quota resets at midnight."
        }
      } else if (!quota?.subscription?.isActive) {
        return {
          variant: "destructive" as const,
          className: "border-red-200 bg-red-50",
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Subscription Expired",
          message: "Your subscription has expired and grace period has ended.",
          resetInfo: "Renew your subscription to continue."
        }
      } else {
        return {
          variant: "destructive" as const,
          className: "border-red-200 bg-red-50",
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Free Trial Quota Exceeded",
          message: `You have ${quotaRemaining} quotes remaining in your free trial.`,
          resetInfo: "Upgrade to unlimited plan for continuous access."
        }
      }
    }
    
    const alertContent = getAlertContent()

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className={`relative overflow-hidden rounded-xl p-[1px] ${
          alertContent.variant === 'destructive' && alertContent.className.includes('orange') 
            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
            : 'bg-gradient-to-r from-red-500 to-pink-500'
        }`}>
          <div className="relative bg-white rounded-xl p-6">
            <div className={`absolute inset-0 rounded-xl ${
              alertContent.className.includes('orange') 
                ? 'bg-gradient-to-r from-orange-50 to-amber-50'
                : 'bg-gradient-to-r from-red-50 to-pink-50'
            }`} />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  alertContent.className.includes('orange')
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                    : 'bg-gradient-to-br from-red-500 to-pink-500'
                }`}>
                  <div className="text-white">
                    {React.cloneElement(alertContent.icon, { className: 'h-6 w-6' })}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{alertContent.title}</h3>
                  <p className="text-gray-700">{alertContent.message}</p>
                  <p className="text-sm text-gray-600 mt-2">{alertContent.resetInfo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showUpgrade && (
          <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-xl text-gray-900 font-light">
                {quota?.subscription?.isInGracePeriod ? 'Renew Your Subscription' : 'Upgrade for Unlimited Quotes'}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {quota?.subscription?.isInGracePeriod 
                  ? 'Reactivate your unlimited access now'
                  : 'Continue creating insurance recommendations without limits'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Monthly Plan</p>
                    <p className="text-sm text-gray-600">Unlimited quotes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">15,000 MMK/mo</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">12 Months Plan</p>
                    <p className="text-sm text-gray-600">Unlimited quotes • Best value</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">8,000 MMK/mo</p>
                    <p className="text-xs text-green-600">Save 47%</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  onClick={() => router.push('/profile?tab=plans')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {quota?.subscription?.isInGracePeriod ? 'Renew Now' : 'Upgrade Now'}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                ✨ Instant activation • Wave Money/KBZPay supported
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    )
  }

  return <>{children}</>
}

// Quota warning component for low quota scenarios
export function QuotaWarning() {
  const { quota, quotaRemaining, loading } = useQuota()
  const router = useRouter()

  // Don't show warning during loading
  if (loading) return null
  
  // Show appropriate warning based on subscription status
  const shouldShowWarning = () => {
    if (quota?.subscription?.isInGracePeriod) {
      return (quota.dailyQuotaLimit - quota.dailyQuotaUsed) <= 2
    }
    return quota?.subscription?.plan === 'free' && quotaRemaining <= 2 && quotaRemaining > 0
  }
  
  if (!shouldShowWarning()) return null

  const getWarningContent = () => {
    if (quota?.subscription?.isInGracePeriod) {
      const dailyRemaining = quota.dailyQuotaLimit - quota.dailyQuotaUsed
      return {
        title: "Grace Period - Low Daily Quota",
        message: `You have ${dailyRemaining} quotes remaining today.`,
        action: "Renew subscription",
        className: "border-orange-200 bg-orange-50",
        textColor: "text-orange-800",
        iconColor: "text-orange-600"
      }
    } else {
      return {
        title: "Low Quota Warning",
        message: `You have ${quotaRemaining} quotes remaining in your free trial.`,
        action: "Upgrade now",
        className: "border-yellow-200 bg-yellow-50",
        textColor: "text-yellow-800",
        iconColor: "text-yellow-600"
      }
    }
  }
  
  const warning = getWarningContent()

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6"
    >
      <Alert className={warning.className}>
        <AlertTriangle className={`h-4 w-4 ${warning.iconColor}`} />
        <AlertDescription className={warning.textColor}>
          <div className="flex items-center justify-between">
            <div>
              <strong>{warning.title}:</strong> {warning.message}
            </div>
            <Button 
              size="sm" 
              variant="link" 
              className={`p-0 h-auto ${warning.iconColor} underline ml-2`}
              onClick={() => router.push('/profile?tab=plans')}
            >
              {warning.action}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}