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
import { useSessions } from "@/hooks/useSessions";
import { SessionItem } from "./SessionItem";
import type { Id } from "@/convex/_generated/dataModel";

interface NavSessionsProps {
  onNavigate?: () => void;
}

export function NavSessions({ onNavigate }: NavSessionsProps) {
  const { sessions, renameSession, deleteSession } = useSessions();
  const navigate = useNavigate();
  const params = useParams();
  const currentSessionId = params?.sessionId as string | undefined;
  const { setOpenMobile } = useSidebar();

  const [editingId, setEditingId] = useState<Id<"sessions"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const isSubmittingRenameRef = useRef(false);

  // TODO: connect to future search modal
  const searchQuery = "";

  const handleRename = async (sessionId: Id<"sessions">) => {
    if (!editTitle.trim()) return;
    isSubmittingRenameRef.current = true;
    try {
      await renameSession({ sessionId, title: editTitle });
      setEditingId(null);
      toast.success("Sesión renombrada");
    } catch {
      toast.error("No se pudo renombrar la sesión");
    } finally {
      isSubmittingRenameRef.current = false;
    }
  };

  const handleDelete = async (sessionId: Id<"sessions">) => {
    try {
      await deleteSession({ sessionId });
      if (currentSessionId === sessionId) navigate("/chat");
      toast.success("Sesión eliminada");
    } catch {
      toast.error("No se pudo eliminar la sesión");
    }
  };

  const filteredSessions = useMemo(
    () =>
      sessions?.filter((session) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          session.title.toLowerCase().includes(q) ||
          session.summary?.toLowerCase().includes(q) ||
          session.themes?.some((t) => t.toLowerCase().includes(q))
        );
      }),
    [sessions, searchQuery]
  );

  return (
    <SidebarGroup className="flex-1 overflow-hidden p-0">
      <SidebarGroupContent className="h-full">
        <ScrollArea className="h-full">
          <SidebarMenu className="px-2 pb-2">
            {sessions === undefined ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : filteredSessions?.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                {searchQuery ? "Sin resultados para tu búsqueda" : "Todavía no hay sesiones"}
              </p>
            ) : (
              filteredSessions?.map((session) => (
                <SessionItem
                  key={session._id}
                  session={session}
                  isEditing={editingId === session._id}
                  editTitle={editTitle}
                  isActive={currentSessionId === session._id}
                  onNavigate={() => {
                    navigate(`/chat/${session._id}`);
                    onNavigate?.();
                    setOpenMobile(false);
                  }}
                  onStartEdit={() => {
                    setEditingId(session._id);
                    setEditTitle(session.title);
                  }}
                  onTitleChange={setEditTitle}
                  onRenameSubmit={() => handleRename(session._id)}
                  onRenameBlur={() => {
                    if (!isSubmittingRenameRef.current) handleRename(session._id);
                  }}
                  onRenameCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(session._id)}
                />
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
