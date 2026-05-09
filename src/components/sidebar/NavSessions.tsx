import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { useThreadList } from "@/hooks/useThreadList";
import { SessionItem } from "./SessionItem";
import type { Id } from "@/convex/_generated/dataModel";

interface NavSessionsProps {
  onNavigate?: () => void;
}

export function NavSessions({ onNavigate }: NavSessionsProps) {
  const { threads, renameThread, deleteThread } = useThreadList();
  const navigate = useNavigate();
  const params = useParams();
  const currentThreadId = params?.threadId as string | undefined;
  const { setOpenMobile } = useSidebar();

  const [editingId, setEditingId] = useState<Id<"threads"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const isSubmittingRenameRef = useRef(false);

  // TODO: connect to future search modal
  const searchQuery = "";

  const handleRename = async (threadId: Id<"threads">) => {
    if (!editTitle.trim()) return;
    isSubmittingRenameRef.current = true;
    try {
      await renameThread({ threadId, title: editTitle });
      setEditingId(null);
      toast.success("Sesión renombrada");
    } catch {
      toast.error("No se pudo renombrar la sesión");
    } finally {
      isSubmittingRenameRef.current = false;
    }
  };

  const handleDelete = async (threadId: Id<"threads">) => {
    try {
      await deleteThread({ threadId });
      if (currentThreadId === threadId) navigate("/chat");
      toast.success("Sesión eliminada");
    } catch {
      toast.error("No se pudo eliminar la sesión");
    }
  };

  const filteredThreads = useMemo(
    () =>
      threads?.filter((thread) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          thread.title.toLowerCase().includes(q) ||
          thread.summary?.toLowerCase().includes(q) ||
          thread.themes?.some((t) => t.toLowerCase().includes(q))
        );
      }),
    [threads, searchQuery]
  );

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
                {searchQuery ? "Sin resultados para tu búsqueda" : "Todavía no hay sesiones"}
              </p>
            ) : (
              filteredThreads?.map((thread) => (
                <SessionItem
                  key={thread._id}
                  thread={thread}
                  isEditing={editingId === thread._id}
                  editTitle={editTitle}
                  isActive={currentThreadId === thread._id}
                  onNavigate={() => {
                    navigate(`/chat/${thread._id}`);
                    onNavigate?.();
                    setOpenMobile(false);
                  }}
                  onStartEdit={() => {
                    setEditingId(thread._id);
                    setEditTitle(thread.title);
                  }}
                  onTitleChange={setEditTitle}
                  onRenameSubmit={() => handleRename(thread._id)}
                  onRenameBlur={() => {
                    if (!isSubmittingRenameRef.current) handleRename(thread._id);
                  }}
                  onRenameCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(thread._id)}
                />
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
