import { useRoutes } from "react-router";
import routes from "./routes";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export default function App() {
  const content = useRoutes(routes);
  return (
    <ThemeProvider defaultTheme="system" storageKey="bitacory-theme">
      <TooltipProvider>
        {content}
        <Toaster richColors />
      </TooltipProvider>
    </ThemeProvider>
  );
}
