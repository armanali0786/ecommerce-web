import { ShoppingBag, Heart, User, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  userEmail?: string;
  onLogout: () => void;
}

export function Navbar({ onLoginClick, isLoggedIn, userEmail, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-pink-600 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              FemmeStyle
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-pink-600 transition-colors">
              Home
            </a>
            <a href="#products" className="text-gray-700 hover:text-pink-600 transition-colors">
              Shop
            </a>
            <a href="#categories" className="text-gray-700 hover:text-pink-600 transition-colors">
              Categories
            </a>
            <a href="#about" className="text-gray-700 hover:text-pink-600 transition-colors">
              About
            </a>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-700 hover:text-pink-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-700 hover:text-pink-600 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="text-gray-700 hover:text-pink-600 transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 text-sm">{userEmail}</span>
                <button
                  onClick={onLogout}
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="text-gray-700 hover:text-pink-600 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            <a
              href="#home"
              className="block text-gray-700 hover:text-pink-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#products"
              className="block text-gray-700 hover:text-pink-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </a>
            <a
              href="#categories"
              className="block text-gray-700 hover:text-pink-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </a>
            <a
              href="#about"
              className="block text-gray-700 hover:text-pink-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <div className="flex items-center gap-4 pt-3 border-t">
              <button className="text-gray-700 hover:text-pink-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-gray-700 hover:text-pink-600">
                <Heart className="w-5 h-5" />
              </button>
              <button className="text-gray-700 hover:text-pink-600 relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <span className="text-gray-700 text-sm">{userEmail}</span>
                  <button
                    onClick={onLogout}
                    className="text-gray-700 hover:text-pink-600 text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={onLoginClick} className="text-gray-700 hover:text-pink-600">
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
