import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, MapPin, Compass, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { WorkflowExperience } from "@/components/WorkflowExperience";
import { LocaleLensDemo } from "@/components/LocaleLensDemo";
import { AgentTorchDemo } from "@/components/AgentTorchDemo";

export default function Demo() {
  const [selectedDemo, setSelectedDemo] = useState<'overview' | 'workflow' | 'localelens' | 'agenttorch'>('overview');
  const [, setLocation] = useLocation();

  const demoCards = [
    {
      id: 'workflow',
      title: 'PDF Itinerary → Agentic Flow',
      description: 'Upload travel document, get AI parsing, crowd intelligence, and local discovery',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-400 to-purple-400',
      features: ['Smart PDF parsing', 'Destination detection', 'Crowd heat integration']
    },
    {
      id: 'localelens',
      title: 'LocaleLens Discovery',
      description: 'Real-time local recommendations powered by Perplexity AI',
      icon: <Compass className="w-6 h-6" />,
      color: 'from-green-400 to-blue-400',
      features: ['Perplexity integration', 'Category filtering', 'Local tips']
    },
    {
      id: 'agenttorch',
      title: 'AgentTorch Intelligence',
      description: 'Live crowd-heat simulation across 8 global cities',
      icon: <MapPin className="w-6 h-6" />,
      color: 'from-purple-400 to-red-400',
      features: ['Real-time trends', '80+ data points', 'Market prediction']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="neo-brutalist bg-white hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-black text-black mb-2 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                AI Agent Demo Platform
              </h1>
              <p className="text-lg text-black font-bold max-w-3xl mx-auto">
                Experience the complete agentic workflow: PDF processing, real-time local discovery, 
                and crowd intelligence for travel commerce.
              </p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Demo Selection */}
          {selectedDemo === 'overview' && (
            <div className="space-y-6">
              {/* Architecture Overview */}
              <Card className="neo-brutalist">
                <CardHeader className="bg-yellow-400">
                  <CardTitle className="text-2xl font-black text-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Platform Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3">🏗️ Full App Flow</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          <span>Social Feed → Product Selection</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          <span>Escrow Payment → Delivery Options</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          <span>NANDA Agent Registry (5 agents)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          <span>Real payment processing</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-3">⚡ Demo Flow</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          <span>PDF Upload → AI Parsing</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          <span>LocaleLens → Perplexity Discovery</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          <span>AgentTorch → Crowd Intelligence</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          <span>Quick proof-of-concept</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {demoCards.map((demo) => (
                  <Card 
                    key={demo.id} 
                    className="border-4 border-black cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedDemo(demo.id as any)}
                  >
                    <CardHeader className={`bg-gradient-to-r ${demo.color} border-b-4 border-black`}>
                      <div className="flex items-center space-x-3">
                        {demo.icon}
                        <CardTitle className="text-lg font-bold text-black">
                          {demo.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-gray-600 mb-4">{demo.description}</p>
                      <div className="space-y-2">
                        {demo.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="w-full mt-4 bg-black text-white hover:bg-gray-800"
                        size="sm"
                      >
                        Try Demo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Status Overview */}
              <Card className="border-4 border-black">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b-4 border-black">
                  <CardTitle className="text-xl font-bold text-black">
                    🔧 Integration Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-bold">AgentTorch</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Live simulation active</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold">LocaleLens</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Perplexity API required</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold">Mapbox</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Token required for maps</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Individual Demo Views */}
          {selectedDemo === 'workflow' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDemo('overview')}
                  className="border-2 border-black"
                >
                  ← Back to Overview
                </Button>
                <h2 className="text-2xl font-bold">PDF Itinerary Workflow</h2>
              </div>
              <WorkflowExperience />
            </div>
          )}

          {selectedDemo === 'localelens' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDemo('overview')}
                  className="border-2 border-black"
                >
                  ← Back to Overview
                </Button>
                <h2 className="text-2xl font-bold">LocaleLens Discovery</h2>
              </div>
              <LocaleLensDemo destination="Tokyo" />
            </div>
          )}

          {selectedDemo === 'agenttorch' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDemo('overview')}
                  className="border-2 border-black"
                >
                  ← Back to Overview
                </Button>
                <h2 className="text-2xl font-bold">AgentTorch Intelligence</h2>
              </div>
              <AgentTorchDemo />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}