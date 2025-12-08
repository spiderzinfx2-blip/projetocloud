import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    content: "O Lumina transformou completamente nossa forma de trabalhar. Antes perdíamos horas organizando projetos, agora tudo está em um só lugar.",
    author: "Marina Silva",
    role: "Diretora de Produção",
    company: "Studio Criativo",
    rating: 5,
  },
  {
    content: "A melhor ferramenta que já usamos para gerenciar projetos audiovisuais. A integração com a equipe ficou muito mais fluida.",
    author: "Carlos Eduardo",
    role: "Produtor Executivo",
    company: "Cine Brasil",
    rating: 5,
  },
  {
    content: "Finalmente uma plataforma que entende as necessidades de quem trabalha com cinema e vídeo. Super recomendo!",
    author: "Ana Beatriz",
    role: "Coordenadora de Projetos",
    company: "Produtora Independente",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            O que nossos{" "}
            <span className="gradient-text">clientes dizem</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Descubra como o Lumina está ajudando produtoras e criadores a alcançar seus objetivos.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={cn(
                "relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-muted-foreground text-xs">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
