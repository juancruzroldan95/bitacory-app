import { Link, useNavigate, useLocation } from "react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { BitacoryLogo } from "@/components/brand/BitacoryLogo";
import useAuth from "@/hooks/useAuth";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const hash = href.slice(hashIndex);

    if (location.pathname === "/") {
      e.preventDefault();
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", hash);
      }
    } else {
      e.preventDefault();
      navigate(`/${hash}`);
    }
  };

  return (
    <footer className="border-t border-border/50 bg-card/30 text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="Bitacory, ir al inicio">
              <div className="h-8 w-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <BitacoryLogo className="h-8 w-8" />
              </div>
              <span className="font-heading font-semibold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                Bitacory
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              La plataforma para potenciar tu bienestar mental, medir tus objetivos de vida y alcanzar tu autorrealización personal con el acompañamiento de inteligencia artificial.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 pt-1">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>Privacidad absoluta: tus notas y metas son tuyas y de nadie más.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Explorar
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/#como-funciona"
                  onClick={(e) => handleNavClick(e, "/#como-funciona")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cómo funciona
                </a>
              </li>
              <li>
                <a
                  href="/#objetivos"
                  onClick={(e) => handleNavClick(e, "/#objetivos")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Metas y objetivos
                </a>
              </li>
              <li>
                <a
                  href="/#notas"
                  onClick={(e) => handleNavClick(e, "/#notas")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Notas y copiloto IA
                </a>
              </li>
              <li>
                <a
                  href="/#terapia"
                  onClick={(e) => handleNavClick(e, "/#terapia")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Acompañamiento de terapia
                </a>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog y artículos
                </Link>
              </li>
              <li>
                <a
                  href="/#faq"
                  onClick={(e) => handleNavClick(e, "/#faq")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Access */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Comenzar
            </h3>
            <ul className="space-y-2 text-sm">
              {isAuthenticated ? (
                <li>
                  <Link
                    to="/app/notes"
                    className="text-primary hover:underline transition-colors font-medium"
                  >
                    Ir a notas →
                  </Link>
                </li>
              ) : (
                <>
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
                </>
              )}
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  <span>Acompañamiento reflexivo con IA</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Bitacory. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Desarrollado por{" "}
            <a
              href="https://chaka.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary font-medium underline underline-offset-4 decoration-border hover:decoration-primary transition-colors"
            >
              chaka.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
