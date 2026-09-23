import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useParams, Navigate } from "react-router";
import { toast } from "sonner";
import { Plus, X, Tag, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NoteEditor = lazy(() =>
  import("@/components/notes/NoteEditor").then((m) => ({ default: m.NoteEditor }))
);
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useNote } from "@/hooks/useNotes";
import { useGoals } from "@/hooks/useGoals";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Id } from "@/convex/_generated/dataModel";
import type { TagSlug, TagCategory } from "@/types/tags";
import {
  THERAPEUTIC_TAGS,
  TAGS_BY_CATEGORY,
} from "@/constants";

export const NoteEditorPage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const { note, updateNote } = useNote(noteId as Id<"notes"> | undefined);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tag & Goal Manager State
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [goalPopoverOpen, setGoalPopoverOpen] = useState(false);
  const { goals } = useGoals();

  const handleLinkGoal = async (targetGoalId: Id<"goals">) => {
    if (!note) return;
    try {
      await updateNote({ noteId: note._id, goalId: targetGoalId });
      setGoalPopoverOpen(false);
      toast.success("Nota vinculada al objetivo");
    } catch {
      toast.error("No se pudo vincular el objetivo");
    }
  };

  const handleUnlinkGoal = async () => {
    if (!note) return;
    try {
      await updateNote({ noteId: note._id, goalId: null });
      toast.success("Objetivo desvinculado");
    } catch {
      toast.error("No se pudo desvincular el objetivo");
    }
  };

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



  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = note.tags?.filter((t) => t !== tagToRemove) || [];
    try {
      await updateNote({ noteId: note._id, tags: updatedTags });
    } catch {
      toast.error("No se pudo eliminar la etiqueta");
    }
  };

  const handleToggleTag = async (slug: TagSlug) => {
    const currentTags = (note.tags || []) as TagSlug[];
    const isSelected = currentTags.includes(slug);
    const updatedTags = isSelected
      ? currentTags.filter((t) => t !== slug)
      : [...currentTags, slug];
    try {
      await updateNote({ noteId: note._id, tags: updatedTags });
    } catch {
      toast.error("No se pudo actualizar la etiqueta");
    }
  };

  const CATEGORY_LABELS: Record<TagCategory, string> = {
    emociones: "Emociones",
    vinculos: "Vínculos",
    crecimiento: "Crecimiento",
  };

  const currentTags = (note.tags || []) as TagSlug[];
  const linkedGoal = goals?.find((g: { _id: Id<"goals">; title: string }) => g._id === note.goalId);

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
          {currentTags.map((slug) => {
            const tagDef = THERAPEUTIC_TAGS.find((t) => t.slug === slug);
            if (!tagDef) return null;
            const Icon = tagDef.icon;
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border/50"
              >
                <Icon className="h-3 w-3 shrink-0" />
                {tagDef.label}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(slug)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold border border-dashed border-border transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Etiqueta</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-64 p-3"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                Etiquetas
              </p>
              <div className="flex flex-col gap-3">
                {(Object.keys(TAGS_BY_CATEGORY) as TagCategory[]).map((category) => (
                  <div key={category}>
                    <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">
                      {CATEGORY_LABELS[category]}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TAGS_BY_CATEGORY[category].map((tagDef) => {
                        const Icon = tagDef.icon;
                        const isSelected = currentTags.includes(tagDef.slug);
                        return (
                          <button
                            key={tagDef.slug}
                            type="button"
                            onClick={() => handleToggleTag(tagDef.slug)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                            }`}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            {tagDef.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Linked Goal Badge or Selector */}
          {linkedGoal ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Target className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[150px]">{linkedGoal.title}</span>
              <button
                type="button"
                onClick={handleUnlinkGoal}
                className="text-primary/70 hover:text-destructive transition-colors shrink-0 cursor-pointer ml-0.5"
                title="Desvincular objetivo"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <Popover open={goalPopoverOpen} onOpenChange={setGoalPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold border border-dashed border-border transition-colors cursor-pointer"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span>Objetivo</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Vincular a un objetivo</p>
                  {goals && goals.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {goals.map((g: any) => (
                        <button
                          key={g._id}
                          type="button"
                          onClick={() => handleLinkGoal(g._id)}
                          className="w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                        >
                          <span className="truncate">{g.title}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{g.category}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground p-2">No tenés objetivos creados aún.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 relative">
        <Suspense
          fallback={
            <div className="flex flex-col flex-1 p-8 gap-3 animate-pulse">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          }
        >
          <NoteEditor
            key={note._id}
            noteId={note._id}
            initialBody={note.body}
            onSave={handleBodySave}
          />
        </Suspense>
      </div>
    </div>
  );
}



