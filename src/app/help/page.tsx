'use client';
import React from 'react';
import { Wallet, DollarSign, HelpCircle, ShieldCheck, Cpu, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FAQItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
};

export default function HelpPage() {
 return (
  <div className="bg-background min-h-screen text-foreground">
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <Badge variant="outline" className="text-xs uppercase tracking-wider">
          Central de Conhecimento
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
          Entendendo o Lucent AI
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          A lógica por trás dos seus números e como nossa IA transforma dados brutos em conselhos reais.
        </p>
      </div>

      {/* SECTION 1: O Conceito Core (Visual) */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Card: Saldo Bancário */}
        <Card className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-3xl border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors shadow-sm">
            <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 shadow-inner">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Saldo Bancário</h2>
                        <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">O que o banco mostra</span>
                    </div>
                </div>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    É uma ilusão momentânea que ignora suas dívidas futuras, como a fatura do cartão de crédito.
                </p>
                <div className="bg-background p-4 rounded-xl border border-border font-mono text-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Saldo Atual</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">+ R$ 5.000,00</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/80 text-right italic">
                        *Parece rico, mas é ilusão.
                    </div>
                </div>
            </CardContent>
        </Card>
        {/* Card: Dinheiro Real */}
        <Card className="bg-green-50 dark:bg-green-900/10 p-8 rounded-3xl border-2 border-green-500/40 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px] rounded-full group-hover:bg-green-500/20 transition-all"></div>
            <CardContent className="p-0 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400 shadow-inner">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Dinheiro Real</h2>
                        <span className="text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">Seu poder de compra</span>
                    </div>
                </div>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Saldo Bancário MENOS faturas de cartão e contas fixas. É o que você realmente pode gastar.
                </p>
                <div className="bg-background p-4 rounded-xl border border-border font-mono text-sm">
                    <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Saldo Bruto:</span>
                        <span>R$ 5.000,00</span>
                    </div>
                    <div className="flex justify-between text-red-500 dark:text-red-400 mb-3">
                        <span>- Fatura Cartão:</span>
                        <span>(R$ 2.000,00)</span>
                    </div>
                    <div className="border-t border-dashed border-border pt-2 flex justify-between text-green-600 dark:text-green-400 font-bold text-base">
                        <span>= Disponível:</span>
                        <span>R$ 3.000,00</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Estrutura de Contas */}
      <div className="border-t border-border pt-12">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Cpu className="text-purple-400" /> 
          Como processamos seus dados
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Carteira / Cash", color: "bg-yellow-500", text: "Dinheiro físico. Não afeta a automação bancária, você precisa lançar manualmente." },
            { title: "Conta Corrente", color: "bg-blue-500", text: "O coração do sistema. Entradas (salário) aumentam e saídas (pix) diminuem seu Dinheiro Real imediatamente." },
            { title: "Cartão de Crédito", color: "bg-red-500", text: "O vilão. Gastos aqui reduzem seu 'Dinheiro Real' na hora, mesmo que o dinheiro ainda esteja na conta corrente." }
          ].map((item, idx) => (
            <Card key={idx} className="bg-card p-6 rounded-2xl flex flex-col gap-3">
              <div className={`w-8 h-1 ${item.color} rounded-full`}></div>
              <h4 className="font-bold text-lg">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 3: FAQ */}
      <div className="border-t border-border pt-12 pb-20">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <HelpCircle className="text-muted-foreground" /> 
          Perguntas Frequentes
        </h3>
        <Card className="rounded-3xl p-2">
            <Accordion type="single" collapsible className="w-full bg-background rounded-2xl p-6 border border-border/50">
              <FAQItem 
                question="Por que o Jorgin é 'grosso'?"
                answer="O Jorgin é uma persona da Geração Z projetada para cortar a formalidade. Ele usa 'choque de realidade' e humor ácido (baseado no modelo Llama-3) para tornar as finanças menos chatas. Se preferir algo formal, você pode alterar a personalidade nas configurações."
              />
              <FAQItem 
                question="Como a IA sabe dos parcelamentos?"
                answer="A IA analisa o histórico e padrões. Se você categoriza uma compra alta como 'Eletrodomésticos', nossos modelos inferem que pode ser um bem durável e sugerem o parcelamento para melhor controle do fluxo de caixa."
              />
              <FAQItem 
                question="Meus dados bancários são seguros?"
                answer={
                  <span className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Não exatamente. Nós enviamos para a IA apenas metadados anonimizados (ex: 'Gasto de R$ 50,00 em Comida'). Suas senhas, número de conta e dados sensíveis nunca saem do ambiente seguro e não são lidos pela IA.</span>
                  </span>
                }
              />
              <FAQItem 
                question="O que acontece se eu gastar meu 'Saldo Bancário' todo?"
                answer="Se você gastar todo o saldo que vê no banco, provavelmente não terá dinheiro para pagar a fatura do cartão quando ela chegar. Por isso criamos o conceito de 'Dinheiro Real' — confie nele, não no app do banco."
              />
            </Accordion>
        </Card>
      </div>
      
      {/* Footer CTA */}
      <div className="text-center pb-12">
        <Button asChild size="lg" className="px-8 py-6 text-lg rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar para o Dashboard
            </Link>
        </Button>
      </div>
    </div>
  </div>
);
}
