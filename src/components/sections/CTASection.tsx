import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16 text-center">
          {/* Background effects */}
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Comece gratuitamente</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Pronto para transformar{" "}
              <span className="gradient-text">sua produção?</span>
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Junte-se a mais de 500 produtoras que já estão usando o Lumina 
              para gerenciar seus projetos criativos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl">
                Criar Conta Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="glass" size="xl">
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
