const fetch = require('node-fetch');

// Configuration
const FUNCTION_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/sendTelegramNotification';
const ID_TOKEN = 'YOUR_FIREBASE_ID_TOKEN'; // Get this from Firebase Auth

async function testTelegramNotification() {
  try {
    console.log('Testing Telegram notification function...');
    
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ID_TOKEN}`,
      },
      body: JSON.stringify({
        type: 'new_signup',
        userData: {
          email: 'test@example.com',
          displayName: 'Test User',
          signupTime: new Date().toISOString(),
        },
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result);
    } else {
      console.error('❌ Error:', response.status, result);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

async function testHealthCheck() {
  try {
    console.log('\nTesting health check endpoint...');
    
    const healthUrl = FUNCTION_URL.replace('sendTelegramNotification', 'healthCheck');
    const response = await fetch(healthUrl);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', result);
    } else {
      console.error('❌ Health check failed:', response.status, result);
    }
  } catch (error) {
    console.error('❌ Health check request failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Firebase Functions Test Script');
  console.log('=============================\n');
  
  // Test health check first
  await testHealthCheck();
  
  // Then test the main function
  await testTelegramNotification();
}

runTests();