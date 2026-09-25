import { useParams, Link, Navigate } from "react-router";
import { BLOG_POSTS } from "@/data/blogPosts";
import { ArrowLeft, Clock, Calendar, CheckCircle2, ArrowRight, Target, Sparkles } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const ctaLink = isAuthenticated ? "/app/notes" : "/auth/login";

  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <article className="w-full flex flex-col items-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Top Breadcrumb navigation */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-4">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Volver a todos los artículos</span>
        </Link>
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {post.category}
        </span>
      </div>

      {/* Article Header */}
      <header className="w-full space-y-6 text-center sm:text-left">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span>•</span>
          <span>Por {post.author.name} ({post.author.role})</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground leading-[1.2] tracking-tight">
          {post.title}
        </h1>

        <p className="font-serif text-lg sm:text-xl text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4 italic">
          {post.excerpt}
        </p>
      </header>

      {/* Article Body */}
      <div className="w-full font-serif text-base sm:text-lg text-foreground/90 leading-[1.75] space-y-8 max-w-[70ch]">
        <p>{post.content.intro}</p>

        {post.content.sections.map((section, idx) => (
          <section key={idx} className="space-y-4 pt-4">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight pt-2">
              {section.heading}
            </h2>

            {section.paragraphs.map((p, pIdx) => (
              <p key={pIdx}>{p}</p>
            ))}

            {section.highlight && (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6 my-6 font-sans text-sm sm:text-base text-foreground leading-relaxed">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="font-medium text-foreground">{section.highlight}</p>
                </div>
              </div>
            )}

            {idx === 1 && post.slug === "piramide-de-maslow-autorrealizacion" && (
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-3 shadow-xs my-8 font-sans not-prose">
                <div className="text-xs font-mono text-muted-foreground text-center pb-2 border-b border-border/40">
                  Jerarquía de Necesidades Humanas segun Abraham Maslow
                </div>

                {/* Level 5 (Highlighted) */}
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground space-y-1 shadow-xs border border-primary/30">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>NIVEL 5: AUTORREALIZACIÓN</span>
                    <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-[11px]">Enfoque de Bitacory</span>
                  </div>
                  <p className="text-xs text-primary-foreground/90 leading-relaxed font-sans">
                    Desarrollo del máximo potencial, creatividad desinhibida, propósito vital y autoconocimiento profundo.
                  </p>
                </div>

                {/* Level 4 */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Nivel 4: Estima y Reconocimiento</div>
                  <p className="text-xs text-muted-foreground">Confianza en uno mismo, respeto ajeno, autoeficacia y logro personal.</p>
                </div>

                {/* Level 3 */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Nivel 3: Pertenencia y Afecto</div>
                  <p className="text-xs text-muted-foreground">Relaciones saludables, afecto familiar, amistad y conexión con la comunidad.</p>
                </div>

                {/* Level 2 */}
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Nivel 2: Seguridad y Estabilidad</div>
                  <p className="text-xs text-muted-foreground">Protección física, estabilidad económica, empleo y orden predecible.</p>
                </div>

                {/* Level 1 */}
                <div className="p-3 rounded-xl bg-muted/10 border border-border/30 space-y-0.5 text-center">
                  <div className="text-xs font-medium text-muted-foreground">Nivel 1: Necesidades Fisiológicas Básicas (Alimentación, descanso y salud)</div>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Conclusion */}
        <section className="space-y-4 pt-6 border-t border-border/40">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Conclusión: La práctica diaria del crecimiento
          </h2>
          <p>{post.content.conclusion}</p>
        </section>

        {/* Key Takeaways Card */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-6 sm:p-8 font-sans space-y-4 my-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            <span>Puntos clave para recordar</span>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {post.content.takeaways.map((item, tIdx) => (
              <li key={tIdx} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/90 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Author Footer */}
      <footer className="w-full pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-medium text-foreground text-sm">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">{post.author.role}</p>
        </div>

        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs"
        >
          <span>{isAuthenticated ? "Ir a notas" : "Probar Bitacory gratis"}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </article>
  );
};
