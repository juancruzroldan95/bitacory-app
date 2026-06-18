import { useRef, useMemo, useState } from "react";
import { ArrowRight, Paperclip } from "lucide-react";
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

const renderHighlightedText = (text: string, notes: MentionedNote[]) => {
  if (!notes.length) return text;

  // Sort notes by title length descending to prevent partial matching
  const sortedNotes = [...notes].sort((a, b) => b.title.length - a.title.length);

  const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const pattern = sortedNotes.map((n) => `@${escapeRegex(n.title)}`).join("|");

  if (!pattern) return text;

  const regex = new RegExp(`(${pattern})`, "g");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const matchingNote = sortedNotes.find((n) => `@${n.title}` === part);
    if (matchingNote) {
      return (
        <span
          key={index}
          className="bg-primary/15 dark:bg-primary/25 rounded px-[3px] -mx-[3px] select-none text-transparent"
        >
          {part}
        </span>
      );
    }
    return (
      <span key={index} className="text-transparent">
        {part}
      </span>
    );
  });
};

export function SessionStartComposer({
  onSubmit,
  placeholder = "¿Qué tenés en mente hoy? Iniciá una sesión...",
  mentionedNotes = [],
  onMentionAdd,
}: SessionStartComposerProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { notes } = useNotes();

  const noteOptions = useMemo(
    () => (notes ?? []).map((n) => ({ _id: n._id, title: n.title })),
    [notes]
  );

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

    // Filter to only include notes whose mention is still present in the input text
    const activeNoteIds = mentionedNotes
      .filter((note) => input.includes(`@${note.title}`))
      .map((note) => note._id);

    setIsSubmitting(true);
    try {
      await onSubmit(content, activeNoteIds);
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
          placement="bottom"
        />
      )}

      {/* Top row: Icon + Input area */}
      <div className="flex gap-4 items-start">
        <div className="flex-grow min-w-0 relative">
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 select-none overflow-hidden px-0 py-1 text-base md:text-sm leading-relaxed whitespace-pre-wrap break-words border-0 text-transparent"
          >
            {renderHighlightedText(input, mentionedNotes)}
          </div>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onScroll={(e) => {
              if (overlayRef.current) {
                overlayRef.current.scrollTop = e.currentTarget.scrollTop;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!showMentionPicker) handleSubmit();
              }
            }}
            placeholder={placeholder}
            disabled={isSubmitting}
            className="min-h-[80px] max-h-48 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 py-1 text-base text-foreground placeholder:text-muted-foreground/45 dark:placeholder:text-muted-foreground/35 leading-relaxed relative z-10"
            rows={3}
          />
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-4">
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
