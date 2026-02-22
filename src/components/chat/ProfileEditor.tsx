import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, User } from "lucide-react";

interface ProfileEditorProps {
  onClose?: () => void;
}

export function ProfileEditor({ onClose }: ProfileEditorProps) {
  const profile = useQuery(api.functions.profiles.get);
  const updateProfile = useMutation(api.functions.profiles.update);
  const generateUploadUrl = useMutation(api.functions.profiles.generateUploadUrl);
  const updateAvatar = useMutation(api.functions.profiles.updateAvatar);

  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setDisplayName(profile.displayName || "");
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    try {
      await updateProfile({ displayName: displayName.trim() });
      toast.success("Perfil actualizado");
      onClose?.();
    } catch {
      toast.error("No se pudo actualizar el perfil");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor subí un archivo de imagen");
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      await updateAvatar({ storageId });
      toast.success("Avatar actualizado");
    } catch {
      toast.error("No se pudo subir el avatar");
    } finally {
      setUploading(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Personalizá tu nombre y avatar
      </p>
      <div>
        <Label className="mb-2">Foto de perfil</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Subiendo..." : "Subir foto"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Nombre</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ingresá tu nombre"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave}>Guardar cambios</Button>
        <Button variant="outline" onClick={() => onClose?.()}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
