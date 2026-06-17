import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, FileText, X } from "lucide-react";
import { MentionPicker } from "@/components/notes/MentionPicker";
import { useNotes } from "@/hooks/useNotes";
import type { MentionedNote } from "@/types/notes";

interface MessageComposerProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isSending: boolean;
  mentionedNotes?: MentionedNote[];
  onMentionAdd?: (note: MentionedNote) => void;
  onMentionRemove?: (noteId: MentionedNote["_id"]) => void;
}

export function MessageComposer({
  input,
  setInput,
  handleSend,
  isSending,
  mentionedNotes = [],
  onMentionAdd,
  onMentionRemove,
}: MessageComposerProps) {
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const { notes } = useNotes();

  const handleChange = (value: string) => {
    setInput(value);
    const match = value.match(/@([^@\n]*)$/);
    if (match) {
      setShowMentionPicker(true);
      setMentionQuery(match[1]);
    } else {
      setShowMentionPicker(false);
    }
  };

  const handleMentionSelect = (note: MentionedNote) => {
    const newInput = input.replace(/@[^@\n]*$/, `@${note.title} `);
    setInput(newInput);
    setShowMentionPicker(false);
    setMentionQuery("");
    if (!mentionedNotes.some((n) => n._id === note._id)) {
      onMentionAdd?.(note);
    }
  };

  const noteOptions = useMemo(
    () => (notes ?? []).map((n) => ({ _id: n._id, title: n.title })),
    [notes]
  );

  return (
    <div className="bg-background px-4 py-4 shrink-0">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex flex-col gap-2 rounded-2xl border border-border bg-background/80 dark:bg-muted/80 backdrop-blur-sm px-3 py-2 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
          {showMentionPicker && (
            <MentionPicker
              query={mentionQuery}
              notes={noteOptions}
              onSelect={handleMentionSelect}
              onClose={() => setShowMentionPicker(false)}
            />
          )}

          {mentionedNotes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 px-1">
              {mentionedNotes.map((note) => (
                <span
                  key={note._id}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-md px-2 py-0.5"
                >
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="max-w-[120px] truncate">{note.title}</span>
                  <button
                    onClick={() => onMentionRemove?.(note._id)}
                    className="ml-0.5 hover:text-primary/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!showMentionPicker) handleSend();
                }
              }}
              placeholder="Escribí lo que quieras... Usá @ para adjuntar una nota"
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
    </div>
  );
}
