import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSessions } from "@/hooks/useSessions";
import { SessionItem } from "./SessionItem";
import type { Id } from "@/convex/_generated/dataModel";

function getDateGroup(creationTime: number): string {
  const now = Date.now();
  const diff = now - creationTime;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Hoy";
  if (diff < 7 * day) return "Esta semana";
  return "Antes";
}

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

  const grouped = useMemo(() => {
    if (!sessions) return null;
    const groups: Record<string, typeof sessions> = {};
    for (const session of sessions) {
      const g = getDateGroup(session._creationTime);
      if (!groups[g]) groups[g] = [];
      groups[g].push(session);
    }
    return groups;
  }, [sessions]);

  return (
    <SidebarGroup className="p-0">
      <div className="px-4 py-2">
        <SidebarGroupLabel className="p-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sesiones
        </SidebarGroupLabel>
      </div>
      <SidebarGroupContent>
        <div className="overflow-y-auto max-h-[30vh] scrollbar-minimal">
          <SidebarMenu className="px-2 pb-2">
            {sessions === undefined ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                Todavía no hay sesiones
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
                    {items.map((session) => (
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
