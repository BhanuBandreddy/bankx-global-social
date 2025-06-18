
import { ArrowRight, Users, ShieldCheck, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-charcoal/5 border-b-4 border-charcoal">
      {/* Single Background Element - Only top-left square, hidden on mobile */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-gold border-4 border-gold transform rotate-12 opacity-15 hidden md:block"></div>

      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display font-bold text-ink text-[clamp(2.2rem,5vw,4rem)] leading-tight mb-8 uppercase tracking-tight">
            The Future of
            <br />
            <span className="bg-white px-4 border-4 border-ink border-b-4 border-b-gold transform -skew-x-12 inline-block">
              Social Commerce
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-ink font-medium mb-12 leading-relaxed max-w-3xl mx-auto">
            Revolutionary AI-powered marketplace where every journey becomes a connection,
            every purchase builds community, and trust flows freely across borders.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <button className="px-8 py-4 bg-gold text-charcoal font-medium text-lg border-4 border-gold shadow-[0_6px_0_#D4AF37] hover:shadow-gold-lg hover:translate-y-[-2px] transition-all duration-150 transform flex items-center justify-center space-x-3 focus-ring">
              <span>JOIN THE REVOLUTION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="px-8 py-4 bg-white text-ink font-medium text-lg border-2 border-gold hover:bg-gold/10 transition-all duration-150 focus-ring">
              WATCH DEMO
            </button>
          </div>

          {/* Demo Flow pill moved from navbar */}
          <div className="mb-16">
            <button
              onClick={() => navigate("/demo")}
              className="bg-gold text-charcoal rounded-full px-3 py-1 text-sm font-medium hover:bg-gold/90 transition-colors focus-ring border border-charcoal"
            >
              DEMO FLOW
            </button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="bg-white border-4 border-ink border-t-4 border-t-gold p-8 shadow-[0_4px_0_#000] hover:shadow-gold">
                <div className="w-16 h-16 bg-gold border-4 border-gold flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                  <Users strokeWidth={2.5} size={32} className="text-charcoal" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4 uppercase border-b-2 border-gold inline-block">Social-First Commerce</h3>
                <p className="text-ink font-normal leading-relaxed">Every transaction becomes a social connection, building global communities through commerce.</p>
              </div>
            </div>

            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="bg-charcoal/5 border-4 border-ink border-t-4 border-t-gold p-8 shadow-[0_4px_0_#000] hover:shadow-gold">
                <div className="w-16 h-16 bg-charcoal border-4 border-charcoal flex items-center justify-center mb-6 mx-auto transform rotate-12">
                  <ShieldCheck strokeWidth={2.5} size={32} className="text-gold" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4 uppercase border-b-2 border-gold inline-block">AI-Driven Trust</h3>
                <p className="text-ink font-normal leading-relaxed">Advanced AI agents create verifiable trust bridges across all global interactions.</p>
              </div>
            </div>

            <div className="group hover:rotate-[-2deg] transition-transform duration-150">
              <div className="bg-white border-4 border-ink border-t-4 border-t-gold p-8 shadow-[0_4px_0_#000] hover:shadow-gold">
                <div className="w-16 h-16 bg-gold border-4 border-gold flex items-center justify-center mb-6 mx-auto transform -rotate-12">
                  <Globe strokeWidth={2.5} size={32} className="text-charcoal" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4 uppercase border-b-2 border-gold inline-block">Borderless Payments</h3>
                <p className="text-ink font-normal leading-relaxed">Seamless global transactions without traditional banking limitations or borders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
