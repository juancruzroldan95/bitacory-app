import { useCallback, useMemo } from "react";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { MessageCircle, Info, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router";

interface NavMainProps {
  onNavigate?: () => void;
}


export function NavMain({ onNavigate }: NavMainProps) {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const handleNewSession = useCallback(() => {
    navigate("/chat");
    onNavigate?.();
    setOpenMobile(false);
  }, [navigate, onNavigate, setOpenMobile]);

  const handleNewNote = useCallback(() => {
    navigate("/notes");
    onNavigate?.();
    setOpenMobile(false);
  }, [navigate, onNavigate, setOpenMobile]);

  const handleAbout = useCallback(() => {
    navigate("/about");
    onNavigate?.();
    setOpenMobile(false);
  }, [navigate, onNavigate, setOpenMobile]);

  const MENU_ITEMS = useMemo(
    () => [
      { id: "new-note", title: "Notas", icon: NotebookPen, action: handleNewNote },
      { id: "new-session", title: "Sesiones", icon: MessageCircle, action: handleNewSession },
      { id: "about", title: "Cómo funciona", icon: Info, action: handleAbout },
    ],
    [handleNewNote, handleNewSession, handleAbout]
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="px-2 pt-2 gap-1">
          {MENU_ITEMS.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton onClick={item.action} className="h-9">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
