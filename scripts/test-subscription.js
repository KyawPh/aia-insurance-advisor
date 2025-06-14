import { db, auth } from './firebase-admin-init.js';
import { FieldValue } from 'firebase-admin/firestore';

async function testSubscriptionManagement() {
  console.log('Testing Firebase subscription management...\n');
  
  const testEmail = 'test@example.com';
  const testUserId = 'test-user-' + Date.now();
  
  try {
    // Test 1: Create a test user
    console.log('1. Creating test user...');
    const userRecord = await auth.createUser({
      uid: testUserId,
      email: testEmail,
      password: 'testpassword123'
    });
    console.log('✓ User created successfully:', userRecord.uid);
    
    // Test 2: Create a subscription
    console.log('\n2. Creating subscription...');
    const subscription = {
      userId: testUserId,
      plan: 'starter',
      status: 'active',
      startDate: FieldValue.serverTimestamp(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      quota: {
        totalQuota: 10,
        usedQuota: 0,
        lastResetDate: FieldValue.serverTimestamp()
      }
    };
    
    await db.collection('subscriptions').doc(testUserId).set(subscription);
    console.log('✓ Subscription created successfully');
    
    // Test 3: Read the subscription
    console.log('\n3. Reading subscription...');
    const doc = await db.collection('subscriptions').doc(testUserId).get();
    if (doc.exists) {
      console.log('✓ Subscription data:', doc.data());
    }
    
    // Test 4: Update custom claims
    console.log('\n4. Setting custom claims...');
    await auth.setCustomUserClaims(testUserId, {
      subscriptionPlan: 'starter',
      subscriptionStatus: 'active'
    });
    console.log('✓ Custom claims set successfully');
    
    // Test 5: Verify custom claims
    console.log('\n5. Verifying custom claims...');
    const updatedUser = await auth.getUser(testUserId);
    console.log('✓ Custom claims:', updatedUser.customClaims);
    
    // Clean up: Delete test data
    console.log('\n6. Cleaning up test data...');
    await db.collection('subscriptions').doc(testUserId).delete();
    await auth.deleteUser(testUserId);
    console.log('✓ Test data cleaned up');
    
    console.log('\n✅ All tests passed! Firebase Admin SDK is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error('Full error:', error);
    
    // Try to clean up even if there was an error
    try {
      await db.collection('subscriptions').doc(testUserId).delete();
      await auth.deleteUser(testUserId);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
  
  process.exit(0);
}

testSubscriptionManagement();