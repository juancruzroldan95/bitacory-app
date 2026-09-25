import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import useAuth from "@/hooks/useAuth";
import { BitacoryLogo } from "@/components/brand/BitacoryLogo";
import {
  Target,
  NotebookPen,
  Sparkles,
  AtSign,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Lock,
  Compass,
  Clock,
  TrendingUp,
  Brain,
  Lightbulb,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: "¿Cómo funciona la medición y el seguimiento de objetivos?",
    answer:
      "Podés crear metas categorizadas en Bienestar, Creatividad, Carrera o Salud Mental. Cada objetivo se desglosa en hitos medibles (milestones) que marcás a medida que avanzás, visualizando porcentajes de progreso y estadísticas para sostener la motivación sin agotamiento.",
  },
  {
    question: "¿Bitacory reemplaza a un profesional de la salud mental?",
    answer:
      "No. Bitacory no realiza diagnósticos clínicos ni reemplaza la terapia psicológica. Es una herramienta de acompañamiento, registro y autoconocimiento diseñada para complementar tu proceso personal o potenciar el trabajo que hacés con tu terapeuta.",
  },
  {
    question: "¿Cómo se sincroniza con mis sesiones de terapia?",
    answer:
      "Configurás el horario de tu sesión en tu perfil. Bitacory genera una plantilla de preparación 24 horas antes para que ordenes tus vivencias y temas clave, y otra 2 horas después para asentar los aprendizajes y acuerdos antes de que se diluyan en la rutina semanal.",
  },
  {
    question: "¿Cómo me ayudan las notas a potenciar mi creatividad?",
    answer:
      "Escribir con regularidad actúa como un vaciado cognitivo: descarga la memoria de trabajo y disminuye los niveles de cortisol, liberando el espacio mental indispensable para conectar ideas y generar soluciones creativas.",
  },
  {
    question: "¿Mis notas, metas y conversaciones son privadas y seguras?",
    answer:
      "Totalmente. La privacidad es nuestro compromiso fundamental. Tus datos están cifrados y únicamente vos podés acceder a ellos. Nunca comercializamos tu información ni la utilizamos para entrenar modelos públicos de inteligencia artificial.",
  },
];

type ShowcaseTab = "goals" | "journal" | "companion";

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("goals");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const ctaLink = isAuthenticated ? "/app/notes" : "/auth/login";

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (hash) {
      const timer = setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className="relative w-full pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center"
      >
        {/* Subtle Ambient Glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[580px] h-72 sm:h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Hero Title */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.18] max-w-4xl text-balance">
          El espacio donde tus pensamientos se ordenan y{" "}
          <span className="text-primary font-semibold">tus objetivos se alcanzan</span>.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-sans text-balance">
          Bitacory une el poder de la escritura reflexiva con el seguimiento de metas, el diálogo inteligente y el acompañamiento terapéutico para desbloquear tu creatividad y alcanzar tu máximo potencial.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            to={ctaLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.98] group"
          >
            <span>{isAuthenticated ? "Ir a mi espacio" : "Empezar gratis hoy"}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <a
            href="#como-funciona"
            onClick={(e) => handleScrollTo(e, "#como-funciona")}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border bg-card text-foreground font-medium text-base hover:bg-muted/50 hover:border-primary/40 transition-all duration-200 cursor-pointer"
          >
            Cómo funciona
          </a>
        </div>

        {/* Reassurance Trust Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Medición de metas e hitos</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span>Salud mental y wellness activo</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Privacidad y cifrado total</span>
          </div>
        </div>

        {/* 2. LIVING PRODUCT SHOWCASE (HERO DEMO) */}
        <div
          id="experiencia"
          className="mt-14 w-full max-w-5xl rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden text-left transition-all duration-300"
        >
          {/* Showcase Navigation Bar */}
          <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Window controls and brand indicator */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <div className="h-3 w-3 rounded-full bg-border" />
                <div className="h-3 w-3 rounded-full bg-border" />
                <div className="h-3 w-3 rounded-full bg-border" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono pl-2 border-l border-border/60">
                <BitacoryLogo className="h-4 w-4" />
                <span>bitacory.app</span>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-background border border-border/70 text-xs font-medium w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setActiveTab("goals")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "goals"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Medición de Objetivos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("journal")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "journal"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                2. Diario & Claridad Mental
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("companion")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "companion"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Copiloto IA & Crecimiento
              </button>
            </div>
          </div>

          {/* Tab 1: Medición de Objetivos */}
          {activeTab === "goals" && (
            <div className="p-6 sm:p-8 bg-card flex flex-col justify-between min-h-[380px] space-y-6 animate-in fade-in duration-300">
              <div className="space-y-5 max-w-3xl">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-xs">
                      Creatividad & Carrera
                    </span>
                    <span className="font-mono text-muted-foreground">Meta trimestral</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    <span>75% completado</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                    Lanzar mi proyecto creativo independiente
                  </h2>
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                    Objetivo diseñado para desbloquear mi potencial creador y construir una fuente de trabajo alineada con mis valores personales.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "75%" }} />
                </div>

                {/* Milestones checklist */}
                <div className="space-y-2 pt-1 font-sans text-sm">
                  <div className="flex items-center gap-2.5 text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-through text-muted-foreground">Definir el propósito central y la propuesta de valor</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-through text-muted-foreground">Estructurar el borrador inicial y validar ideas en notas</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-through text-muted-foreground">Establecer rutina de 45 minutos diarios de escritura enfocada</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-medium">
                    <div className="h-4 w-4 rounded-full border-2 border-primary shrink-0" />
                    <span>Revisión final de contenidos y publicación oficial</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                  <Target className="h-3.5 w-3.5" />
                  3 de 4 hitos alcanzados
                </span>
                <span className="font-mono">Próxima meta semanal: viernes</span>
              </div>
            </div>
          )}

          {/* Tab 2: Diario & Claridad Mental */}
          {activeTab === "journal" && (
            <div className="p-6 sm:p-8 bg-card flex flex-col justify-between min-h-[380px] space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">Martes, 08:30 hs</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                      #claridad
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium text-[11px]">
                      #creatividad
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium text-[11px]">
                      #enfoque
                    </span>
                  </div>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                  Superar el perfeccionismo que frena mi avance
                </h2>

                <div className="font-serif text-base text-foreground/85 leading-relaxed space-y-3">
                  <p>
                    Esta mañana me di cuenta de cuánto tiempo pierdo puliendo detalles menores antes de animarme a dar el siguiente paso. El perfeccionismo suele ser una máscara del miedo a exponerme.
                  </p>
                  <p>
                    Decidí cambiar la métrica: hoy el éxito no es que salga impecable, sino avanzar en el hito que tengo pendiente y tolerar la incomodidad de estar en proceso de aprendizaje.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Guardado automático en tu diario
                </span>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span>210 palabras</span>
                  <span>Claridad mental: alta</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Copiloto IA & Crecimiento */}
          {activeTab === "companion" && (
            <div className="p-6 sm:p-8 bg-card flex flex-col justify-between min-h-[380px] space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4 max-w-3xl">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-3 text-sm shadow-xs">
                    <p className="leading-relaxed font-sans">
                      Anoté en{" "}
                      <span className="bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-md font-mono text-xs font-semibold">
                        @Superar el perfeccionismo
                      </span>{" "}
                      que me cuesta cerrar tareas por miedo al juicio. ¿Qué ejercicio concreto puedo aplicar para pasar a la acción hoy?
                    </p>
                  </div>
                </div>

                {/* AI Companion Response */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <BitacoryLogo className="h-5 w-5" />
                  </div>
                  <div className="max-w-[92%] sm:max-w-[85%] rounded-2xl rounded-tl-xs bg-muted/40 border border-border/60 px-5 py-4 text-sm text-foreground space-y-2.5">
                    <p className="font-serif leading-relaxed text-sm text-foreground/90">
                      Excelente toma de consciencia. Notar que el perfeccionismo encubre miedo a exponerte es el primer gran paso para desarticularlo.
                    </p>
                    <p className="font-serif leading-relaxed text-sm text-foreground/90">
                      Te propongo la regla del "80% listo": elegí el hito que tenés frenado, trabajalo durante 30 minutos sin editarte y compartilo o dalo por cerrado en ese estado. Registrá después en una nota qué ocurrió con tu nivel de ansiedad.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Composer Mock */}
              <div className="pt-2">
                <div className="rounded-xl border border-border bg-background px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="italic">
                    Conversá con tu copiloto o usá @ para vincular notas y objetivos...
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. STEP-BY-STEP WORKFLOW */}
      <section id="como-funciona" className="scroll-mt-20 w-full py-20 border-t border-border/50 bg-muted/20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Un flujo diario para tu desarrollo personal
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Tres pasos simples para cultivar tu salud mental y alcanzar tus metas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 sm:p-7 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all duration-200 space-y-2">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                1. Clarificá tu mente a través de notas reflexivas
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Escribí tus pensamientos, tensiones y descubrimientos diarios. Al volcarlo en palabras, reducís el cortisol y abrís espacio para la creatividad.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all duration-200 space-y-2">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                2. Fijá objetivos e hitos accionables
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Transformá tus anhelos en metas concretas. Dividilas en pasos medibles y hacé seguimiento de tu avance con estadísticas en tiempo real.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all duration-200 space-y-2">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                3. Reflexioná con tu copiloto y acelerá tu avance
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Usá el chat inteligente y la sincronización con terapia para conectar puntos ciegos, romper bloqueos y avanzar con solidez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SOLUTION & CAPABILITIES */}
      <section id="solucion" className="scroll-mt-20 w-full py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-24">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Una solución integral para tu crecimiento interior
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
            Herramientas diseñadas para que tus reflexiones se conviertan en metas tangibles y hábitos duraderos.
          </p>
        </div>

        {/* Pillar 1: Metas y Objetivos */}
        <div id="objetivos" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                <Target className="h-4 w-4" />
                <span>Gestión de Metas & Hábitos</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
                Medí tu progreso sin quemarte en el intento
              </h3>
              <p className="font-serif text-base text-muted-foreground leading-relaxed">
                Los objetivos abstractos generan frustración. En Bitacory definís tus metas personales por categorías y las descomponés en hitos manejables para avanzar con disfrute y constancia.
              </p>
            </div>

            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground font-medium">Hitos progresivos:</strong> Marcá cada avance y celebrá logros intermedios para sostener la dopamina y la motivación.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground font-medium">Métricas claras:</strong> Visualizá el estado de tus objetivos (en curso, completados o pausados) con porcentajes claros.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground font-medium">Sugerencia inteligente:</strong> La IA te sugiere próximos hitos cuando te sentís bloqueado en una meta específica.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs">
                <span className="font-semibold text-foreground">Objetivo en curso</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">Salud Mental</span>
              </div>
              <h4 className="font-heading text-xl font-semibold text-foreground">
                Construir una rutina matutina consciente
              </h4>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                Priorizar 20 minutos de meditación y escritura reflexiva antes de revisar pantallas o notificaciones de trabajo.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between font-mono text-muted-foreground">
                  <span>Progreso</span>
                  <span className="text-primary font-semibold">66%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "66%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Notas Inteligentes y Diálogo Reflexivo */}
        <div id="notas" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/40 text-xs text-muted-foreground">
                <NotebookPen className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Notas & Copiloto</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-muted/30 p-4 font-serif text-sm text-foreground/85 leading-relaxed">
                  "Siento que cuando me enfoco en lo que realmente quiero crear, la ansiedad disminuye. El desafío es no dejarme arrastrar por las urgencias de otros."
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2">
                  <div className="text-xs font-semibold text-primary">Respuesta reflexiva de la IA</div>
                  <p className="font-serif text-sm text-foreground/90 leading-relaxed">
                    ¿Qué límite puntual podés establecer mañana para proteger esa primera hora de tu energía creativa?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                <Brain className="h-4 w-4" />
                <span>Claridad Mental & Creatividad</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
                Despejá el ruido mental para dar lugar a tus mejores ideas
              </h3>
              <p className="font-serif text-base text-muted-foreground leading-relaxed">
                Escribir sin filtros te ayuda a procesar emociones complejas y liberar memoria de trabajo. El asistente con IA te devuelve preguntas estratégicas para que descubras nuevas soluciones.
              </p>
            </div>

            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <AtSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground font-medium">Conexión con @menciones:</strong> Citá notas previas en tus conversaciones para explorar patrones de conducta y evaluar tu crecimiento.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground font-medium">Diálogo constructivo:</strong> Un compañero que no te juzga ni te satura con consejos vacíos, sino que te estimula a pensar con mayor profundidad.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Compass className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground font-medium">Memoria semántica:</strong> Identifica temas recurrentes en tus reflexiones para mostrarte cómo evoluciona tu bienestar a lo largo del tiempo.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. THERAPY BRIDGE SECTION */}
      <section id="terapia" className="scroll-mt-20 w-full py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-14 space-y-10 shadow-xs">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              <Calendar className="h-3.5 w-3.5" />
              <span>Acompañamiento Terapéutico</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Aprovechá al máximo cada sesión con tu psicólogo
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              La terapia es una de las inversiones más valiosas en tu crecimiento personal. Bitacory te ayuda a capitalizarla al 100% con preparación y reflexión automática.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
                <Clock className="h-4 w-4" />
                <span>Antes de la sesión</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Preparación Pre-Sesión
              </h3>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                Recibís una plantilla automática para ordenar qué eventos importantes ocurrieron, qué emociones experimentaste y qué objetivo puntual querés profundizar en la consulta.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
                <Clock className="h-4 w-4" />
                <span>Después de la sesión</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Reflexión Post-Sesión
              </h3>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                Un espacio guiado para asentar las revelaciones y acuerdos antes de que se diluyan en la rutina cotidiana, asegurando la continuidad de tus avances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED BLOG ARTICLE BANNER */}
      <section id="blog-destacado" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-primary/10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Artículo destacado en el Blog
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
              La Pirámide de Maslow y el Quinto Nivel: El camino a la autorrealización
            </h3>
            <p className="font-serif text-sm sm:text-base text-muted-foreground leading-relaxed">
              Exploramos cómo pasar de satisfacer carencias a construir tu mejor versión mediante la claridad mental, el seguimiento de objetivos y el autoconocimiento.
            </p>
          </div>

          <Link
            to="/blog/piramide-de-maslow-autorrealizacion"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs"
          >
            <span>Leer artículo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="scroll-mt-20 w-full py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Respuestas a las dudas más comunes sobre Bitacory.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            const contentId = `faq-content-${idx}`;
            const headerId = `faq-header-${idx}`;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-200"
              >
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
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
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed font-sans border-t border-border/30 animate-in fade-in duration-200"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CLOSING CALL TO ACTION */}
      <section id="comenzar" className="scroll-mt-20 w-full py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-border/80 bg-muted/20 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xs">
          <div
            className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
            <BitacoryLogo className="h-7 w-7" />
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Tu potencial merece ser desplegado
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed font-sans">
              Comenzá hoy a medir tus objetivos, cultivar tu salud mental y construir la mejor versión de vos mismo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ctaLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.98] group"
            >
              <span>{isAuthenticated ? "Ir a mi espacio" : "Crear mi cuenta gratuita"}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Tus datos son 100% privados, cifrados y seguros.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
