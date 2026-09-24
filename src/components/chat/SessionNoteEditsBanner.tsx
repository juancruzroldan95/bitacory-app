import { useState } from "react";
import { Link } from "react-router";
import { Sparkles, RotateCcw, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionNoteVersions } from "@/hooks/useNoteVersions";
import type { Id } from "@/convex/_generated/dataModel";

interface SessionNoteEditsBannerProps {
  sessionId: Id<"sessions">;
}

export function SessionNoteEditsBanner({ sessionId }: SessionNoteEditsBannerProps) {
  const { sessionVersions, restoreVersion } = useSessionNoteVersions(sessionId);
  const [dismissedVersionIds, setDismissedVersionIds] = useState<Set<string>>(new Set());
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  const activeVersions = (sessionVersions || []).filter(
    (v: any) => v.actionType === "ai_edit" && !dismissedVersionIds.has(v._id)
  );

  if (activeVersions.length === 0) {
    return null;
  }

  const latestEdit = activeVersions[0];

  const handleDismiss = (versionId: string) => {
    setDismissedVersionIds((prev) => new Set(prev).add(versionId));
  };

  const handleUndo = async (noteId: Id<"notes">, versionId: Id<"noteVersions">) => {
    setIsRestoringId(versionId);
    try {
      await restoreVersion({ noteId, versionId });
      toast.success("Edición deshecha. La nota volvió a su versión previa.");
      handleDismiss(versionId);
    } catch {
      toast.error("No se pudo deshacer la edición");
    } finally {
      setIsRestoringId(null);
    }
  };

  return (
    <div className="mx-4 mb-2 p-3 rounded-xl bg-card border border-primary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            Bitacory actualizó la nota:{" "}
            <Link
              to={`/app/notes/${latestEdit.noteId}`}
              className="text-primary hover:underline font-serif inline-flex items-center gap-1"
            >
              &ldquo;{latestEdit.title}&rdquo;
              <ExternalLink className="h-3 w-3 inline" />
            </Link>
          </p>
          {latestEdit.summary && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {latestEdit.summary}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUndo(latestEdit.noteId, latestEdit._id)}
          disabled={isRestoringId === latestEdit._id}
          className="h-7 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:border-destructive/40"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{isRestoringId === latestEdit._id ? "Deshaciendo..." : "Deshacer"}</span>
        </Button>

        <button
          type="button"
          onClick={() => handleDismiss(latestEdit._id)}
          className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          title="Ocultar aviso"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
