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
import {
  Trash2,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavSessionsProps {
  onNavigate?: () => void;
}

export function NavSessions({ onNavigate }: NavSessionsProps) {
  const threads = useQuery(api.functions.threads.list);
  const renameThread = useMutation(api.functions.threads.rename);
  const deleteThread = useMutation(api.functions.threads.remove);
  const navigate = useNavigate();
  const params = useParams();
  const currentThreadId = params?.threadId as string | undefined;
  
  const { setOpenMobile } = useSidebar();

  const [editingId, setEditingId] = useState<Id<"threads"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  // TODO: Search state to be connected with the future search modal
  const searchQuery = "";

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
    <SidebarGroup className="flex-1 overflow-hidden p-0">
      <SidebarGroupContent className="h-full">
        <ScrollArea className="h-full">
          <SidebarMenu className="px-2 pb-2">
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
                <SidebarMenuItem key={thread._id} className="relative group/item mb-0.5">
                  {editingId === thread._id ? (
                    <div className="p-1.5 w-full">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(thread._id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => handleRename(thread._id)}
                        autoFocus
                        className="h-8"
                      />
                    </div>
                  ) : (
                    <SidebarMenuButton
                      isActive={currentThreadId === thread._id}
                      onClick={() => {
                        navigate(`/chat/${thread._id}`);
                        onNavigate?.();
                        setOpenMobile(false);
                      }}
                      className="h-auto py-2 flex-col items-start gap-1 w-full"
                    >
                      <div className="flex items-center gap-2 w-full pr-6">
                        <span className="flex-1 truncate text-sm">
                          {thread.title}
                        </span>
                      </div>
                      {thread.themes && thread.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 md:pl-6 pl-6">
                          {thread.themes.slice(0, 3).map((theme) => (
                            <Badge
                              key={theme}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 font-normal"
                            >
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </SidebarMenuButton>
                  )}

                  {editingId !== thread._id && (
                    <div className="absolute right-1 top-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
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
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
