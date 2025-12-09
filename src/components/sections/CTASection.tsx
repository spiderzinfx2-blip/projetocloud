import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  "Teste grátis por 14 dias",
  "Sem cartão de crédito",
  "Cancele quando quiser",
];

export function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-info" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          {/* Decorative orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-info/20 rounded-full blur-3xl" />
          
          <div className="relative px-8 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-8">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">
                  Comece gratuitamente
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Pronto para transformar sua produção?
              </h2>
              
              {/* Description */}
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-10">
                Junte-se a mais de 500 produtoras que já estão usando o Lumina 
                para gerenciar seus projetos criativos.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Button
                  size="xl"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 group"
                >
                  Criar Conta Grátis
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Falar com Especialista
                </Button>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-6">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-primary-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
