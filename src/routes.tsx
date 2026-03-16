import { Navigate } from "react-router";
import AuthGuard from "@/guards/AuthGuard";
import AppLayout from "@/layouts/AppLayout";
import SignInPage from "@/pages/SignInPage";
import ChatHomePage from "@/pages/ChatHomePage";
import ThreadPage from "@/pages/ThreadPage";

const routes = [
  {
    path: "/",
    element: <Navigate to="/chat" replace />
  },
  {
    path: "/auth/sign-in",
    element: <SignInPage />
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
        element: <ChatHomePage />
      },
      {
        path: "/chat/:threadId",
        element: <ThreadPage />
      },
    ],
  },
];

export default routes;
