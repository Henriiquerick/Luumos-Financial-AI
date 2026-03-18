'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** 
 * Initiate Google sign-in (non-blocking) using Popup strategy.
 * 
 * IMPORTANT FOR MOBILE (Capacitor): 
 * We must use signInWithPopup instead of signInWithRedirect because 
 * WebViews often lose the application state during domain redirection, 
 * causing "missing initial state" errors.
 */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  
  // Custom scopes can be added here if needed
  // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

  signInWithPopup(authInstance, provider)
    .then((result) => {
      // Success is handled by the onAuthStateChanged listener in FirebaseProvider
      console.log("Login social bem-sucedido:", result.user.displayName);
    })
    .catch((error) => {
      // Handle mobile-specific popup issues
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("O usuário fechou a janela de login antes de completar o processo.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Uma solicitação de popup anterior foi cancelada.");
      } else {
        console.error("Erro crítico na autenticação via Popup:", error.message);
      }
    });
}
