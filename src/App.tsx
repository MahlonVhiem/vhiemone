import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { RoleSelection } from "./components/RoleSelection";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-500">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="container mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                Vhiem
              </h1>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton />
                <SignUpButton />
              </div>
            </SignedOut>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Content />
        </main>
        
        <Toaster />
      </div>
    </div>
  );
}

function Content() {
  const userProfile = useQuery(api.users.getUserProfile);
  const [preSelectedRole, setPreSelectedRole] = useState<"shopper" | "business" | "delivery_driver" | null>(null);

  // Get pre-selected role from localStorage when component mounts
  useEffect(() => {
    const savedRole = localStorage.getItem('vhiem-preselected-role') as "shopper" | "business" | "delivery_driver" | null;
    if (savedRole) {
      setPreSelectedRole(savedRole);
    }
  }, []);

  if (userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SignedOut>
        <LandingPage onRoleSelect={setPreSelectedRole} />
      </SignedOut>

      <SignedIn>
        {!userProfile ? (
          <RoleSelection preSelectedRole={preSelectedRole || undefined} />
        ) : (
          <Dashboard />
        )}
      </SignedIn>
    </div>
  );
}
