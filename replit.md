# Jo'Fé Digital Team Management System

## Overview

Jo'Fé Digital is a comprehensive team management system designed for a marketing and creative agency in Burkina Faso. The application provides real-time task tracking with automated timekeeping, project management, team collaboration, client relationship management, and performance analytics. The system is built as a web-based platform supporting up to 14 concurrent users with role-based access control, featuring a French interface with FCFA currency formatting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query v5 for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Jo'Fé Digital brand colors (turquoise primary, orange secondary)
- **Real-time Communication**: WebSocket integration for live updates and chat functionality
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Dual authentication system (Replit OAuth + custom team login)
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Features**: WebSocket server for live collaboration and chat
- **Password Security**: bcryptjs for password hashing and verification

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle with migrations support for schema management
- **Key Tables**: 
  - Users (Replit auth integration)
  - Team members with role-based permissions
  - Tasks with automated time tracking
  - Projects with client associations
  - Clients with revenue tracking
  - Time entries for precise time management
  - Chat system with channels and messages
  - Performance metrics and analytics

### Authentication & Authorization
- **Dual Auth System**: Replit OAuth for development + custom team authentication
- **Role-Based Access**: Two-tier system (Admin: Serge ASSALÉ & Enos GOUBA, Members: 12 others)
- **Password Strategy**: Standard password "jofe2024" for members, separate admin password
- **Session Security**: HTTP-only cookies with PostgreSQL session storage

### Real-time Features
- **WebSocket Implementation**: Custom WebSocket server on `/ws` path
- **Live Updates**: Task status changes, timer updates, team member presence
- **Chat System**: Real-time messaging with channels and direct messages
- **Collaboration**: Concurrent editing with conflict resolution
- **Presence Tracking**: Online/offline status for team members

### Time Tracking System
- **Automatic Timers**: Background timers that persist across browser sessions
- **Permission Model**: Members can only control their own task timers
- **Admin Controls**: Admins can manage any timer and modify time entries
- **Precision Tracking**: Second-level accuracy with database persistence

## External Dependencies

### Database & Hosting
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **@radix-ui/***: Comprehensive accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework for consistent styling
- **class-variance-authority**: Type-safe variant handling for components
- **lucide-react**: Modern icon library with consistent design

### Development & Build
- **vite**: Fast build tool with hot module replacement
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds

### Real-time & Communication
- **ws**: WebSocket library for real-time bidirectional communication
- **@tanstack/react-query**: Powerful data fetching and caching library

### Form & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for form integration
- **zod**: TypeScript-first schema validation library

### Utilities & Security
- **bcryptjs**: Password hashing and verification
- **date-fns**: Modern date utility library for French localization
- **memoizee**: Function memoization for performance optimization