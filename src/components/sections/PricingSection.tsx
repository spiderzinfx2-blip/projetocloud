import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    description: "Perfeito para freelancers e pequenos projetos",
    price: "Grátis",
    period: "",
    features: [
      "Até 3 projetos ativos",
      "2 GB de armazenamento",
      "Gestão básica de tarefas",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Ideal para produtoras e equipes pequenas",
    price: "R$ 79",
    period: "/mês",
    features: [
      "Projetos ilimitados",
      "50 GB de armazenamento",
      "Gestão de clientes",
      "Relatórios avançados",
      "Integrações premium",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para grandes produtoras e estúdios",
    price: "Personalizado",
    period: "",
    features: [
      "Tudo do Pro",
      "Armazenamento ilimitado",
      "SSO e segurança avançada",
      "API dedicada",
      "Gerente de conta",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-muted/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Preços
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Planos que{" "}
            <span className="gradient-text">cabem no seu bolso</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para o tamanho da sua operação. Sem surpresas, sem taxas ocultas.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-6 rounded-2xl border transition-all duration-300",
                plan.popular
                  ? "bg-gradient-to-b from-primary/5 to-card border-primary/50 shadow-glow"
                  : "bg-card border-border hover:border-primary/30",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    Mais Popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
