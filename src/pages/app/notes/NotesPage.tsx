import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Filter,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
import { NoteCard } from "@/components/notes/NoteCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Id } from "@/convex/_generated/dataModel";

export const NotesPage = () => {
  const { notes, createNote, updateNote, removeNote } = useNotes();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [limit, setLimit] = useState(5);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Record<string, boolean>>({});

  // Actions State
  const [noteToRename, setNoteToRename] = useState<{ id: Id<"notes">; title: string } | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<{ id: Id<"notes">; title: string } | null>(null);

  const handleCreate = async () => {
    try {
      const noteId = await createNote({ title: "Nueva reflexión", body: "" });
      navigate(`/notes/${noteId}`);
    } catch {
      toast.error("No se pudo crear la nota");
    }
  };

  const handleRenameOpen = (id: Id<"notes">, title: string) => {
    setNoteToRename({ id, title });
    setRenameTitle(title);
  };

  const handleRenameSubmit = async () => {
    if (!noteToRename) return;
    if (!renameTitle.trim()) {
      toast.error("El título no puede estar vacío");
      return;
    }
    try {
      await updateNote({ noteId: noteToRename.id, title: renameTitle.trim() });
      setNoteToRename(null);
      toast.success("Nota renombrada");
    } catch {
      toast.error("No se pudo renombrar la nota");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!noteToDelete) return;
    try {
      await removeNote({ noteId: noteToDelete.id });
      setNoteToDelete(null);
      toast.success("Nota eliminada");
    } catch {
      toast.error("No se pudo eliminar la nota");
    }
  };

  const toggleBookmark = (noteId: Id<"notes">, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedNotes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
    toast.success(
      bookmarkedNotes[noteId]
        ? "Eliminado de marcadores"
        : "Guardado en marcadores"
    );
  };

  // Compile all unique tags for the tag filter dropdown
  const allTags = useMemo(() => {
    if (!notes) return [];
    const tagsSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        if (tag.trim()) {
          tagsSet.add(tag.trim().toLowerCase());
        }
      });
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filter notes on the client-side
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter((note) => {
      // 1. Tag filter
      if (selectedTag && (!note.tags || !note.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()))) {
        return false;
      }
      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const bodyMatch = note.body.toLowerCase().includes(q);
        const tagsMatch = note.tags?.some(t => t.toLowerCase().includes(q)) ?? false;
        return titleMatch || bodyMatch || tagsMatch;
      }
      return true;
    });
  }, [notes, searchQuery, selectedTag]);

  return (
    <div className="flex-1 overflow-y-auto w-full relative">
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden absolute top-3 left-3 z-40">
        <SidebarTrigger className="bg-background/80 backdrop-blur-sm" />
      </div>

      <div className="px-6 py-12 max-w-[720px] mx-auto w-full space-y-10">
        {/* Page Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="font-serif text-4xl font-medium tracking-tight text-foreground">Tus Notas</h2>
            <p className="text-base text-muted-foreground/80 max-w-md leading-relaxed">
              Tu espacio para escribir libremente lo que quieras. Vas a poder usar tus notas para interactuar con la IA y descubrir insights en tu vida diaria.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-5 rounded-full font-medium text-sm hover:opacity-90 transition-all duration-300 active:scale-95 shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nueva nota
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 text-muted-foreground border-b border-border pb-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground/60" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none w-full text-base placeholder:text-muted-foreground/45 dark:placeholder:text-muted-foreground/35"
            placeholder="Buscar en tus reflexiones..."
            type="text"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors text-xs font-semibold ${selectedTag ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
                <Filter className="h-3 w-3" />
                <span>{selectedTag ? `#${selectedTag}` : "Filtrar"}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => setSelectedTag(null)}>
                Todos
              </DropdownMenuItem>
              {allTags.map((tag) => (
                <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                  #{tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          {notes === undefined ? (
            <div className="space-y-6">
              <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />
              <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <article
              onClick={handleCreate}
              className="bg-muted/10 hover:bg-muted/20 rounded-xl p-8 border border-dashed border-border/80 group cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center py-12"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                ¿Buscás reflexiones más profundas?
              </h4>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery || selectedTag
                  ? "No se encontraron reflexiones con los filtros aplicados. Empezá a escribir una nueva."
                  : "Continuá tu viaje escribiendo una nueva reflexión sobre tu semana."}
              </p>
            </article>
          ) : (
            <div className="space-y-6">
              {filteredNotes.slice(0, limit).map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isBookmarked={!!bookmarkedNotes[note._id]}
                  onToggleBookmark={toggleBookmark}
                  onRename={handleRenameOpen}
                  onDelete={(id, title) => setNoteToDelete({ id, title })}
                  onClick={() => navigate(`/notes/${note._id}`)}
                  onTagClick={setSelectedTag}
                />
              ))}

              {/* Suggestions/New Note Prompts bottom card when notes exist */}
              {filteredNotes.length > 0 && (
                <article
                  onClick={handleCreate}
                  className="bg-muted/5 hover:bg-muted/10 rounded-xl p-8 border border-dashed border-border group cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center py-8"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5 text-primary/80" />
                  </div>
                  <h4 className="font-serif text-base font-medium text-foreground mb-1">
                    ¿Buscás reflexiones más profundas?
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Continuá tu viaje escribiendo una nueva reflexión sobre tu semana.
                  </p>
                </article>
              )}

              {/* Pagination footer */}
              {filteredNotes.length > limit && (
                <footer className="mt-12 flex flex-col items-center py-4">
                  <Button
                    variant="ghost"
                    onClick={() => setLimit((l) => l + 5)}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    Mostrar reflexiones anteriores
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </footer>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={noteToRename !== null} onOpenChange={(open) => !open && setNoteToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar reflexión</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Título de la nota"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteToRename(null)}>Cancelar</Button>
            <Button onClick={handleRenameSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reflexión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente &ldquo;{noteToDelete?.title}&rdquo;. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



