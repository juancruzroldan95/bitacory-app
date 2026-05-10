import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Pencil, MoreHorizontal } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface Session {
  _id: Id<"sessions">;
  title: string;
  themes?: string[];
}

interface SessionItemProps {
  session: Session;
  isEditing: boolean;
  editTitle: string;
  isActive: boolean;
  onNavigate: () => void;
  onStartEdit: () => void;
  onTitleChange: (value: string) => void;
  onRenameSubmit: () => void;
  onRenameBlur: () => void;
  onRenameCancel: () => void;
  onDelete: () => void;
}

export function SessionItem({
  session,
  isEditing,
  editTitle,
  isActive,
  onNavigate,
  onStartEdit,
  onTitleChange,
  onRenameSubmit,
  onRenameBlur,
  onRenameCancel,
  onDelete,
}: SessionItemProps) {
  return (
    <SidebarMenuItem className="relative group/item mb-0.5">
      {isEditing ? (
        <div className="p-1.5 w-full">
          <Input
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onRenameSubmit();
              }
              if (e.key === "Escape") onRenameCancel();
            }}
            onBlur={onRenameBlur}
            autoFocus
            className="h-8"
          />
        </div>
      ) : (
        <SidebarMenuButton
          isActive={isActive}
          onClick={onNavigate}
          className="h-auto py-2 flex-col items-start gap-1 w-full"
        >
          <div className="flex items-center gap-2 w-full pr-6 overflow-hidden">
            <span className="line-clamp-1 text-sm">{session.title}</span>
          </div>
        </SidebarMenuButton>
      )}

      {!isEditing && (
        <div className="absolute right-1 top-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Renombrar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Eliminar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto eliminará permanentemente &ldquo;{session.title}&rdquo; y todos sus mensajes. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </SidebarMenuItem>
  );
}
