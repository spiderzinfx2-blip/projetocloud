import { 
  FolderKanban, 
  Users, 
  Calendar, 
  FileVideo, 
  BarChart3, 
  Cloud,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FolderKanban,
    title: "Gestão de Projetos",
    description: "Organize seus projetos com quadros Kanban, listas e cronogramas personalizáveis.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Mantenha todos os dados de clientes organizados com histórico completo de projetos.",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    description: "Visualize prazos, reuniões e entregas em um calendário sincronizado.",
  },
  {
    icon: FileVideo,
    title: "Biblioteca de Mídia",
    description: "Armazene e organize vídeos, imagens e documentos dos seus projetos.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Analytics",
    description: "Acompanhe métricas de produtividade, custos e performance dos projetos.",
  },
  {
    icon: Cloud,
    title: "Sincronização Cloud",
    description: "Acesse seus dados de qualquer lugar com sincronização em tempo real.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-primary text-sm font-semibold tracking-wide uppercase mb-4">
              Recursos
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Tudo que você precisa para{" "}
              <span className="gradient-text">criar sem limites</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas projetadas especialmente para profissionais criativos 
              e equipes de produção audiovisual.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative"
            >
              <div className={cn(
                "h-full p-8 rounded-2xl bg-card border border-border",
                "transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
              )}>
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Link */}
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Saiba mais
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
