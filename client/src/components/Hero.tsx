
import { ArrowRight, Users, ShieldCheck, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white neo-brutalist border-black" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      {/* Neo-brutalist Background Elements */}
      <div className="absolute top-8 left-8 w-32 h-32 neo-brutalist bg-yellow-400 transform rotate-12 hidden md:block"></div>
      <div className="absolute bottom-8 right-8 w-20 h-20 neo-brutalist bg-blue-500 transform -rotate-12 hidden md:block"></div>

      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-black text-black text-[clamp(2.2rem,5vw,4rem)] leading-tight mb-8 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            The Future of
            <br />
            <span className="neo-brutalist bg-lime-400 px-4 transform -skew-x-12 inline-block">
              Social Commerce
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-black font-bold mb-12 leading-relaxed max-w-3xl mx-auto">
            Revolutionary AI-powered marketplace where every journey becomes a connection,
            every purchase builds community, and trust flows freely across borders.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <button className="neo-brutalist px-8 py-4 bg-black text-white font-black text-lg uppercase flex items-center justify-center space-x-3" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              <span>JOIN THE REVOLUTION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="neo-brutalist px-8 py-4 bg-white text-black font-black text-lg uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              WATCH DEMO
            </button>
          </div>

          {/* Demo Flow pill moved from navbar */}
          <div className="mb-16">
            <button
              onClick={() => navigate("/demo")}
              className="bg-accent text-white rounded-full px-3 py-1 text-sm font-medium hover:bg-accent/90 transition-colors focus-ring"
            >
              DEMO FLOW
            </button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="neo-brutalist bg-white p-8">
                <div className="w-16 h-16 neo-brutalist bg-black flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                  <Users strokeWidth={2.5} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>Social-First Commerce</h3>
                <p className="text-black font-bold leading-relaxed">Every transaction becomes a social connection, building global communities through commerce.</p>
              </div>
            </div>

            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="neo-brutalist bg-gray-100 p-8">
                <div className="w-16 h-16 neo-brutalist bg-black flex items-center justify-center mb-6 mx-auto transform rotate-12">
                  <ShieldCheck strokeWidth={2.5} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>AI-Driven Trust</h3>
                <p className="text-black font-bold leading-relaxed">Advanced AI agents create verifiable trust bridges across all global interactions.</p>
              </div>
            </div>

            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="neo-brutalist bg-white p-8">
                <div className="w-16 h-16 neo-brutalist bg-black flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                  <Globe strokeWidth={2.5} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>Borderless Payments</h3>
                <p className="text-black font-bold leading-relaxed">Seamless global transactions without traditional banking limitations or borders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
