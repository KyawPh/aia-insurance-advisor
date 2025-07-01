import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

// Validate environment variables
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS not set in .env file');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore();
const auth = getAuth();

// Test user emails to remove
const TEST_USER_EMAILS = [
  'test-expired-unlimited@example.com',
  'test-active-unlimited@example.com',
  'test-free-user@example.com'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deleteTestUsers() {
  log('\n=== Cleaning Up Test Users ===\n', 'blue');
  
  let deletedCount = 0;
  let errorCount = 0;

  try {
    // Method 1: Delete by email
    for (const email of TEST_USER_EMAILS) {
      log(`\nSearching for user with email: ${email}`, 'yellow');
      
      const usersSnapshot = await db.collection('users')
        .where('email', '==', email)
        .get();
      
      if (!usersSnapshot.empty) {
        for (const doc of usersSnapshot.docs) {
          const userData = doc.data();
          log(`Found user: ${userData.email} (ID: ${doc.id})`, 'yellow');
          
          try {
            // Delete from Firestore
            await doc.ref.delete();
            log(`✅ Deleted from Firestore: ${doc.id}`, 'green');
            
            // Also delete related usage records
            const usageSnapshot = await db.collection('usage')
              .where('userId', '==', doc.id)
              .get();
            
            if (!usageSnapshot.empty) {
              const batch = db.batch();
              usageSnapshot.docs.forEach(usageDoc => {
                batch.delete(usageDoc.ref);
              });
              await batch.commit();
              log(`✅ Deleted ${usageSnapshot.size} usage records`, 'green');
            }
            
            // Try to delete from Auth (may not exist)
            try {
              await auth.deleteUser(doc.id);
              log(`✅ Deleted from Auth: ${doc.id}`, 'green');
            } catch (authError) {
              // User might not exist in Auth, which is fine
              if (authError.code !== 'auth/user-not-found') {
                log(`⚠️  Auth deletion failed: ${authError.message}`, 'yellow');
              }
            }
            
            deletedCount++;
          } catch (error) {
            log(`❌ Error deleting user ${doc.id}: ${error.message}`, 'red');
            errorCount++;
          }
        }
      } else {
        log(`No user found with email: ${email}`, 'yellow');
      }
    }
    
    // Method 2: Delete by UID pattern (test-*)
    log(`\nSearching for users with UID starting with 'test-'...`, 'yellow');
    
    const allUsersSnapshot = await db.collection('users').get();
    const testUsersByUid = allUsersSnapshot.docs.filter(doc => 
      doc.id.startsWith('test-') && doc.id.includes('-') && doc.id.length > 20
    );
    
    if (testUsersByUid.length > 0) {
      log(`Found ${testUsersByUid.length} test users by UID pattern`, 'yellow');
      
      for (const doc of testUsersByUid) {
        const userData = doc.data();
        log(`\nDeleting test user: ${userData.email || 'No email'} (ID: ${doc.id})`, 'yellow');
        
        try {
          // Delete from Firestore
          await doc.ref.delete();
          log(`✅ Deleted from Firestore: ${doc.id}`, 'green');
          
          // Delete related usage records
          const usageSnapshot = await db.collection('usage')
            .where('userId', '==', doc.id)
            .get();
          
          if (!usageSnapshot.empty) {
            const batch = db.batch();
            usageSnapshot.docs.forEach(usageDoc => {
              batch.delete(usageDoc.ref);
            });
            await batch.commit();
            log(`✅ Deleted ${usageSnapshot.size} usage records`, 'green');
          }
          
          deletedCount++;
        } catch (error) {
          log(`❌ Error deleting user ${doc.id}: ${error.message}`, 'red');
          errorCount++;
        }
      }
    } else {
      log(`No users found with UID pattern 'test-*'`, 'yellow');
    }
    
    // Summary
    log('\n=== Cleanup Summary ===', 'blue');
    log(`Total users deleted: ${deletedCount}`, deletedCount > 0 ? 'green' : 'yellow');
    log(`Errors encountered: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
    if (deletedCount === 0) {
      log('\nNo test users found to delete.', 'yellow');
    } else {
      log(`\n✅ Successfully cleaned up ${deletedCount} test users!`, 'green');
    }
    
  } catch (error) {
    log(`\n❌ Cleanup error: ${error.message}`, 'red');
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the cleanup
deleteTestUsers();