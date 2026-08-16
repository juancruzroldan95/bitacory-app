import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

interface TherapyScheduleEditorProps {
  onClose?: () => void;
}

export function TherapyScheduleEditor({ onClose }: TherapyScheduleEditorProps) {
  const { profile, updateTherapySchedule } = useProfile();
  const [initialized, setInitialized] = useState(false);
  
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [timeOfDay, setTimeOfDay] = useState("18:00");
  const [notifyPreSession, setNotifyPreSession] = useState(true);
  const [notifyPostSession, setNotifyPostSession] = useState(true);

  useEffect(() => {
    if (profile && !initialized) {
      if (profile.therapySchedule) {
        setFrequency(profile.therapySchedule.frequency);
        setDayOfWeek(profile.therapySchedule.dayOfWeek);
        setTimeOfDay(profile.therapySchedule.timeOfDay);
        setNotifyPreSession(profile.therapySchedule.notifyPreSession);
        setNotifyPostSession(profile.therapySchedule.notifyPostSession);
      }
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleSave = async () => {
    try {
      await updateTherapySchedule({
        schedule: {
          frequency,
          dayOfWeek,
          timeOfDay,
          notifyPreSession,
          notifyPostSession,
        },
      });
      toast.success("Ritmo de terapia guardado");
      onClose?.();
    } catch {
      toast.error("Error al guardar el ritmo de terapia");
    }
  };

  const handleClear = async () => {
    try {
      await updateTherapySchedule({ schedule: null });
      toast.success("Ritmo de terapia eliminado");
      setFrequency("weekly");
      setDayOfWeek(1);
      setTimeOfDay("18:00");
      setNotifyPreSession(true);
      setNotifyPostSession(true);
      onClose?.();
    } catch {
      toast.error("Error al eliminar el ritmo de terapia");
    }
  };

  if (profile === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configurá cuándo tenés sesión para que la IA te ayude a prepararte y reflexionar después.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frecuencia</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quincenal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Día de la semana</Label>
            <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Lunes</SelectItem>
                <SelectItem value="2">Martes</SelectItem>
                <SelectItem value="3">Miércoles</SelectItem>
                <SelectItem value="4">Jueves</SelectItem>
                <SelectItem value="5">Viernes</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
                <SelectItem value="0">Domingo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Horario aproximado</Label>
          <div className="relative">
            <input 
              type="time" 
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="pre-session" className="flex flex-col space-y-1">
            <span>Preparación Pre-Sesión</span>
            <span className="font-normal text-xs text-muted-foreground">
              Avisame antes de mi sesión y ayudame a armar un resumen.
            </span>
          </Label>
          <Switch 
            id="pre-session" 
            checked={notifyPreSession} 
            onCheckedChange={setNotifyPreSession} 
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="post-session" className="flex flex-col space-y-1">
            <span>Reflexión Post-Sesión</span>
            <span className="font-normal text-xs text-muted-foreground">
              Preguntame cómo me fue un rato después de terminar.
            </span>
          </Label>
          <Switch 
            id="post-session" 
            checked={notifyPostSession} 
            onCheckedChange={setNotifyPostSession} 
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <Button onClick={handleSave}>Guardar</Button>
          <Button variant="outline" onClick={() => onClose?.()}>
            Cancelar
          </Button>
        </div>
        
        {profile?.therapySchedule && (
          <Button variant="ghost" size="icon" onClick={handleClear} title="Borrar ritmo de terapia" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
