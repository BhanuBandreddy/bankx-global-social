
import { ArrowRight, Users, ShieldCheck, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white border-b-4 border-black">
      {/* Single Background Element - Only top-left square, hidden on mobile */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-ink border-4 border-ink transform rotate-12 opacity-15 hidden md:block"></div>

      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display font-bold text-ink text-[clamp(2.2rem,5vw,4rem)] leading-tight mb-8 uppercase tracking-tight">
            The Future of
            <br />
            <span className="bg-white px-4 border-4 border-ink transform -skew-x-12 inline-block">
              Social Commerce
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-ink font-medium mb-12 leading-relaxed max-w-3xl mx-auto">
            Revolutionary AI-powered marketplace where every journey becomes a connection,
            every purchase builds community, and trust flows freely across borders.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <button className="px-8 py-4 bg-ink text-white font-medium text-lg border-4 border-ink shadow-[0_6px_0_#000] hover:translate-y-[-2px] transition-all duration-150 transform flex items-center justify-center space-x-3 focus-ring">
              <span>JOIN THE REVOLUTION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="px-8 py-4 bg-white text-ink font-medium text-lg border-2 border-ink hover:bg-ink/10 transition-all duration-150 focus-ring">
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
              <div className="bg-white border-4 border-ink p-8 shadow-[0_4px_0_#000]">
                <div className="w-16 h-16 bg-ink border-4 border-ink flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                  <Users strokeWidth={2.5} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4 uppercase">Social-First Commerce</h3>
                <p className="text-ink font-normal leading-relaxed">Every transaction becomes a social connection, building global communities through commerce.</p>
              </div>
            </div>

            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="bg-gray-100 border-4 border-ink p-8 shadow-[0_4px_0_#000]">
                <div className="w-16 h-16 bg-ink border-4 border-ink flex items-center justify-center mb-6 mx-auto transform rotate-12">
                  <ShieldCheck strokeWidth={2.5} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4 uppercase">AI-Driven Trust</h3>
                <p className="text-ink font-normal leading-relaxed">Advanced AI agents create verifiable trust bridges across all global interactions.</p>
              </div>
            </div>

            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="bg-white border-4 border-ink p-8 shadow-[0_4px_0_#000]">
                <div className="w-16 h-16 bg-ink border-4 border-ink flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                  <Globe strokeWidth={2.5} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4 uppercase">Borderless Payments</h3>
                <p className="text-ink font-normal leading-relaxed">Seamless global transactions without traditional banking limitations or borders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
