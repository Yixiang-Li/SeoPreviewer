# SEO Meta Tag Analyzer

## Overview

The SEO Meta Tag Analyzer is a web application that helps developers and marketers analyze website SEO meta tags with visual previews for Google search results and social media platforms. Users can input any website URL to receive comprehensive SEO analysis including title tags, meta descriptions, Open Graph data, Twitter Cards, and actionable recommendations for optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI primitives with shadcn/ui component system for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens supporting light/dark themes
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Web Scraping**: Cheerio for HTML parsing and meta tag extraction
- **HTTP Client**: Axios for making requests to target websites
- **Validation**: Zod schemas for runtime type checking and data validation
- **Security**: SSRF protection with IP range blocking and port restrictions

### Database Strategy
- **Current**: In-memory storage (no persistent database needed for core functionality)
- **Future**: Drizzle ORM configured with PostgreSQL support for potential caching of analysis results
- **Rationale**: SEO analysis is stateless by nature; database mainly needed for performance optimization

### Deployment Configuration
- **Development**: Vite dev server with HMR and Express API proxy
- **Production**: Static frontend build served by Express with API routes
- **Build Process**: esbuild for server bundling, Vite for client optimization

### Design System
- **Approach**: Utility-focused design system prioritizing data clarity and professional credibility
- **Typography**: Inter font family for technical readability with defined hierarchy
- **Color Palette**: Deep blue primary colors with semantic status colors (success/warning/error)
- **Layout**: Card-based responsive design with single-column mobile and two-column desktop layouts

### Security Measures
- **SSRF Protection**: Blocked private IP ranges, restricted ports, DNS resolution validation
- **Input Validation**: URL validation and sanitization before processing
- **Content Limits**: Maximum response size limits and request timeouts
- **Error Handling**: Comprehensive error boundaries with user-friendly messages

## External Dependencies

### Core Libraries
- **@radix-ui/***: Accessible UI primitives for components like dialogs, dropdowns, and form controls
- **@tanstack/react-query**: Server state management with automatic caching and background updates
- **axios**: HTTP client for reliable website fetching with timeout and error handling
- **cheerio**: Server-side jQuery-like HTML parsing for meta tag extraction
- **wouter**: Lightweight routing library for single-page application navigation

### Development Tools
- **typescript**: Static type checking for better code quality and developer experience
- **vite**: Modern build tool with fast HMR and optimized production builds
- **tailwindcss**: Utility-first CSS framework with custom design token configuration
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect support
- **zod**: Runtime validation library for API request/response schemas

### UI Enhancement
- **class-variance-authority**: Component variant management for consistent styling
- **clsx/tailwind-merge**: Conditional CSS class composition utilities
- **lucide-react**: Icon library with consistent design language
- **date-fns**: Date manipulation utilities for timestamp formatting

### Fonts & Assets
- **Inter**: Primary font family from Google Fonts for excellent technical readability
- **JetBrains Mono**: Monospace font for code snippets and URLs