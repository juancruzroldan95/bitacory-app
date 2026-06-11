import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
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

function getExcerpt(body: string, length = 150): string {
  if (!body) return "";
  // Strip simple markdown formatting characters
  const plainText = body
    .replace(/[#*`~_]/g, "") // remove bold, italic, code tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // remove markdown links, keep text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // remove markdown images
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
  
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + "...";
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotesPage() {
  const { notes, createNote, updateNote, removeNote } = useNotes();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [limit, setLimit] = useState(5);

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

      <div className="px-6 py-12 max-w-[720px] mx-auto w-full space-y-12">
        {/* Page Header Section */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground mb-2">Tu viaje</h2>
            <p className="text-sm text-muted-foreground">
              Reflexioná, escribí y crecé a través de tus pensamientos.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-5 rounded-full font-medium text-sm hover:opacity-90 transition-all duration-300 active:scale-95 shadow-sm sm:self-auto self-start"
          >
            <Plus className="h-4 w-4" />
            Nueva nota
          </Button>
        </section>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 text-muted-foreground border-b border-border pb-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground/60" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none w-full text-base placeholder:text-muted-foreground/40"
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
        {notes === undefined ? (
          <div className="space-y-6">
            <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />
            <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="space-y-8">
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

            {/* Always show the image banner as a pleasant default when list is empty */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm">
              <img
                className="w-full h-full object-cover grayscale-[20%] brightness-105"
                alt="Interior minimalista sereno"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVsoS3Ifr-FOPPe6jhyp3FNS9uFFnB2uUk3pPHS6z2vtlz0BboRm5n6AB6ovzowa_Bn_Q6XaHZ6BaBEFYHQd5KJw2d1QQljTtSXhdXVrqyBtafb8k59eqEwJIrgVfwTqi_sPY5DzMfsNmI5HMFejXo93YZtN43_MzpDBXuXblqwK5D20wonwip-tDrDEbyg8tEvh8pxcO5y80iM3apyOvlZ_NH-FBPgue1qS6kDNGnmwNG7tq3C_0jd0s1tm4PAdsRzqUosk7Uag"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-serif text-2xl text-white italic font-light tracking-wide">
                  Capture the quiet moments.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredNotes.slice(0, limit).map((note, index) => {
              const showSeparator = index > 0;
              const isSecondCard = index === 1;

              return (
                <div key={note._id} className="space-y-8">
                  {showSeparator && (
                    <div className="flex justify-center py-4">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1"></div>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1"></div>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1"></div>
                    </div>
                  )}

                  <article
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="bg-card hover:bg-muted/10 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer border border-border/50 hover:border-border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold tracking-wider text-primary mb-1">
                          {formatDate(note.updatedAt)}
                        </span>
                        <h3 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {note.title}
                        </h3>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => handleRenameOpen(note._id, note.title)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" />
                            Renombrar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setNoteToDelete({ id: note._id, title: note.title })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="font-serif text-base text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {getExcerpt(note.body) || "Escribí tu nota de hoy..."}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                            }}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>

                  {/* Serene image interstitial after second note */}
                  {isSecondCard && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm my-12 group/img">
                      <img
                        className="w-full h-full object-cover grayscale-[20%] brightness-105 transition-transform duration-700 group-hover/img:scale-105"
                        alt="Interior minimalista sereno"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVsoS3Ifr-FOPPe6jhyp3FNS9uFFnB2uUk3pPHS6z2vtlz0BboRm5n6AB6ovzowa_Bn_Q6XaHZ6BaBEFYHQd5KJw2d1QQljTtSXhdXVrqyBtafb8k59eqEwJIrgVfwTqi_sPY5DzMfsNmI5HMFejXo93YZtN43_MzpDBXuXblqwK5D20wonwip-tDrDEbyg8tEvh8pxcO5y80iM3apyOvlZ_NH-FBPgue1qS6kDNGnmwNG7tq3C_0jd0s1tm4PAdsRzqUosk7Uag"
                      />
                      <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="font-serif text-2xl text-white italic font-light tracking-wide">
                          Capture the quiet moments.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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
                  <span className="text-[16px]">↓</span>
                </Button>
              </footer>
            )}
          </div>
        )}
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
