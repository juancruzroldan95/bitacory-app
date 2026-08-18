import { useState } from "react";
import { Link } from "react-router";
import {
  NotebookPen,
  MessageCircle,
  Sparkles,
  AtSign,
  ArrowRight,
  ShieldCheck,
  Brain,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Compass,
  Lightbulb,
  BookOpen,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: "¿Bitacory reemplaza a un psicólogo o profesional de la salud mental?",
    answer:
      "No. Bitacory no es un sustituto de la terapia psicológica tradicional ni realiza diagnósticos clínicos. Es una herramienta de acompañamiento, registro y autoconocimiento diseñada para complementar tu proceso personal o terapéutico.",
  },
  {
    question: "¿Mis notas y conversaciones son privadas y seguras?",
    answer:
      "Totalmente. La privacidad es el pilar fundamental de Bitacory. Tus notas, sesiones y datos están cifrados y únicamente vos podés acceder a ellos. No compartimos ni comercializamos tu información personal con terceros.",
  },
  {
    question: "¿Por qué el asistente de IA habla en español rioplatense?",
    answer:
      "Diseñamos el asistente con un tono cálido, empático y natural en español rioplatense para generar un ambiente cercano, libre de modismos artificiales y propicio para la introspección genuina.",
  },
  {
    question: "¿Cómo funciona la preparación y reflexión de terapia?",
    answer:
      "Podés configurar el día y hora de tu sesión con el psicólogo. Bitacory te enviará una plantilla de preparación 24 horas antes para que ordenes los temas que querés hablar, y otra 2 horas después para asentar las conclusiones clave.",
  },
  {
    question: "¿Puedo usar Bitacory aunque actualmente no vaya al psicólogo?",
    answer:
      "¡Por supuesto! Bitacory funciona de forma excelente como diario de gratitud, registro de emociones, desahogo y reflexión personal para cualquier persona interesada en el autoconocimiento.",
  },
];

export const LandingPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Ambient Glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-72 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs sm:text-sm font-medium tracking-wide mb-6 shadow-xs animate-in fade-in duration-500">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Tu santuario personal de reflexión e IA</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.18] max-w-4xl">
          Un espacio seguro para escribir, conversar y{" "}
          <span className="text-primary font-semibold">comprenderte mejor</span>.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-sans">
          Combinamos la intimidad de un diario personal con el diálogo empático de una IA en español rioplatense y sincronización proactiva con tu terapia.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            to="/auth/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group"
          >
            <span>Empezar a escribir gratis</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <a
            href="#como-funciona"
            onClick={(e) => handleScrollTo(e, "#como-funciona")}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border/80 bg-card/60 text-foreground font-medium text-base hover:bg-muted/50 hover:border-primary/30 transition-all duration-200"
          >
            Ver cómo funciona
          </a>
        </div>

        {/* Reassurance pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>Sin tarjeta requerida</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Privacidad y cifrado total</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-primary" />
            <span>Español cálido y cercano</span>
          </div>
        </div>

        {/* 2. HERO SHOWCASE MOCKUP */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-md overflow-hidden text-left transition-all duration-300">
          {/* Window Header */}
          <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>Bitacory • Sesión reflexiva</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Split Editor & Chat UI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            {/* Left: Journal Note */}
            <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-border/50 bg-background/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">Jueves, 19:30 hs</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                      #terapia
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium text-[11px]">
                      #autoexigencia
                    </span>
                  </div>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Reflexión post-sesión: Poner límites sin culpa
                </h3>
                <p className="font-serif text-sm text-foreground/80 leading-relaxed">
                  Hoy en la sesión con Mati estuvimos viendo por qué me cuesta tanto decir que no cuando me piden favores en el trabajo. Siento que si no estoy disponible para todos, pierdo mi valor. Me dejó pensando una pregunta: ¿A quién estoy intentando complacer realmente?...
                </p>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Guardado en tu diario
                </span>
                <span className="font-mono text-[11px]">342 palabras</span>
              </div>
            </div>

            {/* Right: AI Chat Companion */}
            <div className="lg:col-span-6 p-6 bg-card/40 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                {/* User Message with Mention */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2.5 text-sm shadow-xs">
                    <p className="leading-relaxed font-sans">
                      Estuve pensando en lo que escribí en{" "}
                      <span className="bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-md font-mono text-xs">
                        @Poner límites
                      </span>
                      . ¿Cómo puedo empezar a practicarlo sin tanta angustia?
                    </p>
                  </div>
                </div>

                {/* AI Companion Response */}
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-muted/40 border border-border/50 px-4 py-3 text-sm text-foreground space-y-2">
                    <p className="font-serif leading-relaxed text-sm text-foreground/90">
                      Es un gran paso haberlo identificado. En tu nota mencionás que sentís que tu valor depende de estar disponible.
                    </p>
                    <p className="font-serif leading-relaxed text-sm text-foreground/90">
                      ¿Qué pasaría si esta semana elegís un límite pequeño? Por ejemplo, demorar 15 minutos en responder un mensaje no urgente y registrar qué sensaciones corporales aparecen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input Mock */}
              <div className="pt-2">
                <div className="rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="italic">Escribí una reflexión o usá @ para vincular notas...</span>
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION / EMPATHY SECTION */}
      <section className="w-full py-16 border-y border-border/50 bg-muted/15 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              El valor de poner en palabras lo que te pasa
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Escribir es una de las formas más efectivas de procesar emociones y clarificar la mente. Bitacory potencia esa práctica dándote perspectiva y estructura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3 hover:border-primary/30 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <NotebookPen className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Desahogo sin juicios
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Un lienzo en blanco donde podés escribir exactamente lo que sentís, sin filtros ni expectativas sociales.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3 hover:border-primary/30 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Preguntas que transforman
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nuestra IA no te da órdenes ni consejos genéricos; te formula preguntas reflexivas para ayudarte a encontrar tus propias respuestas.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3 hover:border-primary/30 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Continuidad y evolución
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tus reflexiones no quedan aisladas en un cajón. Podés conectar ideas del pasado con tu presente para notar tu progreso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section id="caracteristicas" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Dos espacios, un propósito
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Todo lo que necesitás para tu bienestar mental
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Herramientas diseñadas con cuidado editorial y sensibilidad terapéutica para enriquecer tu rutina diaria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Notas */}
          <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-xs transition-all duration-300 group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <NotebookPen className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Tus Notas & Diario Libre
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Editor fluido con tipografía serif (Lora), etiquetado con tags y soporte de formato enriquecido. Tu refugio personal para escribir cuando quieras.
              </p>
            </div>
            <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
              <span>Editor enriquecido</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 2: Sesiones */}
          <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-xs transition-all duration-300 group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Sesiones con IA Terapéutica
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Diálogos profundos y empáticos en español rioplatense. Respuestas en tiempo real con streaming token a token y escucha activa sin prejuicios.
              </p>
            </div>
            <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
              <span>Streaming en tiempo real</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 3: Menciones */}
          <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-xs transition-all duration-300 group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <AtSign className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Conexión con @Menciones
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Mencioná notas anteriores dentro del chat con un simple <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@nota</code>. La IA leerá el contenido para darte reflexiones con contexto real.
              </p>
            </div>
            <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
              <span>Contexto integrado</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 4: Terapia */}
          <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-xs transition-all duration-300 group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Acompañamiento Proactivo
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Sincronizá el horario de tu terapia. Bitacory generará notas guía automáticas 24hs antes para preparar temas y 2hs después para afianzar aprendizajes.
              </p>
            </div>
            <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
              <span>Automatización pre y post sesión</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 5: Insights */}
          <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-xs transition-all duration-300 group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Patrones e Insights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                El sistema sintetiza resúmenes semánticos periódicos para ayudarte a reconocer patrones de conducta, detonantes de estrés y avances en tus metas.
              </p>
            </div>
            <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
              <span>Memoria semántica RAG</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 6: Privacidad */}
          <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-xs transition-all duration-300 group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Privacidad Absoluta
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Autenticación segura sin contraseñas engorrosas (Google o Magic Links por email). Tus datos no se usan para entrenar modelos públicos.
              </p>
            </div>
            <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1">
              <span>Tus datos te pertenecen</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. STEP-BY-STEP WORKFLOW */}
      <section id="como-funciona" className="w-full py-20 border-t border-border/50 bg-muted/20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Empezá en tres simples pasos
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              No hay una manera obligatoria de usar Bitacory. Creá tu propio ritmo.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row items-start gap-5 p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/30 transition-all duration-300">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary font-mono text-lg font-bold flex items-center justify-center shrink-0">
                01
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Escribí en tus notas
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  Usá la sección de Notas como tu diario personal. Podés escribir sobre tu día a día, tus emociones, lo que hablaste en terapia, tus miedos o tus logros. Es tu espacio libre y sin juicios.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row items-start gap-5 p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/30 transition-all duration-300">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary font-mono text-lg font-bold flex items-center justify-center shrink-0">
                02
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Iniciá una sesión reflexiva
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  Abrí una conversación cuando necesites ordenar tus pensamientos o desahogarte. La IA te acompañará haciéndote preguntas introspectivas y ayudándote a desenredar lo que sentís.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row items-start gap-5 p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/30 transition-all duration-300">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary font-mono text-lg font-bold flex items-center justify-center shrink-0">
                03
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Conectá todo con @menciones y descubrí patrones
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  Escribí <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@</code> en el chat para citar notas específicas. Con el tiempo, vas a empezar a notar que ciertas emociones o situaciones se repiten, facilitando cambios reales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THERAPY INTEGRATION FOCUS */}
      <section id="terapia" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card to-primary/5 p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              <span>Para pacientes en terapia</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Aprovechá al máximo cada sesión con tu psicólogo
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              ¿Alguna vez te pasó de llegar a tu sesión de terapia y olvidarte de lo que querías hablar? Bitacory resuelve esto con proactividad inteligente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-background/80 space-y-3">
              <div className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                24 horas antes
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Preparación Pre-Sesión
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Se crea automáticamente una plantilla en tus notas para que anotes qué eventos ocurrieron en la semana, qué emociones predominaron y qué tema puntual querés profundizar con tu terapeuta.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-background/80 space-y-3">
              <div className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                2 horas después
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Reflexión Post-Sesión
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Genera un espacio para volcar los acuerdos, insights y sensaciones frescas que surgieron en el consultorio antes de que se diluyan en la rutina semanal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="w-full py-20 border-t border-border/50 bg-muted/15 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Todo lo que necesitás saber antes de comenzar.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="font-heading text-base font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed font-sans border-t border-border/30 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA SANCTUARY CARD */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xs">
          <div
            className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Tu historia merece un lugar donde ser escuchada
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed font-sans">
              Empezá hoy a cultivar un hábito transformador de escritura y diálogo consciente. Sin juicios, a tu propio ritmo.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] group"
            >
              <span>Crear mi cuenta gratuita</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
