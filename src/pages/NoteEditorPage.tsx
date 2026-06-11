import { useEffect, useRef, useState } from "react";
import { useParams, Navigate } from "react-router";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditor } from "@/components/notes/NoteEditor";

import { useNote } from "@/hooks/useNotes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Id } from "@/convex/_generated/dataModel";

export default function NoteEditorPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const { note, updateNote, clearPendingAiEdit } = useNote(noteId as Id<"notes"> | undefined);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tag Manager State
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagVal, setNewTagVal] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

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

  console.log(`[NoteEditorPage] Render - noteId: ${noteId}, title: "${note.title}", body length: ${note.body.length}`);

  const handleTitleChange = (value: string) => {
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => {
      updateNote({ noteId: note._id, title: value }).catch(() => {
        toast.error("No se pudo guardar el título");
      });
    }, 500);
  };

  const handleBodySave = (body: string) => {
    console.log(`[NoteEditorPage] handleBodySave - calling updateNote mutation (body length: ${body.length})`);
    updateNote({ noteId: note._id, body }).catch(() => {
      toast.error("No se pudo guardar la nota");
    });
  };



  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = note.tags?.filter((t) => t !== tagToRemove) || [];
    try {
      await updateNote({ noteId: note._id, tags: updatedTags });
      toast.success("Etiqueta eliminada");
    } catch {
      toast.error("No se pudo eliminar la etiqueta");
    }
  };

  const handleAddTagSubmit = async () => {
    const trimmed = newTagVal.trim().toLowerCase().replace(/#/g, "");
    setIsAddingTag(false);
    setNewTagVal("");

    if (!trimmed) return;

    const currentTags = note.tags || [];
    if (currentTags.includes(trimmed)) {
      toast.error("La etiqueta ya existe");
      return;
    }

    const updatedTags = [...currentTags, trimmed];
    try {
      await updateNote({ noteId: note._id, tags: updatedTags });
      toast.success("Etiqueta agregada");
    } catch {
      toast.error("No se pudo agregar la etiqueta");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex h-12 items-center border-b px-4 shrink-0 bg-background/95 backdrop-blur z-10 gap-2">
        <SidebarTrigger className="-ml-2 shrink-0 text-muted-foreground hover:text-foreground" />
        <span className="text-sm font-medium text-muted-foreground truncate">{note.title}</span>
      </header>

      {/* Title & Tag Section */}
      <div className="px-8 pt-6 pb-4 border-b border-border shrink-0 flex flex-col gap-2 bg-card/20">
        <input
          type="text"
          defaultValue={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título de la nota"
          className="w-full bg-transparent font-serif text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />

        {/* Tag Manager */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {note.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border/50"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <input
              ref={tagInputRef}
              type="text"
              value={newTagVal}
              onChange={(e) => setNewTagVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTagSubmit();
                if (e.key === "Escape") setIsAddingTag(false);
              }}
              onBlur={handleAddTagSubmit}
              placeholder="nueva-etiqueta"
              className="px-3 py-1 text-xs rounded-full border border-border bg-background focus:outline-none w-28 text-foreground"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold border border-dashed border-border transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Etiqueta</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 relative">
        <NoteEditor
          key={note._id}
          noteId={note._id}
          initialBody={note.body}
          onSave={handleBodySave}
        />
      </div>
    </div>
  );
}
