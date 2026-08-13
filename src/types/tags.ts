import type { LucideIcon } from "lucide-react";

export type TagSlug =
  | "ansiedad"
  | "tristeza"
  | "familia"
  | "trabajo"
  | "relaciones"
  | "autoestima"
  | "miedo"
  | "logros"
  | "sueno"
  | "enojo"
  | "comunicacion"
  | "proposito";

export type TagCategory = "emociones" | "vinculos" | "crecimiento";

export interface TherapeuticTag {
  slug: TagSlug;
  label: string;
  category: TagCategory;
  icon: LucideIcon;
}
