import { cn } from "@/lib/utils";

interface UserMessageProps {
  content: string;
  isPending: boolean;
}

export function UserMessage({ content, isPending }: UserMessageProps) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-muted text-foreground",
          isPending && "opacity-70"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
