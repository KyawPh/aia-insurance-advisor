import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { QuotaService, QuotaInfo, UsageRecord, SubscriptionStatus } from '@/lib/quota-service'

interface UseQuotaReturn {
  quota: QuotaInfo | null
  usageHistory: UsageRecord[]
  loading: boolean
  error: string | null
  refreshQuota: () => Promise<void>
  consumeQuota: (action: 'quote_generated' | 'report_viewed', amount?: number, metadata?: any) => Promise<boolean>
  trackActivity: (action: 'pdf_downloaded' | 'report_viewed', metadata?: any) => Promise<boolean>
  canUseQuota: boolean
  quotaRemaining: number
  quotaUsed: number
  quotaLimit: number
  resetDate: Date | null
  plan: string
  isLowQuota: boolean
}

export function useQuota(): UseQuotaReturn {
  const { user } = useAuth()
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshQuota = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      setError(null)
      
      // Small delay to ensure user profile is initialized
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const quotaInfo = await QuotaService.getUserQuota(user.uid)
      setQuota(quotaInfo)
      
      // Also check if quota needs reset
      await QuotaService.checkAndResetQuota(user.uid)
      
      // Fetch usage history
      const history = await QuotaService.getUsageHistory(user.uid, 20)
      setUsageHistory(history)
    } catch (error) {
      console.error('Error fetching quota:', error)
      setError('Failed to load quota information')
      // Set default quota to prevent UI issues
      const now = new Date()
      setQuota({
        quotaLimit: 5,
        quotaUsed: 0,
        quotaRemaining: 5,
        dailyQuotaUsed: 0,
        dailyQuotaLimit: 5,
        lastResetDate: now,
        subscription: {
          plan: 'free',
          billingPeriod: 'trial',
          subscriptionStart: now,
          subscriptionEnd: now,
          isActive: true,
          autoRenew: false,
          isInGracePeriod: false
        },
        canUseQuota: true,
        plan: 'free',
        resetDate: now
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshQuota()
  }, [refreshQuota])

  const consumeQuota = async (
    action: 'quote_generated' | 'report_viewed', 
    amount: number = 1, 
    metadata: any = {}
  ): Promise<boolean> => {
    if (!user) return false
    
    try {
      const success = await QuotaService.consumeQuota(user.uid, action, amount, metadata)
      if (success) {
        await refreshQuota() // Refresh quota after consumption
      }
      return success
    } catch (error) {
      console.error('Error consuming quota:', error)
      return false
    }
  }

  const trackActivity = async (
    action: 'pdf_downloaded' | 'report_viewed',
    metadata: any = {}
  ): Promise<boolean> => {
    if (!user) return false
    
    try {
      const success = await QuotaService.trackActivity(user.uid, action, metadata)
      if (success) {
        await refreshQuota() // Refresh to get updated usage history
      }
      return success
    } catch (error) {
      console.error('Error tracking activity:', error)
      return false
    }
  }

  return {
    quota,
    usageHistory,
    loading,
    error,
    refreshQuota,
    consumeQuota,
    trackActivity,
    canUseQuota: quota?.canUseQuota ?? false,
    quotaRemaining: quota?.quotaRemaining ?? 0,
    quotaUsed: quota?.quotaUsed ?? 0,
    quotaLimit: quota?.quotaLimit ?? 5,
    resetDate: quota?.resetDate ?? null,
    plan: quota?.plan ?? 'free',
    isLowQuota: (() => {
      if (!quota) return false
      if (quota.subscription.isInGracePeriod) {
        return (quota.dailyQuotaLimit - quota.dailyQuotaUsed) <= 2
      }
      return quota.subscription.plan === 'free' && quota.quotaRemaining <= 2
    })()
  }
}