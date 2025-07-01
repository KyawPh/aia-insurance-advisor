#!/usr/bin/env node

/**
 * Generate a secure random secret for internal API authentication
 */

import crypto from 'crypto';

// Generate a 32-byte random string
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secret = generateSecret();

console.log('\n🔐 Generated Secure Secret:\n');
console.log(secret);
console.log('\n📋 Add this to your .env.production file:');
console.log(`NEXT_PUBLIC_INTERNAL_SECRET=${secret}`);
console.log(`INTERNAL_SECRET=${secret}`);
console.log('\n⚠️  Keep this secret safe and never commit it to version control!\n');