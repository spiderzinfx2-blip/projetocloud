import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Zap, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float delay-500" />
      
      <div className="relative container-wide pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Novo: Integração com IA para roteiros</span>
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            Gerencie seus{" "}
            <span className="gradient-text">projetos criativos</span>
            {" "}em um só lugar
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            A plataforma completa para produtoras, cineastas e criadores de conteúdo. 
            Organize projetos, gerencie equipes e entregue no prazo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
            <Button variant="hero" size="xl">
              Começar Gratuitamente
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="hero-outline" size="xl">
              <Play className="h-5 w-5" />
              Ver Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 animate-fade-in delay-400">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Dados seguros</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm">Setup em 2 min</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">+500 produtoras</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-16 relative animate-fade-in-up delay-500">
          <div className="absolute inset-0 bg-gradient-glow" />
          <div className="relative glass rounded-2xl p-2 shadow-card mx-auto max-w-5xl">
            <div className="bg-card rounded-xl overflow-hidden">
              {/* Mock Dashboard */}
              <div className="bg-secondary/30 p-4 border-b border-border flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-muted rounded-lg h-8" />
              </div>
              <div className="p-6 min-h-[300px] md:min-h-[400px] flex">
                {/* Sidebar mock */}
                <div className="hidden md:block w-48 pr-6 border-r border-border">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className={`h-8 rounded-lg ${i === 1 ? 'bg-primary/20' : 'bg-muted'}`} 
                      />
                    ))}
                  </div>
                </div>
                {/* Content mock */}
                <div className="flex-1 md:pl-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-muted" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-muted" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
