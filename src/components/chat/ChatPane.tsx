import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageList } from "./MessageList";
import { Send, ArrowDown, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface ChatPaneProps {
  threadId: Id<"threads">;
}

export function ChatPane({ threadId }: ChatPaneProps) {
  const thread = useQuery(api.functions.threads.get, { threadId });
  const sendMessage = useMutation(api.functions.messages.send);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !threadId || isSending) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await sendMessage({ threadId, content });
      scrollToBottom();
    } catch {
      toast.error("No se pudo enviar el mensaje");
      setInput(content);
    } finally {
      setIsSending(false);
    }
  };

  if (thread === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-8 space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <div className="space-y-2 max-w-[60%]">
                <Skeleton className={`h-4 ${i % 2 === 0 ? "w-48" : "w-64"}`} />
                <Skeleton className={`h-4 ${i % 2 === 0 ? "w-32" : "w-48"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {thread?.summary && (
        <div className="border-b border-border bg-muted/30 px-4 py-3 shrink-0">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Resumen de la sesión
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {thread.summary}
                </p>
                {thread.themes && thread.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {thread.themes.map((theme) => (
                      <Badge key={theme} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        <div ref={viewportRef} className="h-full overflow-y-auto pb-36">
          {thread?.agentThreadId ? (
            <MessageList
              threadId={threadId}
              agentThreadId={thread.agentThreadId}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3 max-w-sm px-4">
                <p className="text-muted-foreground">
                  Esta es tu sesión de bitácora. Contá lo que quieras procesar hoy.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Podés compartir lo que hablaste con tu terapeuta, cómo te sentís, o cualquier pensamiento que quieras explorar.
                </p>
              </div>
            </div>
          )}
        </div>

        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToBottom}
            className="absolute bottom-36 right-6 rounded-full shadow-lg"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 px-4 pb-6 pt-16 bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            <div className="flex gap-3 rounded-2xl border border-border bg-background/80 backdrop-blur-sm px-3 py-2 shadow-lg ring-1 ring-black/5">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribí lo que querés procesar hoy..."
                disabled={isSending}
                className="min-h-8 max-h-40 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 py-1.5 text-sm"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                size="icon"
                className="shrink-0 self-end mb-0.5 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
