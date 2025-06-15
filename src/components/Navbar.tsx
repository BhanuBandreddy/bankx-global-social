
import { useState } from "react";
import { Bell, Globe, Menu, User, Wallet } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-black border-4 border-black flex items-center justify-center">
              <span className="text-white font-bold text-lg">GS</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black uppercase tracking-tight leading-none">
                Global Social
              </h1>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                powered by BankX
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 border-2 border-black font-medium text-black hover:bg-gray-100 transition-colors cursor-pointer">
              <Globe className="w-5 h-5" />
              <span>Global Network</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white px-4 py-2 border-2 border-black font-medium text-black hover:bg-gray-100 transition-colors cursor-pointer">
              <Wallet className="w-5 h-5" />
              <span>Trust: 94.2</span>
            </div>

            <div className="relative bg-white p-3 border-2 border-black hover:bg-gray-100 transition-colors cursor-pointer">
              <Bell className="w-6 h-6 text-black" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full"></div>
            </div>

            <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
              <User className="w-6 h-6 text-black" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-black p-3 bg-white border-2 border-black hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-black bg-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-white px-4 py-3 border-2 border-black font-medium text-black">
                <Globe className="w-5 h-5" />
                <span>Global Network</span>
              </div>
              <div className="flex items-center space-x-3 bg-white px-4 py-3 border-2 border-black font-medium text-black">
                <Wallet className="w-5 h-5" />
                <span>Trust Score: 94.2</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
