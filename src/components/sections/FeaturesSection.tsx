import { 
  FolderKanban, 
  Users, 
  Calendar, 
  FileVideo, 
  BarChart3, 
  Cloud,
  Smartphone,
  Lock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FolderKanban,
    title: "Gestão de Projetos",
    description: "Organize seus projetos com quadros Kanban, listas e cronogramas personalizáveis.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Mantenha todos os dados de clientes organizados com histórico completo de projetos.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    description: "Visualize prazos, reuniões e entregas em um calendário sincronizado.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: FileVideo,
    title: "Biblioteca de Mídia",
    description: "Armazene e organize vídeos, imagens e documentos dos seus projetos.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Analytics",
    description: "Acompanhe métricas de produtividade, custos e performance dos projetos.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Cloud,
    title: "Sincronização Cloud",
    description: "Acesse seus dados de qualquer lugar com sincronização em tempo real.",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
];

const highlights = [
  { icon: Smartphone, text: "App Mobile" },
  { icon: Lock, text: "Segurança Total" },
  { icon: Zap, text: "Super Rápido" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-muted/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Recursos
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Tudo que você precisa para{" "}
            <span className="gradient-text">criar sem limites</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Ferramentas poderosas projetadas especialmente para profissionais criativos 
            e equipes de produção audiovisual.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 interactive-card",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className={cn("inline-flex p-3 rounded-xl mb-4", feature.bgColor)}>
                <feature.icon className={cn("h-6 w-6", feature.color)} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-6">
          {highlights.map((item) => (
            <div 
              key={item.text}
              className="flex items-center gap-3 px-5 py-3 rounded-full glass"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
