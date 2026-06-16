import { useRef, useState } from "react";
import { ArrowRight, FileText, X, Smile, Paperclip, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MentionPicker } from "@/components/notes/MentionPicker";
import { useNotes } from "@/hooks/useNotes";
import type { Id } from "@/convex/_generated/dataModel";
import type { MentionedNote } from "@/types/notes";
import { toast } from "sonner";

interface SessionStartComposerProps {
  onSubmit: (content: string, noteIds: Id<"notes">[]) => Promise<void>;
  placeholder?: string;
  mentionedNotes?: MentionedNote[];
  onMentionAdd?: (note: MentionedNote) => void;
  onMentionRemove?: (noteId: MentionedNote["_id"]) => void;
}

export function SessionStartComposer({
  onSubmit,
  placeholder = "¿Qué tenés en mente hoy? Iniciá una sesión...",
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
    <div className="w-full relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {showMentionPicker && (
        <MentionPicker
          query={mentionQuery}
          notes={noteOptions}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionPicker(false)}
        />
      )}

      {/* Top row: Icon + Input area */}
      <div className="flex gap-4 items-start">
        <div className="flex-grow min-w-0">
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
            className="min-h-[80px] max-h-48 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 py-1 text-base text-foreground placeholder:text-muted-foreground/45 dark:placeholder:text-muted-foreground/35 leading-relaxed"
            rows={3}
          />
        </div>
      </div>

      {/* Mentioned notes tags row */}
      {mentionedNotes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1 pb-1 border-t border-border/40 pt-3">
          {mentionedNotes.map((note) => (
            <span
              key={note._id}
              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium"
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="max-w-[150px] truncate">{note.title}</span>
              <button
                type="button"
                onClick={() => onMentionRemove?.(note._id)}
                className="ml-1 hover:text-primary/70 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Bottom control bar */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => toast.info("Selector de emojis (visual)")}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
            title="Agregar emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => toast.info("Adjuntar archivo (visual)")}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
            title="Adjuntar archivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <span className="text-xs text-muted-foreground/40 hidden sm:inline">
            Escribí @ para mencionar una nota
          </span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isSubmitting}
          className="rounded-full px-6 bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 font-medium"
        >
          <span>Comenzar sesión</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
