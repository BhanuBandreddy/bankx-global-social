import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomIcons } from "./CustomIcons";
import { useNavigate } from "react-router-dom";

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavigation = (path: string, tabId?: string) => {
    setIsOpen(false);
    setTimeout(() => {
      if (tabId) {
        navigate(path, { state: { activeTab: tabId } });
      } else {
        navigate(path);
      }
    }, 50);
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="neo-brutalist bg-white text-black hover:bg-gray-100 p-3 relative z-50"
        style={{ fontFamily: 'Roboto Mono, monospace' }}
      >
        {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
      </Button>

      {/* Menu Panel */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 right-0 h-full w-80 bg-white border-l-4 border-black z-40 shadow-lg"
          style={{ fontFamily: 'Roboto Mono, monospace' }}
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
                <button
                  onClick={() => handleNavigation("/", "feed")}
                  className="neo-brutalist bg-white text-black hover:bg-gray-100 p-4 w-full text-left block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌐</span>
                    <div>
                      <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                        Global Feed
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Social commerce feed
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation("/", "agents")}
                  className="neo-brutalist bg-white text-black hover:bg-gray-100 p-4 w-full text-left block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🤖</span>
                    <div>
                      <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                        AI Agents
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        NANDA agent network
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation("/", "trust")}
                  className="neo-brutalist bg-white text-black hover:bg-gray-100 p-4 w-full text-left block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔐</span>
                    <div>
                      <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                        Trust Network
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Trust score system
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = "/traveler-discovery"}
                  className="neo-brutalist bg-white text-black hover:bg-gray-100 p-4 w-full text-left block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">✈️</span>
                    <div>
                      <div className="font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                        Connections
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Global travel flows
                      </div>
                    </div>
                  </div>
                </button>
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
                  onClick={() => setIsOpen(false)}
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
      )}
    </div>
  );
};