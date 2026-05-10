import { useParams } from "react-router";
import { ChatView } from "@/components/chat/ChatView";
import type { Id } from "@/convex/_generated/dataModel";

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) return null;

  return <ChatView sessionId={sessionId as Id<"sessions">} />;
}
