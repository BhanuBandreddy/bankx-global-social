import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomIcons } from "./CustomIcons";
import { useNavigate } from "react-router-dom";

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (path: string, tabId?: string) => {
    // Close menu first to prevent flickering
    setIsOpen(false);
    
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      if (tabId) {
        navigate(path, { state: { activeTab: tabId } });
      } else {
        navigate(path);
      }
    }, 100);
  };

  return (
    <>
      {/* Hamburger Button */}
      <Button
        onClick={toggleMenu}
        className="neo-brutalist bg-white text-black hover:bg-gray-100 p-3"
        style={{ fontFamily: 'Roboto Mono, monospace' }}
      >
        <Menu size={24} strokeWidth={2.5} />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l-4 border-black z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          fontFamily: 'Roboto Mono, monospace',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          visibility: isOpen ? 'visible' : 'hidden'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b-4 border-black bg-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              MENU
            </h2>
            <Button
              onClick={() => setIsOpen(false)}
              className="neo-brutalist bg-white text-black hover:bg-gray-100 p-2"
            >
              <X size={20} strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-6 overflow-y-auto h-full pb-20">
          {/* Main Navigation Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-black uppercase mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
              NAVIGATION
            </h3>
            <div className="space-y-4">
              {[
                { id: "feed", label: "Global Feed", icon: "🌐", description: "Social commerce feed" },
                { id: "agents", label: "AI Agents", icon: <CustomIcons.Sparkle className="w-5 h-5" />, description: "NANDA agent network" },
                { id: "trust", label: "Trust Network", icon: "🔐", description: "Trust score system" },
                { id: "travelers", label: "Connections", icon: "✈️", description: "3D traveler discovery" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation("/", item.id)}
                  className="neo-brutalist bg-white text-black hover:bg-gray-100 p-4 w-full text-left block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl flex items-center">
                      {typeof item.icon === 'string' ? item.icon : item.icon}
                    </span>
                    <div>
                      <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Demo Flow */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-black uppercase mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
              DEMO FLOW
            </h3>
            <button
              onClick={() => handleNavigation("/demo")}
              className="neo-brutalist bg-lime-400 text-black hover:bg-lime-500 p-4 w-full text-left block"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">🚀</span>
                <div>
                  <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                    DEMO FLOW
                  </div>
                  <div className="text-xs text-gray-800 font-medium">
                    Upload travel docs & experience AI agents
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-black text-black uppercase mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
              QUICK ACTIONS
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleNavigation("/traveler-world-map")}
                className="neo-brutalist bg-white text-black hover:bg-gray-100 p-3 w-full text-left block"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌍</span>
                  <div>
                    <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                      WORLD MAP
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      3D traveler discovery
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleNavigation("/", "feed")}
                className="neo-brutalist bg-white text-black hover:bg-gray-100 p-3 w-full text-left block"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💬</span>
                  <div>
                    <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                      BLINK CHAT
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      AI conversation system
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};