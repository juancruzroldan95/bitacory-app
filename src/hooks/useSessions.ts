import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useSessions() {
  const sessions = useQuery(api.functions.sessions.list);
  const createSession = useMutation(api.functions.sessions.create);
  const renameSession = useMutation(api.functions.sessions.rename);
  const deleteSession = useMutation(api.functions.sessions.remove);
  return { sessions, createSession, renameSession, deleteSession };
}

export function useSession(sessionId: Id<"sessions">) {
  const session = useQuery(api.functions.sessions.get, { sessionId });
  const deleteSession = useMutation(api.functions.sessions.remove);
  return { session, deleteSession };
}
