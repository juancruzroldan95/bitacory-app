import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Sun, Moon, Menu, X, ArrowRight, BookOpen } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import useAuth from "@/hooks/useAuth";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Características", href: "#caracteristicas" },
    { name: "Cómo funciona", href: "#como-funciona" },
    { name: "Acompañamiento", href: "#terapia" },
    { name: "Preguntas", href: "#faq" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-xs"
          : "bg-background/50 backdrop-blur-xs border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg p-1"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-heading font-semibold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            Bitacory
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Actions (Theme Toggle & CTA) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full border border-border/60 bg-card/60 backdrop-blur-xs flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
            aria-label="Alternar tema claro/oscuro"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Primary Action Button */}
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/app/notes")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <span>Ir a mi diario</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-xs"
              >
                <span>Comenzar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full border border-border/60 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Alternar tema"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 rounded-lg border border-border/60 bg-card/60 flex items-center justify-center text-foreground hover:border-primary/40 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-medium text-muted-foreground hover:text-foreground py-1.5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-border/40 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/app/notes");
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <span>Ir a mi diario</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-medium text-foreground rounded-lg border border-border/60 hover:bg-muted/50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  <span>Comenzar gratis</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
