# HoopMetrics Basketball Training Application

## Overview

HoopMetrics is an AI-powered basketball training application designed to enhance player skills through structured workout programs, progress tracking, achievement systems, and wearable device integration. The platform combines modern web technologies with AI-driven personalization to create comprehensive basketball training experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:** React with TypeScript, built using Vite for optimal development experience and performance. The frontend follows a component-driven architecture with clear separation of concerns.

**Routing & Navigation:** Uses Wouter for lightweight client-side routing, providing efficient navigation between dashboard, workouts, analytics, and social features.

**State Management:** TanStack React Query handles server state management, caching API responses and synchronizing data across components. Local component state is managed with React hooks.

**UI Framework:** Built on shadcn/ui component library using Radix UI primitives for accessibility. Tailwind CSS provides styling with custom basketball-themed color schemes and responsive design patterns.

**Design System:** Implements a cohesive design language with gradient themes (orange and blue), glass morphism effects, and basketball court visual patterns for brand consistency.

### Backend Architecture
**Framework:** Express.js server with modular route organization and centralized middleware handling. The server implements RESTful API patterns with clear endpoint structure.

**Authentication:** Replit OAuth integration using OpenID Connect (OIDC) with automatic user creation and profile synchronization. Session management uses PostgreSQL-backed storage with secure cookie configuration.

**Route Protection:** Middleware-based authentication ensures secure access to protected endpoints with proper error handling for unauthorized requests.

**API Design:** Organized with dedicated endpoints for dashboard data, workouts, user profiles, AI-generated content, and wearable device integration.

### Database Architecture
**Primary Database:** PostgreSQL with Drizzle ORM providing type-safe database operations and schema management.

**Schema Design:** Comprehensive data model supporting:
- User profiles and authentication data
- Workout categories, exercises, and session tracking
- Achievement systems and progress metrics
- Biometric data from wearable devices
- AI workout templates and personalization data
- Social features including leaderboards and activity feeds

**Data Relationships:** Well-defined relational structure linking users to their workouts, achievements, and biometric data for comprehensive analytics.

### AI Integration
**Primary AI Service:** Anthropic's Claude (claude-sonnet-4-20250514) for workout generation and training insights.

**Personalization Engine:** AI analyzes user profiles, performance history, and preferences to generate customized basketball training programs.

**Features:**
- Personalized workout creation based on skill level and goals
- Training insights and performance analysis
- Adaptive recommendations based on progress tracking
- Basketball-specific exercise suggestions and coaching cues

### Wearable Device Integration
**Supported Devices:** Apple Watch (HealthKit), Garmin, and Coros fitness trackers.

**Data Collection:** Real-time biometric monitoring including heart rate, HRV, calories burned, and recovery metrics.

**Workout Enhancement:** Real-time heart rate zone monitoring during training sessions with AI-driven intensity adjustments.

**Analytics:** Comprehensive performance tracking combining workout data with biometric insights for detailed progress analysis.

## External Dependencies

### Core Infrastructure
- **Neon Database:** PostgreSQL hosting with serverless scaling capabilities
- **Vercel/Replit:** Deployment platform and development environment

### Authentication & User Management
- **Replit OAuth:** Primary authentication provider using OpenID Connect
- **connect-pg-simple:** PostgreSQL session storage for secure user sessions

### AI Services
- **Anthropic Claude API:** AI workout generation and training insights using the latest claude-sonnet-4-20250514 model

### Wearable Device APIs
- **Apple HealthKit:** iOS health data integration for Apple Watch users
- **Garmin Connect IQ:** SDK for Garmin device data synchronization
- **Coros API:** Integration with Coros fitness tracking devices

### UI and Styling
- **Radix UI:** Accessible component primitives for complex UI elements
- **Tailwind CSS:** Utility-first CSS framework with custom basketball theme
- **Lucide React:** Icon library for consistent visual elements

### Development Tools
- **TypeScript:** Type safety across the entire application stack
- **Drizzle ORM:** Type-safe database operations and migrations
- **TanStack React Query:** Server state management and caching
- **Zod:** Runtime type validation for API requests and database schemas