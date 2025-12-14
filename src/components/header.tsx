import { Bot } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full max-w-7xl mx-auto mb-8">
      <div className="flex items-center gap-2">
        <Bot className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tighter text-gray-50">Luumos</h1>
      </div>
    </header>
  );
}
