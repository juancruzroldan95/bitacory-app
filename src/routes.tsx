import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import AuthGuard from "@/AuthGuard";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";

const HomePage = lazy(() => import("@/pages/HomePage"));
const SessionPage = lazy(() => import("@/pages/SessionPage"));

const routes = [
  {
    path: "/",
    element: <Navigate to="/chat" replace />
  },
  {
    path: "/auth/login",
    element: <LoginPage />
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/chat",
        element: <Suspense fallback={null}><HomePage /></Suspense>
      },
      {
        path: "/chat/:sessionId",
        element: <Suspense fallback={null}><SessionPage /></Suspense>
      },
    ],
  },
];

export default routes;
