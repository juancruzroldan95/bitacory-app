import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUIMessages, useSmoothText } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface MessageListProps {
  threadId: Id<"threads">;
  agentThreadId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function TypingIndicator() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-2 animate-in fade-in duration-300">
      <div className="flex gap-1 items-center h-6">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const [smoothContent] = useSmoothText(content, {
    charsPerSec: isStreaming ? 180 : undefined,
    startStreaming: isStreaming,
  });

  const displayContent = isStreaming ? smoothContent : content;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-3 prose-headings:mt-5 prose-headings:mb-2 prose-headings:font-semibold prose-strong:text-foreground prose-strong:font-semibold prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic prose-code:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match && !codeString.includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="group/code relative">
                <CopyButton text={codeString} />
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || "text"}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.8rem" }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}

export function MessageList({ threadId, messagesEndRef }: MessageListProps) {
  const { results, status } = useUIMessages(
    api.functions.messages.list,
    { threadId },
    { initialNumItems: 100, stream: true }
  );

  const isLoading = status === "LoadingFirstPage";
  const messages = results ?? [];
  const visibleMessages = messages.filter(
    (m) => {
      if (m.status === "failed") return false;
      return (m.text ?? "").trim() !== "" || m.status === "streaming";
    }
  );

  const isAgentStreaming = visibleMessages.some((m) => m.status === "streaming" && m.role === "assistant");
  const lastMessageIsUser = visibleMessages.length > 0 && visibleMessages[visibleMessages.length - 1].role === "user";
  const hasPendingAssistant = visibleMessages.some(
    (m) => m.role === "assistant" && (m.status === "pending" || m.status === "streaming")
  );
  const showTypingIndicator = (hasPendingAssistant || lastMessageIsUser) && !isAgentStreaming;

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
        const role = message.role;
        const content = message.text ?? "";

        if (role === "user") {
          return (
            <div key={message.key} className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-muted text-foreground",
                  message.status === "pending" && "opacity-70"
                )}
              >
                <p className="whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          );
        }

        if (role === "assistant") {
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
