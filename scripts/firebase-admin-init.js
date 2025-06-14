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
  console.error('Please download your service account key from Firebase Console and set the path in .env');
  process.exit(1);
}

if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('Error: FIREBASE_PROJECT_ID not set in .env file');
  process.exit(1);
}

// Initialize Firebase Admin
let app;
try {
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, 'utf8')
  );

  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  console.error('Make sure your service account key file exists and is valid');
  process.exit(1);
}

// Export Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

// Billing period durations
export const BILLING_PERIODS = {
  monthly: { months: 1, label: '1 Month' },
  '6months': { months: 6, label: '6 Months' },
  '12months': { months: 12, label: '12 Months' }
};

// Subscription plan prices (in MMK)
export const SUBSCRIPTION_PRICES = {
  monthly: 15000,
  '6months': 60000,
  '12months': 96000
};

// Helper function to calculate subscription end date
export function calculateSubscriptionEndDate(startDate, billingPeriod) {
  const endDate = new Date(startDate);
  const period = BILLING_PERIODS[billingPeriod];
  
  if (!period) {
    throw new Error(`Invalid billing period: ${billingPeriod}`);
  }
  
  endDate.setMonth(endDate.getMonth() + period.months);
  return endDate;
}

// Helper function to format date
export function formatDate(date) {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to format currency
export function formatCurrency(amount) {
  return `${amount.toLocaleString()} MMK`;
}