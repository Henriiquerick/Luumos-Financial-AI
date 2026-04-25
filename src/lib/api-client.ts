
import { Capacitor } from '@capacitor/core';

/**
 * Utilitário para gerenciar URLs de API em ambientes híbridos (Web e Mobile).
 * No Capacitor, chamadas relativas (/api/...) falham pois a origem é 'localhost' ou 'file://'.
 */
export function getApiUrl(path: string): string {
  // URL de produção fornecida para o backend na Vercel
  const productionUrl = 'https://luumos-financial-ai.vercel.app';
  
  // 1. Prioridade: Variável de ambiente (se definida no build)
  // 2. Fallback Mobile: Se for Nativo (Android/iOS), força a URL da Vercel
  // 3. Fallback Web: Se for Web e não houver env, usa o caminho relativo ('')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || (Capacitor.isNativePlatform() ? productionUrl : '');
  
  // Garante que o path comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Se não houver baseUrl (Dev Web), retorna apenas o path relativo
  if (!baseUrl) return normalizedPath;

  // Garante que não haja barras duplicadas entre a base e o path
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBase}${normalizedPath}`;
}
