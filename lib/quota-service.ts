import { 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  increment,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { subscriptionPlans, getPlanByInternalId } from '@/data/subscription-plans-data'

export interface SubscriptionStatus {
  plan: 'free' | 'unlimited'
  billingPeriod: 'trial' | 'monthly' | '6months' | '12months'
  subscriptionStart: Date
  subscriptionEnd: Date
  isActive: boolean
  autoRenew: boolean
  gracePeriodEnd?: Date
  isInGracePeriod: boolean
  paymentMethod?: 'wave_money' | 'kbz_pay' | 'bank_transfer' | 'card'
}

export interface QuotaInfo {
  // Quota tracking (only for free trial and grace period)
  quotaLimit: number
  quotaUsed: number
  quotaRemaining: number
  dailyQuotaUsed: number  // For grace period (5/day limit)
  dailyQuotaLimit: number
  lastResetDate: Date
  
  // Subscription info
  subscription: SubscriptionStatus
  canUseQuota: boolean
  
  // Legacy fields for backward compatibility
  plan: 'free' | 'premium'
  resetDate: Date
}

export interface UsageRecord {
  id: string
  userId: string
  action: 'quote_generated' | 'pdf_downloaded' | 'report_viewed'
  timestamp: Date
  metadata: {
    clientName?: string
    totalPremium?: number
    selectedProducts?: string[]
  }
  quotaConsumed: number
}

export class QuotaService {
  // Create default user quota document
  private static async createDefaultUserQuota(userId: string): Promise<void> {
    const now = new Date()
    
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      subscription: {
        // Subscription details
        plan: 'free',
        billingPeriod: 'trial',
        subscriptionStart: Timestamp.fromDate(now),
        subscriptionEnd: null, // Free trial never expires
        isActive: true,
        autoRenew: false,
        isInGracePeriod: false,
        
        // Quota tracking
        quotaLimit: 5,
        quotaUsed: 0,
        dailyQuotaUsed: 0,
        dailyQuotaLimit: 5, // Default for grace period
        lastResetDate: Timestamp.fromDate(now)
      }
    }, { merge: true })
  }

  // Get user's current quota status
  static async getUserQuota(userId: string): Promise<QuotaInfo> {
    try {
      let userDoc = await getDoc(doc(db, 'users', userId))
      
      // If user document doesn't exist, create it with default quota
      if (!userDoc.exists()) {
        console.log('User document not found, creating default quota for:', userId)
        await this.createDefaultUserQuota(userId)
        userDoc = await getDoc(doc(db, 'users', userId))
        
        if (!userDoc.exists()) {
          console.warn('Failed to create user document, returning default quota')
          return this.getDefaultQuota()
        }
      }
      
      const userData = userDoc.data()
      const sub = userData.subscription
      const now = new Date()
      
      // Check if subscription has expired and handle grace period
      const subscriptionEnd = sub?.subscriptionEnd?.toDate()
      const gracePeriodEnd = sub?.gracePeriodEnd?.toDate()
      
      let isActive = sub?.isActive || false
      let isInGracePeriod = false
      let canUseQuota = false
      
      // Determine subscription status
      if (sub?.plan === 'free') {
        // Free trial - always active, quota limited
        isActive = true
        canUseQuota = (sub?.quotaUsed || 0) < (sub?.quotaLimit || 5)
      } else if (sub?.plan === 'unlimited') {
        if (subscriptionEnd && now > subscriptionEnd) {
          // Subscription expired - check grace period
          if (!gracePeriodEnd) {
            // Start grace period (7 days)
            const newGracePeriodEnd = new Date(subscriptionEnd)
            newGracePeriodEnd.setDate(newGracePeriodEnd.getDate() + 7)
            
            await updateDoc(doc(db, 'users', userId), {
              'subscription.gracePeriodEnd': Timestamp.fromDate(newGracePeriodEnd),
              'subscription.isInGracePeriod': true,
              'subscription.isActive': false
            })
            
            isInGracePeriod = true
            canUseQuota = this.checkGracePeriodQuota(sub, now)
          } else if (now <= gracePeriodEnd) {
            // In grace period
            isInGracePeriod = true
            canUseQuota = this.checkGracePeriodQuota(sub, now)
          } else {
            // Grace period expired - account suspended
            isActive = false
            canUseQuota = false
          }
        } else {
          // Active unlimited subscription
          isActive = true
          canUseQuota = true // Unlimited quotes
        }
      }
      
      // Build subscription status
      const subscription: SubscriptionStatus = {
        plan: sub?.plan || 'free',
        billingPeriod: sub?.billingPeriod || 'trial',
        subscriptionStart: sub?.subscriptionStart?.toDate() || now,
        subscriptionEnd: subscriptionEnd || now,
        isActive,
        autoRenew: sub?.autoRenew || false,
        gracePeriodEnd,
        isInGracePeriod,
        paymentMethod: sub?.paymentMethod
      }
      
      // Calculate quota info
      const quotaLimit = sub?.plan === 'unlimited' && isActive ? -1 : (sub?.quotaLimit || 5)
      const quotaUsed = sub?.quotaUsed || 0
      const dailyQuotaUsed = sub?.dailyQuotaUsed || 0
      const dailyQuotaLimit = sub?.dailyQuotaLimit || 5
      
      return {
        quotaLimit,
        quotaUsed,
        quotaRemaining: quotaLimit === -1 ? -1 : Math.max(0, quotaLimit - quotaUsed),
        dailyQuotaUsed,
        dailyQuotaLimit,
        lastResetDate: sub?.lastResetDate?.toDate() || now,
        subscription,
        canUseQuota,
        // Legacy fields
        plan: sub?.plan === 'unlimited' ? 'premium' : 'free',
        resetDate: subscriptionEnd || now
      }
    } catch (error) {
      console.error('Error fetching user quota:', error)
      return this.getDefaultQuota()
    }
  }

  // Check grace period quota (5 quotes per day)
  private static checkGracePeriodQuota(subscription: any, now: Date): boolean {
    const lastReset = subscription?.lastResetDate?.toDate()
    const dailyQuotaUsed = subscription?.dailyQuotaUsed || 0
    
    // Reset daily quota if it's a new day
    if (!lastReset || !this.isSameDay(lastReset, now)) {
      return true // New day, quota available
    }
    
    return dailyQuotaUsed < 5 // Check if under daily limit
  }
  
  // Check if two dates are the same day
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }
  
  // Get default quota (fallback)
  private static getDefaultQuota(): QuotaInfo {
    const now = new Date()
    return {
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
    }
  }

  // Consume quota for an action
  static async consumeQuota(
    userId: string, 
    action: 'quote_generated' | 'pdf_downloaded' | 'report_viewed', 
    amount: number = 1,
    metadata: any = {}
  ): Promise<boolean> {
    try {
      // Get current quota status
      const quotaInfo = await this.getUserQuota(userId)
      
      if (!quotaInfo.canUseQuota) {
        return false
      }
      
      // Check quota limits based on subscription status
      if (quotaInfo.subscription.plan === 'free') {
        // Free trial: Check total quota
        if (quotaInfo.quotaRemaining < amount) {
          return false
        }
      } else if (quotaInfo.subscription.isInGracePeriod) {
        // Grace period: Check daily quota (5 per day)
        const now = new Date()
        const lastReset = quotaInfo.lastResetDate
        
        // Reset daily quota if new day
        if (!this.isSameDay(lastReset, now)) {
          await updateDoc(doc(db, 'users', userId), {
            'subscription.dailyQuotaUsed': 0,
            'subscription.lastResetDate': Timestamp.fromDate(now)
          })
        } else if (quotaInfo.dailyQuotaUsed + amount > quotaInfo.dailyQuotaLimit) {
          return false // Exceeded daily limit
        }
      }
      // Unlimited active subscription: No limits
      
      // Update quota counters
      const updates: any = {
        'lastActivity': Timestamp.now()
      }
      
      if (quotaInfo.subscription.plan === 'free') {
        updates['subscription.quotaUsed'] = increment(amount)
      } else if (quotaInfo.subscription.isInGracePeriod) {
        updates['subscription.dailyQuotaUsed'] = increment(amount)
      }
      
      await updateDoc(doc(db, 'users', userId), updates)
      
      // Log usage
      await addDoc(collection(db, 'usage'), {
        userId,
        action,
        timestamp: Timestamp.now(),
        metadata,
        quotaConsumed: amount,
        subscriptionStatus: quotaInfo.subscription.plan,
        inGracePeriod: quotaInfo.subscription.isInGracePeriod
      })
      
      return true
    } catch (error) {
      console.error('Error consuming quota:', error)
      return false
    }
  }

  // Get usage history for the current user
  static async getUsageHistory(userId: string, limitCount: number = 10): Promise<UsageRecord[]> {
    try {
      const q = query(
        collection(db, 'usage'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        action: doc.data().action,
        timestamp: doc.data().timestamp.toDate(),
        metadata: doc.data().metadata || {},
        quotaConsumed: doc.data().quotaConsumed || 1
      }))
    } catch (error) {
      console.error('Error fetching usage history:', error)
      return []
    }
  }

  // Track activity without consuming quota (for analytics only)
  static async trackActivity(
    userId: string,
    action: 'pdf_downloaded' | 'report_viewed',
    metadata: any = {}
  ): Promise<boolean> {
    try {
      // Log usage without consuming quota
      await addDoc(collection(db, 'usage'), {
        userId,
        action,
        timestamp: Timestamp.now(),
        metadata,
        quotaConsumed: 0 // No quota consumed for these actions
      })

      return true
    } catch (error) {
      console.error('Error tracking activity:', error)
      return false
    }
  }

  // Check if quota reset is needed (client-side check)
  static async checkAndResetQuota(userId: string): Promise<void> {
    try {
      // Ensure user document exists and get quota info
      const quotaInfo = await this.getUserQuota(userId)
      const now = new Date()
      
      if (now > quotaInfo.resetDate) {
        await this.resetQuota(userId)
      }
    } catch (error) {
      console.error('Error checking quota reset:', error)
    }
  }

  // Reset quota (typically called monthly)
  static async resetQuota(userId: string): Promise<void> {
    try {
      const nextResetDate = new Date()
      nextResetDate.setMonth(nextResetDate.getMonth() + 1)
      
      await updateDoc(doc(db, 'users', userId), {
        'subscription.quotaUsed': 0,
        'subscription.quotaResetDate': Timestamp.fromDate(nextResetDate)
      })
    } catch (error) {
      console.error('Error resetting quota:', error)
    }
  }

  // Get quota plans (for display purposes)
  static getQuotaPlans() {
    const plans: any = {}
    
    subscriptionPlans.forEach(plan => {
      plans[plan.internalId] = {
        id: plan.internalId,
        name: plan.name,
        quotaLimit: plan.quotaLimit,
        features: plan.features,
        billingOptions: plan.billingOptions
      }
    })

    return plans
  }

  // Method to purchase extra quota
  static async purchaseExtraQuota(userId: string, quantity: number): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        return false
      }

      const currentExtraQuota = userDoc.data().subscription?.extraQuota || 0
      
      await updateDoc(doc(db, 'users', userId), {
        'subscription.extraQuota': currentExtraQuota + quantity,
        'lastActivity': Timestamp.now()
      })

      return true
    } catch (error) {
      console.error('Error purchasing extra quota:', error)
      return false
    }
  }

  // Method to upgrade plan with immediate effect and proration
  static async upgradePlan(
    userId: string, 
    billingPeriod: 'monthly' | '6months' | '12months',
    paymentMethod?: 'wave_money' | 'kbz_pay' | 'bank_transfer' | 'card'
  ): Promise<{ success: boolean; prorationCredit?: number; newSubscriptionEnd?: Date }> {
    try {
      const currentQuota = await this.getUserQuota(userId)
      const now = new Date()
      
      // Calculate subscription end date
      const subscriptionEnd = new Date(now)
      switch (billingPeriod) {
        case 'monthly':
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)
          break
        case '6months':
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 6)
          break
        case '12months':
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1)
          break
      }
      
      // Calculate proration credit if upgrading from existing subscription
      let prorationCredit = 0
      if (currentQuota.subscription.plan === 'unlimited' && 
          currentQuota.subscription.isActive && 
          currentQuota.subscription.subscriptionEnd > now) {
        
        const remainingDays = Math.ceil(
          (currentQuota.subscription.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        // Calculate daily rate of current plan and apply as credit
        // This is where you'd integrate with your billing system
        const currentDailyRate = this.calculateDailyRate(currentQuota.subscription.billingPeriod)
        prorationCredit = remainingDays * currentDailyRate
      }
      
      // Update subscription
      await updateDoc(doc(db, 'users', userId), {
        'subscription.plan': 'unlimited',
        'subscription.billingPeriod': billingPeriod,
        'subscription.subscriptionStart': Timestamp.fromDate(now),
        'subscription.subscriptionEnd': Timestamp.fromDate(subscriptionEnd),
        'subscription.isActive': true,
        'subscription.autoRenew': billingPeriod === 'monthly', // Only monthly auto-renews
        'subscription.isInGracePeriod': false,
        'subscription.gracePeriodEnd': null,
        'subscription.paymentMethod': paymentMethod,
        'subscription.quotaUsed': 0, // Reset quota on upgrade
        'subscription.dailyQuotaUsed': 0,
        'lastActivity': Timestamp.now()
      })
      
      return {
        success: true,
        prorationCredit,
        newSubscriptionEnd: subscriptionEnd
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      return { success: false }
    }
  }
  
  // Calculate daily rate for proration
  private static calculateDailyRate(billingPeriod: string): number {
    const rates = {
      'monthly': 15000 / 30,
      '6months': 60000 / 180,
      '12months': 96000 / 365
    }
    return rates[billingPeriod as keyof typeof rates] || 0
  }
}