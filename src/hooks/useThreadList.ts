import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useThreadList() {
  const threads = useQuery(api.functions.threads.list);
  const renameThread = useMutation(api.functions.threads.rename);
  const deleteThread = useMutation(api.functions.threads.remove);
  return { threads, renameThread, deleteThread };
}
