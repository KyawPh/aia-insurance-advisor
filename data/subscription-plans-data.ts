// Subscription Plans Data
// Simplified structure for Free Trial + Unlimited Plan with billing periods

export interface BillingOption {
  period: 'monthly' | '6months' | '12months'
  price: number
  totalPrice: number
  savings?: string
}

// Free trial configuration
export const freeTrial = {
  id: 'free',
  internalId: 'free', // For database compatibility
  name: 'Free Trial',
  displayName: 'Free Trial',
  quotaLimit: 5,
  description: '5 quotes • Perfect for trying out',
  features: [
    '5 quotes total',
    'Basic PDF reports',
    'Quote generation',
    'Basic analytics'
  ],
  buttonText: 'Current Plan',
  buttonVariant: 'outline' as const,
  colors: {
    primary: 'text-gray-600',
    background: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    button: 'bg-gray-600',
    buttonHover: 'hover:bg-gray-700'
  }
}

// Unlimited plan configuration  
export const unlimitedPlan = {
  id: 'unlimited',
  internalId: 'premium', // For database compatibility
  name: 'Unlimited Plan',
  displayName: 'Unlimited',
  quotaLimit: -1, // Unlimited
  description: 'Unlimited quotes • Advanced analytics • Premium features',
  features: [
    'Unlimited quotes',
    'PDF reports',
    'Quote History',
    'Analytics'
  ],
  buttonText: 'Upgrade to Unlimited',
  buttonVariant: 'default' as const,
  popular: true,
  colors: {
    primary: 'text-red-600',
    background: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    button: 'bg-red-600',
    buttonHover: 'hover:bg-red-700'
  }
}

// Billing options for unlimited plan
export const billingOptions: BillingOption[] = [
  {
    period: 'monthly',
    price: 15000,
    totalPrice: 15000,
    savings: ''
  },
  {
    period: '6months',
    price: 10000,
    totalPrice: 60000,
    savings: 'Save 30,000 MMK (25% off)'
  },
  {
    period: '12months',
    price: 8000,
    totalPrice: 96000,
    savings: 'Save 84,000 MMK (47% off)'
  }
]

// Combined plans array for backward compatibility
export const subscriptionPlans = [freeTrial, { ...unlimitedPlan, billingOptions }]

// Helper functions
export const getPlanById = (id: string) => {
  if (id === 'free') return freeTrial
  if (id === 'unlimited' || id === 'premium') return { ...unlimitedPlan, billingOptions }
  return undefined
}

export const getPlanByInternalId = (internalId: string) => {
  if (internalId === 'free') return freeTrial
  if (internalId === 'premium') return { ...unlimitedPlan, billingOptions }
  return undefined
}

export const getPopularPlan = () => {
  return { ...unlimitedPlan, billingOptions }
}

// Formatting functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US').format(price)
}

export const formatPriceMMK = (price: number): string => {
  return `${formatPrice(price)} MMK`
}

// Get monthly price for unlimited plan
export const getMonthlyPrice = (): number => {
  const monthlyOption = billingOptions.find(option => option.period === 'monthly')
  return monthlyOption?.price || 15000
}

// Get billing period savings description
export const getBillingPeriodSavings = (period: 'monthly' | '6months' | '12months'): string => {
  const option = billingOptions.find(opt => opt.period === period)
  return option?.savings || ''
}

// Get billing period label
export const getBillingPeriodLabel = (period: 'monthly' | '6months' | '12months'): string => {
  switch (period) {
    case 'monthly':
      return 'Monthly'
    case '6months':
      return '6 Months'
    case '12months':
      return '12 Months'
    default:
      return 'Unknown'
  }
}

// Get billing option by period
export const getBillingOption = (period: 'monthly' | '6months' | '12months'): BillingOption | undefined => {
  return billingOptions.find(option => option.period === period)
}