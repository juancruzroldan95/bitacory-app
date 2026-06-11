import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface NoteOption {
  _id: Id<"notes">;
  title: string;
}

interface MentionPickerProps {
  query: string;
  notes: NoteOption[];
  onSelect: (note: NoteOption) => void;
  onClose: () => void;
}

export function MentionPicker({ query, notes, onSelect, onClose }: MentionPickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = notes
    .filter((n) => n.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!filtered.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(filtered[activeIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, activeIndex, onSelect, onClose]);

  return (
    <AnimatePresence>
      {filtered.length > 0 && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.12 }}
          className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-2 py-1.5 border-b border-border">
            <span className="text-xs text-muted-foreground font-medium">Notas</span>
          </div>
          <ul className="py-1">
            {filtered.map((note, i) => (
              <li key={note._id}>
                <button
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                    i === activeIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => onSelect(note)}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{note.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
