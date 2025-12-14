"use client";

import { useUser, useAuth } from "@/firebase/provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(error => {
      console.error("Error signing in with Google:", error);
    });
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-12 h-12 text-primary" />
        <h1 className="text-5xl font-bold tracking-tighter text-gray-50">Lucent AI</h1>
      </div>
      <p className="text-muted-foreground mb-8 max-w-md">
        Your personal AI-powered finance assistant. Sign in to continue your journey to financial clarity.
      </p>
      <Button onClick={handleSignIn} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 border-2 border-primary/50 shadow-[0_0_20px_hsl(var(--primary))]">
         <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 58.6l-67.2 64.7C324.5 97.5 289.4 80 248 80c-82.3 0-148.8 66.5-148.8 148.8s66.5 148.8 148.8 148.8c99.9 0 126.3-81.5 130.8-124.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
        Sign in with Google
      </Button>
    </div>
  );
}
