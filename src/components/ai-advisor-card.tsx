
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, Send, MessageSquarePlus, MessageSquareText, Star } from 'lucide-react';
import type { AIPersonality, Transaction, CreditCard, AIKnowledgeLevel, ChatMessage, ChatSession } from '@/lib/types';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useTranslation } from '@/contexts/language-context';
import { collection, query, orderBy, addDoc, updateDoc, arrayUnion, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useSubscription } from '@/hooks/useSubscription';

interface AiAdvisorCardProps {
  knowledge: AIKnowledgeLevel;
  personality: AIPersonality;
  onKnowledgeChange: (k: AIKnowledgeLevel) => void;
  onPersonalityChange: (p: AIPersonality) => void;
  transactions: Transaction[];
  cards: CreditCard[];
  balance: number;
}

export function AiAdvisorCard({ knowledge, personality, onKnowledgeChange, onPersonalityChange, transactions, cards, balance }: AiAdvisorCardProps) {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { subscription } = useSubscription();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  
  const sessionsRef = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'chat_sessions'), orderBy('createdAt', 'desc')) : null, [user, firestore]);
  const { data: chatSessions, isLoading: isLoadingSessions } = useCollection<ChatSession>(sessionsRef);

  const welcomeMessage = t.chat.welcomeMessages[personality.id] || t.chat.welcome;

  useEffect(() => {
    if (activeSessionId) {
      const activeSession = chatSessions?.find(s => s.id === activeSessionId);
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeSessionId, chatSessions]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !user) return;
    
    const userMessage: ChatMessage = { role: 'user', content: userInput, timestamp: Timestamp.now() };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    let currentSessionId = activeSessionId;

    try {
      // 1. Create session if it doesn't exist
      if (!currentSessionId) {
        const sessionData = {
          createdAt: serverTimestamp(),
          personaId: personality.id,
          knowledgeId: knowledge.id,
          messages: [userMessage],
          title: userInput.substring(0, 30),
        };
        const docRef = await addDoc(collection(firestore, 'users', user.uid, 'chat_sessions'), sessionData);
        currentSessionId = docRef.id;
        setActiveSessionId(currentSessionId);
      } else {
        const sessionRef = collection(firestore, 'users', user.uid, 'chat_sessions');
        await updateDoc(doc(sessionRef, currentSessionId), {
          messages: arrayUnion(userMessage),
        });
      }

      // 2. Call AI API
      const contextData = {
        balance,
        transactions: transactions.slice(-5),
        cards,
        knowledgeId: knowledge.id,
        personalityId: personality.id,
        language,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          data: contextData,
        }),
      });

      if (!response.ok) throw new Error('Failed to get a response from the AI.');
      
      const result = await response.json();
      const modelMessage: ChatMessage = { role: 'model', content: result.text, timestamp: Timestamp.now() };

      // 3. Save AI response
      const sessionRef = collection(firestore, 'users', user.uid, 'chat_sessions');
      await updateDoc(doc(sessionRef, currentSessionId), {
        messages: arrayUnion(modelMessage),
      });

      setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
      console.error('Failed to get advice:', error);
      const errorMessage: ChatMessage = { role: 'model', content: t.chat.error, timestamp: Timestamp.now() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
  };
  
  const handlePersonalityChange = (id: string) => {
    const newPersonality = PERSONALITIES.find(p => p.id === id);
    if (newPersonality && newPersonality.id !== personality.id) {
       if (newPersonality.plan === 'pro' && subscription?.plan === 'free') {
        alert('This is a PRO feature. Please upgrade your plan to use this personality.'); // Placeholder for a real upgrade modal
        return;
      }
      onPersonalityChange(newPersonality);
      handleStartNewSession();
    }
  };
  
  const handleKnowledgeChange = (id: string) => {
    const newKnowledge = KNOWLEDGE_LEVELS.find(k => k.id === id);
    if (newKnowledge && newKnowledge.id !== knowledge.id) {
      onKnowledgeChange(newKnowledge);
      handleStartNewSession();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full max-h-[70vh] gap-4">
      {/* Sessions Sidebar */}
      <Card className="w-1/3 flex-shrink-0 bg-card/30 border-accent/10 hidden lg:flex flex-col">
          <CardHeader className='pb-2'>
              <CardTitle className='text-base flex items-center justify-between'>
                Histórico
                <Button variant="ghost" size="icon" onClick={handleStartNewSession} className="h-7 w-7">
                    <MessageSquarePlus className="h-4 w-4" />
                </Button>
              </CardTitle>
          </CardHeader>
          <CardContent className='flex-grow overflow-hidden p-2 pt-0'>
              <ScrollArea className="h-full">
                  <div className='space-y-1 p-2'>
                    {isLoadingSessions ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        chatSessions?.map(session => (
                            <Button 
                                key={session.id}
                                variant={activeSessionId === session.id ? "secondary" : "ghost"}
                                className="w-full justify-start h-auto py-2"
                                onClick={() => setActiveSessionId(session.id)}
                            >
                                <MessageSquareText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate text-xs">{session.title || 'Nova Conversa'}</span>
                            </Button>
                        ))
                    )}
                    {chatSessions?.length === 0 && !isLoadingSessions && (
                        <p className='text-center text-xs text-muted-foreground pt-4'>
                            Seu histórico de conversas aparecerá aqui.
                        </p>
                    )}
                  </div>
              </ScrollArea>
          </CardContent>
      </Card>
      
      {/* Main Chat Card */}
      <Card className="flex-grow bg-card/50 border-accent/20 shadow-lg shadow-accent/5 flex flex-col relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-accent" />
            <span>{t.chat.agent_title}</span>
          </CardTitle>
          <CardDescription>
            {t.chat.acting_as} <span className="font-semibold text-foreground">{personality.name}</span> | {t.chat.level} <span className="font-semibold text-foreground">{knowledge.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t.chat.support_level}</label>
              <Select value={knowledge.id} onValueChange={handleKnowledgeChange}>
                <SelectTrigger className="w-full mt-1 text-xs">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_LEVELS.map(k => 
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t.chat.personality}</label>
              <Select value={personality.id} onValueChange={handlePersonalityChange}>
                <SelectTrigger className="w-full mt-1 text-xs">
                  <SelectValue placeholder="Select a personality" />
                </SelectTrigger>
                <SelectContent>
                  {PERSONALITIES.map(p => 
                     <SelectItem key={p.id} value={p.id} disabled={p.plan === 'pro' && subscription?.plan === 'free'}>
                      <div className="flex items-center justify-between w-full">
                        <span>{p.name}</span>
                        {p.plan === 'pro' && (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Star className="w-3 h-3" />
                            PRO
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
             <div className="space-y-4">
              {!activeSessionId && messages.length === 0 && (
                   <div className="flex items-start gap-3 justify-start">
                     <span className="text-2xl mt-1">{personality.icon}</span>
                     <div className="p-3 rounded-lg bg-muted/50 whitespace-pre-wrap font-code text-sm">
                        <p>{welcomeMessage}</p>
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
              placeholder={t.chat.placeholder.replace('{personalityName}', personality.name)}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-12"
              rows={2}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute right-2 bottom-2" size="icon" variant="ghost">
               <Send className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    

    