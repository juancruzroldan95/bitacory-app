import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Heart,
  Users,
  Briefcase,
  Link,
  Sprout,
  ShieldAlert,
  Trophy,
  Moon,
  Flame,
  MessageCircle,
  Compass,
} from "lucide-react";

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

export const THERAPEUTIC_TAGS: TherapeuticTag[] = [
  // Emociones
  { slug: "ansiedad",      label: "Ansiedad",      category: "emociones",   icon: Brain },
  { slug: "tristeza",      label: "Tristeza",      category: "emociones",   icon: Heart },
  { slug: "miedo",         label: "Miedo",         category: "emociones",   icon: ShieldAlert },
  { slug: "enojo",         label: "Enojo",         category: "emociones",   icon: Flame },
  { slug: "sueno",         label: "Sueño",         category: "emociones",   icon: Moon },

  // Vínculos
  { slug: "familia",       label: "Familia",       category: "vinculos",    icon: Users },
  { slug: "relaciones",    label: "Relaciones",    category: "vinculos",    icon: Link },
  { slug: "comunicacion",  label: "Comunicación",  category: "vinculos",    icon: MessageCircle },

  // Crecimiento
  { slug: "autoestima",    label: "Autoestima",    category: "crecimiento", icon: Sprout },
  { slug: "trabajo",       label: "Trabajo",       category: "crecimiento", icon: Briefcase },
  { slug: "logros",        label: "Logros",        category: "crecimiento", icon: Trophy },
  { slug: "proposito",     label: "Propósito",     category: "crecimiento", icon: Compass },
];

/** Map para lookup O(1) por slug */
export const TAGS_BY_SLUG = Object.fromEntries(
  THERAPEUTIC_TAGS.map((tag) => [tag.slug, tag]),
) as Record<TagSlug, TherapeuticTag>;

/** Tags agrupados por categoría */
export const TAGS_BY_CATEGORY = THERAPEUTIC_TAGS.reduce(
  (acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  },
  {} as Record<TagCategory, TherapeuticTag[]>,
);
