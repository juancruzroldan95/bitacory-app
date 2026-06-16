import React from "react";
import {
  FileText,
  Trash2,
  Edit2,
  MoreVertical,
  Bookmark,
  Tag as TagIcon,
  Users,
  Briefcase,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Id } from "@/convex/_generated/dataModel";

interface NoteCardProps {
  note: {
    _id: Id<"notes">;
    updatedAt: number;
    title: string;
    body: string;
    tags?: string[];
  };
  isBookmarked: boolean;
  onToggleBookmark: (noteId: Id<"notes">, e: React.MouseEvent) => void;
  onRename: (id: Id<"notes">, title: string) => void;
  onDelete: (id: Id<"notes">, title: string) => void;
  onClick: () => void;
  onTagClick: (tag: string) => void;
}

interface TagConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderLeftClass: string;
}

function getTagDetails(tags?: string[]): TagConfig {
  if (!tags || tags.length === 0) {
    return {
      label: "Nota",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderLeftClass: "border-l-primary/60 dark:border-l-primary/50",
    };
  }
  const firstTag = tags[0].toLowerCase();
  if (firstTag.includes("familia") || firstTag.includes("family")) {
    return {
      label: `#${tags[0]}`,
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      borderLeftClass: "border-l-orange-500/70 dark:border-l-orange-400/70",
    };
  }
  if (firstTag.includes("trabajo") || firstTag.includes("career") || firstTag.includes("profesion") || firstTag.includes("limites")) {
    return {
      label: `#${tags[0]}`,
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderLeftClass: "border-l-blue-500/70 dark:border-l-blue-400/70",
    };
  }
  if (firstTag.includes("crecimiento") || firstTag.includes("growth") || firstTag.includes("personal") || firstTag.includes("auto")) {
    return {
      label: `#${tags[0]}`,
      icon: Sprout,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderLeftClass: "border-l-emerald-600/70 dark:border-l-emerald-400/70",
    };
  }
  return {
    label: `#${tags[0]}`,
    icon: TagIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderLeftClass: "border-l-primary/60 dark:border-l-primary/50",
  };
}

function getExcerpt(body: string, length = 150): string {
  if (!body) return "";
  const plainText = body
    .replace(/[#*`~_]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + "...";
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  
  return formatDate(timestamp);
}

export const NoteCard = React.memo(function NoteCard({
  note,
  isBookmarked,
  onToggleBookmark,
  onRename,
  onDelete,
  onClick,
  onTagClick,
}: NoteCardProps) {
  const tagDetails = getTagDetails(note.tags);
  const IconComponent = tagDetails.icon;

  return (
    <article
      onClick={onClick}
      className={`bg-card hover:bg-muted/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer border-l-4 border border-y-border border-r-border ${tagDetails.borderLeftClass}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${tagDetails.color}`}>
          <IconComponent className="h-4 w-4" />
          <span>{tagDetails.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/60">
            {getRelativeTime(note.updatedAt)}
          </span>
          <button
            type="button"
            onClick={(e) => onToggleBookmark(note._id, e)}
            className="p-1 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onRename(note._id, note.title)}>
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Renombrar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(note._id, note.title)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h4 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3 leading-snug">
        {note.title}
      </h4>

      <p className="font-serif text-base text-muted-foreground italic pl-3 border-l-2 border-border/60 py-0.5 mb-4">
        &ldquo;{getExcerpt(note.body, 120) || "Escribí tu nota de hoy..."}&rdquo;
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
});
