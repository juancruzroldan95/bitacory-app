import { useState } from "react";
import { useSessions } from "./useSessions";
import { useSendMessage } from "./useMessages";
import type { Id } from "@/convex/_generated/dataModel";

export function useGlobalSession() {
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const { createSession } = useSessions();
  const sendMessage = useSendMessage();

  const start = async (content: string, noteIds?: Id<"notes">[]) => {
    const id = await createSession({ title: "Mi espacio" });
    await sendMessage({ sessionId: id, content, noteIds: noteIds?.length ? noteIds : undefined });
    setSessionId(id);
  };

  return { sessionId, start };
}
