
import { ArrowRight, Users, Shield, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-white border-b-4 border-black">
      {/* Background Elements */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-black border-4 border-black transform rotate-12"></div>
      <div className="absolute top-16 right-16 w-24 h-24 bg-gray-300 border-4 border-black transform -rotate-12"></div>
      <div className="absolute bottom-8 left-1/3 w-20 h-20 bg-gray-200 border-4 border-black transform rotate-45"></div>

      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-black uppercase tracking-tight leading-none">
            The Future of
            <br />
            <span className="bg-white px-4 border-4 border-black transform -skew-x-12 inline-block">
              Social Commerce
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-black font-medium mb-12 leading-relaxed max-w-3xl mx-auto">
            Revolutionary AI-powered marketplace where every journey becomes a connection,
            every purchase builds community, and trust flows freely across borders.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="px-8 py-4 bg-black text-white font-medium text-lg border-4 border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-4px] hover:translate-y-[-4px] flex items-center justify-center space-x-3">
              <span>JOIN THE REVOLUTION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="px-8 py-4 bg-white text-black font-medium text-lg border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-2px] hover:translate-y-[-2px]">
              WATCH DEMO
            </button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white border-4 border-black p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4 uppercase">Social-First Commerce</h3>
              <p className="text-black font-normal leading-relaxed">Every transaction becomes a social connection, building global communities through commerce.</p>
            </div>

            <div className="bg-gray-100 border-4 border-black p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mb-6 mx-auto transform rotate-12">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4 uppercase">AI-Driven Trust</h3>
              <p className="text-black font-normal leading-relaxed">Advanced AI agents create verifiable trust bridges across all global interactions.</p>
            </div>

            <div className="bg-white border-4 border-black p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4 uppercase">Borderless Payments</h3>
              <p className="text-black font-normal leading-relaxed">Seamless global transactions without traditional banking limitations or borders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
