import { useEffect, useRef } from "react";
import { useParams, Navigate } from "react-router";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { AiEditSuggestionCard } from "@/components/notes/AiEditSuggestionCard";
import { useNote } from "@/hooks/useNotes";
import type { Id } from "@/convex/_generated/dataModel";

export default function NoteEditorPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const { note, updateNote, clearPendingAiEdit } = useNote(noteId as Id<"notes"> | undefined);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    };
  }, []);

  if (!noteId) {
    return <Navigate to="/notes" replace />;
  }

  if (note === undefined) {
    return (
      <div className="flex flex-col flex-1 p-8 gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Nota no encontrada.</p>
      </div>
    );
  }

  const handleTitleChange = (value: string) => {
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => {
      updateNote({ noteId: note._id, title: value }).catch(() => {
        toast.error("No se pudo guardar el título");
      });
    }, 500);
  };

  const handleBodySave = (body: string) => {
    updateNote({ noteId: note._id, body }).catch(() => {
      toast.error("No se pudo guardar la nota");
    });
  };

  const handleApplyAiEdit = async () => {
    if (!note.pendingAiEdit) return;
    if (titleDebounceRef.current) {
      clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = null;
    }
    try {
      await updateNote({ noteId: note._id, body: note.pendingAiEdit.proposedBody });
      await clearPendingAiEdit({ noteId: note._id });
    } catch {
      toast.error("No se pudo aplicar la edición");
    }
  };

  const handleDiscardAiEdit = async () => {
    try {
      await clearPendingAiEdit({ noteId: note._id });
    } catch {
      toast.error("No se pudo descartar la sugerencia");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="px-8 pt-6 pb-3 border-b border-border shrink-0">
        <input
          type="text"
          defaultValue={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título de la nota"
          className="w-full bg-transparent font-serif text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <NoteEditor
          key={note._id}
          noteId={note._id}
          initialBody={note.body}
          onSave={handleBodySave}
        />

        <AiEditSuggestionCard
          pendingAiEdit={note.pendingAiEdit}
          onApply={handleApplyAiEdit}
          onDiscard={handleDiscardAiEdit}
        />
      </div>
    </div>
  );
}
