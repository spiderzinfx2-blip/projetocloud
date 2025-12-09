import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Produtoras ativas", suffix: "" },
  { value: "10k+", label: "Projetos gerenciados", suffix: "" },
  { value: "99.9", label: "Uptime garantido", suffix: "%" },
  { value: "4.9", label: "Avaliação dos usuários", suffix: "/5" },
];

export function StatsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-info/5" />
      
      <div className="relative container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
