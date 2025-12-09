import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    content: "O Lumina transformou completamente nossa forma de trabalhar. Antes perdíamos horas organizando projetos, agora tudo está em um só lugar.",
    author: "Marina Silva",
    role: "Diretora de Produção",
    company: "Studio Criativo",
    rating: 5,
    avatar: "MS",
  },
  {
    content: "A melhor ferramenta que já usamos para gerenciar projetos audiovisuais. A integração com a equipe ficou muito mais fluida.",
    author: "Carlos Eduardo",
    role: "Produtor Executivo",
    company: "Cine Brasil",
    rating: 5,
    avatar: "CE",
  },
  {
    content: "Finalmente uma plataforma que entende as necessidades de quem trabalha com cinema e vídeo. Super recomendo!",
    author: "Ana Beatriz",
    role: "Coordenadora de Projetos",
    company: "Produtora Independente",
    rating: 5,
    avatar: "AB",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function TestimonialsSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="relative container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-primary text-sm font-semibold tracking-wide uppercase mb-4">
              Depoimentos
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              O que nossos{" "}
              <span className="gradient-text">clientes dizem</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra como o Lumina está ajudando produtoras e criadores a alcançar seus objetivos.
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={item}
              className={cn(
                "relative p-8 rounded-2xl bg-card border border-border",
                "hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              )}
            >
              {/* Quote decoration */}
              <div className="absolute top-6 right-6">
                <Quote className="h-10 w-10 text-primary/10" />
              </div>
              
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-foreground text-lg leading-relaxed mb-8">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
