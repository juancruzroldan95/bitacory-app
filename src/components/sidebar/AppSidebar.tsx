import { BookOpen } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { NavUser } from "@/components/sidebar/NavUser";
import { NavMain } from "@/components/sidebar/NavMain";
import { NavSessions } from "@/components/sidebar/NavSessions";

interface SidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: SidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Bitacory</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain onNavigate={onNavigate} />
        <NavSessions onNavigate={onNavigate} />
      </SidebarContent>

      <SidebarFooter className="p-4 border-b">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
