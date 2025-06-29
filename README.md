# Insurance Advisor Pro

A modern, professional insurance advisory tool built for independent insurance agents specializing in AIA products in Myanmar.

## 🚀 Live Demo

**Beta Site**: [https://aia-advisor-b5760.web.app](https://aia-advisor-b5760.web.app)  
**Stable Site**: [https://insurance-advisor.web.app](https://insurance-advisor.web.app)

## 📋 Overview

Insurance Advisor Pro is an independent platform that streamlines the insurance consultation process through an intuitive 3-step wizard. It provides accurate premium calculations and generates professional PNG reports for customers.

**⚠️ Disclaimer**: This is an independent tool created for insurance agents. It is not affiliated with, endorsed by, or sponsored by AIA or any other insurance company.

## ✨ Key Features

### 🎯 **Core Functionality**
- **3-Step Insurance Wizard** - Client Data → Product Selection → Report Generation
- **Real Premium Calculations** - Based on current insurance premium tables
- **Professional PNG Reports** - Downloadable insurance recommendations
- **Mobile-Responsive Design** - Optimized for all devices
- **Session Persistence** - Auto-saves client data between sessions

### 🔐 **Authentication & Security**
- **Google Authentication** - Secure sign-in with Google accounts
- **User Profiles** - Isolated user data with Firestore
- **Session Management** - Persistent login with secure tokens
- **Enhanced Security** - CSP headers, input sanitization, error boundaries
- **Production-Safe Logging** - Sensitive data protection

### 💳 **Subscription & Quota System**
- **Free Plan** - 50 quotes per calendar month
- **Unlimited Plans** - Monthly, 6-month, and 12-month options
- **Grace Period** - 7 days with daily quota after subscription expires
- **Real-time Quota Tracking** - Visual indicators and warnings
- **Usage History** - Complete audit trail of generated quotes

### 🏥 **Insurance Products Supported**
- **One Health Solution (OHS)** - 7 medical insurance plans
- **Universal Life Insurance** - 6 flexible life insurance plans
- **Term Life Insurance** - 5 term life insurance options  
- **Cancer Care Coverage** - Specialized cancer protection rider

### 💰 **Premium Features**
- Age and gender-specific pricing
- Insurance age calculations (real age + 1)
- Myanmar Kyat (MMK) formatting with Lakh notation
- Real-time premium updates
- Product eligibility validation

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **Image Generation**: html2canvas for PNG reports
- **Backend**: Firebase (Auth, Firestore)
- **Hosting**: Firebase Hosting (Multi-site)
- **Security**: CSP headers, input sanitization, error boundaries

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
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
   npm install
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
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Build the application
npm run build

# Deploy to beta site
npm run deploy:beta

# Deploy to stable site
npm run deploy:stable

# Deploy to all sites
npm run deploy:all
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
│   ├── qr/                      # QR code sharing
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main application
├── components/                   # React components
│   ├── auth/                    # Auth components
│   ├── ui/                      # Reusable UI components
│   ├── client-data-step.tsx     # Step 1: Client info
│   ├── product-selection-step.tsx # Step 2: Product selection
│   ├── report-generation-step.tsx # Step 3: Report generation
│   ├── error-boundary.tsx       # Error handling
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
│   ├── logger.ts                # Production-safe logging
│   ├── sanitize.ts              # Input sanitization
│   └── user-utils.ts            # User helper functions
├── types/                       # TypeScript definitions
├── utils/                       # Utility functions
├── public/                      # Static assets
│   ├── logo.png                 # Main logo
│   └── logo-r.png               # Report logo
├── scripts/                     # Admin scripts
│   ├── manage-upgrades.js       # Upgrade request management
│   ├── serviceAccountKey.json   # (gitignored) Firebase admin key
│   └── README.md                # Admin documentation
├── firebase.json                # Multi-site hosting config
└── firestore.rules              # Security rules
```

## 🔒 Security Features

### Recently Implemented
- **Service Account Protection**: Firebase admin keys excluded from repository
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, etc.
- **Input Sanitization**: XSS prevention for all user inputs
- **Production Logging**: Sensitive data redaction in logs
- **Error Boundaries**: Graceful error handling without exposing details
- **HTTPS Only**: Enforced secure connections

### Security Best Practices
- Environment variables for sensitive configuration
- Firestore security rules for data access control
- Input validation and sanitization
- No client-side secrets or API keys
- Regular security audits with `npm audit`

## 💡 Key Features Explained

### **Authentication System**
- Google OAuth integration only
- Automatic user profile creation
- Secure session management
- Protected routes with AuthGuard
- Privacy policy and terms compliance

### **Quota & Subscription Management**
- **Free Plan**: 50 quotes per calendar month
- **Unlimited Plans**: 
  - Monthly: 15,000 MMK/month
  - 6 Months: 75,000 MMK (10,000 MMK/month - 33% off)
  - 12 Months: 120,000 MMK (8,000 MMK/month - 47% off)
- **Grace Period**: 7 days with daily quota after expiration
- **Visual Indicators**: Badge showing remaining quota
- **Upgrade Prompts**: Smart upgrade suggestions

### **Smart Product Selection**
- All products are optional (no forced selections)
- Universal Life and Term Life are mutually exclusive
- Dynamic age validation prevents invalid selections
- Real-time premium calculations
- Health tier options for Universal Life

### **Professional PNG Reports**
- Clean, professional document design
- Comprehensive coverage details table
- Customer information summary
- Professional recommendation text
- Timestamped reports with unique IDs

### **Myanmar Market Optimized**
- Currency formatting with Lakh notation (L)
- Insurance age calculations (real age + 1)
- Local business conventions
- Mobile-first design for field agents
- Myanmar language support in reports

## 🎨 Design System

- **Colors**: Professional red accent colors (#DC2626)
- **Typography**: Clean, readable font hierarchy
- **Components**: shadcn/ui for consistency and accessibility
- **Animations**: Subtle Framer Motion interactions
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Google provider)
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Add Firebase config to `.env.local`

### Multi-Site Deployment
The project supports two deployment targets:
- **Beta**: For testing new features
- **Stable**: For production use

Configure in `.firebaserc` and use specific deploy commands.

## 📱 Mobile Support

- Touch-optimized interface
- Responsive table rendering
- Mobile-specific report generation
- Viewport optimization
- Offline-capable session storage

## 🚀 Deployment

### Firebase Hosting
```bash
# Deploy to beta site
npm run deploy:beta

# Deploy to stable site
npm run deploy:stable

# Deploy to all sites
npm run deploy:all
```

### Environment Variables
Required for authentication:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 👨‍💼 Admin Tools

### Upgrade Request Management

Admin scripts are available in the `scripts/` directory for managing subscription upgrades:

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
npm install

# Set up Firebase admin credentials
# Copy serviceAccountKey.json to scripts directory

# Run admin console
npm run admin
```

**Features:**
- Process pending upgrade requests
- Approve/reject with payment tracking
- View user subscription details
- Generate revenue statistics
- Manual subscription management
- User data export

See `scripts/README.md` for detailed admin documentation.

## 🔮 Recent Updates

- ✅ Complete rebranding to Insurance Advisor Pro
- ✅ Enhanced security implementation
- ✅ Multi-site deployment (beta/stable)
- ✅ PNG report generation (replaced PDF)
- ✅ Production-safe logging system
- ✅ Input sanitization for XSS prevention
- ✅ Error boundaries for graceful error handling
- ✅ Privacy policy and terms of service pages
- ✅ QR code sharing functionality
- ✅ Improved quota system (50 free quotes/month)

## 🤝 Contributing

This is a private project for insurance advisory services. For contributions or suggestions, please contact the development team.

## 📄 License

This project is proprietary software developed for independent insurance advisors. All rights reserved.

## ⚖️ Legal Notice

This is an independent tool and is not affiliated with, endorsed by, or sponsored by AIA or any other insurance company. All insurance calculations should be verified with official documentation.

## 📞 Support

For technical support or inquiries:
- Email: kyaw.debug@gmail.com
- GitHub Issues: [Create an issue](https://github.com/[username]/aia-insurance-advisor/issues)

---

**Version**: 3.0.0  
**Last Updated**: June 2025  
**Built by**: Advisory Solutions

---

*Professional insurance advisory tool for independent agents* 🏢