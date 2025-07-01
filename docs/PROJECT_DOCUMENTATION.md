# AIA Insurance Advisor - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Business Logic](#business-logic)
6. [Data Flow](#data-flow)
7. [Authentication & Security](#authentication--security)
8. [Subscription System](#subscription-system)
9. [Database Structure](#database-structure)
10. [Cloud Functions](#cloud-functions)
11. [Recent Changes](#recent-changes)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)
14. [Known Issues](#known-issues)

## Project Overview

**AIA Insurance Advisor** is a professional web application designed for independent insurance agents in Myanmar to generate insurance quotes and recommendations for AIA products. The application provides a streamlined 3-step process for creating professional insurance proposals.

### Key Business Value
- Simplifies complex insurance calculations
- Generates professional PNG reports for clients
- Manages agent quotas and subscriptions
- Supports Myanmar-specific formatting (MMK currency, insurance age calculations)

### Target Users
- Independent insurance agents
- AIA insurance brokers
- Financial advisors in Myanmar

## Architecture

### Application Type
- **Frontend**: Next.js 15 with React 19 (App Router)
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Hosting**: Firebase Hosting (Multi-site: beta and stable)

### Key Design Patterns
1. **Component-Based Architecture**: Modular React components
2. **Context API**: Global state management for auth and quota
3. **Service Layer**: Abstracted business logic in service classes
4. **Type Safety**: Full TypeScript implementation

## Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Image Generation**: html2canvas (PNG report generation)

### Backend
- **Authentication**: Firebase Auth (Google OAuth only)
- **Database**: Cloud Firestore
- **Cloud Functions**: Node.js functions for backend processes
- **Admin Tools**: Custom Node.js scripts with Firebase Admin SDK

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js build system
- **Deployment**: Firebase CLI
- **Version Control**: Git

## Core Features

### 1. Three-Step Quote Generation
```
Step 1: Client Data Collection
├── Name, Date of Birth, Gender
├── Age calculation (insurance age = real age + 1)
└── Session persistence

Step 2: Product Selection
├── One Health Solution (OHS) - 7 plans
├── Universal Life Insurance - 6 plans
├── Term Life Insurance - 5 plans
├── Cancer Care Rider
└── Real-time premium calculations

Step 3: Report Generation
├── Professional PNG report
├── Comprehensive coverage table
├── Download/Share functionality
└── Usage tracking
```

### 2. Subscription Plans
- **Free Plan**: 50 quotes per calendar month
- **Unlimited Plan**:
  - Monthly: 15,000 MMK
  - 6 Months: 60,000 MMK (20% discount)
  - 12 Months: 96,000 MMK (47% discount)

### 3. Key Features Implementation

#### Quote Generation Flow
1. User logs in via Google OAuth
2. Enters client information (persisted in session storage)
3. Selects insurance products with validation
4. Generates PNG report using html2canvas
5. Tracks usage in Firestore

#### Premium Calculation
- Age and gender-based tables
- Product-specific pricing logic
- Myanmar insurance age (real age + 1)
- Real-time calculation updates

## Business Logic

### Quota Management (`/lib/quota-service.ts`)
```typescript
// Key methods:
- getUserQuota(): Get current quota status
- consumeQuota(): Deduct quota for actions
- trackActivity(): Track non-quota actions
- checkAndResetQuota(): Monthly reset logic
```

### Subscription Logic
1. **Free Users**: 
   - 50 quotes per calendar month
   - Auto-reset on 1st of each month
   - Visual quota indicators

2. **Unlimited Users**:
   - No quota restrictions
   - Subscription end date tracking
   - No grace period (removed)

### Product Validation Rules
- Universal Life and Term Life are mutually exclusive
- Age restrictions per product
- Gender-specific premium tables
- All products are optional

## Data Flow

### User Journey
```
Login → Profile Creation → Quote Generation → Report Download
   ↓          ↓                ↓                    ↓
Firebase   Firestore      Session Storage    PNG Generation
  Auth      Database         (Client)         (html2canvas)
```

### State Management
1. **Auth Context**: User authentication state
2. **Quota Hook**: Real-time quota tracking
3. **Session Storage**: Client data persistence
4. **Firestore**: Long-term data storage

## Authentication & Security

### Authentication Flow
1. Google OAuth only (no email/password)
2. Automatic user profile creation on first login
3. JWT token management by Firebase
4. Protected routes with AuthGuard component

### Security Measures
- **Firestore Rules**: User-scoped data access
- **Input Sanitization**: XSS prevention
- **CSP Headers**: Content Security Policy
- **HTTPS Only**: Enforced secure connections
- **Error Boundaries**: Graceful error handling

### Firestore Security Rules
```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Usage records are immutable
match /usage/{usageId} {
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if false;
}
```

## Subscription System

### Upgrade Flow
1. User initiates upgrade from profile
2. Creates upgrade request in Firestore
3. Shows payment instructions
4. Admin processes payment manually
5. Activates subscription

### Payment Methods
- Wave Money
- KBZ Pay
- Bank Transfer

### Admin Tools (`/scripts/`) - Simplified to 4 Scripts
- `manage-upgrades.js`: Main console with 3 options (process requests, create manual subscription, list users)
- `admin-utils.js`: Subscription management functions
- `firebase-admin-init.js`: Firebase configuration
- `list-users.js`: User listing and export
- All other scripts archived to `/scripts/archives/removed-scripts/`

## Database Structure

### Collections

#### `users`
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  fullName: string,
  photoURL: string,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  lastActivity: Timestamp,
  subscription: {
    plan: 'free' | 'unlimited',
    billingPeriod: 'trial' | 'monthly' | '6months' | '12months',
    quotaLimit: number,
    quotaUsed: number,
    lastResetDate: Timestamp,
    isActive: boolean,
    subscriptionStart: Timestamp,
    subscriptionEnd: Timestamp | null,
    paymentMethod?: string,
    autoRenew: boolean
  }
}
```

#### `usage`
```javascript
{
  userId: string,
  action: 'quote_generated' | 'pdf_downloaded' | 'report_viewed',
  timestamp: Timestamp,
  metadata: {
    clientName: string,
    totalPremium: number,
    selectedProducts: string[],
    format?: 'PNG',
    viewMethod?: 'download' | 'share'
  },
  quotaConsumed: number,
  subscriptionStatus: string
}
```

#### `upgradeRequests`
```javascript
{
  userId: string,
  userEmail: string,
  userName: string,
  plan: 'unlimited',
  billingPeriod: 'monthly' | '6months' | '12months',
  amount: number,
  paymentMethod: string,
  phoneNumber?: string,
  notes?: string,
  status: 'pending' | 'processing' | 'completed' | 'rejected',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  processedAt?: Timestamp,
  processedBy?: string,
  paymentReference?: string
}
```

## Cloud Functions

### `onNewUserCreated`
- **Trigger**: New user document creation in Firestore
- **Action**: Sends Telegram notification about new signup
- **Configuration**: Requires Telegram bot token and chat ID

## Recent Changes

### Major Updates (2025)
1. **Grace Period Removal**
   - Removed 7-day grace period functionality
   - Cleaned up related UI components
   - Simplified subscription logic

2. **Telegram Notification Consolidation**
   - Removed direct API endpoint
   - Kept only Firestore trigger method
   - More secure and reliable

3. **PDF to PNG Migration**
   - Changed from jsPDF to html2canvas
   - Better mobile compatibility
   - Maintained tracking with 'pdf_downloaded' action

4. **Quota System Update**
   - Increased free quota from 5 to 50
   - Promotional period implementation
   - Monthly reset logic

## Development Guide

### Prerequisites
- Node.js 18+
- Firebase project
- Google Cloud Console access

### Setup Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Set up Firebase project
5. Deploy Firestore rules
6. Run development server: `npm run dev`

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Admin Setup
```bash
cd scripts
npm install
# Add serviceAccountKey.json
npm run admin
```

## Deployment

### Firebase Hosting Sites
- **Beta**: `aia-advisor-b5760.web.app`
- **Stable**: `insurance-advisor.web.app`

### Deployment Commands
```bash
# Deploy to beta
npm run deploy:beta

# Deploy to stable
npm run deploy:stable

# Deploy to all sites
npm run deploy:all

# Deploy functions
firebase deploy --only functions
```

### Build Process
1. Next.js static export
2. Firebase hosting upload
3. Function deployment (if needed)

## Known Issues

### Current Limitations
1. **Manual Payment Processing**: No automated payment gateway
2. **Tracking Nomenclature**: Still uses 'pdf_downloaded' for PNG downloads
3. **Mobile Share API**: Limited browser support
4. **Firestore Rules**: Plan validation needs update for 'unlimited' plan

### Future Considerations
1. **Payment Integration**: Automated payment processing
2. **Email Notifications**: User communication system
3. **Multi-language Support**: Myanmar language UI
4. **Offline Capability**: PWA implementation
5. **Analytics Dashboard**: Usage statistics for agents

### Performance Notes
- PNG generation can be slow on older devices
- Large reports may exceed mobile memory limits
- Session storage has 5MB limit per domain

## Maintenance Notes

### Regular Tasks
1. Monitor Firebase usage and costs
2. Process upgrade requests daily
3. Review error logs in Firebase Console
4. Update premium tables as needed
5. Clean up old usage records (optional)

### Security Considerations
- Keep Firebase Admin SDK keys secure
- Regular security rule audits
- Monitor for unusual usage patterns
- Update dependencies regularly

---

**Last Updated**: January 2025
**Version**: 3.0.0
**Maintained By**: Advisory Solutions