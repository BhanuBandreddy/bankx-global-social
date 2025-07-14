import { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, Globe, Bot, Shield, Users } from 'lucide-react';

export const HamburgerNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const navigationItems = [
    {
      title: 'GLOBAL FEED',
      path: '/',
      icon: Globe,
      description: 'Social commerce feed'
    },
    {
      title: 'AI AGENTS',
      path: '/?tab=agents',
      icon: Bot,
      description: 'NANDA network agents'
    },
    {
      title: 'TRUST NETWORK',
      path: '/?tab=trust',
      icon: Shield,
      description: 'Trust metrics & scores'
    },
    {
      title: 'CONNECTIONS',
      path: '/traveler-world-map',
      icon: Users,
      description: '3D traveler discovery'
    }
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLocation('/auth');
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hamburger-button"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Overlay */}
      {isOpen && (
        <>
          <div 
            className="navigation-overlay"
            onClick={() => setIsOpen(false)}
          />
          <nav className="hamburger-nav">
            <div className="nav-header">
              <h2>NAVIGATE</h2>
            </div>
            
            <div className="nav-items">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="nav-item"
                  >
                    <div className="nav-item-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="nav-item-content">
                      <div className="nav-item-title">{item.title}</div>
                      <div className="nav-item-description">{item.description}</div>
                    </div>
                  </button>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="nav-item logout-item"
              >
                <div className="nav-item-icon">
                  <X size={24} />
                </div>
                <div className="nav-item-content">
                  <div className="nav-item-title">LOGOUT</div>
                  <div className="nav-item-description">Sign out of your account</div>
                </div>
              </button>
            </div>
          </nav>
        </>
      )}

      <style>{`
        .hamburger-button {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1001;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .hamburger-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .navigation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          z-index: 999;
        }

        .hamburger-nav {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          height: 100vh;
          background: #111111;
          border-left: 4px solid #ffffff;
          z-index: 1000;
          padding: 80px 32px 32px;
          transform: translateX(0);
          animation: slideIn 0.3s ease-out;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.8);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .nav-header {
          margin-bottom: 48px;
        }

        .nav-header h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.5rem;
          color: #ffffff;
          letter-spacing: 0.3em;
          margin: 0;
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid transparent;
          border-radius: 8px;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #ffffff;
          transform: translateX(-4px);
          box-shadow: 4px 4px 0 #ffffff;
        }

        .nav-item-icon {
          flex-shrink: 0;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .nav-item-content {
          flex: 1;
        }

        .nav-item-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .nav-item-description {
          font-family: 'Roboto Mono', monospace;
          font-size: 0.9rem;
          opacity: 0.7;
          line-height: 1.3;
        }

        .logout-item {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
        }

        .logout-item:hover {
          background: rgba(220, 38, 38, 0.2);
          border-color: #dc2626;
        }

        @media (max-width: 480px) {
          .hamburger-nav {
            width: 100vw;
            border-left: none;
            border-top: 4px solid #ffffff;
          }
          
          .hamburger-button {
            top: 16px;
            right: 16px;
            padding: 8px;
          }
        }
      `}</style>
    </>
  );
};