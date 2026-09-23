import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  FileText,
  PauseCircle,
  PlayCircle,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useGoal } from "@/hooks/useGoals";
import { useNotes } from "@/hooks/useNotes";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export interface GoalItem {
  _id: Id<"goals">;
  _creationTime: number;
  userId: Id<"users">;
  title: string;
  description?: string;
  category?: string;
  status: "in_progress" | "completed" | "paused";
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: number;
  }>;
  targetDate?: string;
  createdAt: number;
  updatedAt: number;
}

interface GoalCardProps {
  goal: GoalItem;
  onEdit: (goal: GoalItem) => void;
  onDelete: (goalId: Id<"goals">) => void;
  onStatusChange: (goalId: Id<"goals">, status: "in_progress" | "completed" | "paused") => Promise<unknown>;
  onToggleMilestone: (goalId: Id<"goals">, milestoneId: string) => Promise<unknown>;
  onAddMilestone: (goalId: Id<"goals">, title: string) => Promise<unknown>;
  onRemoveMilestone: (goalId: Id<"goals">, milestoneId: string) => Promise<unknown>;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleMilestone,
  onAddMilestone,
  onRemoveMilestone,
}: GoalCardProps) {
  const navigate = useNavigate();
  const { linkedNotes } = useGoal(goal._id);
  const { createNote } = useNotes();

  const [newStepInput, setNewStepInput] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);

  const completedCount = goal.milestones.filter((m) => m.completed).length;
  const totalCount = goal.milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStepInput.trim();
    if (!trimmed) return;

    try {
      setIsAddingStep(true);
      await onAddMilestone(goal._id, trimmed);
      setNewStepInput("");
      toast.success("Paso agregado al objetivo.");
    } catch {
      toast.error("No se pudo agregar el paso.");
    } finally {
      setIsAddingStep(false);
    }
  };

  const handleCreateLinkedNote = async () => {
    try {
      const newNoteId = await createNote({
        title: `Reflexión: ${goal.title}`,
        body: `> Objetivo: **${goal.title}**\n\n### Registro de avances e introspección\n\n`,
        goalId: goal._id,
      });
      navigate(`/notes/${newNoteId}`);
    } catch {
      toast.error("No se pudo crear la nota vinculada.");
    }
  };

  return (
    <Card className="flex flex-col border border-border/80 bg-card rounded-xl transition-all duration-200 hover:border-primary/40 shadow-xs">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {goal.category && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/30">
                {goal.category}
              </Badge>
            )}

            {goal.status === "completed" && (
              <Badge variant="default" className="text-xs bg-primary/90 text-primary-foreground gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Cumplido
              </Badge>
            )}

            {goal.status === "paused" && (
              <Badge variant="secondary" className="text-xs text-muted-foreground gap-1">
                <PauseCircle className="h-3 w-3" />
                En pausa
              </Badge>
            )}

            {goal.status === "in_progress" && (
              <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                En curso
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar objetivo
              </DropdownMenuItem>

              {goal.status !== "completed" ? (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, "completed")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como cumplido
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, "in_progress")}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Reanudar objetivo
                </DropdownMenuItem>
              )}

              {goal.status === "in_progress" ? (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, "paused")}>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pausar objetivo
                </DropdownMenuItem>
              ) : goal.status === "paused" ? (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, "in_progress")}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Reanudar objetivo
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateLinkedNote}>
                <FileText className="mr-2 h-4 w-4" />
                Escribir nota vinculada
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(goal._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar objetivo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-heading font-semibold text-lg text-foreground mt-2 leading-snug">
          {goal.title}
        </h3>

        {goal.description && (
          <p className="font-serif text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {totalCount > 0
                ? `${completedCount} de ${totalCount} pasos completados`
                : "Sin pasos definidos"}
            </span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Milestones list */}
        <div className="space-y-2">
          {goal.milestones.length > 0 ? (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {goal.milestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className="group flex items-start justify-between text-sm py-1 px-1.5 rounded-md hover:bg-muted/40 transition-colors gap-2"
                >
                  <button
                    type="button"
                    onClick={() => onToggleMilestone(goal._id, milestone.id)}
                    className="flex items-start text-left gap-2 flex-1 cursor-pointer focus:outline-hidden"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    )}
                    <span
                      className={`text-xs leading-relaxed ${
                        milestone.completed
                          ? "line-through text-muted-foreground/70"
                          : "text-foreground"
                      }`}
                    >
                      {milestone.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveMilestone(goal._id, milestone.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-opacity p-0.5"
                    title="Eliminar paso"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic py-1">
              No hay pasos aún. Agregá uno para medir tus avances.
            </p>
          )}

          {/* Quick inline add step */}
          <form onSubmit={handleAddStep} className="flex gap-1.5 pt-1">
            <Input
              value={newStepInput}
              onChange={(e) => setNewStepInput(e.target.value)}
              placeholder="Agregar un paso o hito..."
              className="h-7 text-xs bg-muted/30 focus-visible:ring-1"
              disabled={isAddingStep}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!newStepInput.trim() || isAddingStep}
              className="h-7 px-2 shrink-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </div>

        {/* Footer meta: targetDate & linked notes */}
        <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {goal.targetDate ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {goal.targetDate}
              </span>
            ) : (
              <span />
            )}

            {linkedNotes && linkedNotes.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
              >
                <FileText className="h-3 w-3" />
                {linkedNotes.length} {linkedNotes.length === 1 ? "nota" : "notas"}
                {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateLinkedNote}
                className="flex items-center gap-1 text-muted-foreground/70 hover:text-primary transition-colors cursor-pointer"
              >
                <FileText className="h-3 w-3" />
                <span>+ Vincular nota</span>
              </button>
            )}
          </div>

          {/* Expandable linked notes list */}
          {showNotes && linkedNotes && linkedNotes.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 border border-border/40 text-xs">
              <div className="flex items-center justify-between font-medium text-muted-foreground pb-1">
                <span>Notas asociadas a este objetivo:</span>
                <button
                  type="button"
                  onClick={handleCreateLinkedNote}
                  className="text-primary hover:underline text-[11px]"
                >
                  + Nueva nota
                </button>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {linkedNotes.map((note) => (
                  <li key={note._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/notes/${note._id}`)}
                      className="text-left w-full truncate py-0.5 text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{note.title || "Nota sin título"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
