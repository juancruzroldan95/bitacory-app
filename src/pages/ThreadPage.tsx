import { useParams } from "react-router";
import { ChatView } from "@/components/chat/ChatView";
import type { Id } from "@/convex/_generated/dataModel";

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();

  if (!threadId) return null;

  return <ChatView threadId={threadId as Id<"threads">} />;
}
