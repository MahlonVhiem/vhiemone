import { Link, useLocation } from "react-router-dom";
import VhiemLogo from './VhiemLogo';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <VhiemLogo className="w-16 h-16" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
            Vhiem
          </h1>
        </Link>
        
        <nav className="flex items-center space-x-4">
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
      </div>
    </header>
  );
}