
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
            <div className="w-12 h-12 bg-lime-400 border-4 border-black transform rotate-3 flex items-center justify-center">
              <span className="text-black font-black text-lg transform -rotate-3">BX</span>
            </div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight">
              BankX Global
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-yellow-300 px-4 py-2 border-2 border-black font-bold text-black hover:bg-yellow-400 transition-colors cursor-pointer">
              <Globe className="w-5 h-5" />
              <span>Global Network</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-pink-300 px-4 py-2 border-2 border-black font-bold text-black hover:bg-pink-400 transition-colors cursor-pointer">
              <Wallet className="w-5 h-5" />
              <span>Trust: 94.2</span>
            </div>

            <div className="relative bg-red-400 p-3 border-2 border-black hover:bg-red-500 transition-colors cursor-pointer">
              <Bell className="w-6 h-6 text-black" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 border-2 border-black rounded-full"></div>
            </div>

            <div className="w-12 h-12 bg-blue-400 border-4 border-black flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
              <User className="w-6 h-6 text-black" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-black p-3 bg-gray-200 border-2 border-black hover:bg-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-black bg-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-yellow-300 px-4 py-3 border-2 border-black font-bold text-black">
                <Globe className="w-5 h-5" />
                <span>Global Network</span>
              </div>
              <div className="flex items-center space-x-3 bg-pink-300 px-4 py-3 border-2 border-black font-bold text-black">
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
