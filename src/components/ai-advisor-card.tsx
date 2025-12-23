"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, MessageSquarePlus, AlertCircle, Trash2, ChevronDown, Check, X, Pencil } from 'lucide-react';
import type { AIPersonality, Transaction, CreditCard, AIKnowledgeLevel, ChatMessage, ChatSession } from '@/lib/types';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useTranslation } from '@/contexts/language-context';
import { collection, query, orderBy, addDoc, updateDoc, arrayUnion, Timestamp, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

// Nota: Removemos o useSubscription pois não bloqueamos mais por plano

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSubmissionTimeRef = useRef<number>(0);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  
  const sessionsRef = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'chat_sessions'), orderBy('createdAt', 'desc')) : null, [user, firestore]);
  const { data: chatSessions } = useCollection<ChatSession>(sessionsRef);

  const welcomeMessage = (t.chat.welcomeMessages as any)[personality.id] || t.chat.welcome;
  
  const activeSession = chatSessions?.find(s => s.id === activeSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatError]);

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
      event.preventDefault();
      event.stopPropagation();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !user) return;

    const now = Date.now();
    if (now - lastSubmissionTimeRef.current < 1000) return;
    lastSubmissionTimeRef.current = now;

    if (isLoading) return;

    setIsLoading(true);
    setChatError(null);
    
    const userMessageContent = userInput;
    setUserInput(''); 
    
    const userMessage: ChatMessage = { role: 'user', content: userMessageContent, timestamp: Timestamp.now() };
    
    setMessages(prev => [...prev, userMessage]);

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
        // Lógica de Créditos mantida (Erro 403)
        if (response.status === 403 && result.code === '403_INSUFFICIENT_CREDITS') {
            setChatError("Você atingiu seu limite de créditos. Assista um anúncio para ganhar mais!");
        } else {
            throw new Error(result.error || 'Failed to get a response from the AI.');
        }
        setMessages(prev => prev.slice(0, -1));
        return;
      }
      
      const modelMessage: ChatMessage = { role: 'model', content: result.text, timestamp: Timestamp.now() };

      const sessionRef = doc(firestore, 'users', user.uid, 'chat_sessions', currentSessionId);
      await updateDoc(sessionRef, { messages: arrayUnion(modelMessage) });

    } catch (error: any) {
      console.error('Failed to get advice:', error);
      const errorMessage: ChatMessage = { role: 'model', content: t.chat.error, timestamp: Timestamp.now() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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

  // --- LÓGICA DE TROCA LIBERADA ---
  const handlePersonalityChange = (id: string) => {
    const newPersonality = PERSONALITIES.find(p => p.id === id);
    // Verificação simples: Se existe e é diferente, troca. Sem checagem de plano.
    if (newPersonality && newPersonality.id !== personality.id) {
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
      <CardHeader className='pb-4 shrink-0'>
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
      
      <div className="p-6 pt-2 shrink-0">
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
                      // --- REMOVIDA A PROPRIEDADE DISABLED ---
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{p.name}</span>
                          {/* REMOVIDO O ÍCONE DE PRO (ESTRELA) */}
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-6 scroll-smooth">
        {!activeSessionId && messages.length === 0 && (
             <div className="flex items-start gap-3 justify-start">
               <span className="text-2xl mt-1">{personality.icon}</span>
               <div className="p-3 rounded-2xl bg-muted/50 whitespace-pre-wrap font-code text-sm rounded-bl-none">
                  <p>{welcomeMessage}</p>
               </div>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'model' && <span className="text-2xl mt-1">{personality.icon}</span>}
            <div className={cn(
                "max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap font-code", 
                msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted/50 rounded-bl-none'
            )}>
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
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background shrink-0">
          <div className="flex items-end gap-2 relative">
              <Textarea
                id="user-question"
                placeholder={t.chat.placeholder.replace('{personalityName}', personality.name)}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[50px] max-h-[150px] resize-none pr-12"
                rows={2}
              />
              <Button 
                type="button" 
                onClick={handleSendMessage} 
                disabled={isLoading || !userInput.trim()} 
                className="absolute right-2 bottom-2 h-8 w-8" 
                size="icon"
              >
                 <Send className="h-4 w-4 text-primary" />
              </Button>
          </div>
       </div>
    </Card>
  );
}