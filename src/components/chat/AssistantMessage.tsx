import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSmoothText } from "@convex-dev/agent/react";
import { CopyButton } from "./CopyButton";

const REMARK_PLUGINS = [remarkGfm];

const MARKDOWN_COMPONENTS = {
  code({ className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { node?: unknown }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    const isInline = !match && !codeString.includes("\n");

    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono" {...props}>
          {children}
        </code>
      );
    }

    return (
      <div className="group/code relative">
        <CopyButton text={codeString} />
        <pre className="rounded-md bg-muted p-4 overflow-x-auto text-xs font-mono">
          <code>{codeString}</code>
        </pre>
      </div>
    );
  },
};

export const AssistantMessage = memo(function AssistantMessage({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const [smoothContent] = useSmoothText(content, {
    charsPerSec: isStreaming ? 180 : undefined,
    startStreaming: isStreaming,
  });

  const displayContent = isStreaming ? smoothContent : content;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-3 prose-headings:mt-5 prose-headings:mb-2 prose-headings:font-semibold prose-strong:text-foreground prose-strong:font-semibold prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic prose-code:text-foreground">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={MARKDOWN_COMPONENTS}>
        {displayContent}
      </ReactMarkdown>
    </div>
  );
});

