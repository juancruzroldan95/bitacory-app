import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import { NoteToolbar } from "./NoteToolbar";

interface NoteEditorProps {
  noteId: string;
  initialBody: string;
  onSave: (body: string) => void;
}

export function NoteEditor({ initialBody, onSave }: NoteEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Escribí tu nota aquí..." }),
      Markdown,
    ],
    content: initialBody,
    editorProps: {
      attributes: {
        class:
          "font-serif prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-8 py-6 leading-relaxed text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = (editor as typeof editor & { getMarkdown(): string }).getMarkdown();
      console.log(`[NoteEditor] onUpdate - current editor markdown (length: ${markdown.length}):`, JSON.stringify(markdown.substring(0, 60)) + (markdown.length > 60 ? "..." : ""));
      
      if (debounceRef.current) {
        console.log("[NoteEditor] onUpdate - clearing previous debounce timer");
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        console.log(`[NoteEditor] Debounce fired - calling onSave with content length: ${markdown.length}`);
        onSave(markdown);
      }, 500);
    },
  });

  useEffect(() => {
    console.log(`[NoteEditor] Mounted with initialBody (length: ${initialBody.length}):`, JSON.stringify(initialBody.substring(0, 60)) + (initialBody.length > 60 ? "..." : ""));
    return () => {
      console.log("[NoteEditor] Unmounting...");
      if (debounceRef.current) {
        console.log("[NoteEditor] Unmount - clearing pending debounce timer");
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto pb-24">
        <EditorContent editor={editor} />
      </div>

      <NoteToolbar editor={editor} />
    </div>
  );
}
