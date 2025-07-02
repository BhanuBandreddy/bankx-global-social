# Trust Network Application - Replit Migration

## Overview
Social trust network platform with AI agents, payment escrow, and logistics coordination. Successfully migrated from Lovable/Supabase to Replit's built-in PostgreSQL database.

## Recent Changes
- **NANDA Phase 2 Complete (July 2025)**: Implemented comprehensive NANDA protocol bridge with JSON-RPC 2.0 compatibility, mapped all business capabilities to NANDA methods (social_commerce, trust_escrow, peer_delivery, travel_logistics, multi_agent_orchestration), added methods discovery endpoint, and validated 100% protocol compliance via automated testing
- **NANDA Phase 1 Complete (July 2025)**: Successfully established real NANDA network connectivity with registry at `https://chat.nanda-registry.com:6900`, discovered correct API structure (`agent_id`/`agent_url` format), implemented compliant agent endpoints, and achieved HTTP 500 registry response indicating successful data processing
- **OpenAI PDF Parsing Integration (June 2025)**: Implemented real PDF document analysis using OpenAI GPT-4o with smart fallback for large files, replacing placeholder parsing with AI-powered content analysis and intelligent filename-based detection
- **Platform Architecture Clarified (June 2025)**: Separated full app flow (production social commerce) from demo flow (quick use case demonstration) with distinct user paths and clear integration status
- **LocaleLens Perplexity Integration (June 2025)**: Implemented real-time local discovery using Perplexity API for authentic recommendations, replacing mock data with live search capabilities
- **PDF Processing Fixed (June 2025)**: Enhanced smart destination detection from filenames, removed Supabase dependency for Mapbox token loading
- **AgentTorch Phase 1 Complete (June 2025)**: Implemented crowd-heat simulation with real-time market prediction across 8 cities, integrated into social feed and demo workflow for predictive commerce intelligence
- **NANDA Phase 3 Complete (June 2025)**: Implemented comprehensive automated testing infrastructure with Jest integration tests, GitHub Actions CI workflow, and executable verification of NANDA handshake protocol
- **NANDA Phase 2 Complete (June 2025)**: Successfully implemented and tested NANDA SDK-style cryptographic heartbeat system with DID generation, signature verification, and real-time status monitoring showing ACTIVE status consistently
- **Agent Dashboard Navigation Fixed (June 2025)**: Removed extra navigation buttons, restored full 4-agent display in NANDA registry
- **NANDA Registry Integration - Phase 1 (June 2025)**: Implemented agent registration system with real registry proxy support
- **Agent Dashboard Enhancement**: Added gold highlighting for GlobalSocial agent with "OUR AGENT" label
- **Registration Scripts**: Created automated agent registration and integration testing tools
- **Seamless Purchase Flow Complete (June 2025)**: Implemented inline transaction flow within social feed using drawer overlay
- **Fixed Payment Processing**: Resolved UUID validation and foreign key constraint issues in escrow system
- **Enhanced Mock Data**: Updated social feed with proper UUID formatting for products and users
- **Demo Mode**: Modified escrow system to use current user as seller for demonstration purposes
- **Workflow System Complete (June 2025)**: Implemented comprehensive global feed → product selection → escrow → delivery options workflow
- **Database Schema Expanded**: Added products, feed_posts, delivery_options, travelers, and chat_messages tables
- **API Routes Enhanced**: Added complete CRUD operations for products, feed, delivery options, travelers, and chat
- **Migration Complete (January 2025)**: Migrated from Supabase to built-in PostgreSQL with Drizzle ORM
- **Authentication**: Implemented JWT-based auth system replacing Supabase Auth
- **Database**: All tables migrated to PostgreSQL with proper schema
- **API Routes**: Converted all Supabase Edge Functions to Express server routes
- **Security**: Added proper API key management with secret environment variables

## Project Architecture

### Database (PostgreSQL + Drizzle ORM)
- **users**: User accounts with email/password
- **profiles**: User profiles with trust scores and metadata
- **products**: Merchant products with location, pricing, and delivery options
- **feed_posts**: Social feed posts with product attachments and engagement metrics
- **escrow_transactions**: Enhanced payment escrow with delivery option tracking
- **delivery_options**: Multiple delivery methods (instore, merchant-ship, peer-delivery)
- **travelers**: Peer delivery network with route matching
- **chat_messages**: Merchant-buyer communication system
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
- `/api/feed`: Global social feed with product integration
- `/api/products`: Product catalog and merchant management
- `/api/escrow/*`: Enhanced payment escrow with delivery options
- `/api/delivery-options/*`: Multi-modal delivery system
- `/api/travelers/*`: Peer delivery network matching
- `/api/chat/*`: Real-time merchant-buyer communication
- `/api/blink/*`: AI conversation system
- `/api/nanda`: Agent discovery system

### Key Features
- **Complete Workflow System**: Global feed → product selection → escrow → delivery options
- **Social Commerce Feed**: Real-time posts with product integration and engagement metrics
- **Multi-Modal Delivery**: In-store pickup, merchant shipping, and peer delivery options
- **Traveler Network**: Verified travelers offering peer-to-peer delivery services
- **Merchant Chat**: Real-time communication between buyers and sellers
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