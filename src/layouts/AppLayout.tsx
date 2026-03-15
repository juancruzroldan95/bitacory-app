import { Outlet } from "react-router";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col h-[100dvh] overflow-hidden bg-background relative">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
