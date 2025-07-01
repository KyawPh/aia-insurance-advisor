# AIA Insurance Advisor - Codebase Structure

## Directory Overview
```
aia-insurance-advisor/
├── app/                        # Next.js App Router
├── components/                 # React Components
├── contexts/                   # React Context Providers
├── data/                       # Static Data & Constants
├── hooks/                      # Custom React Hooks
├── lib/                        # Core Libraries & Services
├── types/                      # TypeScript Type Definitions
├── utils/                      # Utility Functions
├── public/                     # Static Assets
├── scripts/                    # Admin & Utility Scripts
├── functions/                  # Firebase Cloud Functions
└── [config files]              # Configuration Files
```

## Detailed Structure

### `/app` - Next.js App Router
```
app/
├── (protected)/                # Protected routes group
│   ├── layout.tsx             # Protected layout wrapper
│   ├── advisor/               # Main application
│   │   └── page.tsx           # 3-step wizard interface
│   └── profile/               # User profile
│       └── page.tsx           # Profile & subscription management
├── (public)/                   # Public routes group
│   ├── page.tsx               # Landing page (redirects to login)
│   ├── privacy/               # Privacy policy
│   │   └── page.tsx
│   └── terms/                 # Terms of service
│       └── page.tsx
├── api/                        # API routes
│   └── telegram-notify/       # Telegram notification endpoint
│       └── route.ts           # (Deprecated - to be removed)
├── auth/                       # Authentication
│   └── login/
│       └── page.tsx           # Google OAuth login page
├── qr/                         # QR code sharing
│   └── page.tsx               # QR code generation page
├── test/                       # Test pages (development)
├── globals.css                 # Global CSS styles
├── layout.tsx                  # Root layout with providers
└── not-found.tsx              # 404 error page
```

### `/components` - React Components
```
components/
├── auth/
│   ├── auth-guard.tsx         # Route protection HOC
│   └── access-denied.tsx      # Unauthorized access component
├── ui/                         # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── [30+ UI components]
│   └── use-toast.ts           # Toast hook
├── client-data-step.tsx        # Step 1: Client information form
├── product-selection-step.tsx  # Step 2: Insurance product selection
├── report-generation-step.tsx  # Step 3: PNG report generation
├── quota-guard.tsx            # Quota checking wrapper
├── error-boundary.tsx         # Error handling component
├── theme-provider.tsx         # Theme context provider
└── upgrade-payment-dialog.tsx  # Subscription upgrade modal
```

### `/contexts` - React Contexts
```
contexts/
└── auth-context.tsx           # Authentication state management
    ├── AuthContext
    ├── AuthProvider
    ├── User profile initialization
    └── Telegram notification trigger
```

### `/data` - Static Data & Constants
```
data/
├── aia-products.ts            # Product catalog and metadata
├── subscription-plans-data.ts  # Pricing plans configuration
├── ohs-premium-data.ts        # OHS insurance premium tables
├── universal-life-premium-data.ts  # Universal Life premiums
├── short-term-endowment-premium-data.ts  # Term Life premiums
└── cancer-care-premium-data.ts # Cancer rider premium data
```

### `/hooks` - Custom React Hooks
```
hooks/
├── use-quota.ts               # Quota management hook
│   ├── Real-time quota tracking
│   ├── Usage history
│   └── Activity tracking
├── use-subscription-plans.ts   # Subscription data hook
│   ├── Plan information
│   ├── Pricing utilities
│   └── Billing helpers
└── use-toast.ts               # Toast notifications (from UI)
```

### `/lib` - Core Libraries & Services
```
lib/
├── firebase.ts                # Firebase configuration
│   ├── App initialization
│   ├── Auth instance
│   └── Firestore instance
├── quota-service.ts           # Quota business logic
│   ├── getUserQuota()
│   ├── consumeQuota()
│   ├── trackActivity()
│   └── upgradePlan()
├── upgrade-service.ts         # Upgrade request management
│   ├── createUpgradeRequest()
│   ├── getUserUpgradeRequests()
│   └── getPaymentInstructions()
├── session-storage.ts         # Client data persistence
│   ├── saveClientData()
│   ├── getClientData()
│   └── clearSession()
├── logger.ts                  # Production-safe logging
├── sanitize.ts               # Input sanitization
└── user-utils.ts             # User helper functions
```

### `/types` - TypeScript Definitions
```
types/
└── insurance.ts              # Core type definitions
    ├── ClientData
    ├── ProductSelections
    ├── OHSPlan interfaces
    ├── UniversalLifePlan
    └── TermLifePlan
```

### `/utils` - Utility Functions
```
utils/
├── calculations.ts           # Age and date calculations
│   ├── calculateAge()
│   └── Insurance age logic
├── formatting.ts             # Number and currency formatting
│   ├── formatMMK()
│   └── Lakh notation
├── validations.ts           # Form validation schemas
│   └── Zod schemas
└── premium-tables.ts        # Premium calculation functions
    ├── getOHSPremium()
    ├── getUniversalLifePremium()
    ├── getTermLifePremium()
    └── getCancerRiderPremium()
```

### `/public` - Static Assets
```
public/
├── logo.png                 # Main application logo
├── logo-r.png              # Report generation logo
├── apple-icon.png          # Apple touch icon
├── icon-*.png              # Various favicon sizes
└── robots.txt              # SEO configuration
```

### `/scripts` - Admin Scripts (Simplified)
```
scripts/
├── manage-upgrades.js      # Main admin console (3 options only)
├── admin-utils.js         # Subscription utility functions
├── firebase-admin-init.js  # Firebase Admin SDK setup
├── list-users.js          # User listing and export
├── archives/              # Archived scripts
│   └── removed-scripts/   # 25 archived scripts
├── backups/               # Database backups
├── serviceAccountKey.json # (gitignored) Admin credentials
├── README.md             # Original documentation
└── README-SIMPLIFIED.md   # New simplified guide
```

### `/functions` - Cloud Functions
```
functions/
├── index.js               # Function definitions
│   └── onNewUserCreated   # Telegram notification trigger
├── package.json           # Function dependencies
└── .env                  # (gitignored) Function config
```

### Configuration Files
```
Root Directory:
├── package.json           # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── firebase.json         # Firebase hosting config
├── firestore.rules       # Firestore security rules
├── .firebaserc          # Firebase project aliases
├── .env.local           # (gitignored) Environment variables
├── .gitignore           # Git ignore patterns
└── README.md            # Project documentation
```

## Key File Relationships

### Authentication Flow
```
app/auth/login/page.tsx
    ↓ (Google OAuth)
contexts/auth-context.tsx
    ↓ (User creation)
lib/firebase.ts
    ↓ (Firestore)
functions/index.js (Telegram notification)
```

### Quote Generation Flow
```
app/(protected)/advisor/page.tsx
    ↓
components/client-data-step.tsx
    ↓ (Session storage)
components/product-selection-step.tsx
    ↓ (Premium calculation)
components/report-generation-step.tsx
    ↓ (PNG generation)
lib/quota-service.ts (Usage tracking)
```

### Subscription Management
```
app/(protected)/profile/page.tsx
    ↓
components/upgrade-payment-dialog.tsx
    ↓
lib/upgrade-service.ts
    ↓
scripts/manage-upgrades.js (Admin processing)
```

## Component Dependencies

### Core Components
- **AuthGuard**: Wraps all protected routes
- **QuotaGuard**: Checks quota before allowing actions
- **ErrorBoundary**: Catches and handles errors gracefully

### Service Layer
- **QuotaService**: Central quota management
- **UpgradeService**: Handles subscription upgrades
- **Session Storage**: Client data persistence

### Data Flow
1. User logs in → Auth Context
2. Client data → Session Storage
3. Product selection → Premium calculation
4. Report generation → Quota consumption
5. Usage tracking → Firestore

## Important Notes

### File Naming Conventions
- Components: PascalCase (e.g., `ClientDataStep.tsx`)
- Utilities: camelCase (e.g., `formatMMK.ts`)
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase interfaces

### Code Organization
- Business logic in `/lib` services
- UI components in `/components`
- Shared types in `/types`
- Static data in `/data`
- Utility functions in `/utils`

### State Management
- Global auth state: Context API
- Local component state: useState
- Form state: React Hook Form
- Server state: Direct Firestore queries

---

**Last Updated**: January 2025
**Maintained By**: Advisory Solutions