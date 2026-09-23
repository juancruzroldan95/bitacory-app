import { useState, useMemo } from "react";
import { useGoals } from "@/hooks/useGoals";
import { GoalCard, type GoalItem } from "@/components/goals/GoalCard";
import { GoalDialog, GOAL_CATEGORIES } from "@/components/goals/GoalDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PauseCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export function GoalsPage() {
  const {
    goals,
    createGoal,
    updateGoal,
    removeGoal,
    toggleMilestone,
    addMilestone,
    removeMilestone,
    suggestMilestones,
  } = useGoals();

  const [activeTab, setActiveTab] = useState<"in_progress" | "completed" | "paused" | "all">("in_progress");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<GoalItem | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Id<"goals"> | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!goals) return { total: 0, inProgress: 0, completed: 0, paused: 0, globalProgress: 0 };

    const goalList = goals as GoalItem[];
    const total = goalList.length;
    const inProgress = goalList.filter((g) => g.status === "in_progress").length;
    const completed = goalList.filter((g) => g.status === "completed").length;
    const paused = goalList.filter((g) => g.status === "paused").length;

    let totalMilestones = 0;
    let completedMilestones = 0;

    for (const g of goalList) {
      for (const m of g.milestones) {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      }
    }

    const globalProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return { total, inProgress, completed, paused, globalProgress };
  }, [goals]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (!goals) return [];

    return (goals as GoalItem[]).filter((goal) => {
      // Tab filter
      if (activeTab !== "all" && goal.status !== activeTab) {
        return false;
      }

      // Category filter
      if (selectedCategory && goal.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = goal.title.toLowerCase().includes(query);
        const matchesDesc = goal.description?.toLowerCase().includes(query);
        const matchesCategory = goal.category?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesCategory;
      }

      return true;
    });
  }, [goals, activeTab, selectedCategory, searchQuery]);

  const handleOpenCreate = () => {
    setGoalToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (goal: GoalItem) => {
    setGoalToEdit(goal);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: {
    title: string;
    description?: string;
    category?: string;
    status?: "in_progress" | "completed" | "paused";
    targetDate?: string;
    milestones?: string[];
  }) => {
    if (goalToEdit) {
      await updateGoal({
        goalId: goalToEdit._id,
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        targetDate: data.targetDate,
      });
      toast.success("Objetivo actualizado.");
    } else {
      await createGoal({
        title: data.title,
        description: data.description,
        category: data.category,
        targetDate: data.targetDate,
        milestones: data.milestones,
      });
      toast.success("Objetivo creado con éxito.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await removeGoal({ goalId: goalToDelete });
      toast.success("Objetivo eliminado.");
      setGoalToDelete(null);
    } catch {
      toast.error("No se pudo eliminar el objetivo.");
    }
  };

  const handleStatusChange = async (
    goalId: Id<"goals">,
    status: "in_progress" | "completed" | "paused"
  ) => {
    try {
      await updateGoal({ goalId, status });
      toast.success(
        status === "completed"
          ? "¡Felicitaciones por cumplir este objetivo!"
          : status === "paused"
          ? "Objetivo pausado."
          : "Objetivo reactivado."
      );
    } catch {
      toast.error("No se pudo actualizar el estado.");
    }
  };

  const handleSuggestMilestones = async (params: {
    title: string;
    description?: string;
    category?: string;
  }) => {
    return await suggestMilestones(params);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-background">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="font-heading font-semibold text-2xl tracking-tight text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Objetivos
            </h1>
            <p className="font-serif text-xs text-muted-foreground hidden sm:block mt-0.5">
              Metas medibles y alcanzables para acompañar tu proceso terapéutico.
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Nuevo objetivo</span>
        </Button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">En curso</p>
              <p className="text-xl font-heading font-semibold text-foreground">{stats.inProgress}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Cumplidos</p>
              <p className="text-xl font-heading font-semibold text-foreground">{stats.completed}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <PauseCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">En pausa</p>
              <p className="text-xl font-heading font-semibold text-foreground">{stats.paused}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Avance global</p>
              <p className="text-xl font-heading font-semibold text-foreground">{stats.globalProgress}%</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 sm:flex w-full">
              <TabsTrigger value="in_progress">En curso</TabsTrigger>
              <TabsTrigger value="completed">Cumplidos</TabsTrigger>
              <TabsTrigger value="paused">En pausa</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar objetivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-card"
              />
            </div>

            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-muted-foreground mr-1 text-[11px] uppercase tracking-wider">Áreas:</span>
          {GOAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal as GoalItem}
                onEdit={handleOpenEdit}
                onDelete={(id) => setGoalToDelete(id)}
                onStatusChange={handleStatusChange}
                onToggleMilestone={(goalId, milestoneId) => toggleMilestone({ goalId, milestoneId })}
                onAddMilestone={(goalId, title) => addMilestone({ goalId, title })}
                onRemoveMilestone={(goalId, milestoneId) => removeMilestone({ goalId, milestoneId })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 my-8">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              {goals && goals.length > 0 ? "No hay objetivos con este filtro" : "Aún no tenés objetivos definidos"}
            </h3>
            <p className="font-serif text-sm text-muted-foreground max-w-md mt-1 mb-4 leading-relaxed">
              {goals && goals.length > 0
                ? "Probá cambiando el término de búsqueda o seleccionando otra pestaña."
                : "Definí una meta clara para tu proceso personal. Bitacory te acompañará a medir tus avances y reflexionar sobre ellos en tus notas y sesiones."}
            </p>
            <Button onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Crear mi primer objetivo</span>
            </Button>
          </div>
        )}
      </div>

      {/* Goal Dialog */}
      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goalToEdit={goalToEdit}
        onSubmit={handleDialogSubmit}
        onSuggestMilestones={handleSuggestMilestones}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">¿Eliminar objetivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán los pasos registrados, pero las notas asociadas no se borrarán, solo quedarán desvinculadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
