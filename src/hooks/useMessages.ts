import { useMutation } from "convex/react";
import { useUIMessages, type UIMessage } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useMessages(sessionId: Id<"sessions">) {
  // Cast needed until `npx convex dev` regenerates api.d.ts with the new sessionId arg
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results: rawResults, status } = useUIMessages(
    api.functions.messages.list as any,
    { sessionId },
    { initialNumItems: 100, stream: true }
  );
  const results = rawResults as UIMessage[] | undefined;

  const isLoading = status === "LoadingFirstPage";
  const messages = results ?? [];
  const visibleMessages = messages.filter((m) => {
    if (m.status === "failed") return false;
    return (m.text ?? "").trim() !== "" || m.status === "streaming";
  });

  let isAgentStreaming = false;
  let lastRole: string | undefined;
  let hasPendingAssistant = false;

  for (const m of visibleMessages) {
    lastRole = m.role;
    if (m.role === "assistant") {
      if (m.status === "streaming") isAgentStreaming = true;
      if (m.status === "pending" || m.status === "streaming") hasPendingAssistant = true;
    }
  }

  const lastMessageIsUser = lastRole === "user";
  const showTypingIndicator = (hasPendingAssistant || lastMessageIsUser) && !isAgentStreaming;

  return { visibleMessages, isLoading, isAgentStreaming, showTypingIndicator };
}

export function useSendMessage() {
  return useMutation(api.functions.messages.send);
}
