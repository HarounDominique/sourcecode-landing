# Design

## Theme

Warm, editorial-technical. A calm paper-and-ink surface (Anthropic's intellectual warmth, but NOT its clay color) wrapping an honest dark terminal (Anomaly Innovations' developer candor). Dual-identity: light and dark are both first-class, sharing one muted **sage/chalk-green** accent and a serif-display / grotesque-body / mono-code type system. The signature is contrast: a warm light page with a dark terminal artifact at its center. Warm paper keeps the calm; the green accent nods to Spring/Java identity while staying distinct from Anthropic's terracotta — a deliberately desaturated sage, never the neon Spring logo green (#6DB33F).

Color strategy: **Restrained-with-conviction.** Tinted warm neutrals carry the surface; a single **dusty sage** accent (chalk/tiza, `oklch(0.82 0.06 150)`) carries identity. Two-token green, because a pale chalk green can't hit 4.5:1 as text on paper:
- `--accent` is theme-appropriate **text-safe**: dark = the pale sage chalk itself (light-on-dark); light = a **deep sage** `oklch(0.44 0.10 150)` for links/labels/accent word.
- `--accent-soft` = the pale sage chalk in BOTH themes, for fills, borders, glows, chips.

So the chalk pastel reads strongest in dark mode (accent word, prompt, glow all sage chalk); light mode carries deep sage text + sage-chalk tints. Brand green and the "safe/positive" green share the family. The terminal keeps a classic dark syntax palette.

## Color (OKLCH)

### Light (warm paper) — default-equal
- `--bg-0` paper `oklch(0.971 0.007 80)`
- `--bg-1` raised `oklch(0.948 0.009 78)`
- `--bg-2` sunken `oklch(0.912 0.011 76)`
- `--bg-3` `oklch(0.86 0.013 74)`
- `--text-primary` warm ink `oklch(0.26 0.012 55)`
- `--text-secondary` `oklch(0.44 0.012 50)` (~7:1 on paper)
- `--text-muted` `oklch(0.55 0.012 50)` (labels/large only)
- `--accent` deep sage `oklch(0.44 0.10 150)` (~5:1 on paper, text-safe)
- `--accent-strong` `oklch(0.38 0.10 148)`
- `--accent-soft` sage chalk `oklch(0.82 0.06 150)` (fills/borders/glow)
- `--accent-green` (safe) `oklch(0.44 0.12 146)`

### Dark (warm black)
- `--bg-0` `oklch(0.175 0.006 65)` (never pure #000)
- `--bg-1` `oklch(0.21 0.008 64)`
- `--bg-2` `oklch(0.25 0.009 62)`
- `--bg-3` `oklch(0.30 0.01 60)`
- `--text-primary` warm off-white `oklch(0.93 0.008 82)`
- `--text-secondary` `oklch(0.72 0.01 78)`
- `--text-muted` `oklch(0.54 0.01 72)`
- `--accent` sage chalk `oklch(0.82 0.06 150)` (text-safe on dark)
- `--accent-strong` `oklch(0.88 0.06 152)`
- `--accent-soft` `oklch(0.82 0.06 150)`
- `--accent-green` (safe) `oklch(0.84 0.10 150)`

### Terminal (always dark, both themes)
Deep warm black, warm-off-white ink, sage-chalk prompt glyph + cursor, classic syntax: blue keys, amber strings, green values, red for HIGH risk. Kept literal to the product.

## Typography

No serif. The serif display read too "Anthropic editorial" for a Java/Spring CLI; the voice is a tool, not a magazine.

- **Display + body:** Mona Sans Variable (GitHub's grotesque; weights 200–900, `wght`-only — no width axis). Display = h1/h2 at 700, tight tracking (h1 −0.035em, h2 −0.03em). Body = 400/500. Dev-native, confident, distinct from Inter/Geist/DM defaults. Loaded via `@fontsource-variable/mona-sans` on jsDelivr.
- **Code / terminal:** JetBrains Mono (400/500). Kept — authentic to a CLI tool.
- Emphasis (`h1 em`) by accent color + weight, not italic.
- Pairing axis: grotesque display/body (weight contrast) × mono code.

## Components

- **Section wayfinding** (replaces 14 pill eyebrows): a short clay leading rule + lowercase mono label, integrated into the heading block as one deliberate system. Not an uppercase bordered kicker pill.
- **Buttons:** primary = ink/paper inversion (neutral, high-contrast); secondary = hairline-bordered ghost. Clay reserved for links, the accent word, and live/active states.
- **Terminal:** collapsible `<details>` sections, mac dots, dark in both themes, clay prompt.
- **Cards / grids:** 1px-gap grids over a border-colored bg (existing pattern, kept). No nested cards, no side-stripe borders.

## Layout

Centered hero with the terminal as the dominant artifact below the fold-line. `clamp()` fluid spacing, generous section padding (~7rem), 1060px container. Breakpoints at 960 / 768 / 520 / 380px.

## Motion

Restrained, deterministic. Staggered `fadeUp` on hero load; `IntersectionObserver` reveal on sections (enhances already-visible content). Full `prefers-reduced-motion` fallback. No bounce, no scroll-jacking.

## Bans (project-specific, on top of skill bans)

- No gradient text. Emphasis via chalk-green color + serif weight.
- No neon Spring logo green (#6DB33F). The accent is a desaturated sage.
- No side-stripe (`border-left`/`right` >1px) accents.
- No neon-cyan cyber-terminal revival.
- No uppercase tracked kicker pill repeated per section.
