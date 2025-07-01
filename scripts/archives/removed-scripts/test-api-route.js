#!/usr/bin/env node

/**
 * Test the API route directly
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testApiRoute() {
  const apiUrl = 'http://localhost:3000/api/telegram-notify';
  const secret = process.env.INTERNAL_SECRET || '9c8787ef817658f5e76fa0e282240072c0be9c6edd1178270fff0c57c2a6252e';
  
  console.log('🔍 Testing API route:', apiUrl);
  console.log('🔑 Using secret:', secret);

  const testData = {
    type: 'new_signup',
    secret: secret,
    userData: {
      email: 'test@example.com',
      displayName: 'Test User',
      signupTime: new Date().toISOString(),
      totalUsers: 100
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API route test successful:', data);
    } else {
      console.error('❌ API route test failed:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Error testing API route:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

// Run the test
testApiRoute();