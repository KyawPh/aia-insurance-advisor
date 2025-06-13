/**
 * Session persistence utilities for auto-saving form progress
 */

import type { ClientData } from "@/types/insurance"

const SESSION_KEYS = {
  CLIENT_DATA: 'aia_session_client_data',
  SESSION_ID: 'aia_session_id'
} as const


/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Save client data to localStorage
 */
export function saveClientData(clientData: ClientData): void {
  try {
    localStorage.setItem(SESSION_KEYS.CLIENT_DATA, JSON.stringify(clientData))
    console.log('✅ Client data saved')
  } catch (error) {
    console.error('❌ Failed to save client data:', error)
  }
}




/**
 * Load client data from localStorage
 */
export function loadClientData(): ClientData | null {
  try {
    const stored = localStorage.getItem(SESSION_KEYS.CLIENT_DATA)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('✅ Client data restored')
      return parsed
    }
  } catch (error) {
    console.error('❌ Failed to load client data:', error)
  }
  return null
}




/**
 * Check if there's saved client data
 */
export function hasClientData(): boolean {
  try {
    return !!localStorage.getItem(SESSION_KEYS.CLIENT_DATA)
  } catch (error) {
    return false
  }
}


/**
 * Clear all session data
 */
export function clearSession(): void {
  try {
    Object.values(SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('✅ Session cleared')
  } catch (error) {
    console.error('❌ Failed to clear session:', error)
  }
}

/**
 * Initialize a new session
 */
export function initializeSession(): string {
  const sessionId = generateSessionId()
  localStorage.setItem(SESSION_KEYS.SESSION_ID, sessionId)
  console.log(`✅ New session initialized: ${sessionId}`)
  return sessionId
}

