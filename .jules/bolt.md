## 2024-06-05 - Chat Streaming Re-renders
**Learning:** Streaming chat messages in React causes full-list re-renders as new chunks arrive. For historical messages containing complex components like `ReactMarkdown`, this causes massive performance degradation on every chunk received.
**Action:** Always wrap chat message components (`AssistantMessage`, `UserMessage`) with `React.memo` to prevent re-rendering historical messages during active streaming.
