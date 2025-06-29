// Input sanitization utilities for XSS prevention

// HTML entities that need to be escaped
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

// Regular expression for HTML entities
const HTML_ENTITY_REGEX = /[&<>"'\/]/g

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return ''
  return str.replace(HTML_ENTITY_REGEX, (match) => HTML_ENTITIES[match] || match)
}

/**
 * Sanitize user input for display
 * Removes potentially dangerous characters and scripts
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Remove script tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Escape HTML entities
  sanitized = escapeHtml(sanitized)
  
  return sanitized
}

/**
 * Sanitize a name field (letters, spaces, hyphens, apostrophes only)
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return ''
  
  // Don't trim or process if the user is still typing
  // This preserves spaces while typing
  if (name.length === 0) return name
  
  // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
  // Allow Unicode letters for international names
  let sanitized = name.replace(/[^\p{L}\s\-']/gu, '')
  
  // Only remove multiple consecutive spaces (keep single spaces)
  sanitized = sanitized.replace(/\s{2,}/g, ' ')
  
  // Don't trim while user is typing - only limit length
  return sanitized.substring(0, 100)
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  
  // Basic email sanitization - remove spaces and convert to lowercase
  return email.trim().toLowerCase()
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(value: string | number): string {
  if (typeof value === 'number') return value.toString()
  if (typeof value !== 'string') return '0'
  
  // Remove non-numeric characters except decimal point
  return value.replace(/[^0-9.]/g, '')
}

/**
 * Sanitize date input (supports DD/MM/YYYY and YYYY-MM-DD formats)
 */
export function sanitizeDate(date: string): string {
  if (typeof date !== 'string') return ''
  
  // Allow DD/MM/YYYY format (used in the app)
  const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/
  if (ddmmyyyyRegex.test(date)) return date
  
  // Allow YYYY-MM-DD format
  const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/
  if (yyyymmddRegex.test(date)) return date
  
  // Allow partial dates while typing (e.g., "12", "12/", "12/05", etc.)
  const partialDateRegex = /^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/
  if (partialDateRegex.test(date)) return date
  
  return ''
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return ''
  
  // Remove non-numeric characters except +, -, (), and spaces
  return phone.replace(/[^0-9+\-() ]/g, '').substring(0, 20)
}

/**
 * Sanitize text for Myanmar language support
 * Preserves Myanmar Unicode characters while removing dangerous content
 */
export function sanitizeMyanmarText(text: string): string {
  if (typeof text !== 'string') return ''
  
  // Remove script tags and event handlers
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Preserve Myanmar Unicode range (U+1000 to U+109F and U+AA60 to U+AA7F)
  // while escaping HTML entities
  return escapeHtml(sanitized)
}

/**
 * Create a safe ID from user input (for HTML IDs, etc.)
 */
export function createSafeId(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Replace non-alphanumeric characters with hyphens
  let safeId = input.replace(/[^a-zA-Z0-9]/g, '-')
  
  // Remove consecutive hyphens
  safeId = safeId.replace(/-+/g, '-')
  
  // Remove leading/trailing hyphens
  safeId = safeId.replace(/^-|-$/g, '')
  
  // Ensure it starts with a letter (HTML ID requirement)
  if (!/^[a-zA-Z]/.test(safeId)) {
    safeId = 'id-' + safeId
  }
  
  return safeId.toLowerCase()
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return ''
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    return parsed.toString()
  } catch {
    // If URL parsing fails, return empty string
    return ''
  }
}