import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { RoleSelection } from "./components/RoleSelection";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, SignIn, SignUp } from "@clerk/clerk-react";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-500">
        <div className="min-h-screen bg-black/20 backdrop-blur-sm">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/signin" 
                element={
                  <SignedOut>
                    <div className="flex justify-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full">
                        <SignIn 
                          routing="path" 
                          path="/signin" 
                          signUpUrl="/signup"
                          afterSignInUrl="/setup"
                        />
                      </div>
                    </div>
                  </SignedOut>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <SignedOut>
                    <div className="flex justify-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full">
                        <SignUp 
                          routing="path" 
                          path="/signup" 
                          signInUrl="/signin"
                          afterSignUpUrl="/setup"
                        />
                      </div>
                    </div>
                  </SignedOut>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/setup" 
                element={
                  <ProtectedRoute>
                    <RoleSelectionRoute />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect authenticated users from public routes */}
              <Route 
                path="/signin" 
                element={
                  <SignedIn>
                    <Navigate to="/dashboard" replace />
                  </SignedIn>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <SignedIn>
                    <Navigate to="/dashboard" replace />
                  </SignedIn>
                } 
              />
            </Routes>
          </main>
          
          <Toaster />
        </div>
      </div>
    </Router>
  );
}

// Component to handle role selection logic
function RoleSelectionRoute() {
  const userProfile = useQuery(api.users.getUserProfile);

  if (userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  // If user already has a profile, redirect to dashboard
  if (userProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RoleSelection />;
}

// Component to handle dashboard logic
function DashboardRoute() {
  const userProfile = useQuery(api.users.getUserProfile);

  if (userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  // If user doesn't have a profile, redirect to setup
  if (!userProfile) {
    return <Navigate to="/setup" replace />;
  }

  return <Dashboard />;
}