
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, Send, MessageSquarePlus, Star, AlertCircle, Trash2, ChevronDown, Check, X, Pencil } from 'lucide-react';
import type { AIPersonality, Transaction, CreditCard, AIKnowledgeLevel, ChatMessage, ChatSession } from '@/lib/types';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useTranslation } from '@/contexts/language-context';
import { collection, query, orderBy, addDoc, updateDoc, arrayUnion, Timestamp, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
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
  const [chatError, setChatError] = useState<string | null>(null);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState('');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false); // Trava para impedir envios múltiplos
  const { user } = useUser();
  const { subscription } = useSubscription();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  
  const sessionsRef = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'chat_sessions'), orderBy('createdAt', 'desc')) : null, [user, firestore]);
  const { data: chatSessions, isLoading: isLoadingSessions } = useCollection<ChatSession>(sessionsRef);

  const welcomeMessage = t.chat.welcomeMessages[personality.id] || t.chat.welcome;
  const activeSession = chatSessions?.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (activeSessionId) {
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    } else {
      setMessages([]);
    }
     setChatError(null);
  }, [activeSessionId, chatSessions, activeSession]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Previne nova linha
      handleSendMessage(); // Chama a função de envio
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isSendingRef.current || !user) return;

    isSendingRef.current = true;
    setIsLoading(true);
    setChatError(null);
    
    const userMessageContent = userInput;
    const userMessage: ChatMessage = { role: 'user', content: userMessageContent, timestamp: Timestamp.now() };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    let currentSessionId = activeSessionId;

    try {
      if (!currentSessionId) {
        const sessionData = {
          createdAt: serverTimestamp(),
          personaId: personality.id,
          knowledgeId: knowledge.id,
          messages: [userMessage],
          title: userMessageContent.substring(0, 30),
        };
        const docRef = await addDoc(collection(firestore, 'users', user.uid, 'chat_sessions'), sessionData);
        currentSessionId = docRef.id;
        setActiveSessionId(currentSessionId);
      } else {
        const sessionRef = doc(firestore, 'users', user.uid, 'chat_sessions', currentSessionId);
        await updateDoc(sessionRef, { messages: arrayUnion(userMessage) });
      }

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
        body: JSON.stringify({ userId: user.uid, messages: [...messages, userMessage], data: contextData }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403 && result.code === '403_INSUFFICIENT_CREDITS') {
            setChatError("Você atingiu seu limite diário de mensagens. Faça upgrade para PRO para continuar.");
        } else {
            throw new Error(result.error || 'Failed to get a response from the AI.');
        }
        setMessages(prev => prev.slice(0, -1)); // Remove a mensagem do usuário se a API falhar
        return;
      }
      
      const modelMessage: ChatMessage = { role: 'model', content: result.text, timestamp: Timestamp.now() };

      const sessionRef = doc(firestore, 'users', user.uid, 'chat_sessions', currentSessionId);
      await updateDoc(sessionRef, { messages: arrayUnion(modelMessage) });
      setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
      console.error('Failed to get advice:', error);
      const errorMessage: ChatMessage = { role: 'model', content: t.chat.error, timestamp: Timestamp.now() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => { isSendingRef.current = false; }, 100); // Destrava após um pequeno delay
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, chatError]);
  
  const handleStartNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setChatError(null);
  };
  
  const handleLoadSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    if (!user || !window.confirm('Tem certeza que deseja excluir esta conversa?')) return;
    try {
      const sessionRef = doc(firestore, 'users', user.uid, 'chat_sessions', sessionId);
      await deleteDoc(sessionRef);
      if (activeSessionId === sessionId) {
        handleStartNewSession();
      }
    } catch (error) {
      console.error("Error deleting chat session: ", error);
      alert('Failed to delete chat session.');
    }
  };
  
  const handleStartRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewSessionTitle(session.title || '');
  };

  const handleSaveRename = async () => {
    if (!user || !editingSessionId || !newSessionTitle.trim()) {
      setEditingSessionId(null);
      return;
    };
    try {
      const sessionRef = doc(firestore, 'users', user.uid, 'chat_sessions', editingSessionId);
      await updateDoc(sessionRef, { title: newSessionTitle.trim() });
    } catch (error) {
      console.error("Error renaming session:", error);
    } finally {
      setEditingSessionId(null);
    }
  };

  const handlePersonalityChange = (id: string) => {
    const newPersonality = PERSONALITIES.find(p => p.id === id);
    if (newPersonality && newPersonality.id !== personality.id) {
       if (newPersonality.plan === 'pro' && subscription?.plan === 'free') {
        alert('This is a PRO feature. Please upgrade your plan to use this personality.');
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

  return (
    <Card className="flex-grow h-full max-h-[85vh] bg-card/50 border-accent/20 shadow-lg shadow-accent/5 flex flex-col relative overflow-hidden">
      <CardHeader className='pb-4'>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className='w-full justify-center h-auto text-base p-2'>
                    <span className='font-semibold truncate max-w-[250px]'>
                      {activeSession?.title || 'Nova Conversa'}
                    </span>
                    <ChevronDown className='w-5 h-5 ml-2'/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-[--radix-dropdown-menu-trigger-width]'>
                <DropdownMenuItem onSelect={handleStartNewSession}>
                    <MessageSquarePlus className='mr-2'/>
                    Nova Conversa
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <ScrollArea className='max-h-60'>
                    {chatSessions?.map(session => (
                        <DropdownMenuItem key={session.id} onSelect={(e) => e.preventDefault()} className="group justify-between">
                            {editingSessionId === session.id ? (
                                <div className='flex items-center gap-2 w-full'>
                                    <input 
                                        type="text" 
                                        value={newSessionTitle} 
                                        onChange={(e) => setNewSessionTitle(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveRename();
                                            if (e.key === 'Escape') setEditingSessionId(null);
                                        }}
                                        className="bg-transparent text-sm w-full outline-none border-b border-primary"
                                        autoFocus
                                    />
                                    <Button variant="ghost" size="icon" className='h-6 w-6 text-green-500' onClick={handleSaveRename}><Check className='w-4 h-4'/></Button>
                                    <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => setEditingSessionId(null)}><X className='w-4 h-4'/></Button>
                                </div>
                            ) : (
                                <>
                                    <span className='truncate flex-1' onClick={() => handleLoadSession(session.id)}>
                                      {session.title || 'Conversa sem título'}
                                    </span>
                                    <div className='flex opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => handleStartRename(session)}><Pencil className='w-4 h-4'/></Button>
                                        <Button variant="ghost" size="icon" className='h-6 w-6 text-red-400' onClick={() => handleDeleteSession(session.id)}><Trash2 className='w-4 h-4'/></Button>
                                    </div>
                                </>
                            )}
                        </DropdownMenuItem>
                    ))}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
        <CardDescription className='text-center'>
          {t.chat.acting_as} <span className="font-semibold text-foreground">{personality.name}</span> | {t.chat.level} <span className="font-semibold text-foreground">{knowledge.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t.chat.support_level}</label>
            <Select value={knowledge.id} onValueChange={handleKnowledgeChange}>
              <SelectTrigger className="w-full mt-1 text-xs h-10">
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
              <SelectTrigger className="w-full mt-1 text-xs h-10">
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
            {chatError && (
               <div className="flex items-center gap-3 justify-center p-3 bg-destructive/20 text-destructive border border-destructive/50 rounded-lg">
                  <AlertCircle className="h-5 w-5"/>
                  <p className="text-sm font-medium">{chatError}</p>
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
          <Button type="submit" onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute right-2 bottom-2" size="icon" variant="ghost">
             <Send className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    