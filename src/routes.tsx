import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import AuthGuard from "@/AuthGuard";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";

const SessionsPage = lazy(() => import("@/pages/SessionsPage"));
const SessionPage = lazy(() => import("@/pages/SessionPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const NoteEditorPage = lazy(() => import("@/pages/NoteEditorPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));

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
        element: <Suspense fallback={null}><NotesPage /></Suspense>,
      },
      {
        path: "/notes/:noteId",
        element: <Suspense fallback={null}><NoteEditorPage /></Suspense>,
      },
      {
        path: "/chat",
        element: <Suspense fallback={null}><SessionsPage /></Suspense>,
      },
      {
        path: "/chat/:sessionId",
        element: <Suspense fallback={null}><SessionPage /></Suspense>,
      },
      {
        path: "/about",
        element: <Suspense fallback={null}><AboutPage /></Suspense>,
      },
    ],
  },
];

export default routes;
