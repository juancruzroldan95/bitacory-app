import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import type { RouteObject } from "react-router";
import AuthGuard from "@/components/guards/AuthGuard";
import GuestGuard from "@/components/guards/GuestGuard";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LandingLayout } from "@/layouts/LandingLayout";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading correctly chunking each page
const LandingPage = lazy(() => import("@/pages/landing/LandingPage").then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const NotesPage = lazy(() => import("@/pages/app/notes/NotesPage").then(m => ({ default: m.NotesPage })));
const NoteEditorPage = lazy(() => import("@/pages/app/notes/NoteEditorPage").then(m => ({ default: m.NoteEditorPage })));
const SessionsPage = lazy(() => import("@/pages/app/chat/SessionsPage").then(m => ({ default: m.SessionsPage })));
const SessionPage = lazy(() => import("@/pages/app/chat/SessionPage").then(m => ({ default: m.SessionPage })));
const AboutPage = lazy(() => import("@/pages/app/about/AboutPage").then(m => ({ default: m.AboutPage })));

const PAGE_SKELETON = (
  <div className="flex flex-col flex-1 p-8 gap-4 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);

const routes: RouteObject[] = [
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true, element: <Suspense fallback={PAGE_SKELETON}><LandingPage /></Suspense> },
    ],
  },
  {
    path: "/auth",
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: "login", element: <Suspense fallback={PAGE_SKELETON}><LoginPage /></Suspense> },
    ],
  },
  {
    path: "/app",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/app/notes" replace /> },
      {
        path: "notes",
        element: <Suspense fallback={PAGE_SKELETON}><NotesPage /></Suspense>,
      },
      {
        path: "notes/:noteId",
        element: <Suspense fallback={PAGE_SKELETON}><NoteEditorPage /></Suspense>,
      },
      {
        path: "chat",
        element: <Suspense fallback={PAGE_SKELETON}><SessionsPage /></Suspense>,
      },
      {
        path: "chat/:sessionId",
        element: <Suspense fallback={PAGE_SKELETON}><SessionPage /></Suspense>,
      },
      {
        path: "about",
        element: <Suspense fallback={PAGE_SKELETON}><AboutPage /></Suspense>,
      },
    ],
  },
];

export default routes;
