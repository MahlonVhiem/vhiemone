import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import VhiemLogo from './VhiemLogo';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export function Header() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <VhiemLogo className="w-16 h-16" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
            Vhiem
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-4">
          <SignedIn>
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'bg-yellow-400 text-black font-medium' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </SignedIn>
          
          <SignedOut>
            <div className="flex gap-2">
              <Link 
                to="/signin"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/signin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/signup'
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600'
                }`}
              >
                Sign Up
              </Link>
            </div>
          </SignedOut>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none p-2 rounded-md bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-lg z-40 flex flex-col items-center justify-center space-y-8 animate-fade-in">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white text-4xl focus:outline-none"
            >
              &times;
            </button>
            <SignedIn>
              <Link 
                to="/dashboard" 
                className={`text-white text-2xl font-bold hover:text-yellow-400 transition-colors ${
                  location.pathname === '/dashboard' ? 'text-yellow-400' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12"
                  }
                }}
              />
            </SignedIn>
            
            <SignedOut>
              <Link 
                to="/signin"
                className={`text-white text-2xl font-bold hover:text-blue-400 transition-colors ${
                  location.pathname === '/signin' ? 'text-blue-400' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                className={`text-white text-2xl font-bold hover:text-green-400 transition-colors ${
                  location.pathname === '/signup' ? 'text-green-400' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </SignedOut>
          </div>
        )}
      </div>
    </header>
  );
}