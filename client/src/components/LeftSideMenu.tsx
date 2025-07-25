import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CustomIcons } from "./CustomIcons";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LeftSideMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const LeftSideMenu = ({ activeTab, onTabChange }: LeftSideMenuProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const menuItems = [
    { id: "feed", label: "Global Feed", icon: "🌐", description: "Social commerce feed" },
    { id: "agents", label: "AI Agents", icon: "🤖", description: "NANDA agent network" },
    { id: "trust", label: "Trust Network", icon: "🔐", description: "Trust score system" },
    { id: "travelers", label: "Connections", icon: "✈️", description: "Explore" },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-80'} bg-white border-r-4 border-black h-full transition-all duration-300`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
      {/* Header with Toggle */}
      <div className="p-8 border-b-4 border-black bg-gray-100 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-xl font-black text-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
            MENU
          </h2>
        )}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="neo-brutalist bg-white text-black hover:bg-gray-100 p-2"
        >
          {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
        </Button>
      </div>

      {/* Menu Content */}
      <div className="p-8 space-y-8">
        {/* Main Navigation */}
        <div>
          {!isCollapsed && (
            <h3 className="text-sm font-black text-black uppercase mb-5" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              NAVIGATION
            </h3>
          )}
          <div className="space-y-5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`neo-button w-full text-left transition-colors ${
                  isCollapsed ? 'px-4 py-5 justify-center' : 'px-6 py-5'
                } ${
                  activeTab === item.id 
                    ? 'neo-button-pink text-white' 
                    : 'neo-button-white text-black hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isCollapsed ? (
                  <div className="flex justify-center">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-black text-xs uppercase mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                        {item.label}
                      </div>
                      <div className={`text-xs font-medium ${
                        activeTab === item.id ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Flow */}
        <div>
          {!isCollapsed && (
            <h3 className="text-sm font-black text-black uppercase mb-5" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              DEMO FLOW
            </h3>
          )}
          <button
            onClick={() => handleNavigation("/demo")}
            className={`neo-button neo-button-green w-full text-left ${
              isCollapsed ? 'px-3 py-4 justify-center' : 'px-4 py-5'
            }`}
            title={isCollapsed ? "Demo Flow" : undefined}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                <span className="text-lg">🚀</span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-lg">🚀</span>
                <div>
                  <div className="font-black text-xs uppercase mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    DEMO FLOW
                  </div>
                  <div className="text-xs text-gray-800 font-medium">
                    Upload travel docs & experience AI agents
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};