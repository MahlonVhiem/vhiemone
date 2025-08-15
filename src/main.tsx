import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import "./index.css";
import App from "./App";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('VITE_CONVEX_URL:', convexUrl);
console.log('VITE_CLERK_PUBLISHABLE_KEY:', clerkPublishableKey);

if (!convexUrl) {
  throw new Error(
    "Missing VITE_CONVEX_URL environment variable.\n" +
    "Run 'npm run dev' to start the Convex development server, or\n" +
    "add VITE_CONVEX_URL to your .env.local file."
  );
}

if (!clerkPublishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable.");
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>,
);
