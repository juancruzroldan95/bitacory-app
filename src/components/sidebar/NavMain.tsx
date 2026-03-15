import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { SquarePen, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface NavMainProps {
  onNavigate?: () => void;
}

export function NavMain({ onNavigate }: NavMainProps) {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const handleNewSession = () => {
    navigate("/chat");
    onNavigate?.();
    setOpenMobile(false);
  };

  const MENU_ITEMS = [
    {
      id: "new-session",
      title: "Nueva sesión",
      icon: SquarePen,
      action: handleNewSession,
    },
    {
      id: "search-sessions",
      title: "Buscar sesiones",
      icon: Search,
      action: () => toast.info("Modal de búsqueda próximamente...", {
        description: "Aquí se abrirá el modal para buscar sesiones y más contenido."
      }),
    },
  ];

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
