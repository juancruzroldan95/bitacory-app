import { Navigate } from "react-router";
import useAuth from "@/hooks/useAuth";

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app/notes" replace />;
  }

  return <>{children}</>;
};

export default GuestGuard;
