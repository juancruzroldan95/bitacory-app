import { useMemo, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
  const overlayRef = useRef<HTMLDivElement>(null);

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

          <div className="flex gap-3">
            <div className="flex-grow min-w-0 relative">
              <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 select-none overflow-hidden px-1 py-1.5 text-sm whitespace-pre-wrap break-words border-0 text-transparent"
              >
                {renderHighlightedText(input, mentionedNotes)}
              </div>
              <Textarea
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
                    if (!showMentionPicker) handleSend();
                  }
                }}
                placeholder="Escribí lo que quieras... Usá @ para adjuntar una nota"
                disabled={isSending}
                className="min-h-8 max-h-40 resize-none border-0 bg-transparent dark:bg-transparent shadow-none focus-visible:ring-0 px-1 py-1.5 text-sm relative z-10"
                rows={1}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              size="icon"
              className="shrink-0 self-end mb-0.5 rounded-xl z-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
