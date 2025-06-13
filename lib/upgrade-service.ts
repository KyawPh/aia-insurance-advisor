import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getBillingOption } from '@/data/subscription-plans-data'

export interface UpgradeRequest {
  id?: string
  userId: string
  userEmail: string
  userName: string
  plan: 'unlimited'
  billingPeriod: 'monthly' | '6months' | '12months'
  amount: number
  paymentMethod: 'wave_money' | 'kbz_pay' | 'bank_transfer'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  phoneNumber?: string
  notes?: string
  paymentReference?: string
  createdAt: Date
  updatedAt?: Date
  processedAt?: Date
  processedBy?: string
}

export class UpgradeService {
  // Create a new upgrade request
  static async createUpgradeRequest(
    userId: string,
    userEmail: string,
    userName: string,
    billingPeriod: 'monthly' | '6months' | '12months',
    paymentMethod: 'wave_money' | 'kbz_pay' | 'bank_transfer',
    phoneNumber?: string,
    notes?: string
  ): Promise<string> {
    try {
      const billingOption = getBillingOption(billingPeriod)
      if (!billingOption) {
        throw new Error('Invalid billing period')
      }

      const upgradeRequest = {
        userId,
        userEmail,
        userName,
        plan: 'unlimited',
        billingPeriod,
        amount: billingOption.totalPrice,
        paymentMethod,
        phoneNumber,
        notes,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'upgradeRequests'), upgradeRequest)
      return docRef.id
    } catch (error) {
      console.error('Error creating upgrade request:', error)
      throw error
    }
  }

  // Get user's upgrade requests
  static async getUserUpgradeRequests(userId: string): Promise<UpgradeRequest[]> {
    try {
      const q = query(
        collection(db, 'upgradeRequests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const requests: UpgradeRequest[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          processedAt: data.processedAt?.toDate()
        } as UpgradeRequest)
      })
      
      return requests
    } catch (error) {
      console.error('Error fetching upgrade requests:', error)
      return []
    }
  }

  // Check if user has pending upgrade request
  static async hasPendingRequest(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'upgradeRequests'),
        where('userId', '==', userId),
        where('status', '==', 'pending')
      )
      
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking pending requests:', error)
      return false
    }
  }

  // Get payment instructions based on method
  static getPaymentInstructions(paymentMethod: string, amount: number): {
    title: string
    instructions: string[]
    accountInfo: { label: string; value: string }[]
  } {
    switch (paymentMethod) {
      case 'wave_money':
        return {
          title: 'Wave Money Payment Instructions',
          instructions: [
            'Open your Wave Money app',
            'Select "Send Money"',
            'Enter the phone number below',
            `Enter amount: ${amount.toLocaleString()} MMK`,
            'Add your email as reference in notes',
            'Complete the transaction',
            'Take a screenshot of the confirmation'
          ],
          accountInfo: [
            { label: 'Phone Number', value: '09-123-456-789' },
            { label: 'Account Name', value: 'AIA Insurance Advisor' }
          ]
        }
      
      case 'kbz_pay':
        return {
          title: 'KBZ Pay Payment Instructions',
          instructions: [
            'Open your KBZ Pay app',
            'Select "Transfer"',
            'Scan QR code or enter phone number',
            `Enter amount: ${amount.toLocaleString()} MMK`,
            'Add your email as reference',
            'Confirm the payment',
            'Save the transaction receipt'
          ],
          accountInfo: [
            { label: 'Phone Number', value: '09-987-654-321' },
            { label: 'Account Name', value: 'AIA Insurance Advisor' }
          ]
        }
      
      case 'bank_transfer':
        return {
          title: 'Bank Transfer Instructions',
          instructions: [
            'Log in to your mobile/internet banking',
            'Select "Transfer to Other Bank"',
            'Enter the account details below',
            `Transfer amount: ${amount.toLocaleString()} MMK`,
            'Use your email as transfer reference',
            'Complete the transfer',
            'Download or screenshot the receipt'
          ],
          accountInfo: [
            { label: 'Bank Name', value: 'KBZ Bank' },
            { label: 'Account Number', value: '0123-4567-8901-2345' },
            { label: 'Account Name', value: 'AIA Insurance Services Myanmar' }
          ]
        }
      
      default:
        return {
          title: 'Payment Instructions',
          instructions: ['Please contact support for payment instructions'],
          accountInfo: []
        }
    }
  }
}