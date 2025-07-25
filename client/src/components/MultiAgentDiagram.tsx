import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowDown, Bot, Users, MapPin, CreditCard, MessageSquare, Globe, Zap, Target } from 'lucide-react';

export default function MultiAgentDiagram() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-black mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          GLOBAL SOCIAL MULTI-AGENT ORCHESTRATION
        </h1>
        <p className="text-lg text-gray-600">
          AI-Powered Social Commerce with Intelligent Agent Coordination
        </p>
      </div>

      {/* User Input Layer */}
      <Card className="neo-brutalist bg-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            <Users className="w-8 h-8 mr-3" />
            USER INTERACTION LAYER
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white neo-brutalist text-center">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-bold">Chat Messages</div>
              <div className="text-sm text-gray-600">"Find Nike shoes from NYC"</div>
            </div>
            <div className="p-4 bg-white neo-brutalist text-center">
              <div className="text-2xl mb-2">🖱️</div>
              <div className="font-bold">UI Clicks</div>
              <div className="text-sm text-gray-600">Product selection, city filter</div>
            </div>
            <div className="p-4 bg-white neo-brutalist text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-bold">Map Interactions</div>
              <div className="text-sm text-gray-600">Zoom, marker clicks</div>
            </div>
            <div className="p-4 bg-white neo-brutalist text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-bold">Form Submissions</div>
              <div className="text-sm text-gray-600">Travel requests, payments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Central Orchestrator */}
      <div className="text-center">
        <ArrowDown className="w-8 h-8 mx-auto text-gray-500" />
      </div>

      <Card className="neo-brutalist bg-yellow-200">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center justify-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            <Bot className="w-8 h-8 mr-3" />
            OPENAI AGENTS-SDK CONDUCTOR (GPT-4o)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="p-4 bg-black text-yellow-400 neo-brutalist inline-block">
              <div className="font-bold text-lg">CENTRAL AI ORCHESTRATOR</div>
              <div className="text-sm">Analyzes all user actions • Coordinates specialized agents • Maintains context memory</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white neo-brutalist">
              <div className="font-bold text-green-600 mb-2">📊 ANALYSIS ENGINE</div>
              <ul className="text-sm space-y-1">
                <li>• Intent classification</li>
                <li>• Context understanding</li>
                <li>• Priority assessment</li>
                <li>• Agent selection logic</li>
              </ul>
            </div>
            <div className="p-4 bg-white neo-brutalist">
              <div className="font-bold text-blue-600 mb-2">🔄 WORKFLOW COORDINATION</div>
              <ul className="text-sm space-y-1">
                <li>• Multi-agent task routing</li>
                <li>• Parallel execution</li>
                <li>• Response aggregation</li>
                <li>• Error handling</li>
              </ul>
            </div>
            <div className="p-4 bg-white neo-brutalist">
              <div className="font-bold text-purple-600 mb-2">🧠 MEMORY SYSTEM</div>
              <ul className="text-sm space-y-1">
                <li>• User conversation history</li>
                <li>• Context persistence</li>
                <li>• Preference learning</li>
                <li>• Cross-session continuity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Network */}
      <div className="text-center">
        <ArrowDown className="w-8 h-8 mx-auto text-gray-500" />
      </div>

      <Card className="neo-brutalist bg-green-50">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            <Zap className="w-8 h-8 mr-3" />
            SPECIALIZED AGENT NETWORK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* TrustPay Agent */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
                <div className="font-black text-lg">TRUSTPAY</div>
                <Badge className="bg-green-200 text-green-800">Payment & Escrow</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-bold text-green-600">Capabilities:</div>
                <ul className="space-y-1">
                  <li>• Stripe payment processing</li>
                  <li>• X402 micropayments</li>
                  <li>• Escrow fund management</li>
                  <li>• Trust score calculation</li>
                </ul>
                <div className="font-bold text-green-600 mt-3">Use Cases:</div>
                <ul className="space-y-1">
                  <li>• Product purchase flow</li>
                  <li>• Peer delivery payments</li>
                  <li>• Marketplace transactions</li>
                </ul>
              </div>
            </div>

            {/* GlobeGuides Agent */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <div className="font-black text-lg">GLOBEGUIDES</div>
                <Badge className="bg-blue-200 text-blue-800">Travel Intelligence</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-bold text-blue-600">Capabilities:</div>
                <ul className="space-y-1">
                  <li>• Route optimization</li>
                  <li>• Flight tracking</li>
                  <li>• Traveler matching</li>
                  <li>• Logistics coordination</li>
                </ul>
                <div className="font-bold text-blue-600 mt-3">Use Cases:</div>
                <ul className="space-y-1">
                  <li>• Peer delivery routing</li>
                  <li>• Travel itinerary planning</li>
                  <li>• Airport connections</li>
                </ul>
              </div>
            </div>

            {/* LocaleLens Agent */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div className="font-black text-lg">LOCALELENS</div>
                <Badge className="bg-purple-200 text-purple-800">Local Discovery</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-bold text-purple-600">Capabilities:</div>
                <ul className="space-y-1">
                  <li>• Perplexity API integration</li>
                  <li>• Local recommendations</li>
                  <li>• Cultural insights</li>
                  <li>• City-specific data</li>
                </ul>
                <div className="font-bold text-purple-600 mt-3">Use Cases:</div>
                <ul className="space-y-1">
                  <li>• Restaurant recommendations</li>
                  <li>• Shopping districts</li>
                  <li>• Cultural experiences</li>
                </ul>
              </div>
            </div>

            {/* PathSync Agent */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <div className="font-black text-lg">PATHSYNC</div>
                <Badge className="bg-orange-200 text-orange-800">Coordination</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-bold text-orange-600">Capabilities:</div>
                <ul className="space-y-1">
                  <li>• Multi-agent coordination</li>
                  <li>• Workflow orchestration</li>
                  <li>• Task prioritization</li>
                  <li>• Response synthesis</li>
                </ul>
                <div className="font-bold text-orange-600 mt-3">Use Cases:</div>
                <ul className="space-y-1">
                  <li>• Complex multi-step flows</li>
                  <li>• Agent conflict resolution</li>
                  <li>• Priority management</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Networks */}
      <div className="text-center">
        <ArrowDown className="w-8 h-8 mx-auto text-gray-500" />
      </div>

      <Card className="neo-brutalist bg-pink-50">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            <Globe className="w-8 h-8 mr-3" />
            EXTERNAL NETWORK INTEGRATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NANDA Network */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="text-center mb-3">
                <div className="font-black text-lg text-pink-600">NANDA AGENT NETWORK</div>
                <Badge className="bg-pink-200 text-pink-800">External AI Agents</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-bold">Registry Integration:</div>
                <ul className="space-y-1">
                  <li>• Discovery of external agents</li>
                  <li>• Capability mapping</li>
                  <li>• Secure communication</li>
                  <li>• Trust verification</li>
                </ul>
                <div className="font-bold mt-3">Use Cases:</div>
                <ul className="space-y-1">
                  <li>• Specialized domain expertise</li>
                  <li>• Extended capability network</li>
                  <li>• Cross-platform coordination</li>
                </ul>
              </div>
            </div>

            {/* AgentTorch */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="text-center mb-3">
                <div className="font-black text-lg text-red-600">AGENTTORCH CROWD INTELLIGENCE</div>
                <Badge className="bg-red-200 text-red-800">Crowd Analytics</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-bold">Crowd Heat Analysis:</div>
                <ul className="space-y-1">
                  <li>• Market trend prediction</li>
                  <li>• Crowd behavior simulation</li>
                  <li>• Commerce opportunity scoring</li>
                  <li>• Real-time sentiment analysis</li>
                </ul>
                <div className="font-bold mt-3">Use Cases:</div>
                <ul className="space-y-1">
                  <li>• Product demand forecasting</li>
                  <li>• Social commerce insights</li>
                  <li>• Market timing optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-World Use Case Examples */}
      <Card className="neo-brutalist bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-2xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            REAL-WORLD USE CASE SCENARIOS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Use Case 1 */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="font-black text-lg mb-3 text-green-600">🛍️ PEER DELIVERY PURCHASE</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-bold">1. USER INPUT</div>
                  <div>Maya in Bengaluru chats: "I need Nike Air Max 270 from NYC"</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">2. CONDUCTOR ANALYSIS</div>
                  <div>GPT-4o identifies: Product request + Location matching + Payment needed</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">3. AGENT COORDINATION</div>
                  <div>GlobeGuides finds Raj (NYC→Bengaluru), TrustPay creates $150 escrow</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">4. RESULT</div>
                  <div>"Raj can bring your Nike Air Max 270 for $150, arriving Bengaluru 7 Jul • escrow held 💰"</div>
                </div>
              </div>
            </div>

            {/* Use Case 2 */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="font-black text-lg mb-3 text-blue-600">✈️ TRAVEL PLANNING WITH LOCAL DISCOVERY</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-bold">1. USER INPUT</div>
                  <div>Sarah uploads Tokyo itinerary PDF and asks for restaurant recommendations</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">2. CONDUCTOR ANALYSIS</div>
                  <div>GPT-4o processes PDF, identifies Tokyo location and dining intent</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">3. AGENT COORDINATION</div>
                  <div>LocaleLens queries Perplexity for authentic Tokyo dining, GlobeGuides optimizes routes</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">4. RESULT</div>
                  <div>Personalized Tokyo restaurant list with routes, local insights, and booking options</div>
                </div>
              </div>
            </div>

            {/* Use Case 3 */}
            <div className="p-4 bg-white neo-brutalist">
              <div className="font-black text-lg mb-3 text-purple-600">🌐 MULTI-AGENT MARKET ANALYSIS</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-bold">1. USER INPUT</div>
                  <div>User clicks "Delhi" on connections map to explore commerce opportunities</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">2. CONDUCTOR ANALYSIS</div>
                  <div>GPT-4o identifies market research intent for Delhi travel hub</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">3. AGENT COORDINATION</div>
                  <div>AgentTorch analyzes crowd patterns, LocaleLens gets Delhi market data, NANDA agents provide additional insights</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold">4. RESULT</div>
                  <div>Comprehensive market analysis: "45,000 daily arrivals • $2M commerce opportunity • Top categories: Electronics, Fashion"</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Architecture Summary */}
      <Card className="neo-brutalist bg-black text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-black mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              ARCHITECTURE SUCCESS METRICS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800 neo-brutalist">
                <div className="text-3xl font-bold text-lime-400">89%</div>
                <div className="text-sm">Multi-Agent Success Rate</div>
              </div>
              <div className="p-4 bg-gray-800 neo-brutalist">
                <div className="text-3xl font-bold text-yellow-400">4</div>
                <div className="text-sm">Specialized Local Agents</div>
              </div>
              <div className="p-4 bg-gray-800 neo-brutalist">
                <div className="text-3xl font-bold text-pink-400">∞</div>
                <div className="text-sm">External NANDA Agents</div>
              </div>
              <div className="p-4 bg-gray-800 neo-brutalist">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm">Real-time Orchestration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}