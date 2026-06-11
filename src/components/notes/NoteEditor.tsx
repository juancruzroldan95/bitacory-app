import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";

interface NoteEditorProps {
  noteId: string;
  initialBody: string;
  onSave: (body: string) => void;
}

export function NoteEditor({ noteId, initialBody, onSave }: NoteEditorProps) {
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
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave(markdown);
      }, 500);
    },
  });

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <EditorContent editor={editor} />
    </div>
  );
}
