import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  "Gestão completa de projetos",
  "Colaboração em tempo real",
  "Relatórios automatizados",
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-info/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      
      <div className="relative container-wide pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Novo: Integração com IA para roteiros</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Gerencie seus{" "}
              <span className="relative">
                <span className="gradient-text">projetos criativos</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              {" "}em um só lugar
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              A plataforma completa para produtoras, cineastas e criadores de conteúdo. 
              Organize projetos, gerencie equipes e entregue no prazo.
            </p>

            {/* Benefits list */}
            <ul className="flex flex-col sm:flex-row gap-4 mb-10">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  {benefit}
                </motion.li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Começar Gratuitamente
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="xl" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-3 w-3 text-primary fill-primary" />
                </div>
                Ver Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-info/80 flex items-center justify-center text-xs font-bold text-primary-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">+500 produtoras</p>
                <p className="text-muted-foreground">já confiam em nós</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-info/20 rounded-3xl blur-3xl" />
            
            {/* Main card */}
            <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 h-7 bg-background rounded-lg flex items-center px-3">
                  <span className="text-xs text-muted-foreground">lumina.app/dashboard</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Sidebar */}
                  <div className="hidden sm:block w-40 space-y-3">
                    {["Dashboard", "Projetos", "Clientes", "Equipe", "Analytics"].map((item, i) => (
                      <div
                        key={item}
                        className={`h-9 px-3 rounded-lg flex items-center text-sm ${
                          i === 0 ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-1 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Projetos", value: "24" },
                        { label: "Em andamento", value: "8" },
                        { label: "Concluídos", value: "16" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-muted/50 rounded-xl p-4">
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart placeholder */}
                    <div className="h-32 bg-gradient-to-t from-primary/10 to-transparent rounded-xl flex items-end p-4">
                      <div className="flex items-end gap-2 w-full">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/60 rounded-t-sm"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Tasks */}
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted/30 rounded-lg flex items-center px-4 gap-3">
                          <div className={`w-3 h-3 rounded-full ${i === 1 ? "bg-success" : i === 2 ? "bg-warning" : "bg-muted-foreground/50"}`} />
                          <div className="h-3 bg-muted rounded flex-1" style={{ width: `${70 - i * 15}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Projeto entregue!</p>
                  <p className="text-xs text-muted-foreground">há 2 minutos</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
