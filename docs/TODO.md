# TODO List - AIA Insurance Advisor

This document tracks planned features, improvements, and technical debt for the AIA Insurance Advisor project. Items are organized by priority and category.

## 🚨 High Priority

### 1. Firebase Analytics Implementation
**Why**: Currently no user behavior tracking or business intelligence
**Tasks**:
- [ ] Add Firebase Analytics to `/lib/firebase.ts`
- [ ] Create `/lib/analytics.ts` service with helper functions
- [ ] Track key events:
  - [ ] Authentication: sign_up, login, logout
  - [ ] Quote Generation: quote_generated (products, premium, client info)
  - [ ] Report Actions: report_downloaded, report_shared, report_viewed
  - [ ] Subscription: upgrade_initiated, subscription_purchased, plan_selected
  - [ ] Navigation: page_view (automatic)
- [ ] Add measurement ID to environment variables
- [ ] Update privacy policy for analytics disclosure
- [ ] Add analytics opt-out option (GDPR compliance)

### 2. Testing Infrastructure
**Why**: No tests exist - risky for production changes
**Tasks**:
- [ ] Set up Jest and React Testing Library
- [ ] Add test scripts to package.json
- [ ] Create unit tests for:
  - [ ] Premium calculations
  - [ ] Quota service logic
  - [ ] Date/age calculations
- [ ] Create integration tests for:
  - [ ] Authentication flow
  - [ ] Quote generation process
  - [ ] Subscription management
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Aim for 80% code coverage

### 3. Error Monitoring
**Why**: No visibility into production errors
**Tasks**:
- [ ] Integrate Sentry or similar error tracking
- [ ] Add error boundaries to all major components
- [ ] Create error logging service
- [ ] Set up error alerts for critical issues
- [ ] Add source maps for better error debugging

## 📊 Medium Priority

### 4. CI/CD Pipeline
**Why**: Manual deployments are error-prone
**Tasks**:
- [ ] Set up GitHub Actions workflow
- [ ] Add automated testing on PR
- [ ] Add build verification
- [ ] Add automated deployment to Firebase
- [ ] Add branch protection rules
- [ ] Create staging environment

### 5. Performance Monitoring
**Why**: No insights into app performance
**Tasks**:
- [ ] Add Web Vitals tracking
- [ ] Implement Lighthouse CI
- [ ] Add bundle size monitoring
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add performance budgets
- [ ] Implement code splitting

### 6. SEO Optimization
**Why**: Poor search engine visibility
**Tasks**:
- [ ] Add dynamic meta tags for all pages
- [ ] Create sitemap.xml
- [ ] Add robots.txt
- [ ] Implement structured data (JSON-LD)
- [ ] Add Open Graph tags
- [ ] Create canonical URLs

### 7. Admin Dashboard Enhancement
**Why**: Limited admin functionality
**Tasks**:
- [ ] Create web-based admin panel
- [ ] Add user management interface
- [ ] Add subscription management UI
- [ ] Create analytics dashboard
- [ ] Add system health monitoring
- [ ] Implement role-based access control

## 🎯 Low Priority

### 8. Progressive Web App (PWA)
**Why**: No offline capability
**Tasks**:
- [ ] Add service worker
- [ ] Create manifest.json
- [ ] Implement offline fallback pages
- [ ] Add install prompt
- [ ] Cache static assets
- [ ] Enable background sync

### 9. Email Notification System
**Why**: Only Telegram notifications currently
**Tasks**:
- [ ] Integrate SendGrid or similar
- [ ] Create email templates
- [ ] Add welcome emails
- [ ] Send subscription reminders
- [ ] Add payment receipts
- [ ] Create email preferences

### 10. Multi-language Support
**Why**: Only English, limiting Myanmar market
**Tasks**:
- [ ] Add i18n framework (next-intl)
- [ ] Translate UI to Burmese
- [ ] Create language switcher
- [ ] Translate reports to Burmese
- [ ] Add RTL support if needed

### 11. API Documentation
**Why**: No API documentation exists
**Tasks**:
- [ ] Add OpenAPI/Swagger documentation
- [ ] Document all API endpoints
- [ ] Create API testing interface
- [ ] Add request/response examples
- [ ] Generate client SDKs

### 12. Component Documentation
**Why**: Hard for new developers to understand components
**Tasks**:
- [ ] Set up Storybook
- [ ] Document all UI components
- [ ] Add component playground
- [ ] Create design system docs
- [ ] Add usage examples

## 🛡️ Security & Compliance

### 13. Enhanced Security
**Tasks**:
- [ ] Add rate limiting to API routes
- [ ] Implement CAPTCHA for forms
- [ ] Add 2FA option
- [ ] Create security headers middleware
- [ ] Add API key management
- [ ] Implement audit logging

### 14. Backup & Disaster Recovery
**Tasks**:
- [ ] Set up automated Firestore backups
- [ ] Create backup restoration process
- [ ] Document recovery procedures
- [ ] Test backup restoration
- [ ] Add backup monitoring

## 📈 Business Features

### 15. Advanced Analytics
**Tasks**:
- [ ] Create conversion funnel tracking
- [ ] Add cohort analysis
- [ ] Build revenue analytics
- [ ] Track user engagement metrics
- [ ] Create custom reports
- [ ] Add data export functionality

### 16. User Feedback System
**Tasks**:
- [ ] Add in-app feedback widget
- [ ] Create satisfaction surveys
- [ ] Implement feature request system
- [ ] Add bug reporting tool
- [ ] Create feedback dashboard

### 17. Referral System
**Tasks**:
- [ ] Create referral tracking
- [ ] Add referral rewards
- [ ] Build referral dashboard
- [ ] Implement social sharing
- [ ] Track referral conversions

## 🔧 Technical Debt

### 18. Code Quality
**Tasks**:
- [ ] Add ESLint rules
- [ ] Configure Prettier
- [ ] Add pre-commit hooks
- [ ] Refactor large components
- [ ] Remove console.logs
- [ ] Add proper TypeScript types

### 19. Database Optimization
**Tasks**:
- [ ] Add database indexes
- [ ] Optimize query performance
- [ ] Implement data archiving
- [ ] Add query caching
- [ ] Create data cleanup jobs

### 20. Development Experience
**Tasks**:
- [ ] Add hot reload for functions
- [ ] Create development seeds
- [ ] Add debugging guides
- [ ] Improve error messages
- [ ] Create contribution guide

## 📝 Quick Implementation Reference

### For Firebase Analytics (Priority #1):
```typescript
// 1. Update /lib/firebase.ts
import { getAnalytics } from 'firebase/analytics';
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// 2. Create /lib/analytics.ts
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

export const trackEvent = (eventName: string, parameters?: any) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// 3. Use in components
trackEvent('quote_generated', {
  products: selectedProducts,
  totalPremium: calculateTotalPremium(),
  clientAge: calculateAge(clientData.dateOfBirth)
});
```

---

**Last Updated**: January 2025  
**Note**: This is a living document. Update priorities based on business needs and user feedback.