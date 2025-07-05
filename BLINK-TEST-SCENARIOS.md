# Blink Conversational Concierge - Test Scenarios

## Overview
Blink serves as an interaction-centric testing platform for the Conductor orchestration system, following MIT multi-agent design principles where intelligence emerges from interaction patterns rather than individual agent sophistication.

## Test Architecture

### Event Types Framework
Based on temporal interaction patterns:

1. **PAST Events**: Historical data retrieval and analysis
2. **CURRENT Events**: Real-time contextual assistance  
3. **FUTURE Events**: Planning and predictive coordination

### Complexity Levels
- **Simple**: Single agent, direct interaction
- **Medium**: 2-3 agents, sequential coordination
- **Complex**: 4+ agents, emergent coordination patterns

## Test Scenarios

### PAST EVENT SCENARIOS

#### Past-001: Purchase History Retrieval
- **User Message**: "Show me my recent electronics purchases from Tokyo last month"
- **Expected Agents**: TrustPay (payment data), LocaleLens (location context)
- **Interaction Pattern**: Payment retrieval → Location filtering → Temporal analysis
- **Tests**: Agent coordination, data correlation, temporal queries

#### Past-002: Wishlist Analysis (Complex)
- **User Message**: "What items did I save to wishlist but never purchased? Why didn't I buy them?"
- **Expected Agents**: TrustPay, LocaleLens, GlobeGuides
- **Interaction Pattern**: Wishlist retrieval → Purchase gap analysis → Behavioral insight generation
- **Tests**: Multi-agent behavioral analysis, emergent pattern recognition

#### Past-003: Refund Status Check
- **User Message**: "Check if my refund for the camera I returned two weeks ago went through"
- **Expected Agents**: TrustPay
- **Interaction Pattern**: Transaction verification → Refund status lookup
- **Tests**: Single-agent efficiency, data integrity

### CURRENT EVENT SCENARIOS

#### Current-001: Real-time Local Discovery
- **User Message**: "What's trending in Shibuya right now? Show me crowd heat and popular spots"
- **Expected Agents**: LocaleLens
- **Interaction Pattern**: Location detection → Crowd analysis → Trend aggregation
- **Tests**: Real-time data integration, AgentTorch crowd heat correlation

#### Current-002: Navigation and Transport
- **User Message**: "I need the nearest train station and best route to Tokyo Station from my current location"
- **Expected Agents**: PathSync (routing), LocaleLens (local knowledge)
- **Interaction Pattern**: Location detection → Route calculation → Transport optimization
- **Tests**: Cross-agent coordination, real-time adaptation

#### Current-003: Contextual Shopping Assistant (Complex)
- **User Message**: "I'm in an electronics district. What should I buy based on my wishlist and current deals?"
- **Expected Agents**: LocaleLens, TrustPay, PathSync
- **Interaction Pattern**: Location context → Wishlist analysis → Price comparison → Store optimization
- **Tests**: Complex multi-agent commerce coordination, contextual reasoning

### FUTURE EVENT SCENARIOS

#### Future-001: Itinerary Planning (Complex)
- **User Message**: "Here's my flight to Seoul next week. Plan my first day including transport, meals, and shopping"
- **Expected Agents**: GlobeGuides, PathSync, LocaleLens, TrustPay
- **Interaction Pattern**: Itinerary parsing → Destination planning → Route optimization → Budget planning
- **Tests**: Full four-agent coordination, comprehensive planning workflows

#### Future-002: Flight Status and Ground Transport
- **User Message**: "Check my flight tomorrow and book a cab to arrive 2 hours before departure"
- **Expected Agents**: GlobeGuides (flight data), PathSync (ground transport)
- **Interaction Pattern**: Flight monitoring → Timing calculation → Transport booking
- **Tests**: Temporal coordination, service integration

#### Future-003: Pre-arrival Delivery Setup
- **User Message**: "I'm traveling next month. Set up my online orders to arrive after I return on the 15th"
- **Expected Agents**: PathSync, TrustPay, GlobeGuides
- **Interaction Pattern**: Travel schedule analysis → Delivery timing → Order management
- **Tests**: Temporal logistics coordination, predictive planning

### CROSS-TEMPORAL SCENARIOS

#### Cross-001: Learning from Past for Future (Complex)
- **User Message**: "Based on my previous trips to Japan, what should I differently this time? Plan accordingly"
- **Expected Agents**: All four agents
- **Interaction Pattern**: Historical analysis → Pattern recognition → Improvement suggestions → Adaptive planning
- **Tests**: Emergent learning behavior, cross-temporal intelligence

#### Cross-002: Real-time Adaptation (Complex)
- **User Message**: "My flight got delayed. Adjust my entire day plan and bookings accordingly"
- **Expected Agents**: All four agents
- **Interaction Pattern**: Disruption detection → Cascading updates → Rebooking coordination → Cost optimization
- **Tests**: System resilience, adaptive coordination under disruption

## Testing Framework

### Automated Test Suite
```bash
# Run all scenarios
curl -X POST http://localhost:5000/api/blink/test/suite

# Run by event type
curl -X POST http://localhost:5000/api/blink/test/suite \
  -d '{"filter": {"eventType": "past"}}'

# Run by complexity
curl -X POST http://localhost:5000/api/blink/test/suite \
  -d '{"filter": {"complexityLevel": "complex"}}'

# Run specific scenario
curl -X POST http://localhost:5000/api/blink/test/scenario/past-001
```

### Success Metrics
1. **Agent Coordination**: Did expected agents activate?
2. **Interaction Patterns**: Were appropriate interaction patterns detected?
3. **Emergent Behavior**: Did unexpected but beneficial coordination emerge?
4. **Reasoning Quality**: Is Conductor analysis logical and relevant?
5. **Response Time**: How quickly did the system respond?

### Evaluation Criteria

#### Expected Outcomes
- **Simple scenarios**: Single agent, sub-1000ms response
- **Medium scenarios**: 2-3 agents, coordination within 2000ms
- **Complex scenarios**: 4+ agents, emergent behavior detection

#### Emergent Behavior Indicators
- Unexpected agent combinations that improve outcomes
- Adaptive reasoning based on context
- Cross-temporal learning patterns
- System resilience under disruption

## Interactive Testing via Blink UI

### Visual Test Mode
1. **Enable Test Mode**: Click "TEST ON" in Blink interface
2. **Quick Test Buttons**: Click pre-defined scenarios by event type
3. **Custom Testing**: Type any message to trigger Conductor analysis
4. **Real-time Feedback**: See agent coordination in Conductor Dashboard

### Expected UI Behavior
- **Past events**: Blue badges, historical data display
- **Current events**: Green badges, real-time information
- **Future events**: Purple badges, planning interfaces
- **Multi-agent**: Orange badges showing agent count
- **Conductor insights**: Purple preview boxes with reasoning

## MIT Multi-Agent Principles Applied

### Interaction-Centric Design
- **Focus**: How agents influence each other, not individual capabilities
- **Testing**: Interaction patterns drive test evaluation
- **Emergence**: Unexpected coordination patterns are positive indicators

### Multi-Scale Composition
- **Local**: Individual agent responses
- **Network**: Agent-to-agent coordination
- **Global**: System-wide emergent behavior
- **Feedback**: Outcomes influence future interactions

### Adaptive Coordination
- **Discovery**: Tests reveal coordination patterns
- **Learning**: System adapts based on interaction history
- **Resilience**: Graceful degradation under failure

This testing framework validates that Blink successfully demonstrates interaction-centric multi-agent coordination where intelligence emerges from how agents influence each other, not from sophisticated individual components.