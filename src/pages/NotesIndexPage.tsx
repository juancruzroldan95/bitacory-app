import { useNavigate } from "react-router";
import { toast } from "sonner";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";

export default function NotesIndexPage() {
  const { createNote } = useNotes();
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const noteId = await createNote({ title: "Nueva nota", body: "" });
      navigate(`/notes/${noteId}`);
    } catch {
      toast.error("No se pudo crear la nota");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <NotebookPen className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2 max-w-xs">
        <h2 className="font-serif text-xl font-medium tracking-tight">Tu espacio de notas</h2>
        <p className="text-sm text-muted-foreground">
          Seleccioná una nota de la barra lateral o creá una nueva para empezar a escribir.
        </p>
      </div>
      <Button onClick={handleCreate} className="rounded-xl">
        <NotebookPen className="mr-2 h-4 w-4" />
        Nueva nota
      </Button>
    </div>
  );
}
