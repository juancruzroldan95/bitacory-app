import { BookHeart } from "lucide-react";
import { toast } from "sonner";
import { ChatView } from "@/components/chat/ChatView";
import { SessionStartComposer } from "@/components/chat/SessionStartComposer";
import { useGlobalSession } from "@/hooks/useGlobalSession";
import type { Id } from "@/convex/_generated/dataModel";
import type { MentionedNote } from "@/types/notes";

interface GlobalChatPanelProps {
  mentionedNotes: MentionedNote[];
  onMentionAdd: (note: MentionedNote) => void;
  onMentionRemove: (noteId: MentionedNote["_id"]) => void;
}

export function GlobalChatPanel({
  mentionedNotes,
  onMentionAdd,
  onMentionRemove,
}: GlobalChatPanelProps) {
  const { sessionId, start } = useGlobalSession();

  if (sessionId) {
    return (
      <ChatView
        sessionId={sessionId}
        mentionedNotes={mentionedNotes}
        onMentionAdd={onMentionAdd}
        onMentionRemove={onMentionRemove}
      />
    );
  }

  const handleSubmit = async (content: string, noteIds: Id<"notes">[]) => {
    try {
      await start(content, noteIds);
    } catch {
      toast.error("No se pudo iniciar la sesión");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <BookHeart className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold tracking-tight">Tu compañero de escritura</h3>
        <p className="text-sm text-muted-foreground">
          Contame qué estás pensando o sintiendo mientras escribís tu nota.
        </p>
      </div>
      <SessionStartComposer
        onSubmit={handleSubmit}
        placeholder="¿Qué querés explorar hoy?"
        mentionedNotes={mentionedNotes}
        onMentionAdd={onMentionAdd}
        onMentionRemove={onMentionRemove}
      />
    </div>
  );
}
