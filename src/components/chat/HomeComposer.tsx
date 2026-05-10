import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessions } from "@/hooks/useSessions";
import { useSendMessage } from "@/hooks/useMessages";

export function HomeComposer() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createSession } = useSessions();
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const content = input.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sessionId = await createSession({ title: "Nueva sesión" });
      await sendMessage({ sessionId, content });
      navigate(`/chat/${sessionId}`);
    } catch {
      toast.error("No se pudo iniciar la sesión");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3 rounded-2xl border border-border bg-background/80 dark:bg-muted/80 backdrop-blur-sm px-4 py-3 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="¿Qué querés explorar hoy?"
          disabled={isSubmitting}
          className="min-h-[72px] max-h-48 resize-none border-0 bg-transparent dark:bg-transparent shadow-none focus-visible:ring-0 px-1 py-1 text-base"
          rows={3}
        />
        <div className="flex items-end pb-0.5">
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            size="icon"
            className="shrink-0 rounded-xl"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground/60">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
