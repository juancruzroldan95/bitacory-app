import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/hooks/useSessions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HomeComposer } from "@/components/chat/HomeComposer";
import { SessionCard } from "@/components/chat/SessionCard";
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
import type { Id } from "@/convex/_generated/dataModel";

export default function SessionsPage() {
  const { sessions, renameSession, deleteSession } = useSessions();
  const navigate = useNavigate();

  const [limit, setLimit] = useState(3);
  const [bookmarkedSessions, setBookmarkedSessions] = useState<Record<string, boolean>>({});
  const [sessionToRename, setSessionToRename] = useState<{ id: Id<"sessions">; title: string } | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<{ id: Id<"sessions">; title: string } | null>(null);

  const handleRenameOpen = (id: Id<"sessions">, title: string) => {
    setSessionToRename({ id, title });
    setRenameTitle(title);
  };

  const handleRenameSubmit = async () => {
    if (!sessionToRename) return;
    if (!renameTitle.trim()) {
      toast.error("El título no puede estar vacío");
      return;
    }
    try {
      await renameSession({ sessionId: sessionToRename.id, title: renameTitle.trim() });
      setSessionToRename(null);
      toast.success("Sesión renombrada");
    } catch {
      toast.error("No se pudo renombrar la sesión");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!sessionToDelete) return;
    try {
      await deleteSession({ sessionId: sessionToDelete.id });
      setSessionToDelete(null);
      toast.success("Sesión eliminada");
    } catch {
      toast.error("No se pudo eliminar la sesión");
    }
  };

  const toggleBookmark = (sessionId: Id<"sessions">, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
    toast.success(
      bookmarkedSessions[sessionId]
        ? "Eliminado de marcadores"
        : "Guardado en marcadores"
    );
  };

  return (
    <div className="flex-1 overflow-y-auto w-full relative">
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden absolute top-3 left-3 z-40">
        <SidebarTrigger className="bg-background/80 backdrop-blur-sm" />
      </div>

      <div className="px-6 py-12 max-w-[720px] mx-auto w-full space-y-10">
        {/* Page Header Section */}
        <div className="space-y-2">
          <h2 className="font-serif text-4xl font-medium tracking-tight text-foreground">Tus Sesiones</h2>
          <p className="text-base text-muted-foreground/80 max-w-md leading-relaxed">
            Un espacio de calma para conversar con tus pensamientos y descubrir patrones en tu vida diaria.
          </p>
        </div>

        {/* Prompt Box */}
        <HomeComposer />

        {/* Divider: Recent Dialogues */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-border/40"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase">
            Chats recientes
          </span>
          <div className="flex-grow border-t border-border/40"></div>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {sessions === undefined ? (
            <div className="space-y-6">
              <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />
              <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-muted/10 rounded-xl p-8 border border-dashed border-border/80 text-center py-12">
              <p className="text-sm text-muted-foreground">
                No tenés sesiones guardadas. Comenzá a escribir arriba para iniciar una conversación.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.slice(0, limit).map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isBookmarked={!!bookmarkedSessions[session._id]}
                  onToggleBookmark={toggleBookmark}
                  onRename={handleRenameOpen}
                  onDelete={(id, title) => setSessionToDelete({ id, title })}
                  onClick={() => navigate(`/chat/${session._id}`)}
                />
              ))}

              {/* View Archived Sessions Chevron footer */}
              {sessions.length > limit && (
                <footer className="mt-8 flex justify-center py-2">
                  <Button
                    variant="ghost"
                    onClick={() => setLimit((l) => l + 5)}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    Ver sesiones archivadas
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </footer>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={sessionToRename !== null} onOpenChange={(open) => !open && setSessionToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar sesión</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Título de la sesión"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionToRename(null)}>Cancelar</Button>
            <Button onClick={handleRenameSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={sessionToDelete !== null} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente la sesión &ldquo;{sessionToDelete?.title}&rdquo; y todo su historial de mensajes. Esta acción no se puede deshacer.
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
