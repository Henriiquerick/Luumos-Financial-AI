"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthGate } from "@/components/auth-gate";
import Dashboard from "@/components/dashboard";

export default function Home() {
  return (
    <FirebaseClientProvider>
      <AuthGate>
        <Dashboard />
      </AuthGate>
    </FirebaseClientProvider>
  );
}