'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Cria o client uma única vez por sessão
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Os dados ficam considerados "novos" por 5 minutos
        staleTime: 5 * 60 * 1000,
        // Se a janela perder o foco e voltar, não recarrega (opcional)
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}