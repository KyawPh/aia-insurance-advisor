# AIA Insurance Advisor - Myanmar Edition

A modern, professional insurance recommendation tool built specifically for AIA Myanmar's insurance advisory services.

## 🚀 Live Demo

**[https://aia-advisor.web.app](https://aia-advisor.web.app)**

## 📋 Overview

The AIA Insurance Advisor is a comprehensive web application that streamlines the insurance consultation process through an intuitive 3-step wizard. It uses real AIA Myanmar premium data to provide accurate quotes and generates professional PDF reports for customers.

## ✨ Features

### 🎯 **Core Functionality**
- **3-Step Insurance Wizard** - Client Data → Product Selection → Report Generation
- **Real Premium Calculations** - Authentic AIA Myanmar premium tables
- **Professional PDF Reports** - Downloadable insurance recommendations
- **Mobile-Responsive Design** - Optimized for all devices
- **Dynamic Age Validation** - Automatic product availability checking

### 🏥 **Insurance Products Supported**
- **One Health Solution (OHS)** - 7 medical insurance plans
- **Universal Life Insurance** - 6 flexible life insurance plans
- **Short Term Endowment** - 5 term life insurance options  
- **Cancer Care Coverage** - Specialized cancer protection

### 💰 **Premium Features**
- Age and gender-specific pricing
- Insurance age calculations (real age + 1)
- Myanmar Kyat (MMK) formatting with Lakh notation
- Real-time premium updates
- Optional product selection

## 🛠 Tech Stack

- **Frontend**: Next.js 15.2.4 with React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with Radix UI components
- **Animations**: Framer Motion
- **PDF Generation**: jsPDF with autoTable
- **Hosting**: Firebase Hosting
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
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

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Build the application
pnpm build

# Deploy to Firebase (if configured)
firebase deploy --only hosting
```

## 📁 Project Structure

```
aia-insurance-advisor/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── client-data-step.tsx     # Step 1: Client info
│   ├── product-selection-step.tsx # Step 2: Product selection
│   └── report-generation-step.tsx # Step 3: Report generation
├── data/                        # Premium data and products
│   ├── aia-products.ts          # Product catalog
│   ├── ohs-premium-data.ts      # OHS premium tables
│   ├── universal-life-premium-data.ts
│   ├── short-term-endowment-premium-data.ts
│   └── cancer-care-premium-data.ts
├── types/                       # TypeScript definitions
├── utils/                       # Utility functions
└── public/                      # Static assets
```

## 💡 Key Features Explained

### **Smart Product Selection**
- All products are optional (no forced selections)
- Universal Life and Short Term Endowment are mutually exclusive
- Dynamic age validation prevents invalid selections
- Real-time premium calculations

### **Professional PDF Reports**
- AIA-branded document design
- Comprehensive coverage details table
- Customer information summary
- Professional recommendation text
- Mobile-optimized generation

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

- **Colors**: AIA red brand colors throughout
- **Typography**: Professional, readable font hierarchy
- **Components**: Radix UI for accessibility
- **Animations**: Subtle Framer Motion interactions
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### Firebase Hosting
The project is configured for Firebase hosting with:
- Static export optimization
- Proper routing rewrites
- Cache headers for performance
- Professional domain setup

### Build Configuration
- Next.js static export enabled
- TypeScript strict mode
- Tailwind CSS optimization
- Bundle size optimization

## 📱 Mobile Support

- Touch-optimized interface
- Responsive table rendering
- Mobile-specific PDF generation
- Viewport optimization to prevent zoom issues
- Offline-capable design

## 🚀 Deployment

### Firebase Hosting
```bash
# Build and deploy
pnpm run deploy

# Or manually
pnpm build
firebase deploy --only hosting
```

### Environment Setup
No environment variables required for basic functionality.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for AIA Myanmar's internal use. All premium data and calculations are based on official AIA Myanmar documentation.

## 🔮 Future Enhancements

See [ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md) for detailed future development plans including:

- User authentication with Firebase
- Agent performance dashboards
- Multi-language support (Myanmar/Burmese)
- Advanced analytics and reporting
- CRM integration capabilities

## 📞 Support

For technical support or business inquiries, please contact the AIA Myanmar IT department or development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Built for**: AIA Myanmar Insurance Advisory Services

---

*Professional insurance recommendation tool designed specifically for the Myanmar market* 🇲🇲