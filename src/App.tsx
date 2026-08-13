import { useRoutes } from "react-router";
import routes from "./routes";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const App = () => {
  const content = useRoutes(routes);
  return (
    <ThemeProvider defaultTheme="system" storageKey="bitacory-theme">
      <TooltipProvider>
        {content}
        <Toaster richColors />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
