import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useProfile() {
  const profile = useQuery(api.functions.profiles.get);
  const updateProfile = useMutation(api.functions.profiles.update);
  const generateUploadUrl = useMutation(api.functions.profiles.generateUploadUrl);
  const updateAvatar = useMutation(api.functions.profiles.updateAvatar);

  const uploadAvatar = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!result.ok) throw new Error("Upload failed");
    const { storageId } = await result.json();
    await updateAvatar({ storageId });
  };

  return { profile, updateProfile, uploadAvatar };
}
