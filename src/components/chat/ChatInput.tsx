import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isSending: boolean;
}

export function ChatInput({ input, setInput, handleSend, isSending }: ChatInputProps) {
  return (
    <div className="bg-background px-4 py-4 shrink-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex gap-3 rounded-2xl border border-border bg-background/80 dark:bg-muted/80 backdrop-blur-sm px-3 py-2 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribí lo que quieras..."
            disabled={isSending}
            className="min-h-8 max-h-40 resize-none border-0 bg-transparent dark:bg-transparent shadow-none focus-visible:ring-0 px-1 py-1.5 text-sm"
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
  );
}
