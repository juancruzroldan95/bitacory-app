import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useNotes() {
  const notes = useQuery(api.functions.notes.list);
  const createNote = useMutation(api.functions.notes.create);
  const updateNote = useMutation(api.functions.notes.update);
  const removeNote = useMutation(api.functions.notes.remove);
  return { notes, createNote, updateNote, removeNote };
}

export function useNote(noteId: Id<"notes"> | undefined) {
  const note = useQuery(api.functions.notes.get, noteId ? { noteId } : "skip");
  const updateNote = useMutation(api.functions.notes.update);
  const clearPendingAiEdit = useMutation(api.functions.notes.clearPendingAiEdit);
  return { note, updateNote, clearPendingAiEdit };
}
