import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Users, ShieldCheck, Zap, Bot, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center space-x-6 mb-10">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="neo-brutalist bg-white hover:bg-gray-100 px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-3" />
              Back to App
            </Button>
            <h1 className="text-4xl font-black text-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px' }}>
              About Global Social
            </h1>
          </div>

          {/* Hero Section */}
          <Card className="neo-brutalist mb-8">
            <CardHeader className="bg-lime-400 border-b-4 border-black">
              <CardTitle className="text-3xl font-black text-black uppercase text-center" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
                The Future of Social Commerce
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-black font-bold leading-relaxed text-center max-w-3xl mx-auto">
                Revolutionary AI-powered marketplace where every journey becomes a connection,
                every purchase builds community, and trust flows freely across borders.
              </p>
            </CardContent>
          </Card>

          {/* Core Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="neo-brutalist">
              <CardHeader className="bg-blue-400 border-b-4 border-black">
                <CardTitle className="flex items-center space-x-3 text-black">
                  <Bot className="w-6 h-6" />
                  <span className="font-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    AI Agent Network
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-black">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>NANDA Integration:</strong> Connected to global agent registry</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>Multi-Agent Orchestration:</strong> TrustPay, LocaleLens, PathSync, GlobeGuides</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>Real-time Coordination:</strong> OpenAI Conductor with GPT-4o reasoning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="neo-brutalist">
              <CardHeader className="bg-yellow-400 border-b-4 border-black">
                <CardTitle className="flex items-center space-x-3 text-black">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="font-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Trust & Security
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-black">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Escrow System:</strong> Secure payment processing with release conditions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Trust Scoring:</strong> Dynamic reputation system across network</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Verified Network:</strong> Authentication and verification protocols</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="neo-brutalist">
              <CardHeader className="bg-green-400 border-b-4 border-black">
                <CardTitle className="flex items-center space-x-3 text-black">
                  <MapPin className="w-6 h-6" />
                  <span className="font-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Global Logistics
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-black">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Peer Delivery:</strong> Traveler-powered logistics network</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>3D Discovery:</strong> Interactive global traveler visualization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Smart Matching:</strong> AI-powered route and capacity optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="neo-brutalist">
              <CardHeader className="bg-purple-400 border-b-4 border-black">
                <CardTitle className="flex items-center space-x-3 text-black">
                  <Zap className="w-6 h-6" />
                  <span className="font-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Smart Commerce
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-black">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span><strong>Social Feed:</strong> Product discovery through social interactions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span><strong>Crowd Intelligence:</strong> AgentTorch market prediction engine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span><strong>Local Discovery:</strong> Perplexity-powered recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Technology Stack */}
          <Card className="neo-brutalist mb-8">
            <CardHeader className="bg-cyan-400 border-b-4 border-black">
              <CardTitle className="text-2xl font-black text-black uppercase text-center" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
                Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="font-black text-lg mb-3 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Frontend
                  </h3>
                  <p className="text-black">React, TypeScript, Tailwind CSS, WebGL Visualizations</p>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-3 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Backend
                  </h3>
                  <p className="text-black">Node.js, Express, PostgreSQL, Drizzle ORM</p>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-3 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    AI & Integration
                  </h3>
                  <p className="text-black">OpenAI GPT-4o, NANDA Protocol, Perplexity API</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="neo-brutalist">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-black text-black mb-4 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
                Join the Revolution
              </h2>
              <p className="text-lg text-black font-bold mb-6">
                Experience the future of social commerce powered by AI agents and global community.
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => navigate('/demo')}
                  className="neo-brutalist bg-lime-400 hover:bg-lime-500 text-black px-8 py-3"
                >
                  Try Demo
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="neo-brutalist bg-blue-400 hover:bg-blue-500 text-black px-8 py-3"
                >
                  Explore Platform
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}