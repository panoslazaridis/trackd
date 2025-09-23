# TrackD Analytics Dashboard

## Overview

TrackD is a comprehensive analytics dashboard designed for small trades businesses (electricians, plumbers, HVAC technicians, and handymen). The application transforms raw business data into actionable insights that help trades professionals optimize pricing, understand customer behavior, and increase profitability. The platform features job management, customer relationship tracking, competitor analysis, and AI-powered business insights.

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
- **Primary Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud hosting
- **Type Safety**: Drizzle-Zod integration for runtime schema validation
- **Core Tables**: Users, jobs, customers, competitors, and AI-generated insights

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **User Storage**: Currently implemented with in-memory storage (MemStorage) for development
- **Security**: Session-based authentication with secure cookie handling

### AI Integration Architecture
- **AI Service**: OpenAI GPT integration for generating business insights
- **Analysis Types**: Competitor analysis and pricing optimization recommendations
- **Data Processing**: Real-time analysis of business data to generate actionable insights
- **API Structure**: Dedicated AI endpoints with structured request/response schemas using Zod validation

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