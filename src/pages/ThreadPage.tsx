import { useParams } from "react-router";
import { ChatPane } from "@/components/chat/ChatPane";
import type { Id } from "@/convex/_generated/dataModel";

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();

  if (!threadId) return null;

  return <ChatPane threadId={threadId as Id<"threads">} />;
}
