import { BookHeart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function ChatHomePage() {
  const createThread = useMutation(api.functions.threads.create);
  const navigate = useNavigate();

  const handleNewSession = async () => {
    try {
      const threadId = await createThread({ title: "Nueva sesión" });
      navigate(`/chat/${threadId}`);
    } catch {
      toast.error("No se pudo crear la sesión");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <BookHeart className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center space-y-3 max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight">
          Bienvenido a Bitácora
        </h2>
        <p className="text-muted-foreground">
          Tu espacio para procesar pensamientos, emociones y experiencias de tus sesiones de terapia.
        </p>
        <p className="text-sm text-muted-foreground/70">
          Iniciá una nueva sesión para escribir lo que querés explorar, o elegí una sesión anterior desde la barra lateral.
        </p>
      </div>
      <Button onClick={handleNewSession} size="lg" className="gap-2">
        <Plus className="h-4 w-4" />
        Nueva sesión
      </Button>
    </div>
  );
}
