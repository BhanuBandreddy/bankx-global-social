# Trust Network Application - Replit Migration

## Overview
Social trust network platform with AI agents, payment escrow, and logistics coordination. Successfully migrated from Lovable/Supabase to Replit's built-in PostgreSQL database.

## Recent Changes
- **Migration Complete (January 2025)**: Migrated from Supabase to built-in PostgreSQL with Drizzle ORM
- **Authentication**: Implemented JWT-based auth system replacing Supabase Auth
- **Database**: All tables migrated to PostgreSQL with proper schema
- **API Routes**: Converted all Supabase Edge Functions to Express server routes
- **Security**: Added proper API key management with secret environment variables

## Project Architecture

### Database (PostgreSQL + Drizzle ORM)
- **users**: User accounts with email/password
- **profiles**: User profiles with trust scores and metadata
- **escrow_transactions**: Payment escrow functionality
- **payment_events**: Transaction audit trail
- **blink_conversations**: AI chat history
- **blink_workflows**: AI workflow tracking
- **blink_notifications**: User notifications

### Authentication
- JWT-based authentication with bcrypt password hashing
- Server-side token verification middleware
- Client-side auth context with localStorage persistence

### API Endpoints
- `/api/auth/*`: Authentication (signup, signin, user data)
- `/api/escrow/*`: Payment escrow management
- `/api/blink/*`: AI conversation system
- `/api/nanda`: Agent discovery system

### Key Features
- **AI Agents**: Multi-agent conversation system with TrustPay, GlobeGuides, LocaleLens, and PathSync
- **Trust Network**: User profiles with trust scores and social features
- **Payment Escrow**: Secure transaction handling with release conditions
- **Social Logistics**: Peer-to-peer delivery and logistics coordination
- **Travel Support**: Itinerary processing and travel planning assistance

### Environment Variables Required
- `JWT_SECRET`: For authentication tokens
- `OPENAI_API_KEY`: For AI agent functionality
- `MAPBOX_PUBLIC_TOKEN`: For mapping features
- `DATABASE_URL`: PostgreSQL connection (auto-configured)

## Development Notes
- Uses Vite for frontend development with HMR
- Server runs on port 5000 with Express.js
- Database schema managed with Drizzle migrations
- TypeScript throughout with shared schema definitions

## User Preferences
*To be updated based on user feedback and preferences*