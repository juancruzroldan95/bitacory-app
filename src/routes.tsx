import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import AuthGuard from "@/AuthGuard";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";

const ChatHomePage = lazy(() => import("@/pages/ChatHomePage"));
const ThreadPage = lazy(() => import("@/pages/ThreadPage"));

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
        element: <Suspense fallback={null}><ChatHomePage /></Suspense>
      },
      {
        path: "/chat/:threadId",
        element: <Suspense fallback={null}><ThreadPage /></Suspense>
      },
    ],
  },
];

export default routes;
