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
}

function getTagDetails(tags?: string[]): TagConfig {
  if (!tags || tags.length === 0) {
    return {
      label: "Nota",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    };
  }
  const firstTag = tags[0].toLowerCase();
  if (firstTag.includes("familia") || firstTag.includes("family")) {
    return {
      label: `#${tags[0]}`,
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    };
  }
  if (firstTag.includes("trabajo") || firstTag.includes("career") || firstTag.includes("profesion") || firstTag.includes("limites")) {
    return {
      label: `#${tags[0]}`,
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    };
  }
  if (firstTag.includes("crecimiento") || firstTag.includes("growth") || firstTag.includes("personal") || firstTag.includes("auto")) {
    return {
      label: `#${tags[0]}`,
      icon: Sprout,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    };
  }
  return {
    label: `#${tags[0]}`,
    icon: TagIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
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
      className="bg-card hover:bg-muted/10 rounded-xl p-6 border border-border hover:border-primary/30 dark:hover:border-primary/45 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${tagDetails.color} ${tagDetails.bgColor} border-current/10 shrink-0`}>
          <IconComponent className="h-3.5 w-3.5 shrink-0" />
          <span>{tagDetails.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/60">
            {getRelativeTime(note.updatedAt)}
          </span>
          <button
            type="button"
            onClick={(e) => onToggleBookmark(note._id, e)}
            className="p-1 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg transition-colors duration-150">
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

      <h4 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug tracking-tight">
        {note.title}
      </h4>

      <p className="font-serif text-base text-muted-foreground/85 italic pl-3 border-l border-primary/20 dark:border-l dark:border-primary/30 py-0.5 mb-4">
        &ldquo;{getExcerpt(note.body, 120) || "Escribí tu nota de hoy..."}&rdquo;
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2.5 py-0.5 bg-secondary/60 text-secondary-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 rounded-md text-xs font-medium transition-all duration-150"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
});
