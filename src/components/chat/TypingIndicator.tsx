export function TypingIndicator() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-2 animate-in fade-in duration-300">
      <div className="flex gap-1 items-center h-6">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
      </div>
    </div>
  );
}
