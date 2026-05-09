import { MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  title: string;
  onDeleteRequest: () => void;
}

export function ChatHeader({ title, onDeleteRequest }: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4 shrink-0 bg-background/95 backdrop-blur z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden -ml-2 text-muted-foreground hover:text-foreground" />
        <h2 className="text-lg font-semibold text-foreground/90">{title}</h2>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
  );
}
