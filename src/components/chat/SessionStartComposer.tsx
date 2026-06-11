import { useRef, useState } from "react";
import { ArrowUp, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MentionPicker } from "@/components/notes/MentionPicker";
import { useNotes } from "@/hooks/useNotes";
import type { Id } from "@/convex/_generated/dataModel";
import type { MentionedNote } from "@/types/notes";

interface SessionStartComposerProps {
  onSubmit: (content: string, noteIds: Id<"notes">[]) => Promise<void>;
  placeholder?: string;
  mentionedNotes?: MentionedNote[];
  onMentionAdd?: (note: MentionedNote) => void;
  onMentionRemove?: (noteId: MentionedNote["_id"]) => void;
}

export function SessionStartComposer({
  onSubmit,
  placeholder = "¿Qué querés explorar hoy?",
  mentionedNotes = [],
  onMentionAdd,
  onMentionRemove,
}: SessionStartComposerProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { notes } = useNotes();

  const noteOptions = (notes ?? []).map((n) => ({ _id: n._id, title: n.title }));

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

  const handleSubmit = async () => {
    const content = input.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, mentionedNotes.map((n) => n._id));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="relative flex flex-col gap-2 rounded-2xl border border-border bg-background/80 dark:bg-muted/80 backdrop-blur-sm px-4 py-3 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
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
            ref={textareaRef}
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!showMentionPicker) handleSubmit();
              }
            }}
            placeholder={placeholder}
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
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground/60">
        Enter para enviar · Shift+Enter para nueva línea · @ para mencionar una nota
      </p>
    </div>
  );
}
