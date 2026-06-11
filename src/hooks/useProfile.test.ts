import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useProfile } from "./useProfile";
import { useQuery, useMutation } from "convex/react";

// Mock API path resolution
vi.mock("@/convex/_generated/api", () => ({
  api: {
    functions: {
      profiles: {
        get: "get_profile",
        update: "update_profile",
        generateUploadUrl: "generate_upload_url",
        updateAvatar: "update_avatar",
      },
    },
  },
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

describe("useProfile", () => {
  let originalFetch: typeof globalThis.fetch;
  const mockUpdateProfile = vi.fn();
  const mockGenerateUploadUrl = vi.fn();
  const mockUpdateAvatar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = globalThis.fetch;

    vi.mocked(useMutation).mockImplementation((apiPath) => {
      if (apiPath === "generate_upload_url") return mockGenerateUploadUrl;
      if (apiPath === "update_avatar") return mockUpdateAvatar;
      return mockUpdateProfile;
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // Class 1 (Query Loading)
  it("should return undefined profile when loading", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const result = useProfile();
    expect(result.profile).toBeUndefined();
  });

  // Class 2 (Query Loaded)
  it("should return profile details when loaded", () => {
    const mockProfile = { displayName: "Juan Cruz", avatarId: "avatar123" };
    vi.mocked(useQuery).mockReturnValue(mockProfile);

    const result = useProfile();
    expect(result.profile).toBe(mockProfile);
    expect(useQuery).toHaveBeenCalledWith("get_profile");
  });

  // Class 3 (Upload Success)
  it("should successfully run uploadAvatar flow", async () => {
    mockGenerateUploadUrl.mockResolvedValue("http://upload.url/target");
    mockUpdateAvatar.mockResolvedValue(undefined);

    const mockResponseJson = vi.fn().mockResolvedValue({ storageId: "storage_abc" });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: mockResponseJson,
    });
    globalThis.fetch = mockFetch;

    const { uploadAvatar } = useProfile();
    const mockFile = new File(["test content"], "avatar.png", { type: "image/png" });

    await expect(uploadAvatar(mockFile)).resolves.not.toThrow();

    expect(mockGenerateUploadUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith("http://upload.url/target", {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: mockFile,
    });
    expect(mockResponseJson).toHaveBeenCalled();
    expect(mockUpdateAvatar).toHaveBeenCalledWith({ storageId: "storage_abc" });
  });

  // Class 4 (Upload Failure - HTTP Error)
  it("should throw error if fetch response is not ok", async () => {
    mockGenerateUploadUrl.mockResolvedValue("http://upload.url/target");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    });
    globalThis.fetch = mockFetch;

    const { uploadAvatar } = useProfile();
    const mockFile = new File(["test content"], "avatar.png", { type: "image/png" });

    await expect(uploadAvatar(mockFile)).rejects.toThrow("Upload failed");
    expect(mockUpdateAvatar).not.toHaveBeenCalled();
  });

  // Class 5 (Upload Failure - Mutation Error)
  it("should bubble up error if generateUploadUrl fails", async () => {
    mockGenerateUploadUrl.mockRejectedValue(new Error("Generate URL mutation failed"));

    const { uploadAvatar } = useProfile();
    const mockFile = new File(["test content"], "avatar.png", { type: "image/png" });

    await expect(uploadAvatar(mockFile)).rejects.toThrow("Generate URL mutation failed");
  });
});
