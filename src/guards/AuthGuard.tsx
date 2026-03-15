import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "@/hooks/useAuth";

interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isInitialized } = useAuth();

  const { search } = useLocation();
  const hasOAuthCode = new URLSearchParams(search).has("code");

  // Only block while OAuth is in progress (code present but not yet authenticated).
  // Once authenticated, show content — the code may still be in React Router's stale location.
  if (hasOAuthCode && !isAuthenticated) return null;
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/auth/sign-in" replace />;

  return children ? <>{children}</> : <Outlet />;
};

export default AuthGuard;
