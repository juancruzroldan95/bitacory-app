import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export const GOAL_CATEGORIES = [
  "Emocional",
  "Vínculos y Pareja",
  "Laboral y Vocacional",
  "Hábitos y Salud",
  "Autoestima y Cuidado",
  "Sentido y Espiritualidad",
  "Personalizado",
] as const;

export interface GoalData {
  _id?: Id<"goals">;
  title: string;
  description?: string;
  category?: string;
  status?: "in_progress" | "completed" | "paused";
  targetDate?: string;
  milestones?: Array<{ id: string; title: string; completed: boolean }>;
}

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: GoalData | null;
  onSubmit: (data: {
    title: string;
    description?: string;
    category?: string;
    status?: "in_progress" | "completed" | "paused";
    targetDate?: string;
    milestones?: string[];
  }) => Promise<void>;
  onSuggestMilestones?: (params: {
    title: string;
    description?: string;
    category?: string;
  }) => Promise<string[]>;
}

export function GoalDialog({
  open,
  onOpenChange,
  goalToEdit,
  onSubmit,
  onSuggestMilestones,
}: GoalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Emocional");
  const [status, setStatus] = useState<"in_progress" | "completed" | "paused">("in_progress");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestoneInput, setNewMilestoneInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || "");
      setCategory(goalToEdit.category || "Emocional");
      setStatus(goalToEdit.status || "in_progress");
      setTargetDate(goalToEdit.targetDate || "");
      setMilestones(goalToEdit.milestones?.map((m) => m.title) || []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("Emocional");
      setStatus("in_progress");
      setTargetDate("");
      setMilestones([]);
    }
    setNewMilestoneInput("");
  }, [goalToEdit, open]);

  const handleAddMilestone = () => {
    const trimmed = newMilestoneInput.trim();
    if (!trimmed) return;
    setMilestones((prev) => [...prev, trimmed]);
    setNewMilestoneInput("");
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAiSuggest = async () => {
    if (!title.trim()) {
      toast.error("Ingresá un título primero para que Bitacory pueda sugerir pasos.");
      return;
    }
    if (!onSuggestMilestones) return;

    try {
      setIsSuggesting(true);
      const suggestions = await onSuggestMilestones({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      });

      if (suggestions && suggestions.length > 0) {
        setMilestones((prev) => {
          const unique = new Set([...prev, ...suggestions]);
          return Array.from(unique);
        });
        toast.success("Pasos sugeridos agregados.");
      }
    } catch {
      toast.error("No se pudieron generar sugerencias en este momento.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        status,
        targetDate: targetDate.trim() || undefined,
        milestones: !goalToEdit ? milestones : undefined,
      });
      onOpenChange(false);
    } catch {
      toast.error("Ocurrió un error al guardar el objetivo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {goalToEdit ? "Editar objetivo" : "Nuevo objetivo terapéutico"}
            </DialogTitle>
            <DialogDescription>
              Definí metas claras, alcanzables y divididas en pasos medibles para trabajarlas en tu proceso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal-title">Título del objetivo</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Gestionar mi autoexigencia laboral"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="goal-category">Área o categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="goal-category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {goalToEdit ? (
                <div className="space-y-1.5">
                  <Label htmlFor="goal-status">Estado</Label>
                  <Select
                    value={status}
                    onValueChange={(val: "in_progress" | "completed" | "paused") => setStatus(val)}
                  >
                    <SelectTrigger id="goal-status">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">En curso</SelectItem>
                      <SelectItem value="completed">Cumplido</SelectItem>
                      <SelectItem value="paused">En pausa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="goal-target-date">Fecha objetivo (opcional)</Label>
                  <Input
                    id="goal-target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {goalToEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="goal-target-date-edit">Fecha objetivo (opcional)</Label>
                <Input
                  id="goal-target-date-edit"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="goal-description">
                Motivación y sentido personal
                <span className="text-muted-foreground text-xs ml-1 font-normal">
                  (¿Por qué es importante para vos?)
                </span>
              </Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Quiero sentir mayor serenidad al final del día y no postergar mi descanso por exigencias desmedidas."
                rows={2}
                className="font-serif resize-none text-sm"
              />
            </div>

            {!goalToEdit && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Pasos o hitos medibles
                  </Label>

                  {onSuggestMilestones && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAiSuggest}
                      disabled={isSuggesting || !title.trim()}
                      className="text-xs text-primary hover:text-primary gap-1.5 h-7 px-2"
                    >
                      {isSuggesting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Sugerir con Bitacory
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newMilestoneInput}
                    onChange={(e) => setNewMilestoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMilestone();
                      }
                    }}
                    placeholder="Ej: Identificar mis 3 disparadores de autoexigencia"
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMilestone}
                    disabled={!newMilestoneInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {milestones.length > 0 && (
                  <ul className="space-y-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
                    {milestones.map((m, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-2.5 py-1.5 border border-border/50"
                      >
                        <span className="flex-1 pr-2 break-words">
                          <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
                          {m}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : goalToEdit ? (
                "Guardar cambios"
              ) : (
                "Crear objetivo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
