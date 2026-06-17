import React from "react";
import {
  MessageSquare,
  Trash2,
  Edit2,
  MoreVertical,
  Bookmark,
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

interface SessionCardProps {
  session: {
    _id: Id<"sessions">;
    _creationTime: number;
    title: string;
    summary?: string;
    themes?: string[];
  };
  isBookmarked: boolean;
  onToggleBookmark: (sessionId: Id<"sessions">, e: React.MouseEvent) => void;
  onRename: (id: Id<"sessions">, title: string) => void;
  onDelete: (id: Id<"sessions">, title: string) => void;
  onClick: () => void;
}

interface ThemeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function getThemeDetails(themeName?: string): ThemeConfig {
  if (!themeName) {
    return {
      label: "Tema: General",
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    };
  }
  const t = themeName.toLowerCase();
  if (t.includes("familia") || t.includes("family")) {
    return {
      label: "Tema: Familia",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    };
  }
  if (t.includes("trabajo") || t.includes("career") || t.includes("profesion") || t.includes("limites")) {
    return {
      label: "Tema: Trabajo",
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    };
  }
  if (t.includes("crecimiento") || t.includes("growth") || t.includes("personal") || t.includes("auto")) {
    return {
      label: "Tema: Crecimiento Personal",
      icon: Sprout,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    };
  }
  return {
    label: `Tema: ${themeName}`,
    icon: MessageSquare,
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

export const SessionCard = React.memo(function SessionCard({
  session,
  isBookmarked,
  onToggleBookmark,
  onRename,
  onDelete,
  onClick,
}: SessionCardProps) {
  const primaryTheme = session.themes?.[0];
  const themeDetails = getThemeDetails(primaryTheme);
  const IconComponent = themeDetails.icon;

  return (
    <article
      onClick={onClick}
      className="bg-card hover:bg-muted/10 rounded-xl p-6 border border-border hover:border-primary/30 dark:hover:border-primary/45 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${themeDetails.color} ${themeDetails.bgColor} border-current/10 shrink-0`}>
          <IconComponent className="h-3.5 w-3.5 shrink-0" />
          <span>{themeDetails.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/60">
            {getRelativeTime(session._creationTime)}
          </span>
          <button
            type="button"
            onClick={(e) => onToggleBookmark(session._id, e)}
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
              <DropdownMenuItem onClick={() => onRename(session._id, session.title)}>
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Renombrar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(session._id, session.title)}
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
        {session.title}
      </h4>

      <p className="font-serif text-base text-muted-foreground/85 italic pl-3 border-l border-primary/20 dark:border-l dark:border-primary/30 py-0.5">
        &ldquo;{session.summary ? getExcerpt(session.summary, 120) : "Iniciá la conversación con tu terapeuta virtual..."}&rdquo;
      </p>
    </article>
  );
});
