import { NotebookPen, MessageCircle, Lightbulb, AtSign, Sparkles, PenLine, ArrowRight, TrendingUp, Goal, Brain, BookOpen } from "lucide-react";
import { useNavigate } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: string;
}

function FeatureCard({ icon, title, description, accent = "bg-primary/10 text-primary" }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-6 flex flex-col gap-3 hover:border-primary/30 hover:shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <div className={`shrink-0 ${accent}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-foreground text-base">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

interface StepProps {
  number: string;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-5 group">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold font-mono transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          {number}
        </div>
        <div className="w-px flex-1 bg-border/50 min-h-[2rem]" />
      </div>
      <div className="pb-8 space-y-1 pt-0.5">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto w-full relative">
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden absolute top-3 left-3 z-40">
        <SidebarTrigger className="bg-background/80 backdrop-blur-sm" />
      </div>

      <div className="px-6 py-12 max-w-[720px] mx-auto w-full space-y-14">

        {/* Hero Section */}
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Tu compañero de reflexión personal
          </div>
          <div className="space-y-3">
            <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground leading-tight">
              Bienvenido a Bitacory
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Un espacio íntimo para escribir, reflexionar y descubrir patrones en tu vida. Como un diario personal con un compañero de IA que te escucha y te ayuda a crecer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              onClick={() => navigate("/notes")}
              className="flex items-center gap-2 rounded-full px-5 font-medium text-sm"
            >
              <PenLine className="h-4 w-4" />
              Empezar a escribir
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2 rounded-full px-5 font-medium text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Abrir sesiones
            </Button>
          </div>
        </header>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/40" />
          <span className="flex-shrink mx-4 text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase">
            Qué es Bitacory
          </span>
          <div className="flex-grow border-t border-border/40" />
        </div>

        {/* What is it */}
        <section className="space-y-6">
          <p className="text-base text-foreground/80 leading-relaxed">
            Bitacory nace de la idea de que <span className="text-foreground font-medium">escribir es una de las herramientas más poderosas de autoconocimiento</span>. Combinamos la intimidad de un diario personal con la profundidad de un acompañante de IA para ayudarte a entenderte mejor.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Ya sea que estés atravesando un proceso terapéutico, explorando tu mundo interior, o simplemente querés dejar registro de tus pensamientos, Bitacory te ofrece el espacio para hacerlo con profundidad y sin juicio.
          </p>
        </section>

        {/* Features Grid */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-medium text-foreground">Dos espacios, un propósito</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<NotebookPen className="h-5 w-5" />}
              title="Tus Notas"
              description="Tu diario íntimo digital. Escribí lo que quieras, cuando quieras — reflexiones del día, lo que charlaste con tu psicólogo, pensamientos, emociones, metas. Es tu espacio libre y sin estructura."
              accent="text-primary"
            />
            <FeatureCard
              icon={<MessageCircle className="h-5 w-5" />}
              title="Sesiones con IA"
              description="Conversaciones profundas con un compañero de IA en español rioplatense. Podés charlar sobre lo que estés viviendo, explorar ideas, o pedir perspectivas sobre tus reflexiones escritas."
              accent="text-violet-600 dark:text-violet-400"
            />
            <FeatureCard
              icon={<AtSign className="h-5 w-5" />}
              title="Mencioná tus notas"
              description="Dentro de una sesión, podés mencionar tus notas con @ para que la IA tenga contexto real de lo que escribiste. Así la conversación se vuelve mucho más rica y personalizada."
              accent="text-amber-600 dark:text-amber-400"
            />
            <FeatureCard
              icon={<Lightbulb className="h-5 w-5" />}
              title="Insights y patrones"
              description="Con el tiempo, la IA puede ayudarte a identificar patrones recurrentes en tus pensamientos, emociones y comportamientos, y convertirlos en aprendizajes concretos sobre vos mismo."
              accent="text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/40" />
          <span className="flex-shrink mx-4 text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase">
            Cómo usarlo
          </span>
          <div className="flex-grow border-t border-border/40" />
        </div>

        {/* How to use */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-medium text-foreground">Empezá en tres pasos</h2>
          <div className="pt-2">
            <Step
              number="01"
              title="Escribí en tus notas"
              description="Usá la sección de Notas como tu diario personal. Podés escribir sobre tu día, tus emociones, lo que hablaste en terapia, tus miedos, tus logros — cualquier cosa que quieras dejar escrita."
            />
            <Step
              number="02"
              title="Iniciá una sesión de chat"
              description="Abrí una nueva sesión desde la sección de Sesiones. Podés empezar contando cómo estás, qué estás pensando o qué querés explorar. La IA te acompañará sin juzgarte."
            />
            <Step
              number="03"
              title="Conectá todo con @menciones"
              description="Dentro del chat, escribí @ seguido del nombre de una nota para que la IA pueda leerla y tenerla en cuenta. Esto le da contexto real y hace la conversación mucho más profunda."
            />
          </div>
        </section>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/40" />
          <span className="flex-shrink mx-4 text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase">
            El objetivo
          </span>
          <div className="flex-grow border-t border-border/40" />
        </div>

        {/* Purpose section */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-medium text-foreground">¿Para qué sirve todo esto?</h2>
          <div className="space-y-3">
            {[
              {
                icon: <TrendingUp className="h-4 w-4" />,
                accent: "bg-primary/10 text-primary",
                title: "Descubrí patrones",
                text: "Con el tiempo vas a empezar a ver que ciertas situaciones, emociones o pensamientos se repiten. Reconocerlos es el primer paso para cambiarlos.",
              },
              {
                icon: <Goal className="h-4 w-4" />,
                accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                title: "Planteá objetivos",
                text: "Usá Bitacory para definir qué querés lograr en tu vida personal, emocional o profesional. La IA puede ayudarte a pensar cómo llegar ahí.",
              },
              {
                icon: <MessageCircle className="h-4 w-4" />,
                accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                title: "Complementá tu terapia",
                text: "Si estás en terapia, podés usar Bitacory para escribir lo que hablaste con tu psicólogo y profundizar en esas reflexiones entre sesiones.",
              },
              {
                icon: <Brain className="h-4 w-4" />,
                accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                title: "Vivir más conscientemente",
                text: "Escribir y reflexionar regularmente te ayuda a conocerte mejor. No se trata de ser perfecto, sino de estar más presente en tu propia vida.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors duration-200"
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.accent}`}>
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <footer className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <BookOpen className="h-8 w-8 text-primary/60" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-medium text-foreground">
              Bitacory es tu espacio
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              No hay manera correcta o incorrecta de usarlo. Solo escribí, conversá y dejate sorprender por lo que descubrís.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate("/notes")}
              className="rounded-full px-6 font-medium text-sm flex items-center gap-2"
            >
              <PenLine className="h-4 w-4" />
              Nueva nota
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/chat")}
              className="rounded-full px-6 font-medium text-sm flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Nueva sesión
            </Button>
          </div>
        </footer>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}


export default AboutPage;