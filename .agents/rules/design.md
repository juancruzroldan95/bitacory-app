---
trigger: always_on
---

# Design System: Bitacory

## 1. Overview

**Creative North Star: "The Serene Sanctuary"**

Bitacory is designed as an adaptive light and dark sanctuary optimized for therapeutic reflection, self-healing, and calm dialog. It uses soft studio whites, deep zinc backgrounds, and calming healing teal accents to establish safety, privacy, and quiet focus. The design system is highly restrained, emphasizing spacious typography, generous whitespace, and tactile micro-interactions to lower cognitive load.

Every element in Bitacory is structured to prioritize visual comfort. The interface avoids loud, flashing elements and typical clinical/cold medical aesthetics, opting instead for a warm, human, and premium personal journal experience.

**Key Characteristics:**
- Restrained color application (primary accent used under 10% of any view).
- Editorial-grade typography with a serif body face (Lora) for writing and reading.
- Adaptive light/dark styling using OKLCH custom properties.
- Quiet, intent-driven motion curves with reduced-motion fallbacks.

## 2. Colors

The color palette is anchored in a calming, therapeutic teal with neutral, soft-zinc backdrops for comfort.

### Primary
- **Calming Healing Teal** (oklch(0.52 0.12 185) / #288e8e in light mode, oklch(0.68 0.13 185) / #45b1b1 in dark mode): Used for active actions, focus rings, selected menu options, and primary buttons.

### Neutral
- **Soft Studio White** (oklch(1 0 0) / #ffffff): Canonical background for light mode.
- **Warm Zinc Dark** (oklch(0.27 0 0) / #404040): Calm, low-glare background for dark mode.
- **Ink Charcoal** (oklch(0.20 0.006 285.823) / #333233): High-contrast, soft charcoal for light mode body text.
- **Muted Sage** (oklch(0.552 0.016 285.938) / #7c7a7d): Used for secondary labels, placeholders, and borders.

**The Calming Accent Rule.** The primary accent teal is used on ≤10% of any given screen. Its rarity makes it an intentional focus indicator, never a distraction.

## 3. Typography

**Display Font:** Outfit (sans-serif)
**Body Font:** Lora (serif)
**Label/Mono Font:** Geist Mono (monospace)

The typographic system pairs the modern geometric sans-serif Outfit (for clean, clear interface navigation and layout structure) with the classic, comforting Lora serif font (for editor and chat message readability).

### Hierarchy
- **Display** (Bold (700), clamp(2rem, 5vw, 3rem), 1.2): Hero headers and empty state headlines.
- **Headline** (Semi-bold (600), 1.5rem, 1.3): Major page titles or session panel headers.
- **Title** (Medium (500), 1.25rem, 1.4): Card headings, note titles, list items.
- **Body** (Regular (400), 1rem, 1.6): Notes writing area, chat message bubbles, general prose. Capped at 70ch line length.
- **Label** (Medium (500), 0.875rem, letter-spacing 0.02em): Sidebar items, buttons, tags, system metadata.

**The Therapeutic Reading Rule.** Body text, editor prose, and AI chat messages must always render in Lora (serif) with a line-height of 1.6 and a maximum line length of 70ch to optimize reading and journaling comfort.

## 4. Elevation

Bitacory uses a hybrid of flat surfaces with subtle elevation for active overlay containers (e.g. dialogs, dropdown menus). Depth is conveyed through subtle tonal borders and soft ambient shadows rather than structural layers.

### Shadow Vocabulary
- **ambient-sm** (box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)): Subtle rest-state shadow for cards and buttons.
- **ambient-md** (box-shadow: 0 4px 12px 0 rgba(0,0,0,0.07)): Soft shadow for dropdowns, tooltips, and floating components.

**The Flat-At-Rest Rule.** Card containers and panels are flat or have minimal shadows (`ambient-sm`) at rest. Shadows appear only to denote state transitions (hover, active focus, active dropdown overlays).

## 5. Components

### Buttons
- **Shape:** Gently rounded corners (0.55rem / 8.8px radius).
- **Primary:** Calming Healing Teal background, white text. Generous horizontal padding (h-9 px-4 or h-10 px-6).
- **Hover / Focus:** Transitions smoothly via opacity scale. Focus rings glow with ring color `oklch(0.60 0.08 185)`.

### Cards / Containers
- **Corner Style:** Gently rounded (0.75rem / 12px / rounded-xl).
- **Background:** Soft card background (`--card`) with a thin border (`--border`).
- **Shadow Strategy:** Flat or minimal shadow (`ambient-sm`). No heavy shadows.
- **Internal Padding:** 1.5rem (24px).

### Inputs / Fields
- **Style:** Flat white background in light mode, dark input fill in dark mode. Thin border (`--border`).
- **Focus:** Subtle border shift with teal ring glow.

### Navigation
- **Style:** Sidebar navigation uses clean typography (Outfit, 500 weight) with responsive state hover indicators and active state teal highlighting.

## 6. Do's and Don'ts

### Do:
- **Do** wrap body text and editor prose to max 70ch to facilitate scanning and self-reflection.
- **Do** verify text contrast (e.g., body text must hit ≥4.5:1 contrast ratio against the background).
- **Do** respect user preferences for motion by wrapping animations in prefers-reduced-motion media queries.
- **Do** keep cards simple and flat at rest, with a thin 1px border.

### Don't:
- **Don't** use border-left or border-right greater than 1px as a colored accent/stripe on card lists.
- **Don't** use gradient text or background-clip: text combined with gradient backgrounds.
- **Don't** use glassmorphism/blurs as a default decoration.
- **Don't** pair borders with wide drop shadows (no ghost-cards).
- **Don't** use tiny uppercase tracked eyebrows above every section.
- **Don't** use sketchy/doodle SVG drawings or wavy paths.