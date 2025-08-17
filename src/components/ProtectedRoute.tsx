import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <Navigate to="/signin" replace />
      </SignedOut>
    </>
  );
}