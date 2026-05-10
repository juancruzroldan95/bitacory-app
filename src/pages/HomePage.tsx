import { BookHeart } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HomeComposer } from "@/components/chat/HomeComposer";

export default function ChatHomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 relative">
      <div className="md:hidden absolute top-3 left-3 z-40">
        <SidebarTrigger className="bg-background/80 backdrop-blur-sm" />
      </div>
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <BookHeart className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center space-y-3 max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight">
          Bienvenido a Bitacory
        </h2>
        <p className="text-muted-foreground">
          Tu espacio para procesar pensamientos, emociones y experiencias de tus sesiones de terapia.
        </p>
      </div>
      <HomeComposer />
    </div>
  );
}
