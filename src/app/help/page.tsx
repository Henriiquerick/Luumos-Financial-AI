'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Landmark, 
  Minus, 
  Equal, 
  Receipt, 
  Lightbulb, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle 
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary rounded-full uppercase tracking-wider">
            Central de Ajuda
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Entenda o <span className="text-primary">Lucent AI</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubra por que seu saldo bancário mente para você e como o Jorgin calcula sua verdadeira liberdade financeira.
          </p>
        </div>

        {/* AdSlot: Topo */}
        <div className="w-full h-[100px] bg-muted/50 rounded-xl border border-border border-dashed flex items-center justify-center">
          <span className="text-muted-foreground text-sm font-mono">[Espaço Publicitário - Topo]</span>
        </div>

        {/* Core Concept: The Math */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">A Matemática do Dinheiro Real</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Card 1: Saldo Banco */}
            <Card className="md:col-span-3 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> Saldo Bancário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">R$ 5.000</div>
                <p className="text-xs text-muted-foreground mt-1">O que o app do banco mostra.</p>
              </CardContent>
            </Card>

            {/* Operator: Minus */}
            <div className="md:col-span-1 flex justify-center">
              <div className="bg-muted rounded-full p-2">
                <Minus className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>

            {/* Card 2: Compromissos */}
            <Card className="md:col-span-3 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Compromissos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">R$ 4.550</div>
                <p className="text-xs text-muted-foreground mt-1">Faturas abertas + Contas fixas.</p>
              </CardContent>
            </Card>

            {/* Operator: Equal */}
            <div className="md:col-span-1 flex justify-center">
              <div className="bg-muted rounded-full p-2">
                <Equal className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>

            {/* Card 3: Dinheiro Real */}
            <Card className="md:col-span-3 border-green-500 bg-green-50/50 dark:bg-green-950/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] transform md:scale-105 transition-transform">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> DINHEIRO REAL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">R$ 450</div>
                <p className="text-xs text-muted-foreground mt-1">Seu poder de compra verdadeiro.</p>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-sm text-muted-foreground text-center italic mt-4">
            "Não conte com o dinheiro que já tem dono. O Lucent protege você de gastar o que é da fatura."
          </p>
        </section>

        <Separator />

        {/* Mission Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold">Nosso objetivo:</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nós queremos ajudar todas as pessoas a terem uma maior educação financeira, maior controle de gastos e evolução monetária, no nosso app você vai aprender a investir, quando gastar, quanto gastar e como economizar.
            </p>
          </div>
          
          {/* AdSlot: Quadrado Lateral */}
          <div className="w-full h-[250px] bg-muted/50 rounded-xl border border-border border-dashed flex items-center justify-center flex-col gap-2">
            <span className="text-muted-foreground text-sm font-mono">[Espaço Publicitário - Lateral]</span>
            <span className="text-xs text-muted-foreground/50">Recomendado: 300x250</span>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Perguntas Frequentes</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como conecto meus bancos?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Atualmente você pode adicionar transações manualmente ou importar CSVs. Estamos trabalhando na integração via Open Finance para o próximo release. Vá em <strong>Configurações</strong> para gerenciar suas contas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Meus dados estão seguros?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <div className="flex flex-col gap-2">
                  <p>Sim. Utilizamos autenticação segura via <strong>Firebase Auth</strong> e banco de dados <strong>Firebase</strong> com regras estritas de segurança.</p>
                  <p className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" /> 
                    Seus dados sensíveis são anonimizados antes de passar pela IA.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Posso mudar a personalidade do Jorgin?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim! Se você prefere algo mais formal, vá nas configurações do chat e altere a personalidade para "O Estrategista" (mais sério) ou "O Otimista". Mas o padrão "Sem Filtro" é o nosso favorito.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Footer CTA */}
        <div className="pt-8 pb-10 text-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full md:w-auto px-10 text-lg font-bold shadow-lg shadow-primary/20">
              Voltar para o Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
