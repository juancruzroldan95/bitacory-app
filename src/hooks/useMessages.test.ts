import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMessages, useSendMessage } from "./useMessages";
import { useMutation } from "convex/react";
import { useUIMessages } from "@convex-dev/agent/react";

vi.mock("@/convex/_generated/api", () => ({
  api: {
    functions: {
      messages: {
        list: "messages_list",
        send: "messages_send",
      },
    },
  },
}));

vi.mock("convex/react", () => ({
  useMutation: vi.fn(),
}));

vi.mock("@convex-dev/agent/react", () => ({
  useUIMessages: vi.fn(),
}));

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Class 1 (Loading State)
  it("should return isLoading true when status is LoadingFirstPage", () => {
    vi.mocked(useUIMessages).mockReturnValue({
      results: undefined,
      status: "LoadingFirstPage",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.isLoading).toBe(true);
    expect(result.visibleMessages).toEqual([]);
    expect(result.isAgentStreaming).toBe(false);
    expect(result.showTypingIndicator).toBe(false);
  });

  // Class 2 (Loaded State - Empty)
  it("should return isLoading false when status is not LoadingFirstPage", () => {
    vi.mocked(useUIMessages).mockReturnValue({
      results: [],
      status: "CanFetchMore",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.isLoading).toBe(false);
    expect(result.visibleMessages).toEqual([]);
  });

  // Class 3 (Message Filter - Failed status)
  it("should filter out failed messages", () => {
    const mockMessages = [
      { role: "user", text: "hello", status: "completed" },
      { role: "assistant", text: "failed text", status: "failed" },
    ];
    vi.mocked(useUIMessages).mockReturnValue({
      results: mockMessages,
      status: "CanFetchMore",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.visibleMessages).toHaveLength(1);
    expect(result.visibleMessages[0].text).toBe("hello");
  });

  // Class 4 & 5 (Message Filter - Empty text handling)
  it("should filter out empty completed messages but keep empty streaming messages", () => {
    const mockMessages = [
      { role: "user", text: "  ", status: "completed" }, // Empty completed -> filter out
      { role: "assistant", text: "", status: "streaming" }, // Empty streaming -> keep
      { role: "user", text: "valid", status: "completed" }, // Non-empty -> keep
    ];
    vi.mocked(useUIMessages).mockReturnValue({
      results: mockMessages,
      status: "CanFetchMore",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.visibleMessages).toHaveLength(2);
    expect(result.visibleMessages[0].status).toBe("streaming");
    expect(result.visibleMessages[1].text).toBe("valid");
  });

  // Class 6 (Typing Indicator - User Last)
  it("should show typing indicator if last message is from user and agent not streaming", () => {
    const mockMessages = [
      { role: "user", text: "hello", status: "completed" },
    ];
    vi.mocked(useUIMessages).mockReturnValue({
      results: mockMessages,
      status: "CanFetchMore",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.isAgentStreaming).toBe(false);
    expect(result.showTypingIndicator).toBe(true);
  });

  // Class 7 (Typing Indicator - Streaming Assistant)
  it("should set isAgentStreaming to true and hide typing indicator when assistant is streaming", () => {
    const mockMessages = [
      { role: "user", text: "hello", status: "completed" },
      { role: "assistant", text: "typing...", status: "streaming" },
    ];
    vi.mocked(useUIMessages).mockReturnValue({
      results: mockMessages,
      status: "CanFetchMore",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.isAgentStreaming).toBe(true);
    expect(result.showTypingIndicator).toBe(false);
  });

  // Class 8 (Typing Indicator - Pending Assistant)
  it("should show typing indicator if assistant is pending", () => {
    const mockMessages = [
      { role: "user", text: "hello", status: "completed" },
      { role: "assistant", text: "", status: "pending" },
    ];
    vi.mocked(useUIMessages).mockReturnValue({
      results: mockMessages,
      status: "CanFetchMore",
    } as any);

    const result = useMessages("session_123" as any);

    expect(result.isAgentStreaming).toBe(false);
    expect(result.showTypingIndicator).toBe(true);
  });
});

describe("useSendMessage", () => {
  it("should return the send message mutation hook", () => {
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation);

    const result = useSendMessage();

    expect(result).toBe(mockMutation);
    expect(useMutation).toHaveBeenCalledWith("messages_send");
  });
});
