import type { Id } from "@/convex/_generated/dataModel";
import { useMessages } from "@/hooks/useMessages";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  threadId: Id<"threads">;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ threadId, messagesEndRef }: MessageListProps) {
  const { visibleMessages, isLoading, showTypingIndicator } = useMessages(threadId);

  if (isLoading) {
    return null;
  }

  if (visibleMessages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3 max-w-sm px-4">
          <p className="text-muted-foreground">
            Este es tu espacio personal. Contá lo que quieras procesar hoy.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Podés compartir lo que hablaste con tu psicólogo/a, cómo te sentís, o cualquier pensamiento que quieras explorar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {visibleMessages.map((message) => {
        const content = message.text ?? "";

        if (message.role === "user") {
          return (
            <UserMessage
              key={message.key}
              content={content}
              isPending={message.status === "pending"}
            />
          );
        }

        if (message.role === "assistant") {
          return (
            <div
              key={message.key}
              className="w-full text-sm text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <AssistantMessage content={content} isStreaming={message.status === "streaming"} />
            </div>
          );
        }

        return null;
      })}

      {showTypingIndicator && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
