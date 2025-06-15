
import { useState } from "react";
import { Bell, Globe, Menu, User, Wallet } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BX</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              BankX Global
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Global Network</span>
            </div>
            
            <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors cursor-pointer">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Trust Score: 94.2</span>
            </div>

            <div className="relative">
              <Bell className="w-5 h-5 text-white/80 hover:text-white transition-colors cursor-pointer" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>

            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white/80 py-2">
                <Globe className="w-4 h-4" />
                <span>Global Network</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 py-2">
                <Wallet className="w-4 h-4" />
                <span>Trust Score: 94.2</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
