import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, Globe, Users, Shield, MapPin } from 'lucide-react';

export const HamburgerNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigationItems = [
    {
      label: 'GLOBAL FEED',
      href: '/feed',
      icon: Globe,
      description: 'Social commerce feed'
    },
    {
      label: 'AI AGENTS',
      href: '/agents',
      icon: Users,
      description: 'NANDA agent network'
    },
    {
      label: 'TRUST NETWORK',
      href: '/trust',
      icon: Shield,
      description: 'Reputation system'
    },
    {
      label: 'CONNECTIONS',
      href: '/traveler-world-map',
      icon: MapPin,
      description: '3D traveler discovery'
    }
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 neo-brutalist bg-white text-black p-3 hover:scale-105 transition-transform duration-150"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-gray-100 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        border-l-4 border-black
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8 pt-16">
            <h2 
              className="text-2xl font-black text-black uppercase tracking-tight"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              NAVIGATION
            </h2>
            <div className="w-full h-1 bg-black mt-2"></div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block"
                  onClick={toggleMenu}
                >
                  <div className="neo-brutalist bg-white p-4 hover:scale-[1.02] transition-transform duration-150 group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 neo-brutalist bg-black flex items-center justify-center">
                        <IconComponent size={24} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 
                          className="text-lg font-black text-black uppercase"
                          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                        >
                          {item.label}
                        </h3>
                        <p 
                          className="text-sm font-bold text-gray-600 mt-1"
                          style={{ fontFamily: 'Roboto Mono, monospace' }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-4 border-black">
            <p 
              className="text-sm font-bold text-gray-600 text-center"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              GLOBALSOCIAL NETWORK
            </p>
            <p 
              className="text-xs font-bold text-gray-500 text-center mt-1"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              Powered by NANDA Protocol
            </p>
          </div>
        </div>
      </div>
    </>
  );
};