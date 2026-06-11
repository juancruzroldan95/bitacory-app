import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import AuthGuard from "@/AuthGuard";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";

const HomePage = lazy(() => import("@/pages/HomePage"));
const SessionPage = lazy(() => import("@/pages/SessionPage"));
const WorkspacePage = lazy(() => import("@/pages/WorkspacePage"));
const NotesIndexPage = lazy(() => import("@/pages/NotesIndexPage"));
const NoteEditorPage = lazy(() => import("@/pages/NoteEditorPage"));

const routes = [
  {
    path: "/",
    element: <Navigate to="/notes" replace />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/notes",
        element: <Suspense fallback={null}><WorkspacePage /></Suspense>,
        children: [
          {
            index: true,
            element: <Suspense fallback={null}><NotesIndexPage /></Suspense>,
          },
          {
            path: ":noteId",
            element: <Suspense fallback={null}><NoteEditorPage /></Suspense>,
          },
        ],
      },
      {
        path: "/chat",
        element: <Suspense fallback={null}><HomePage /></Suspense>,
      },
      {
        path: "/chat/:sessionId",
        element: <Suspense fallback={null}><SessionPage /></Suspense>,
      },
    ],
  },
];

export default routes;
