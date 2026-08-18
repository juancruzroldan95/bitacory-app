import { Link } from "react-router";
import { BookOpen, ShieldCheck, Heart, Sparkles } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer className="border-t border-border/50 bg-card/30 text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-heading font-semibold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                Bitacory
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Un santuario digital para registrar tus pensamientos, dialogar con un compañero de IA empático y descubrir patrones en tu vida emocional.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 pt-1">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>Privacidad absoluta: tus notas son tuyas y de nadie más.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
              Explorar
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#caracteristicas"
                  onClick={(e) => handleNavClick(e, "#caracteristicas")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Características
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  onClick={(e) => handleNavClick(e, "#como-funciona")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cómo funciona
                </a>
              </li>
              <li>
                <a
                  href="#terapia"
                  onClick={(e) => handleNavClick(e, "#terapia")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Acompañamiento terapéutico
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, "#faq")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
              Comenzar
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/auth/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Crear cuenta gratis
                </Link>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  <span>En español rioplatense</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Bitacory. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para el bienestar y la claridad personal
            <Heart className="h-3 w-3 text-primary inline fill-primary/30" />
          </p>
        </div>
      </div>
    </footer>
  );
};
