import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/useNotes";
import type { Id } from "@/convex/_generated/dataModel";

function getDateGroup(updatedAt: number): string {
  const now = Date.now();
  const diff = now - updatedAt;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Hoy";
  if (diff < 7 * day) return "Esta semana";
  return "Antes";
}

export function NavNotes() {
  const { notes, updateNote, removeNote } = useNotes();
  const navigate = useNavigate();
  const params = useParams();
  const currentNoteId = params?.noteId as string | undefined;
  const { setOpenMobile } = useSidebar();

  const [editingId, setEditingId] = useState<Id<"notes"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const isSubmittingRenameRef = useRef(false);

  const handleRename = async (noteId: Id<"notes">) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    isSubmittingRenameRef.current = true;
    try {
      await updateNote({ noteId, title: editTitle });
      setEditingId(null);
    } catch {
      toast.error("No se pudo renombrar la nota");
    } finally {
      isSubmittingRenameRef.current = false;
    }
  };

  const handleDelete = async (noteId: Id<"notes">, title: string) => {
    try {
      await removeNote({ noteId });
      if (currentNoteId === noteId) navigate("/notes");
      toast.success(`"${title}" eliminada`);
    } catch {
      toast.error("No se pudo eliminar la nota");
    }
  };

  const grouped = useMemo(() => {
    if (!notes) return null;
    const groups: Record<string, typeof notes> = {};
    for (const note of notes) {
      const g = getDateGroup(note.updatedAt);
      if (!groups[g]) groups[g] = [];
      groups[g].push(note);
    }
    return groups;
  }, [notes]);

  return (
    <SidebarGroup className="p-0">
      <div className="flex items-center px-4 py-2">
        <SidebarGroupLabel className="p-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notas
        </SidebarGroupLabel>
      </div>

      <SidebarGroupContent>
        <div className="overflow-y-auto max-h-[30vh] scrollbar-minimal">
          <SidebarMenu className="px-2 pb-2">
            {notes === undefined ? (
              <div className="space-y-1 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : notes.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                Todavía no hay notas
              </p>
            ) : (
              grouped &&
              ["Hoy", "Esta semana", "Antes"].map((group) => {
                const items = grouped[group];
                if (!items?.length) return null;
                return (
                  <div key={group}>
                    <p className="px-2 pt-3 pb-1 text-xs text-muted-foreground/60 font-medium">
                      {group}
                    </p>
                    {items.map((note) => (
                      <SidebarMenuItem key={note._id} className="relative group/item mb-0.5">
                        {editingId === note._id ? (
                          <div className="p-1.5 w-full">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleRename(note._id); }
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              onBlur={() => {
                                if (!isSubmittingRenameRef.current) handleRename(note._id);
                              }}
                              autoFocus
                              className="h-8"
                            />
                          </div>
                        ) : (
                          <SidebarMenuButton
                            isActive={currentNoteId === note._id}
                            onClick={() => {
                              navigate(`/notes/${note._id}`);
                              setOpenMobile(false);
                            }}
                            className="h-8 w-full"
                          >
                            <NotebookPen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="line-clamp-1 text-sm">{note.title}</span>
                          </SidebarMenuButton>
                        )}

                        {editingId !== note._id && (
                          <div className="absolute right-1 top-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-6 w-6"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(note._id);
                                    setEditTitle(note.title);
                                  }}
                                >
                                  <Pencil className="mr-2 h-3.5 w-3.5" />
                                  Renombrar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar nota?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esto eliminará permanentemente &ldquo;{note.title}&rdquo;. Esta acción no se puede deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(note._id, note.title)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </div>
                );
              })
            )}
          </SidebarMenu>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
