import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingAiEdit {
  proposedBody: string;
  prompt: string;
  generatedAt: number;
}

interface AiEditSuggestionCardProps {
  pendingAiEdit: PendingAiEdit | undefined | null;
  onApply: () => void;
  onDiscard: () => void;
}

export function AiEditSuggestionCard({
  pendingAiEdit,
  onApply,
  onDiscard,
}: AiEditSuggestionCardProps) {
  return (
    <AnimatePresence>
      {pendingAiEdit && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="mx-6 mb-6 border border-primary/20 rounded-2xl bg-card shadow-lg overflow-hidden"
        >
          <div className="px-6 py-3 border-b border-border flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">Sugerencia de Bitacory</span>
            {pendingAiEdit.prompt && (
              <span className="ml-auto text-xs text-muted-foreground truncate max-w-[50%]">
                {pendingAiEdit.prompt}
              </span>
            )}
          </div>

          <div className="font-serif px-8 py-6 max-h-72 overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {pendingAiEdit.proposedBody}
              </ReactMarkdown>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex gap-3">
            <Button onClick={onApply} size="sm">
              Aplicar
            </Button>
            <Button variant="ghost" size="sm" onClick={onDiscard}>
              Mantener la mía
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
