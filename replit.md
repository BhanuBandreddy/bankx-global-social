# Global Social - Social Commerce Platform

## Overview

Global Social is a revolutionary AI-powered social commerce platform that combines travel planning, product discovery, secure payments, and peer-to-peer logistics into a unified experience. The platform leverages a multi-agent AI system to create seamless workflows for international commerce and travel coordination.

## System Architecture

This is a full-stack TypeScript application built with modern web technologies:

### Frontend Architecture
- **Framework**: React 18 with Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: React Query (TanStack Query) for server state management
- **Authentication**: Supabase Auth with custom AuthContext
- **Routing**: React Router v6 for client-side navigation

### Backend Architecture
- **Server**: Express.js running on Node.js 20
- **Database**: PostgreSQL with Supabase as the backend-as-a-service provider
- **ORM**: Drizzle ORM for type-safe database operations
- **Edge Functions**: Supabase Edge Functions for serverless computing
- **Development**: Hot module replacement with Vite in development mode

### Data Storage
- **Primary Database**: PostgreSQL hosted on Supabase
- **Schema Management**: Drizzle migrations with schema defined in TypeScript
- **Authentication**: Supabase Auth with row-level security (RLS) policies
- **File Storage**: Supabase Storage for PDF uploads and assets

## Key Components

### Multi-Agent AI System
The platform features a sophisticated AI orchestration system with specialized agents:
- **TrustPay**: Handles secure payments and escrow transactions
- **GlobeGuides**: Manages travel planning and itinerary parsing
- **LocaleLens**: Provides product discovery and recommendations
- **PathSync**: Coordinates peer-to-peer logistics and delivery

### Trust & Payment Infrastructure
- **Escrow System**: Secure payment holding with release conditions
- **X402 Payment Protocol**: HTTP 402 Payment Required implementation
- **Trust Scoring**: Dynamic user reputation system with Oracle-level verification
- **Multi-currency Support**: International payment processing

### Social Features
- **Activity Feed**: Real-time social interactions with products and travel
- **Trust Metrics Dashboard**: Gamified reputation system with challenges
- **Community Verification**: Peer-to-peer trust building
- **Global Logistics Network**: Social delivery coordination

### AI-Powered Workflows
- **PDF Itinerary Processing**: OpenAI-powered document parsing
- **Contextual Recommendations**: Location-based product discovery
- **Conversational Commerce**: Blink AI concierge for guided purchases
- **Smart Logistics**: Route optimization for delivery matching

## Data Flow

1. **User Authentication**: Supabase handles login/signup with automatic profile creation
2. **Itinerary Upload**: PDFs processed via OpenAI to extract travel data
3. **Product Discovery**: AI agents recommend relevant products based on travel context
4. **Secure Payments**: X402 protocol initiates escrow transactions
5. **Logistics Coordination**: PathSync matches travelers with delivery requests
6. **Trust Updates**: Successful transactions update user reputation scores

## External Dependencies

### Core Services
- **Supabase**: Database, authentication, edge functions, and real-time subscriptions
- **OpenAI**: GPT models for itinerary parsing and conversational AI
- **Mapbox**: Interactive maps for destination visualization (optional)

### Payment Infrastructure
- **X402 Protocol**: Custom payment flow implementation
- **Multi-currency Support**: International transaction handling

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast TypeScript compilation for production builds
- **Replit**: Development environment with PostgreSQL module

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reloading
- **Database**: PostgreSQL 16 module in Replit environment
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Deployment**: Autoscale deployment target on port 80
- **Process Management**: npm scripts for dev/build/start lifecycle

### Configuration Files
- **Drizzle Config**: Points to shared schema and PostgreSQL dialect
- **Vite Config**: React plugin with path aliases and runtime error overlay
- **TypeScript**: Strict mode with ESNext modules and DOM types

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 24, 2025. Initial setup