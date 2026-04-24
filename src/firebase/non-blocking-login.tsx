
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate Google sign-in (non-blocking) with Native/Web detection.
 * 
 * In Capacitor (Native), we use the plugin to get the native Google ID Token
 * and then sign into the Firebase JS SDK using signInWithCredential.
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      console.log("Iniciando login nativo do Google com ClientID...");
      
      // 1. Aciona o fluxo nativo (Android/iOS) passando o Web Client ID explicitamente
      // Isso resolve o erro 10 (DEVELOPER_ERROR) ao garantir que o token seja gerado para a audiência correta.
      const result = await FirebaseAuthentication.signInWithGoogle({
        clientId: "543656462486-uno69olc77m798vd6ockucdovj9j3oie.apps.googleusercontent.com"
      });
      
      if (result.credential?.idToken) {
        // 2. Transforma o token nativo em uma credencial do Firebase JS SDK
        const credential = GoogleAuthProvider.credential(result.credential.idToken);
        
        // 3. Autentica o SDK principal para que os listeners (onAuthStateChanged) funcionem
        await signInWithCredential(authInstance, credential);
        console.log("Login nativo concluído com sucesso.");
      } else {
        throw new Error("Token do Google não recebido pelo plugin nativo.");
      }
    } catch (error: any) {
      console.error("Erro no login nativo:", error.message);
      // O erro '12501' no Android significa que o usuário cancelou o popup
      if (error.code !== '12501') {
        alert("Falha no login nativo. Verifique se o Google Play Services está atualizado e se o SHA-1 está correto no console Firebase.");
      }
    }
  } else {
    // Fluxo Web Tradicional (Browser)
    const provider = new GoogleAuthProvider();
    signInWithPopup(authInstance, provider)
      .then((result) => {
        console.log("Login Web social bem-sucedido:", result.user.displayName);
      })
      .catch((error) => {
        if (error.code === 'auth/popup-closed-by-user') {
          console.warn("O usuário fechou a janela de login.");
        } else {
          console.error("Erro na autenticação via Popup Web:", error.message);
        }
      });
  }
}
