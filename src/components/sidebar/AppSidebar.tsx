import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { NavUser } from "@/components/sidebar/NavUser";
import { NavMain } from "@/components/sidebar/NavMain";
import { NavNotes } from "@/components/sidebar/NavNotes";
import { NavSessions } from "@/components/sidebar/NavSessions";

interface SidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: SidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-1">
          <span className="font-semibold text-2xl">Bitacory</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col overflow-hidden">
        <NavMain onNavigate={onNavigate} />
        <NavNotes />
        <NavSessions onNavigate={onNavigate} />
      </SidebarContent>

      <SidebarFooter className="p-4 border-b">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
