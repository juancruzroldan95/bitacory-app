import * as React from "react";
import { Navigate, Outlet } from "react-router";
import useAuth from "@/hooks/useAuth";

interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AuthGuard;
