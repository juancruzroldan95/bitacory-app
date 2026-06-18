import { LoginForm } from "@/components/auth/LoginForm";
import { InteractiveBackground } from "@/components/auth/InteractiveBackground";
import { useTheme } from "@/hooks/useTheme";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { Sun, Moon, BookOpen } from "lucide-react";

export default function LoginPage() {
  const { setTheme } = useTheme();
  const resolvedTheme = useResolvedTheme();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden select-none">
      {/* Interactive Canvas Background */}
      <InteractiveBackground />

      {/* Floating Theme Toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 z-50 h-10 w-10 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-300 active:scale-95 cursor-pointer shadow-xs"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-[18px] w-[18px]" />
        ) : (
          <Moon className="h-[18px] w-[18px]" />
        )}
      </button>

      {/* Content Card Container */}
      <div className="w-full max-w-[380px] space-y-7 z-10 py-8">
        <div className="text-center space-y-1">
          {/* Logo Icon */}
          {/* <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 shadow-xs border border-primary/20">
            <BookOpen className="h-6 w-6" />
          </div> */}
          {/* Title in Outfit/Sans */}
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Bitacory
          </h1>
          {/* Tagline/Description in Lora/Serif */}
          <p className="text-lg text-muted-foreground leading-relaxed max-w-[280px] mx-auto pt-1">
            Tu espacio seguro para escribir, conversar y reflexionar.
          </p>
        </div>

        {/* LoginForm Card */}
        <LoginForm />

        {/* Security & Reassurance Footer */}
        <p className="text-center text-xs text-muted-foreground/60 font-sans max-w-[280px] mx-auto leading-relaxed">
          Tus notas y conversaciones son completamente privadas y seguras.
        </p>
      </div>
    </div>
  );
}
