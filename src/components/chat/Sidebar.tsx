import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavUser } from "@/components/chat/NavUser";
import {
  Plus,
  BookOpen,
  Trash2,
  Pencil,
  Search,
  MoreHorizontal,
  X,
} from "lucide-react";

interface SidebarProps {
  onNavigate: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const threads = useQuery(api.functions.threads.list);
  const createThread = useMutation(api.functions.threads.create);
  const renameThread = useMutation(api.functions.threads.rename);
  const deleteThread = useMutation(api.functions.threads.remove);
  const navigate = useNavigate();
  const params = useParams();
  const currentThreadId = params?.threadId as string | undefined;

  const [editingId, setEditingId] = useState<Id<"threads"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewSession = async () => {
    try {
      const threadId = await createThread({ title: "Nueva sesión" });
      navigate(`/chat/${threadId}`);
      onNavigate();
      toast.success("Nueva sesión creada");
    } catch {
      toast.error("No se pudo crear la sesión");
    }
  };

  const handleRename = async (threadId: Id<"threads">) => {
    if (!editTitle.trim()) return;
    try {
      await renameThread({ threadId, title: editTitle });
      setEditingId(null);
      toast.success("Sesión renombrada");
    } catch {
      toast.error("No se pudo renombrar la sesión");
    }
  };

  const handleDelete = async (threadId: Id<"threads">) => {
    try {
      await deleteThread({ threadId });
      if (currentThreadId === threadId) {
        navigate("/chat");
      }
      toast.success("Sesión eliminada");
    } catch {
      toast.error("No se pudo eliminar la sesión");
    }
  };

  const startEdit = (thread: { _id: Id<"threads">; title: string }) => {
    setEditingId(thread._id);
    setEditTitle(thread.title);
  };

  const filteredThreads = threads?.filter((thread) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      thread.title.toLowerCase().includes(q) ||
      thread.summary?.toLowerCase().includes(q) ||
      thread.themes?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <div className="flex items-center gap-2 px-1 py-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Bitacory</span>
        </div>
        <Button
          onClick={handleNewSession}
          className="w-full gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Nueva sesión
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar sesiones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {threads === undefined ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : filteredThreads?.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {searchQuery
                ? "Sin resultados para tu búsqueda"
                : "Todavía no hay sesiones"}
            </p>
          ) : (
            filteredThreads?.map((thread) => (
              <div
                key={thread._id}
                className={`group relative mb-0.5 rounded-lg transition-colors ${
                  currentThreadId === thread._id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                }`}
              >
                {editingId === thread._id ? (
                  <div className="p-1.5">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(thread._id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => handleRename(thread._id)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate(`/chat/${thread._id}`);
                      onNavigate();
                    }}
                    className="flex w-full flex-col px-2.5 py-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm">
                        {thread.title}
                      </span>
                    </div>
                    {thread.themes && thread.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pl-5">
                        {thread.themes.slice(0, 3).map((theme) => (
                          <Badge
                            key={theme}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                )}

                {editingId !== thread._id && (
                  <div className="absolute right-1.5 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(thread);
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
                              <AlertDialogTitle>
                                ¿Eliminar sesión?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esto eliminará permanentemente &ldquo;
                                {thread.title}&rdquo; y todos sus mensajes.
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(thread._id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <NavUser />
      </div>
    </div>
  );
}
