import { useMemo } from 'react'
import { 
  subscriptionPlans,
  getPlanById,
  getPlanByInternalId,
  getPopularPlan,
  formatPriceMMK,
  getBillingPeriodSavings,
  getBillingPeriodLabel,
  getMonthlyPrice,
  getBillingOption,
  billingOptions,
  freeTrial,
  unlimitedPlan,
  type BillingOption
} from '@/data/subscription-plans-data'

export interface UseSubscriptionPlansReturn {
  plans: any[]
  getPlanById: (id: string) => any
  getPlanByInternalId: (internalId: string) => any
  getPopularPlan: () => any
  formatPriceMMK: (price: number) => string
  getPlanColors: (planId: string) => any
  getPlanName: (internalId: string) => string
  getPlanDisplayName: (internalId: string) => string
  getBillingPeriodSavings: (period: 'monthly' | '6months' | '12months') => string
  getBillingPeriodLabel: (period: 'monthly' | '6months' | '12months') => string
  getMonthlyPrice: () => number
  getBillingOption: (period: 'monthly' | '6months' | '12months') => BillingOption | undefined
  billingOptions: BillingOption[]
  freeTrial: typeof freeTrial
  unlimitedPlan: typeof unlimitedPlan
}

export function useSubscriptionPlans(): UseSubscriptionPlansReturn {
  const getPlanColors = useMemo(() => {
    return (planId: string) => {
      const plan = getPlanById(planId) || getPlanByInternalId(planId)
      return plan?.colors
    }
  }, [])

  const getPlanName = useMemo(() => {
    return (internalId: string) => {
      const plan = getPlanByInternalId(internalId)
      return plan?.name || 'Unknown Plan'
    }
  }, [])

  const getPlanDisplayName = useMemo(() => {
    return (internalId: string) => {
      const plan = getPlanByInternalId(internalId)
      return plan?.displayName || 'Unknown'
    }
  }, [])

  return {
    plans: subscriptionPlans,
    getPlanById,
    getPlanByInternalId,
    getPopularPlan,
    formatPriceMMK,
    getPlanColors,
    getPlanName,
    getPlanDisplayName,
    getBillingPeriodSavings,
    getBillingPeriodLabel,
    getMonthlyPrice,
    getBillingOption,
    billingOptions,
    freeTrial,
    unlimitedPlan
  }
}