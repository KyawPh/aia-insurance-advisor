// Production-safe logging utility
// Only logs in development environment and sanitizes sensitive data

const isDevelopment = process.env.NODE_ENV === 'development'

// List of sensitive keys to redact
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'email',
  'name',
  'dateOfBirth',
  'gender',
  'uid',
  'userId',
  'sessionId',
  'private_key',
  'client_email',
  'client_id',
]

// Sanitize data by redacting sensitive information
function sanitizeData(data: any): any {
  if (!data) return data
  
  if (typeof data === 'string') {
    // Check if string looks like email
    if (data.includes('@')) {
      return data.replace(/([^@]{1,3})[^@]*(@.*)/, '$1***$2')
    }
    return data
  }
  
  if (typeof data !== 'object') {
    return data
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item))
  }
  
  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    
    // Check if key contains sensitive words
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// Sanitize error objects
function sanitizeError(error: any): any {
  if (!error) return error
  
  const sanitized: any = {
    message: error.message || 'Unknown error',
    code: error.code,
    name: error.name,
  }
  
  // Don't include stack traces in production
  if (isDevelopment && error.stack) {
    sanitized.stack = error.stack
  }
  
  // Sanitize any additional properties
  if (error.details) {
    sanitized.details = sanitizeData(error.details)
  }
  
  return sanitized
}

// Logger object with different log levels
export const logger = {
  // General logging
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(message, data ? sanitizeData(data) : '')
    }
  },
  
  // Information logging
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.info(message, data ? sanitizeData(data) : '')
    }
  },
  
  // Warning logging
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data ? sanitizeData(data) : '')
    }
  },
  
  // Error logging
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error ? sanitizeError(error) : '')
    }
    // In production, you could send errors to a monitoring service here
    // Example: sendToErrorTracking(message, error)
  },
  
  // Debug logging (only in development)
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(message, data ? sanitizeData(data) : '')
    }
  },
}

// Export a function to check if we're in development
export const isDevEnvironment = () => isDevelopment