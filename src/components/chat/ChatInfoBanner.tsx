import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatInfoBannerProps {
  summary: string;
  themes?: string[];
}

export function ChatInfoBanner({ summary, themes }: ChatInfoBannerProps) {
  return (
    <div className="border-b border-border bg-muted/30 px-4 py-3 shrink-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Resumen de la sesión
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
            {themes && themes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {themes.map((theme) => (
                  <Badge key={theme} variant="secondary" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
