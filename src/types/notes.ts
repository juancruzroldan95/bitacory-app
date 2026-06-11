import type { Id } from "@/convex/_generated/dataModel";

export interface MentionedNote {
  _id: Id<"notes">;
  title: string;
}
