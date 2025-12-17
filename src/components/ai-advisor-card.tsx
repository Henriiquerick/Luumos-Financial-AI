
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, Send } from 'lucide-react';
import type { AIPersonality, Transaction, CreditCard } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

interface AiAdvisorCardProps {
  personality: AIPersonality;
  onPersonalityChange: (p: AIPersonality) => void;
  transactions: Transaction[];
  cards: CreditCard[];
  balance: number;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AiAdvisorCard({ personality, onPersonalityChange, transactions, cards, balance }: AiAdvisorCardProps) {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const handleSendMessage = async () => {
    if (!userInput.trim() || !user) return;
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CORREÇÃO: Enviando a mensagem E os dados de contexto (incluindo a personalidade)
        body: JSON.stringify({ 
            messages: newMessages,
            data: {
              persona: personality.systemInstruction, // A instrução que define a personalidade
              balance,
              transactions,
              cards,
            }
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error Response:", errorBody);
        throw new Error(errorBody.error || 'Failed to get a response from the AI.');
      }
      
      const result = await response.json();
      
      setMessages(prev => [...prev, { role: 'model', content: result.text }]);

    } catch (error: any) {
      console.error('Failed to get advice:', error);
      setMessages(prev => [...prev, { role: 'model', content: error.message || 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  
  const handlePersonalityChange = (id: string) => {
    const newPersonality = PERSONAS.find(p => p.id === id);
    if (newPersonality) {
      onPersonalityChange(newPersonality);
      setMessages([]); // Clear chat history on personality change
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <Card className="bg-card/50 border-accent/20 shadow-lg shadow-accent/5 flex flex-col h-[70vh] max-h-[800px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-accent" />
          AI Financial Agent
        </CardTitle>
        <CardDescription>Ask questions or tell me to add transactions or cards.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden">
        <div>
          <label className="text-sm font-medium">Finance Personality</label>
          <Select value={personality.id} onValueChange={handlePersonalityChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select a personality" />
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map(p => 
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
           <div className="space-y-4">
            {messages.length === 0 && (
                 <div className="flex items-start gap-3 justify-start">
                   <span className="text-2xl mt-1">{personality.icon}</span>
                   <div className="p-3 rounded-lg bg-muted/50 whitespace-pre-wrap font-code text-sm">
                      <p>Hello! How can I help you today?</p>
                      <p className="text-xs text-muted-foreground mt-2">Try saying: "Add my new Nubank card with a R$5000 limit" or "I just bought a coffee for R$10".</p>
                   </div>
                </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'model' && <span className="text-2xl mt-1">{personality.icon}</span>}
                <div className={cn("p-3 rounded-lg max-w-sm whitespace-pre-wrap font-code text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50')}>
                  {msg.content}
                </div>
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <span className="text-2xl mt-1">{personality.icon}</span>
                   <div className="p-3 rounded-lg bg-muted/50">
                    <Loader2 className="h-5 w-5 animate-spin" />
                   </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="relative">
          <Textarea
            id="user-question"
            placeholder={`Ask ${personality.name} anything...`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-12"
            rows={2}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !userInput} className="absolute right-2 bottom-2" size="icon" variant="ghost">
             <Send className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
