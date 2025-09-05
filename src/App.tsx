import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { RoleSelection } from "./components/RoleSelection";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { VoiceChatRoomPage } from "./components/VoiceChatRoomPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#012169] via-[#1a327a] via-teal-500 via-orange-500 to-yellow-400">
        <div className="min-h-screen bg-black/20 backdrop-blur-sm">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />

              <Route
                path="/signin/*"
                element={
                  <SignedOut>
                    <div className="flex justify-center">
                      <div className="bg-white/10 bg-opacity-50 rounded-2xl p-4 border border-white/20 w-full">
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
                path="/signup/*"
                element={
                  <SignedOut>
                    <div className="flex justify-center">
                      <div className="bg-white/10 bg-opacity-50 rounded-2xl p-4 border border-white/20 w-full">
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

              <Route
                path="/voice-chat"
                element={
                  <ProtectedRoute>
                    <VoiceChatRoomPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect authenticated users from public routes */}
              <Route
                path="/signin/*"
                element={
                  <SignedIn>
                    <Navigate to="/dashboard" replace />
                  </SignedIn>
                }
              />

              <Route
                path="/signup/*"
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

function RoleSelectionRoute() {
  const userProfile = useQuery(api.users.getUserProfile);

  if (userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return !userProfile ? <RoleSelection /> : <Navigate to="/dashboard" replace />;
}

function DashboardRoute() {
  const userProfile = useQuery(api.users.getUserProfile);

  if (userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return userProfile ? <Dashboard /> : <Navigate to="/setup" replace />;
}