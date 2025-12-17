
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/contexts/language-context';
import { Languages } from 'lucide-react';

const languageMap: { [key: string]: string } = {
    en: '🇺🇸',
    pt: '🇧🇷',
    es: '🇪🇸',
};


export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className='text-lg'>{languageMap[language]}</span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          <span className="mr-2">🇺🇸</span> English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('pt')}>
          <span className="mr-2">🇧🇷</span> Português
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')}>
          <span className="mr-2">🇪🇸</span> Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
