
/**
 * Utilitário para gerenciar URLs de API em ambientes híbridos (Web e Mobile).
 * No Capacitor, chamadas relativas (/api/...) falham pois a origem é 'localhost' ou 'file://'.
 */
export function getApiUrl(path: string): string {
  // NEXT_PUBLIC_API_URL deve ser configurada no .env de produção (ex: https://meu-app.vercel.app)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Garante que o path comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Se estivermos em desenvolvimento local ou web sem URL base definida, usamos o path relativo
  if (!baseUrl) return normalizedPath;

  return `${baseUrl}${normalizedPath}`;
}
