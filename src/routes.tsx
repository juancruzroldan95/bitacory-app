import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import AuthGuard from "@/AuthGuard";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";
import { Skeleton } from "@/components/ui/skeleton";

const SessionsPage = lazy(() => import("@/pages/SessionsPage"));
const SessionPage = lazy(() => import("@/pages/SessionPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const NoteEditorPage = lazy(() => import("@/pages/NoteEditorPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));

const PAGE_SKELETON = (
  <div className="flex flex-col flex-1 p-8 gap-4 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);

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
        element: <Suspense fallback={PAGE_SKELETON}><NotesPage /></Suspense>,
      },
      {
        path: "/notes/:noteId",
        element: <Suspense fallback={PAGE_SKELETON}><NoteEditorPage /></Suspense>,
      },
      {
        path: "/chat",
        element: <Suspense fallback={PAGE_SKELETON}><SessionsPage /></Suspense>,
      },
      {
        path: "/chat/:sessionId",
        element: <Suspense fallback={PAGE_SKELETON}><SessionPage /></Suspense>,
      },
      {
        path: "/about",
        element: <Suspense fallback={PAGE_SKELETON}><AboutPage /></Suspense>,
      },
    ],
  },
];

export default routes;
