# TrackD Analytics Dashboard

## Overview

TrackD is a comprehensive analytics dashboard designed for small trades businesses (electricians, plumbers, HVAC technicians, and handymen). The application transforms raw business data into actionable insights that help trades professionals optimize pricing, understand customer behavior, and increase profitability. The platform features real database-backed job management, customer relationship tracking, competitor analysis, and AI-powered business insights.

**Current Status**: Core job management functionality is fully implemented with PostgreSQL database persistence, real-time CRUD operations, and comprehensive UI integration. The system has transitioned from prototype mock data to production-ready database operations. **NEW**: Comprehensive subscription management, AI usage tracking, and user engagement analytics infrastructure implemented with Row Level Security, automated triggers, and business intelligence views. **LATEST (Oct 2025)**: Airtable-based configuration system for real-time tier management, 3-tier subscription model (Trial/Basic/Pro), trial expiry protection, and AI cost optimization with gpt-4o-mini.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Styling**: Tailwind CSS with a custom design system using sage green (#508682) primary color and warm peach (#E8B894) accent color
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible components
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for data visualization with 7 different chart types
- **Typography**: Inter font for body text and Nunito for headings to ensure readability in data-heavy interfaces

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for consistent type safety across the stack
- **API Design**: RESTful endpoints with structured error handling
- **Build System**: Vite for fast development and optimized production builds
- **File Structure**: Monorepo structure with shared types between client and server

### Data Storage Solutions
- **Primary Database**: Supabase PostgreSQL with connection pooler for scalable cloud hosting
- **Database Driver**: Standard PostgreSQL client (pg) for IPv4 compatibility
- **Schema Management**: Drizzle ORM for type-safe database operations with Drizzle Kit for migrations
- **Type Safety**: Drizzle-Zod integration for runtime schema validation with enhanced date/string handling

**Core Tables**:
1. **users** - Business profiles and owner information
2. **jobs** - Job tracking with revenue, expenses, hours, and profit margins
3. **customers** - Customer relationship management with lifetime value tracking
4. **competitors** - Competitor intelligence and market positioning data
5. **insights** - AI-generated business recommendations and actionable insights
6. **ai_requests** - Comprehensive AI usage tracking (model, tokens, costs, success/failure)
7. **user_subscriptions** - Full subscription management (Stripe integration, trials, discounts, entitlements)
8. **subscription_events** - Audit trail for MRR/churn analysis and revenue tracking

**Advanced Features**:
- **Row Level Security (RLS)**: Users can only access their own data, admin has full access
- **Automated Triggers**: Auto-set entitlements on tier changes, log subscription events, update timestamps
- **Materialized View**: Pre-calculated user engagement metrics refreshed daily
- **Analytics Views**: Revenue dashboard, user health scoring, cohort analysis, feature adoption funnels
- **Scheduled Jobs**: Daily metric refreshes, monthly billing updates, weekly trial checks

### Authentication and Authorization
- **Current**: Custom username/password authentication with Express sessions and PostgreSQL storage
- **Planned Migration**: Supabase Auth for secure, scalable authentication
  - Eliminates plaintext password storage (secure bcrypt hashing)
  - Enables Row Level Security policies using `auth.uid()`
  - Provides built-in user management dashboard
  - Supports OAuth providers (Google, GitHub, etc.) and magic links
  - Automatic login tracking via `auth.audit_log_entries`
- **Security**: Session-based authentication with secure cookie handling (transitioning to JWT)
- **Development**: Test user (test-user-id) configured for development and testing workflows

**Why Supabase Auth?**
The application is designed to be platform-agnostic and will be migrated to Cursor and deployed externally. Supabase Auth provides:
- Industry-standard security (no plaintext passwords)
- Built-in user management and analytics
- Row Level Security integration
- Works seamlessly outside Replit environment

### AI Integration Architecture
- **AI Service**: OpenAI GPT integration for generating business insights
- **Analysis Types**: Competitor analysis and pricing optimization recommendations
- **Data Processing**: Real-time analysis of business data to generate actionable insights
- **API Structure**: Dedicated AI endpoints with structured request/response schemas using Zod validation
- **Usage Tracking**: Comprehensive monitoring via `ai_requests` table
  - Tracks: model used, input/output tokens, cost estimates (£), response times, success/failure rates
  - Per-user entitlement tier tracking for usage-based billing
  - Performance analytics and error monitoring

### Subscription Management Architecture
- **Pricing Tiers**: Free, Basic (£9/mo), Professional (£19/mo), Premium (£39/mo), Enterprise (£99/mo)
- **Stripe Integration**: Customer IDs, subscription IDs, webhook event handling
- **Trial Management**: 14-day trials with auto-conversion tracking and expiration handling
- **Discount System**: Coupon codes, percentage/amount discounts, grandfathered pricing
- **Feature Entitlements**: Automatic tier-based feature flags and usage limits
  - Free: 20 jobs/month, 3 competitors, 10 AI credits
  - Basic: 100 jobs/month, 5 competitors, 50 AI credits, advanced analytics
  - Professional: Unlimited jobs, 10 competitors, 200 AI credits, competitor alerts, WhatsApp
  - Premium: Unlimited jobs, 25 competitors, 500 AI credits, API access, white-label
  - Enterprise: Unlimited everything, dedicated support
- **Usage Tracking**: Monthly job creation, AI parsing, report exports per billing cycle
- **Revenue Analytics**: MRR, churn rate, LTV, ARPU calculations via subscription events
- **Automated Billing**: Monthly resets, trial expirations, lifetime metric updates via pg_cron

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with @neondatabase/serverless driver
- **Drizzle ORM**: Type-safe database operations with drizzle-orm
- **Database Migrations**: Drizzle Kit for schema management and deployments

### AI and Analytics
- **OpenAI API**: GPT-based business intelligence and competitor analysis
- **TanStack React Query**: Efficient data fetching, caching, and synchronization

### UI and Design System
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon system for consistent visual language
- **Recharts**: Chart library for dashboard analytics visualization

### Development and Build Tools
- **Vite**: Fast build tool with HMR for development experience
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production builds

### Development Environment
- **Replit Integration**: Custom Replit plugins for development experience
- **Runtime Error Handling**: Replit error modal plugin for debugging
- **Cartographer**: Replit code mapping plugin for development