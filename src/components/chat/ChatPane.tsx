import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ArrowDown, BookOpen, MoreVertical, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
    <div className="flex flex-1 flex-col min-h-0 bg-background relative">
      <header className="flex h-14 items-center justify-between border-b px-4 shrink-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden -ml-2 text-muted-foreground hover:text-foreground" />
          <h2 className="text-lg font-semibold text-foreground/90"></h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

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

      <div ref={viewportRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full pb-4">
          <MessageList
            threadId={threadId}
            agentThreadId={thread?.agentThreadId}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToBottom}
          className="cursor-pointer absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full shadow-lg z-10"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}

      <ChatInput 
        input={input} 
        setInput={setInput} 
        handleSend={handleSend} 
        isSending={isSending} 
      />
    </div>
  );
}
