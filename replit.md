# StreamFlix - Streaming Platform

## Overview

StreamFlix is a modern streaming platform application built as a full-stack web application. The project features a Netflix-style interface for browsing movies and TV series, with content discovery, search functionality, and user watchlist management. The application uses a monorepo structure with a React frontend and Node.js/Express backend, implementing a clean separation between client-side and server-side code through a shared schema layer.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### UI/UX Improvements (September 2025)
- **Enhanced Category Pages**: Completely redesigned movie and series category pages with gradient headers, animated cards, statistical displays, and color-coded visual themes for improved user engagement
- **Simplified Search Interface**: Streamlined search functionality by removing complex filter selectors, focusing on clean input with recent search history and intelligent suggestions
- **Optimized Favorites Management**: Simplified favorites interface by removing unnecessary category selectors while maintaining essential sorting options and movie/series tab separation
- **Improved Category-Specific Views**: Enhanced individual category pages with rich visual headers featuring gradients, category icons, descriptions, and animated content grids with staggered loading effects

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with custom CSS variables for theming, using a dark Netflix-inspired color scheme
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Storage**: In-memory storage implementation with interfaces for future database integration
- **API Design**: RESTful API with content endpoints for movies/series and user list management
- **Development**: Hot reload with tsx and Vite integration for seamless development experience

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL configured through Neon Database serverless connection
- **Schema**: Shared schema definitions using Drizzle with Zod validation
- **Migration**: Database migrations managed through Drizzle Kit

### Database Schema Design
The application uses three main entities:
- **Users**: Authentication and user management with username/password
- **Content**: Movies and TV series with metadata (title, year, rating, genre, cast, descriptions, media URLs)
- **User Lists**: Many-to-many relationship between users and content for watchlist functionality

### Authentication and Authorization
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- Cookie-based session management with secure defaults
- User registration and login endpoints (prepared for implementation)

### External Dependencies
- **Database**: Neon Database serverless PostgreSQL instance
- **UI Framework**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Form Handling**: React Hook Form with Hookform resolvers for validation
- **Date Utilities**: date-fns for date manipulation and formatting
- **Development Tools**: Replit-specific plugins for development environment integration