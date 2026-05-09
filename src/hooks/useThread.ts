import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useThread(threadId: Id<"threads">) {
  const thread = useQuery(api.functions.threads.get, { threadId });
  const deleteThread = useMutation(api.functions.threads.remove);
  return { thread, deleteThread };
}
