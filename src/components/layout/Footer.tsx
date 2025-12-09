import { Link } from "react-router-dom";
import { Film, Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  produto: [
    { name: "Recursos", href: "#features" },
    { name: "Preços", href: "#pricing" },
    { name: "Integrações", href: "#integrations" },
    { name: "Changelog", href: "#changelog" },
  ],
  empresa: [
    { name: "Sobre", href: "#about" },
    { name: "Blog", href: "#blog" },
    { name: "Carreiras", href: "#careers" },
    { name: "Contato", href: "#contact" },
  ],
  legal: [
    { name: "Privacidade", href: "#privacy" },
    { name: "Termos", href: "#terms" },
    { name: "Cookies", href: "#cookies" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Email", icon: Mail, href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container-wide">
        {/* Newsletter section */}
        <div className="py-12 md:py-16 border-b border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-muted-foreground">
                Receba atualizações sobre novos recursos e dicas de produtividade.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Input
                type="email"
                placeholder="seu@email.com"
                className="max-w-xs"
              />
              <Button variant="hero">
                Inscrever
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <Film className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Lumina
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-6 leading-relaxed">
              Plataforma completa para gestão de projetos criativos, 
              filmes, séries e conteúdo audiovisual.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lumina. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com 💙 para criadores
          </p>
        </div>
      </div>
    </footer>
  );
}
