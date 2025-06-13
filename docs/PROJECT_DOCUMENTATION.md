# AIA Insurance Advisor - Myanmar Edition

## Project Overview

The **AIA Insurance Advisor** is a modern, responsive web application designed specifically for the Myanmar market to help insurance advisors and customers navigate AIA Myanmar's insurance product portfolio. This comprehensive tool streamlines the insurance recommendation process through an intuitive 3-step wizard that calculates real premiums based on authentic AIA Myanmar premium tables.

## 🎯 Purpose & Mission

This application serves as a digital transformation solution for AIA Myanmar's insurance advisory process, enabling:
- **Accurate Premium Calculations** using real AIA Myanmar premium data
- **Professional Report Generation** with downloadable insurance recommendations
- **Streamlined Customer Consultation** through an intuitive step-by-step process
- **Mobile-Optimized Experience** for field agents and customers

## 🚀 Key Features

### 1. **3-Step Insurance Wizard**
- **Step 1: Client Data Collection** - Capture essential customer information (name, date of birth, gender)
- **Step 2: Product Selection** - Interactive selection of insurance products with real-time premium calculations
- **Step 3: Report Generation** - Professional insurance recommendation report with complete coverage details

### 2. **Comprehensive Product Portfolio**
- **One Health Solution (OHS)** - 7 medical insurance plans with varying coverage levels
- **Universal Life Insurance** - 6 flexible life insurance plans with 3 health tiers each
- **Short Term Endowment** - 5 term life insurance options with different coverage amounts
- **Cancer Care Coverage** - Specialized cancer protection add-on

### 3. **Real-Time Premium Calculations**
- Authentic AIA Myanmar premium tables integrated for all products
- Age and gender-specific pricing
- Insurance age calculations (real age + 1)
- Dynamic age validation with product availability checking

### 4. **Professional Report Generation**
- Comprehensive insurance recommendation reports
- Mobile-optimized table rendering with complete data capture
- PNG and text format download options
- Professional branding with AIA logo integration

### 5. **Smart Product Selection Logic**
- Optional product selection (no forced choices)
- Mutual exclusivity between Universal Life and Short Term Endowment
- Dynamic age validation preventing invalid product selections
- Real-time premium updates as selections change

## 🛠 Technical Architecture

### **Frontend Stack**
- **Next.js 15.2.4** with React 19 for modern web development
- **TypeScript** for type-safe development
- **Tailwind CSS** for responsive, utility-first styling
- **Radix UI** components for accessible, professional interface
- **Framer Motion** for smooth animations and transitions

### **Key Technologies**
- **html2canvas** for high-quality report screenshot generation
- **Responsive Design** optimized for both desktop and mobile devices
- **Component-Based Architecture** for maintainable and scalable code
- **Real Premium Data Integration** with Myanmar Kyat (MMK) formatting

### **Data Management**
- Structured premium tables for all 4 insurance products
- Dynamic age validation based on actual coverage data
- Centralized type definitions for type safety
- Optimized utility functions for premium calculations

## 📊 Supported Insurance Products

### **1. One Health Solution (OHS)**
- **7 Plans Available** (Plan 1-7)
- **Coverage Range**: Daily limits from 23K to 525K MMK
- **Annual Limits**: 3.75M to 120M MMK
- **Accidental Death**: 1M to 7M MMK
- **Age Coverage**: 0-80 years

### **2. Universal Life Insurance**
- **6 Coverage Levels**: 1000L to 5000L (10L to 50L MMK)
- **3 Health Tiers**: Minimum, Default, Maximum pricing
- **Age Groups**: 0-64 years with group-specific pricing
- **Flexible Premium**: Investment-linked with cash value accumulation

### **3. Short Term Endowment**
- **5 Coverage Options**: 10M to 200M MMK (100L to 2000L)
- **Age Coverage**: 17-65 years
- **Gender-Specific**: Separate male/female premium tables
- **Term Protection**: Fixed-term life insurance coverage

### **4. Cancer Care Coverage**
- **Fixed Coverage**: 100M MMK
- **Age Range**: 1-60 years
- **Comprehensive Benefits**: Early stage to advanced cancer coverage
- **Add-on Product**: Can be combined with other insurance products

## 🎨 User Experience Features

### **Responsive Design**
- Mobile-first approach with optimized layouts
- Touch-friendly interface for tablet and smartphone use
- Desktop-optimized report generation and viewing
- Adaptive typography and spacing for all screen sizes

### **Professional Interface**
- Clean, modern design aligned with AIA branding
- Intuitive navigation with clear progress indicators
- Professional report layout suitable for customer presentations
- Consistent color scheme using AIA's red brand colors

### **Smart Validation**
- Real-time form validation and error handling
- Age-based product availability checking
- Mutual exclusivity enforcement for competing products
- Clear error messages and guidance for users

### **Interactive Elements**
- Smooth animations and transitions using Framer Motion
- Hover effects and visual feedback for better user interaction
- Loading states and progress indicators
- Mobile-optimized touch interactions

## 💼 Business Value

### **For Insurance Advisors**
- Streamlined customer consultation process
- Accurate premium calculations eliminating manual errors
- Professional report generation for customer presentations
- Mobile accessibility for field work
- Reduced consultation time with automated calculations

### **For Customers**
- Transparent premium calculations
- Comprehensive coverage comparison
- Professional documentation of recommendations
- Clear understanding of insurance options
- Immediate premium quotes without waiting

### **For AIA Myanmar**
- Digital transformation of advisory process
- Consistent premium calculations across all advisors
- Professional brand presentation
- Improved customer experience and satisfaction
- Reduced operational costs and errors

## 🔧 Technical Implementation Details

### **Project Structure**
```
aia-insurance-advisor/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main application page
├── components/                   # React components
│   ├── ui/                      # Reusable UI components (Radix-based)
│   ├── client-data-step.tsx     # Step 1: Client information
│   ├── product-selection-step.tsx # Step 2: Product selection
│   ├── report-generation-step.tsx # Step 3: Report generation
│   └── theme-provider.tsx       # Theme configuration
├── data/                        # Premium data and product information
│   ├── aia-products.ts          # Product catalog and descriptions
│   ├── ohs-premium-data.ts      # OHS premium tables and functions
│   ├── universal-life-premium-data.ts # Universal Life premium data
│   ├── short-term-endowment-premium-data.ts # Term Life premium data
│   └── cancer-care-premium-data.ts # Cancer Care premium data
├── types/                       # TypeScript type definitions
│   └── insurance.ts             # Insurance-related interfaces
├── utils/                       # Utility functions
│   ├── calculations.ts          # Age calculations and formatting
│   ├── formatting.ts            # Currency and data formatting
│   └── premium-tables.ts        # Premium calculation functions
└── public/                      # Static assets
    └── placeholder-logo.png     # AIA logo placeholder
```

### **Key Components**

#### **Client Data Step (`client-data-step.tsx`)**
- Form validation with real-time feedback
- Date formatting for Myanmar date format (DD/MM/YYYY)
- Gender selection with proper validation
- Age calculation and insurance age determination

#### **Product Selection Step (`product-selection-step.tsx`)**
- Dynamic product availability based on age
- Real-time premium calculations
- Mutual exclusivity logic for life insurance products
- Interactive product cards with hover effects
- Mobile-optimized tabbed interface

#### **Report Generation Step (`report-generation-step.tsx`)**
- Professional insurance report layout
- Mobile-responsive table rendering
- High-quality PNG report generation using html2canvas
- Fallback text report for download failures
- Loading states and user feedback

### **Data Management**

#### **Premium Tables**
- **OHS Data**: 7 plans with age-specific pricing (0-80 years)
- **Universal Life**: 6 plans with 3 health tiers and age groups
- **Short Term Endowment**: 5 coverage levels with male/female tables
- **Cancer Care**: Age-specific pricing (1-60 years) for both genders

#### **Dynamic Validation**
- Age range validation for each product type
- Real-time availability checking
- Gender-specific premium calculations
- Insurance age vs real age handling

### **Mobile Optimization**
- Responsive design with mobile-first approach
- Touch-optimized interface elements
- Mobile-specific report generation handling
- Optimized loading and performance for mobile devices

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- Modern web browser with JavaScript enabled

### **Installation**
```bash
# Clone the repository
git clone [repository-url]
cd aia-insurance-advisor

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### **Development**
```bash
# Development server (default port 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### **Environment Setup**
- No environment variables required for basic functionality
- Ensure proper Node.js version (18+)
- Recommended to use pnpm for faster dependency management

## 🧪 Testing & Quality Assurance

### **Testing Scenarios**
1. **Age Validation Testing**
   - Test age boundaries for each product
   - Verify insurance age calculations
   - Test invalid age handling

2. **Premium Calculation Testing**
   - Verify calculations against official AIA tables
   - Test all product combinations
   - Validate currency formatting

3. **Mobile Responsiveness Testing**
   - Test on various device sizes
   - Verify report generation on mobile
   - Test touch interactions

4. **Report Generation Testing**
   - Test PNG generation quality
   - Verify fallback text reports
   - Test download functionality across browsers

### **Browser Compatibility**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance Considerations

### **Optimization Strategies**
- **Code Splitting**: Automatic Next.js code splitting for optimal loading
- **Image Optimization**: Next.js Image component for logo and assets
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Browser caching for static assets and data

### **Mobile Performance**
- Optimized bundle size for mobile networks
- Efficient rendering for mobile report generation
- Touch-optimized interactions with minimal delay
- Progressive loading with proper loading states

## 🔒 Security & Data Privacy

### **Data Handling**
- No persistent data storage - all data stays in browser session
- No server-side data transmission for calculations
- Client-side only premium calculations
- No sensitive customer data stored or transmitted

### **Security Measures**
- Type-safe development with TypeScript
- Input validation and sanitization
- XSS prevention through React's built-in protections
- No external API calls for sensitive operations

## 🌟 Future Enhancements

### **Planned Features**
- **Multi-language Support**: Myanmar language localization
- **Additional Products**: Integration of more AIA Myanmar products
- **Advanced Reports**: PDF generation with enhanced formatting
- **Comparison Tools**: Side-by-side product comparisons
- **Save & Share**: Session saving and report sharing capabilities

### **Technical Improvements**
- **PWA Support**: Progressive Web App capabilities for offline use
- **Enhanced Analytics**: User interaction tracking and insights
- **Advanced Validation**: More sophisticated age and health validations
- **API Integration**: Potential integration with AIA systems

## 📞 Support & Maintenance

### **Technical Support**
- Comprehensive error handling with user-friendly messages
- Fallback mechanisms for critical functions
- Cross-browser compatibility testing
- Mobile device testing across platforms

### **Maintenance Considerations**
- Regular premium table updates as needed
- Browser compatibility monitoring
- Performance optimization reviews
- Security updates and dependency management

---

## 📄 License & Usage

This application is developed specifically for AIA Myanmar's insurance advisory operations. All premium data and product information are based on official AIA Myanmar documentation and should be verified against current official rates before use in actual customer consultations.

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Developed for**: AIA Myanmar Insurance Advisory Services

---

*This documentation provides a comprehensive overview of the AIA Insurance Advisor application. For technical questions or support, please refer to the development team or AIA Myanmar's IT department.*