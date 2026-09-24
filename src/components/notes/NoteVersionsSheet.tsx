import { useState } from "react";
import { toast } from "sonner";
import {
  History,
  Sparkles,
  Bookmark,
  RotateCcw,
  Plus,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNoteVersions } from "@/hooks/useNoteVersions";
import type { Id } from "@/convex/_generated/dataModel";

function formatShortDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLongDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface NoteVersionsSheetProps {
  noteId: Id<"notes">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteVersionsSheet({
  noteId,
  open,
  onOpenChange,
}: NoteVersionsSheetProps) {
  const { versions, createCheckpoint, restoreVersion } = useNoteVersions(noteId);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [checkpointSummary, setCheckpointSummary] = useState("");
  const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showAddCheckpoint, setShowAddCheckpoint] = useState(false);

  const selectedVersion = (versions as any[])?.find((v: any) => v._id === selectedVersionId) || (versions as any[])?.[0];

  const handleCreateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCheckpoint(true);
    try {
      await createCheckpoint({
        noteId,
        summary: checkpointSummary.trim() || undefined,
      });
      setCheckpointSummary("");
      setShowAddCheckpoint(false);
      toast.success("Punto de control guardado");
    } catch {
      toast.error("No se pudo guardar el punto de control");
    } finally {
      setIsCreatingCheckpoint(false);
    }
  };

  const handleRestore = async (versionId: Id<"noteVersions">) => {
    setIsRestoring(true);
    try {
      await restoreVersion({ noteId, versionId });
      toast.success("Versión restaurada correctamente");
      onOpenChange(false);
    } catch {
      toast.error("No se pudo restaurar la versión");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col h-full p-0 gap-0 border-l border-border bg-background"
      >
        <SheetHeader className="p-6 border-b border-border text-left">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <SheetTitle className="font-sans text-lg font-semibold text-foreground">
              Historial de versiones
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Revisá los cambios anteriores, resguardá tus avances con puntos de control o volvé a una versión previa.
          </SheetDescription>

          <div className="mt-4 pt-3 border-t border-border/60">
            {showAddCheckpoint ? (
              <form onSubmit={handleCreateCheckpoint} className="flex flex-col gap-2">
                <Input
                  value={checkpointSummary}
                  onChange={(e) => setCheckpointSummary(e.target.value)}
                  placeholder="Etiqueta opcional (ej: 'Antes de agregar ideas')"
                  className="text-xs h-8"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowAddCheckpoint(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isCreatingCheckpoint}
                  >
                    {isCreatingCheckpoint ? "Guardando..." : "Guardar hito"}
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setShowAddCheckpoint(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Crear punto de control manual</span>
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Versions list */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-border overflow-y-auto p-3 space-y-2">
            {!versions ? (
              <p className="text-xs text-muted-foreground p-3">Cargando historial...</p>
            ) : versions.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-muted-foreground">
                  No hay versiones previas
                </p>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                  Las versiones se generan automáticamente cuando la IA edita tu nota o cuando guardás un hito manual.
                </p>
              </div>
            ) : (
              (versions as any[]).map((ver: any) => {
                const isSelected = selectedVersion?._id === ver._id;
                const dateStr = formatShortDate(ver.createdAt);

                return (
                  <button
                    key={ver._id}
                    type="button"
                    onClick={() => setSelectedVersionId(ver._id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-secondary/70 border-primary/40 shadow-xs"
                        : "bg-card border-border/60 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground">
                        {dateStr}
                      </span>
                      {ver.author === "ai" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          <Sparkles className="h-2.5 w-2.5" />
                          IA
                        </span>
                      ) : ver.actionType === "manual_checkpoint" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          <Bookmark className="h-2.5 w-2.5" />
                          Hito
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          <RotateCcw className="h-2.5 w-2.5" />
                          Rollback
                        </span>
                      )}
                    </div>
                    {ver.summary && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                        {ver.summary}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Version preview & restore action */}
          <div className="w-full md:w-7/12 flex flex-col flex-1 min-h-0 bg-muted/20">
            {selectedVersion ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-border flex items-center justify-between gap-2 bg-card/40">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Vista previa
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatLongDate(selectedVersion.createdAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleRestore(selectedVersion._id)}
                    disabled={isRestoring}
                    className="h-8 text-xs gap-1.5 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{isRestoring ? "Restaurando..." : "Restaurar versión"}</span>
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 font-serif text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {selectedVersion.body || (
                    <span className="italic text-muted-foreground text-xs">
                      (Esta versión estaba vacía)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Seleccioná una versión para ver su contenido.
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
