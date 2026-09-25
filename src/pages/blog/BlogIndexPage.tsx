import { Link } from "react-router";
import { BLOG_POSTS } from "@/data/blogPosts";
import { ArrowRight, Clock, Sparkles, Target } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export const BlogIndexPage = () => {
  const { isAuthenticated } = useAuth();
  const ctaLink = isAuthenticated ? "/app/notes" : "/auth/login";
  const featuredPost = BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.slice(1);

  return (
    <div className="w-full flex flex-col items-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* Blog Header */}
      <div className="text-center max-w-3xl space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Ideas para tu crecimiento y autorrealización
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
          Artículos sobre bienestar mental, psicología, medición de objetivos y desarrollo del potencial humano con el respaldo de Bitacory.
        </p>
      </div>

      {/* Featured Article Card (Maslow's Pyramid) */}
      <div className="w-full">
        <Link
          to={`/blog/${featuredPost.slug}`}
          className="group block p-8 sm:p-10 rounded-3xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  {featuredPost.readingTime}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{featuredPost.date}</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                {featuredPost.title}
              </h2>

              <p className="font-serif text-base text-muted-foreground leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <span>Leer artículo completo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="w-full rounded-2xl bg-muted/30 border border-border/60 p-6 flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  El 5to Nivel de Maslow
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cómo pasar de cubrir carencias a desplegar tu creatividad y vivir con propósito.
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Other Articles Grid */}
      <div className="w-full space-y-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Más lecturas recomendadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regularPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group p-6 sm:p-8 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
                <span>Leer artículo</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="w-full p-8 sm:p-12 rounded-3xl border border-border/80 bg-muted/20 text-center space-y-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
          Poné en práctica lo aprendido
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
          Bitacory te ofrece el espacio para escribir con claridad, medir tus metas personales y cultivar tu bienestar mental todos los días.
        </p>
        <div className="pt-2">
          <Link
            to={ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
          >
            <span>{isAuthenticated ? "Ir a notas" : "Crear mi cuenta gratuita"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
