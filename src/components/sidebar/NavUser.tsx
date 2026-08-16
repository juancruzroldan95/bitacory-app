import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router";
import { useTheme } from "@/hooks/useTheme";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditor } from "@/components/sidebar/ProfileEditor";
import { TherapyScheduleEditor } from "@/components/sidebar/TherapyScheduleEditor";
import { ChevronsUpDown, LogOut, Moon, Sun, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

export function NavUser() {
  const { profile } = useProfile();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { isMobile } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const resolvedTheme = useResolvedTheme();

  const displayName = profile?.displayName ?? "Usuario";
  const avatarUrl = profile?.avatarUrl ?? undefined;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8 rounded-lg shrink-0">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-medium">{displayName}</span>
              {profile?.email && (
                <span className="truncate text-xs text-muted-foreground">{profile.email}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg min-w-56"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-medium">{displayName}</span>
                {profile?.email && (
                  <span className="truncate text-xs text-muted-foreground">{profile.email}</span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => void signOut().then(() => navigate("/auth/login", { replace: true }))}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configuración</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="therapy">Terapia</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4">
              <ProfileEditor onClose={() => setProfileOpen(false)} />
            </TabsContent>
            <TabsContent value="therapy" className="mt-4">
              <TherapyScheduleEditor onClose={() => setProfileOpen(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
