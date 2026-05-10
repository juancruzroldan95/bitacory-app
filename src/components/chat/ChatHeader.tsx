import { useState } from "react";
import { BookOpen, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  title: string;
  summary?: string;
  themes?: string[];
  onDeleteRequest: () => void;
}

export function ChatHeader({ title, summary, themes, onDeleteRequest }: ChatHeaderProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b px-4 shrink-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="md:hidden -ml-2 shrink-0 text-muted-foreground hover:text-foreground" />
          <h2 className="text-lg font-semibold text-foreground/90 truncate">{title}</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Opciones de sesión"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {summary && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setSummaryOpen(true)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Resumen de sesión
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                onDeleteRequest();
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {summary && (
        <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
          <SheetContent side="right" className="w-[90vw] sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle>Resumen de sesión</SheetTitle>
              <SheetDescription className="sr-only">
                Resumen y temas identificados en esta sesión
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-4 overflow-y-auto">
              <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
              {themes && themes.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Temas identificados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {themes.map((theme) => (
                      <Badge key={theme} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
