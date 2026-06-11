import { Editor } from "@tiptap/react";
import { List, ListOrdered, Quote, Code, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteToolbarProps {
  editor: Editor | null;
}

export function NoteToolbar({ editor }: NoteToolbarProps) {
  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-background shadow-md z-10 max-w-[90vw] overflow-x-auto no-scrollbar">
        {/* Text styles */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("bold") ? "text-foreground bg-muted font-bold" : "text-muted-foreground"
              )}
            >
              <span className="font-bold font-serif text-sm">B</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Negrita (Ctrl+B)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("italic") ? "text-foreground bg-muted" : "text-muted-foreground"
              )}
            >
              <span className="italic font-serif text-sm">I</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Cursiva (Ctrl+I)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("strike") ? "text-foreground bg-muted" : "text-muted-foreground"
              )}
            >
              <span className="line-through font-serif text-sm">S</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Tachado
          </TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

        {/* Headings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("heading", { level: 1 }) ? "text-foreground bg-muted font-bold" : "text-muted-foreground"
              )}
            >
              <span className="font-bold text-xs">H1</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Título 1 (#)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("heading", { level: 2 }) ? "text-foreground bg-muted font-bold" : "text-muted-foreground"
              )}
            >
              <span className="font-bold text-xs">H2</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Título 2 (##)
          </TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

        {/* Block formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("bulletList") ? "text-foreground bg-muted" : "text-muted-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Lista con viñetas (-)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("orderedList") ? "text-foreground bg-muted" : "text-muted-foreground"
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Lista numerada (1.)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("blockquote") ? "text-foreground bg-muted" : "text-muted-foreground"
              )}
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Cita (&gt;)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0",
                editor.isActive("codeBlock") ? "text-foreground bg-muted" : "text-muted-foreground"
              )}
            >
              <Code className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Bloque de código (```)
          </TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

        {/* Attachments */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => toast.info("Adjuntar archivos no está disponible en el MVP")}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Adjuntar archivo
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
