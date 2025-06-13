# AIA Insurance Advisor - Myanmar Edition

A modern, professional insurance recommendation SaaS platform built specifically for AIA Myanmar's insurance advisory services.

## 🚀 Live Demo

**[https://aia-advisor.web.app](https://aia-advisor.web.app)**

## 📋 Overview

The AIA Insurance Advisor is a comprehensive web application that streamlines the insurance consultation process through an intuitive 3-step wizard. It uses real AIA Myanmar premium data to provide accurate quotes and generates professional PDF reports for customers.

## ✨ Key Features

### 🎯 **Core Functionality**
- **3-Step Insurance Wizard** - Client Data → Product Selection → Report Generation
- **Real Premium Calculations** - Authentic AIA Myanmar premium tables
- **Professional PDF Reports** - Downloadable insurance recommendations with AIA branding
- **Mobile-Responsive Design** - Optimized for all devices
- **Session Persistence** - Auto-saves client data between sessions

### 🔐 **Authentication & Security**
- **Firebase Authentication** - Email/password and Google sign-in
- **Secure User Profiles** - Isolated user data with Firestore
- **Session Management** - Persistent login with secure tokens
- **Security Rules** - Comprehensive Firestore access control

### 💳 **Subscription & Quota System**
- **Free Trial** - 5 quotes for new users
- **Unlimited Plans** - Monthly, 6-month, and 12-month options
- **Grace Period** - 7 days with 5 quotes/day after subscription expires
- **Real-time Quota Tracking** - Visual indicators and warnings
- **Usage History** - Complete audit trail of generated quotes

### 🏥 **Insurance Products Supported**
- **One Health Solution (OHS)** - 7 medical insurance plans
- **Universal Life Insurance** - 6 flexible life insurance plans
- **Short Term Endowment** - 5 term life insurance options  
- **Cancer Care Coverage** - Specialized cancer protection rider

### 💰 **Premium Features**
- Age and gender-specific pricing
- Insurance age calculations (real age + 1)
- Myanmar Kyat (MMK) formatting with Lakh notation
- Real-time premium updates
- Product eligibility validation

## 🛠 Tech Stack

- **Frontend**: Next.js 15.2.4 with React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **PDF Generation**: jsPDF with autoTable
- **Backend**: Firebase (Auth, Firestore)
- **Hosting**: Firebase Hosting
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Firebase project (for authentication)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/aia-insurance-advisor.git
   cd aia-insurance-advisor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Set up Firestore security rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Build the application
pnpm build

# Deploy to Firebase
pnpm deploy
```

## 📁 Project Structure

```
aia-insurance-advisor/
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   └── login/               # Login/signup page
│   ├── profile/                 # User profile & subscription
│   ├── privacy/                 # Privacy policy
│   ├── terms/                   # Terms of service
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main application
├── components/                   # React components
│   ├── auth/                    # Auth components
│   │   ├── auth-guard.tsx      # Route protection
│   │   └── access-denied.tsx   # Access denial UI
│   ├── ui/                      # Reusable UI components
│   ├── client-data-step.tsx     # Step 1: Client info
│   ├── product-selection-step.tsx # Step 2: Product selection
│   ├── report-generation-step.tsx # Step 3: Report generation
│   └── quota-guard.tsx          # Quota management wrapper
├── contexts/                    # React contexts
│   └── auth-context.tsx         # Authentication state
├── data/                        # Premium data and products
│   ├── aia-products.ts          # Product catalog
│   ├── subscription-plans-data.ts # Pricing plans
│   └── *-premium-data.ts        # Premium tables
├── hooks/                       # Custom React hooks
│   ├── use-quota.ts             # Quota management
│   └── use-subscription-plans.ts # Subscription data
├── lib/                         # Utility libraries
│   ├── firebase.ts              # Firebase configuration
│   ├── quota-service.ts         # Quota business logic
│   ├── session-storage.ts       # Client data persistence
│   └── user-utils.ts            # User helper functions
├── types/                       # TypeScript definitions
├── utils/                       # Utility functions
├── public/                      # Static assets
├── scripts/                     # Admin scripts
│   ├── manage-upgrades.js       # Upgrade request management
│   ├── admin-utils.js           # Admin utility functions
│   ├── firebase-admin-init.js   # Firebase Admin SDK setup
│   └── setup.js                 # Setup wizard
└── firestore.rules              # Security rules
```

## 💡 Key Features Explained

### **Authentication System**
- Email/password registration with display name
- Google OAuth integration
- Automatic user profile creation
- Secure session management
- Protected routes with AuthGuard

### **Quota & Subscription Management**
- **Free Trial**: 5 quotes for new users
- **Unlimited Plans**: 
  - Monthly: 15,000 MMK/month
  - 6 Months: 10,000 MMK/month (25% off)
  - 12 Months: 8,000 MMK/month (47% off)
- **Grace Period**: 7 days with 5 quotes/day after expiration
- **Visual Indicators**: Badge showing remaining quota
- **Upgrade Prompts**: Smart upgrade suggestions

### **Smart Product Selection**
- All products are optional (no forced selections)
- Universal Life and Short Term Endowment are mutually exclusive
- Dynamic age validation prevents invalid selections
- Real-time premium calculations
- Health tier options for Universal Life

### **Professional PDF Reports**
- AIA-branded document design
- Comprehensive coverage details table
- Customer information summary
- Professional recommendation text
- Timestamped reports with unique IDs

### **Myanmar Market Optimized**
- Currency formatting with Lakh notation (L)
- Insurance age calculations (real age + 1)
- Local business conventions
- Mobile-first design for field agents

## 📊 Premium Data

The application uses authentic AIA Myanmar premium tables:

- **OHS Plans**: 7 plans with age-specific pricing (0-80 years)
- **Universal Life**: 6 plans with 3 health tiers and age groups
- **Short Term Endowment**: 5 coverage levels with gender-specific rates
- **Cancer Care**: Age-specific pricing (1-60 years) for both genders

## 🎨 Design System

- **Colors**: AIA red brand colors (#DC2626) throughout
- **Typography**: Professional, readable font hierarchy
- **Components**: shadcn/ui for consistency and accessibility
- **Animations**: Subtle Framer Motion interactions
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Add Firebase config to `.env.local`

### Build Configuration
- Next.js static export enabled
- TypeScript strict mode
- Tailwind CSS optimization
- Bundle size optimization

## 📱 Mobile Support

- Touch-optimized interface
- Responsive table rendering
- Mobile-specific PDF generation
- Viewport optimization
- Offline-capable session storage

## 🚀 Deployment

### Firebase Hosting
```bash
# One-command deploy
pnpm deploy

# Or step by step
pnpm build
firebase deploy --only hosting
```

### Environment Variables
Required for authentication:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for AIA Myanmar's internal use. All premium data and calculations are based on official AIA Myanmar documentation.

## 🔮 Recent Updates

- ✅ Firebase Authentication integration
- ✅ User profile management
- ✅ Subscription and quota system
- ✅ Grace period implementation
- ✅ Session persistence
- ✅ Security rules and access control
- ✅ Admin CLI for upgrade management

## 👨‍💼 Admin Tools

### Upgrade Request Management

Admin scripts are available in the `scripts/` directory for managing subscription upgrades:

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
npm install

# Run setup wizard
npm run setup

# Test connection
npm test

# Launch admin console
npm run manage-upgrades
```

**Features:**
- Process pending upgrade requests
- Approve/reject with payment tracking
- View user subscription details
- Generate revenue statistics
- Manual subscription management
- User data export

See `scripts/README.md` for detailed admin documentation.

## 📞 Support

For technical support or business inquiries, please contact the AIA Myanmar IT department or development team.

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Built for**: AIA Myanmar Insurance Advisory Services

---

*Professional insurance recommendation platform designed specifically for the Myanmar market* 🇲🇲