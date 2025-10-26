# Parking Management System

## Overview

This is a comprehensive parking management system (Sistema de Controle de Estacionamento) built with a modern full-stack architecture. The application manages vehicle entries and exits for both cars and motorcycles, automatically calculates parking fees based on configurable hourly rates and overnight charges, and provides real-time tracking of active vehicles with a historical record of all transactions.

The system features a clean, utility-focused interface designed around Material Design 3 principles, emphasizing data clarity and efficient workflows for parking attendants.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript in strict mode
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query v5 for server state with aggressive caching disabled (staleTime: Infinity, no refetch on window focus)
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (New York style variant)
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

**Design System**:
- Color scheme uses CSS custom properties for theming with HSL values
- Typography: Inter font family from Google Fonts
- Spacing: Tailwind's utility classes with consistent scale (2, 4, 6, 8)
- Components follow a card-based layout with rounded corners and subtle shadows
- Responsive design with mobile-first breakpoint at 768px

**Key UI Patterns**:
- Sidebar navigation (fixed left on desktop, collapsible on mobile)
- Modal dialogs for vehicle exit confirmation with fee calculation preview
- Real-time duration updates using interval-based state ticking
- Toast notifications for user feedback on actions
- Form validation with immediate error display

### Backend Architecture

**Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Build Tool**: Vite for frontend, esbuild for backend bundling
- **Development**: tsx for TypeScript execution in development mode

**API Design**:
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Express middleware for logging API requests with response capture
- Custom error handling with Zod validation error formatting

**Core Routes**:
- `POST /api/vehicles` - Register vehicle entry
- `GET /api/vehicles/active` - List currently parked vehicles
- `POST /api/vehicles/:id/exit` - Process vehicle exit with fee calculation
- `GET /api/history` - Retrieve completed parking sessions
- `GET /api/settings` - Fetch parking rate configuration
- `PUT /api/settings` - Update parking rates and policies

**Business Logic**:
- Automatic fee calculation based on entry/exit timestamps
- Configurable free minutes period (default: 15 minutes)
- Hourly rate calculation with ceiling rounding (partial hours charged as full)
- Overnight fee detection (different calendar day = overnight)
- Separate pricing for cars vs motorcycles

### Data Storage

**Current Implementation**: In-memory storage (MemStorage class)
- Vehicles stored in Map with UUID keys
- Single settings object with default values
- Suitable for development and single-instance deployments

**Schema Design** (Drizzle ORM ready):
- PostgreSQL dialect configured in drizzle.config.ts
- Connection via @neondatabase/serverless driver
- Tables defined in shared/schema.ts:
  - `vehicles`: id, licensePlate, vehicleType, entryTime, exitTime, amountCharged
  - `settings`: id, hourlyRateCar, hourlyRateBike, overnightFeeCar, overnightFeeBike, freeMinutes

**Data Validation**:
- License plate format: AAA-0000 or AAA-0A00 (Brazilian Mercosul format)
- Vehicle types: enum of "car" or "bike"
- Decimal precision: 10,2 for monetary values
- Zod schemas generated from Drizzle table definitions

### External Dependencies

**Database**:
- Neon Postgres (serverless) configured but not actively used
- Drizzle ORM v0.39+ as the query builder
- Migration system via drizzle-kit with output to ./migrations
- Current mode: In-memory storage (production would use DATABASE_URL environment variable)

**UI Component Libraries**:
- Radix UI primitives (v1.x-v2.x) for 25+ accessible component patterns
- Lucide React for iconography
- date-fns for date formatting and manipulation
- embla-carousel-react for potential carousel features
- cmdk for command palette functionality

**Development Tools**:
- Vite with React plugin and runtime error overlay
- Replit-specific plugins: cartographer (development mode), dev-banner, runtime-error-modal
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript compiler with strict mode and bundler module resolution

**Session Management**:
- connect-pg-simple for PostgreSQL session store (configured but sessions not actively used)
- Express session middleware ready for authentication features

**Key Architectural Decisions**:

1. **Monorepo Structure**: Frontend (client/), backend (server/), and shared code (shared/) in single repository with path aliases for clean imports
2. **Type Safety**: End-to-end TypeScript with shared schema definitions between client and server
3. **Database Abstraction**: IStorage interface allows swapping between in-memory and PostgreSQL implementations without changing application logic
4. **Static Asset Serving**: Vite handles development server with HMR; production builds to dist/public for Express static serving
5. **Form Validation**: Schema-driven validation using Zod with automatic type inference and error formatting
6. **Real-time Updates**: Client-side interval polling for duration display (no WebSocket overhead for this use case)