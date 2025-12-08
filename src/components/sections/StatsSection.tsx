const stats = [
  { value: "500+", label: "Produtoras ativas" },
  { value: "10k+", label: "Projetos gerenciados" },
  { value: "99.9%", label: "Uptime garantido" },
  { value: "4.9/5", label: "Avaliação dos usuários" },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 border-y border-border bg-card/50">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="font-display text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
