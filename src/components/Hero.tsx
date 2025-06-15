
import { ArrowRight, Users, Shield, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            The Future of
            <br />
            Social Commerce
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
            Revolutionary AI-powered marketplace where every journey becomes a connection,
            every purchase builds community, and trust flows freely across borders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
              <span>Join the Revolution</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Social-First Commerce</h3>
              <p className="text-white/70">Every transaction becomes a social connection, building global communities through commerce.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Driven Trust</h3>
              <p className="text-white/70">Advanced AI agents create verifiable trust bridges across all global interactions.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Borderless Payments</h3>
              <p className="text-white/70">Seamless global transactions without traditional banking limitations or borders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
