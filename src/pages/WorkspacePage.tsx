import { useState } from "react";
import { Outlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalChatPanel } from "@/components/notes/GlobalChatPanel";
import type { MentionedNote } from "@/types/notes";

export default function WorkspacePage() {
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [mentionedNotes, setMentionedNotes] = useState<MentionedNote[]>([]);

  const handleMentionAdd = (note: MentionedNote) => {
    setMentionedNotes((prev) =>
      prev.some((n) => n._id === note._id) ? prev : [...prev, note]
    );
  };

  const handleMentionRemove = (noteId: MentionedNote["_id"]) => {
    setMentionedNotes((prev) => prev.filter((n) => n._id !== noteId));
  };

  const toggleEditor = () => {
    if (editorCollapsed && chatCollapsed) {
      setEditorCollapsed(false);
    } else {
      setEditorCollapsed((v) => !v);
    }
  };

  const toggleChat = () => {
    if (editorCollapsed && chatCollapsed) {
      setChatCollapsed(false);
    } else {
      setChatCollapsed((v) => !v);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* Toggle controls */}
      <div className="absolute top-3 right-3 z-20 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleEditor}
          className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-sm"
          title={editorCollapsed ? "Mostrar notas" : "Ocultar notas"}
        >
          {editorCollapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChat}
          className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-sm"
          title={chatCollapsed ? "Mostrar chat" : "Ocultar chat"}
        >
          {chatCollapsed ? (
            <PanelRightOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelRightClose className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Notes editor panel */}
      <AnimatePresence initial={false}>
        {!editorCollapsed && (
          <motion.div
            key="editor-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: chatCollapsed ? "100%" : "50%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex flex-col min-h-0 border-r border-border overflow-hidden"
            style={{ flexShrink: 0 }}
          >
            <Outlet />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel — always mounted to preserve message subscription */}
      <div
        className={`flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-200 ${
          chatCollapsed ? "w-0 opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <GlobalChatPanel
          mentionedNotes={mentionedNotes}
          onMentionAdd={handleMentionAdd}
          onMentionRemove={handleMentionRemove}
        />
      </div>
    </div>
  );
}
