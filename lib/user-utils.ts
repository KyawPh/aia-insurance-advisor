/**
 * Utility functions for user-related operations
 */

/**
 * Generate initials from a full name
 * @param name - Full name string
 * @returns Uppercase initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'U'
  
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Format number as Myanmar Kyat (MMK) currency
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatMMK = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0'
  return new Intl.NumberFormat('en-US').format(amount)
}

/**
 * Format date string to readable format
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    return 'Invalid Date'
  }
}