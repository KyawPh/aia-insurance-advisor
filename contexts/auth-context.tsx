"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize user profile in Firestore (basic user info, quota handled by quota service)
  const initializeUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid)
      
      // Check if user document exists
      const userDoc = await getDoc(userDocRef)
      const now = new Date()
      
      if (!userDoc.exists()) {
        // New user - create with full subscription data
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || '',
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
        })
      } else {
        // Existing user - just update last login
        await setDoc(userDocRef, {
          lastLogin: Timestamp.now()
        }, { merge: true })
      }
      
    } catch (error) {
      console.error('Error initializing user profile:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Initialize basic user profile (quota will be handled by quota service)
        try {
          await initializeUserProfile(user)
        } catch (error) {
          console.error('Failed to initialize user profile:', error)
        }
      }
      
      // Set user and loading state
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])


  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result
    } catch (error: any) {
      // Don't log popup closed errors as they're expected user behavior
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error('Error during Google sign in:', error)
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    logout
  }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}