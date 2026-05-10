import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/useSessions";
import { useSendMessage } from "@/hooks/useMessages";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { ChatHeader } from "./ChatHeader";

interface ChatViewProps {
  sessionId: Id<"sessions">;
}

const CHAT_SKELETON = (
  <div className="flex flex-1 flex-col">
    <div className="flex-1 p-8 space-y-8">
      {[0, 1, 2].map((i) => (
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

export function ChatView({ sessionId }: ChatViewProps) {
  const { session, deleteSession } = useSession(sessionId);
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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

  const handleSend = useCallback(async () => {
    if (!input.trim() || !sessionId || isSending) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await sendMessage({ sessionId, content });
      scrollToBottom();
    } catch {
      toast.error("No se pudo enviar el mensaje");
      setInput(content);
    } finally {
      setIsSending(false);
    }
  }, [input, sessionId, isSending, sendMessage, scrollToBottom]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteSession({ sessionId });
      navigate("/chat");
      toast.success("Sesión eliminada");
    } catch {
      toast.error("No se pudo eliminar la sesión");
    }
  }, [deleteSession, sessionId, navigate]);

  if (session === undefined) {
    return CHAT_SKELETON;
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background relative">
      <ChatHeader
        title={session?.title ?? ""}
        summary={session?.summary}
        themes={session?.themes}
        onDeleteRequest={() => setDeleteDialogOpen(true)}
      />

      <div ref={viewportRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full pb-4">
          <MessageList sessionId={sessionId} messagesEndRef={messagesEndRef} />
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

      <MessageComposer
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isSending={isSending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente &ldquo;{session?.title}&rdquo; y todos sus mensajes. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
