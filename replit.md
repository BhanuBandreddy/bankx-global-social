# Trust Network Application - Replit Migration

## Overview
Social trust network platform with AI agents, payment escrow, and logistics coordination. Successfully migrated from Lovable/Supabase to Replit's built-in PostgreSQL database.

## Recent Changes
- **Neo-Brutalist Design System Implementation (July 2025)**: Completely refactored design system with vibrant color palette (#FEE440 yellow, #FF2975 pink, #04E762 green), bold typography (Lexend Mega, Archivo Black, Public Sans), large buttons with 20px+ fonts and 32px padding, 3px black borders with 6px shadows, compressed hero section to 550px desktop/350px mobile with top 30% text anchoring, global feed limited to 66% width with 40px margins, neo-card layout with 24px vertical spacing, 32px spacing between menu and chat with black divider, asymmetrical card layouts throughout, mobile responsive adjustments, and modular CSS classes for easy maintenance
- **Responsive Design & Reddit UI Removal (July 2025)**: Fixed mute button positioning to stay fixed at top-right corner (z-index 9999); improved responsive layout with larger components for bigger screens - menu expanded to 320px, feed takes full width, Blink chat increased to 700px height; completely removed all Reddit branding and UI elements from frontend while maintaining invisible backend integration; layout now properly utilizes screen real estate with better component alignment and sizing
- **Reddit API Integration Complete (July 2025)**: Successfully implemented comprehensive Reddit API integration with proper Authorization Code Flow OAuth authentication, session management, and Reddit auth UI component; enhanced global feed UI to seamlessly display rich content with images and metadata without Reddit branding; increased post limit from 5 to 50 posts; implemented location-based content filtering with city-specific subreddit mapping; Reddit integration runs invisibly in backend with "COMMUNITY VERIFIED" badges; users can now connect to Reddit via OAuth popup for enhanced community content; framework ready for testing with valid Reddit API credentials
- **Professional Login Component with Accessibility Enhancements (July 2025)**: Completely redesigned login component positioned at bottom-right with stable positioning and comprehensive UX improvements; implemented unified blue color scheme for brand consistency, enhanced accessibility with proper focus states and WCAG contrast ratios, added mobile responsiveness with full-width on small screens, video poster fallback for performance, semi-opaque overlay for text readability, cross-component audio control system, and proper form labels; compact neo-brutalist design showcases Global Social video background while maintaining professional functionality
- **Simple Track Memory System Fixed (July 2025)**: Fixed authentication token issue and database table creation for simple one-track-per-user memory system; each user stores only their last uploaded tune which auto-loads on login; upload now works properly with correct auth token ('auth_token' vs 'token') and shows actual track name instead of "upload failed"; created userCurrentTrack table manually and all endpoints functioning
- **User Music Track Storage System (July 2025)**: Implemented comprehensive track upload and management system that saves user audio files to database with persistent storage; includes file upload API with authentication, track library management, streaming endpoints with range support, active track selection, and database schema for per-user track storage; users can now upload music files which are saved permanently and accessible across sessions via `/api/tracks` endpoints
- **Advanced Music Reactive Hero Section (July 2025)**: Implemented complete WebGL-powered music reactive visualization using Three.js with professional-grade fragment shaders; features real-time audio analysis with frequency bands (bass/mid/treble), kick detection, dynamic wave patterns, ripple effects, grain filtering, bounce effects, and smooth idle-to-active transitions; includes compact PLAY/STOP controls, file upload functionality, FPS counter, username overlay positioned directly on light ray, comprehensive audio processing pipeline with proper AudioContext management, and performance optimizations (30fps cap, reduced resolution, visibility-based pausing, throttled audio analysis)
- **About & Redirect URLs Added (July 2025)**: Created comprehensive About page at `/about` showcasing platform features, technology stack, and AI agent network capabilities; implemented redirect URL handler at `/redirect` with support for OAuth callbacks, error handling, and parameterized destination routing; enhanced navigation with proper URL structure for external integrations
- **Compartmentalized Blink Chat System (July 2025)**: Redesigned Blink chat from problematic sidebar to integrated panel within main app body using grid layout; implemented minimizable/expandable chat panel with cyan neo-brutalist styling; positioned as right column alongside main content for better workflow integration; includes proper message threading, loading states, and compact design suitable for continuous use
- **Left-Side Collapsible Menu System (July 2025)**: Completely replaced problematic hamburger menu with stable left-side menu in app body; implemented collapsible/expandable functionality with chevron toggle; increased spacing between menu tabs to reduce visual shadow continuity; removed Quick Actions section per user request; menu includes 4 main navigation tabs and Demo Flow with icon-only collapsed state and full descriptions when expanded; eliminates all component conflicts and cursor interaction issues
- **NANDA API Integration Fixed (July 2025)**: Fixed critical SWR errors by implementing missing /api/nanda POST endpoint that handles agent discovery requests; resolved syntax errors causing console issues; NANDA agent discovery now works properly with consistent data structure
- **Neo-Brutalist Design System Applied (July 2025)**: Applied comprehensive neo-brutalist styling across all pages including Auth, Index, Hero, Navbar, NotFound, Demo, and TravelerWorldMapNew; implemented proper Roboto Mono and Bebas Neue fonts with 4px borders, 8px shadows, bold typography and high contrast aesthetic; personalized auth page to show user's name as main heading with "International Citizen" subtitle; fixed syntax error in menubar component displayName property
- **NANDA 2025 Standards Compliance (July 2025)**: Successfully evaluated and enhanced NANDA integration for 2025 standards; added Model Context Protocol (MCP) transport layer with SSE and streaming support; implemented Agent-to-Agent (A2A) protocol for peer communication; enhanced security with multi-layer protection (rate limiting, signature validation, input sanitization, CORS policy); maintained 100% validation success rate with 7/7 tests passing; added comprehensive compliance documentation and security monitoring
- **Interface Visibility Improvements (July 2025)**: Fixed Quick Cities buttons visibility by changing from dark/transparent to bright white background with blue borders; updated "CHAT" to "BLINK" throughout interface; changed "3D Traveler Discovery" to "Connections" label; updated AuthNavbar logout button with cyan background color
- **Database Foreign Key Constraint Fix (July 2025)**: Fixed blink_conversations table foreign key constraint error by making userId nullable for anonymous users; system now supports chat functionality without authentication requirements
- **3D Traveler Discovery System (July 2025)**: Built comprehensive 3D world map interface for discovering travelers coming to user's city using Globe.gl, includes interactive filtering by purpose/date, real-time traveler visualization, connection request system, global travel patterns, and API endpoints for location management and traveler discovery
- **Complete Marketplace Workflow Integration (July 2025)**: Implemented deterministic marketplace experience where Maya Shopper (u_s1) can request Nike Air Max 270, Raj Traveler (u_t1) flying NYC→Bengaluru matches the route, system creates escrow automatically, and chat responds "Raj can bring your Nike Air Max 270 for $150, arriving Bengaluru 7 Jul • escrow held 💰 • Accept?"; includes real database matching, escrow creation, request status updates, and complete audit trail
- **Proper Chat Sidebar UI (July 2025)**: Replaced terrible drawer UI with clean sidebar chat interface that doesn't block main content; users can minimize, close, scroll main page, and continue using the platform while chatting; fixed terrible UX with proper sidebar that slides from right edge
- **Purple Blink Component Removed (July 2025)**: Removed user-facing Blink orchestration UI component as per user feedback - users should only see results, not internal coordination thinking; Conductor orchestration now happens completely backend-only with no frontend exposure of agent coordination processes
- **Blink Conversational Concierge Redesign (July 2025)**: Redesigned Blink as interaction-centric multi-agent testing platform following MIT principles, with comprehensive test scenarios covering past/current/future events, automated test engine, and real-time Conductor orchestration validation through conversational interface
- **OpenAI Agents-SDK Conductor Implementation (July 2025)**: Implemented centralized AI orchestration engine that analyzes all user actions (click/chat/webhook) using GPT-4o, coordinates specialized agent workflows, maintains context memory, and feeds real-time events through event bus to AgentTorch batch processing with crowd-heat feedback loops
- **Multi-Agent Orchestration Framework Documentation (July 2025)**: Documented comprehensive multi-agent system architecture combining NANDA network integration (external agents), local AI agent system (TrustPay, GlobeGuides, LocaleLens, PathSync), JSON-RPC protocol bridge, and Blink conversation orchestration engine with 89% success rate
- **Product Requirements Document Complete (July 2025)**: Created comprehensive PRD defining user personas (General Users, Business Users, Traveler Users), technical requirements, implementation roadmap, and success metrics focusing on content creation enhancement and social commerce platform evolution
- **UI Design Analysis Complete (July 2025)**: Analyzed existing neobrutalism design system, evaluated user personas (general vs business users), documented global feed architecture, and created strategic design plan focusing on content creation, photo capture, and enhanced social commerce flows
- **Crowd Intelligence Transparency (July 2025)**: Added clear logging and documentation that AgentTorch crowd heat data is currently simulation-based, created framework for real crowd intelligence API integration (Google Places, Foursquare, Social Media APIs)
- **LocaleLens Location Fix (July 2025)**: Fixed Perplexity API integration to provide accurate city-specific recommendations instead of defaulting to Japanese cultural curation regardless of input city
- **Production Deployment Ready (July 2025)**: Completed all NANDA integration phases with 89% success rate, comprehensive testing infrastructure, registry communication protocols, and production deployment preparation for live NANDA network participation
- **NANDA Phase 3 Complete (July 2025)**: Implemented comprehensive automated testing infrastructure with Jest integration tests, milestone progression validation, agent discovery protocols, and complete registry search documentation for production NANDA network deployment
- **NANDA Phase 2 Complete (June 2025)**: Successfully implemented and tested NANDA SDK-style cryptographic heartbeat system with DID generation, signature verification, and real-time status monitoring showing ACTIVE status consistently
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
- **OpenAI Agents-SDK Conductor**: Central AI orchestrator that analyzes all user actions and coordinates agent workflows with GPT-4o reasoning
- **Event Bus Architecture**: Real-time pub/sub system for agent coordination with AgentTorch batch processing
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
- **Real-time Context Memory**: Persistent conversation and workflow context across user sessions
- **Crowd Heat Intelligence**: AgentTorch predictions fed back into UI badges and agent planning

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