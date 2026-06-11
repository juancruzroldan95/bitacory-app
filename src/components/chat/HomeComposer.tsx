import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";
import { useSendMessage } from "@/hooks/useMessages";
import { SessionStartComposer } from "./SessionStartComposer";
import type { Id } from "@/convex/_generated/dataModel";
import type { MentionedNote } from "@/types/notes";

export function HomeComposer() {
  const [mentionedNotes, setMentionedNotes] = useState<MentionedNote[]>([]);
  const { createSession } = useSessions();
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

  const handleMentionAdd = (note: MentionedNote) => {
    setMentionedNotes((prev) =>
      prev.some((n) => n._id === note._id) ? prev : [...prev, note]
    );
  };

  const handleMentionRemove = (noteId: MentionedNote["_id"]) => {
    setMentionedNotes((prev) => prev.filter((n) => n._id !== noteId));
  };

  const handleSubmit = async (content: string, noteIds: Id<"notes">[]) => {
    try {
      const sessionId = await createSession({ title: "Nueva sesión" });
      await sendMessage({ sessionId, content, noteIds: noteIds.length ? noteIds : undefined });
      navigate(`/chat/${sessionId}`);
    } catch {
      toast.error("No se pudo iniciar la sesión");
    }
  };

  return (
    <SessionStartComposer
      onSubmit={handleSubmit}
      mentionedNotes={mentionedNotes}
      onMentionAdd={handleMentionAdd}
      onMentionRemove={handleMentionRemove}
    />
  );
}
