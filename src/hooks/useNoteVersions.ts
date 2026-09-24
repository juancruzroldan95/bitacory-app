import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useNoteVersions(noteId: Id<"notes"> | undefined) {
  const versions = useQuery(
    api.functions.noteVersions.listByNote,
    noteId ? { noteId } : "skip"
  );
  const createCheckpoint = useMutation(api.functions.noteVersions.createCheckpoint);
  const restoreVersion = useMutation(api.functions.noteVersions.restore);

  return {
    versions,
    createCheckpoint,
    restoreVersion,
  };
}

export function useSessionNoteVersions(sessionId: Id<"sessions"> | undefined) {
  const sessionVersions = useQuery(
    api.functions.noteVersions.listBySession,
    sessionId ? { sessionId } : "skip"
  );
  const restoreVersion = useMutation(api.functions.noteVersions.restore);

  return {
    sessionVersions,
    restoreVersion,
  };
}
