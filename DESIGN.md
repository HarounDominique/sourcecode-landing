# Design

## Theme

Warm, editorial-technical. A calm paper-and-ink surface (Anthropic's intellectual warmth) wrapping an honest dark terminal (Anomaly Innovations' developer candor). Dual-identity: light and dark are both first-class, sharing one clay accent and a serif-display / grotesque-body / mono-code type system. The signature is contrast: a warm light page with a dark terminal artifact at its center.

Color strategy: **Restrained-with-conviction.** Tinted warm neutrals carry the surface; a single clay accent (≈10%) carries links, the accent word, wayfinding ticks, and live states. The terminal keeps a classic dark syntax palette — authentic, not decorative.

## Color (OKLCH)

### Light (warm paper) — default-equal
- `--bg-0` paper `oklch(0.971 0.007 80)`
- `--bg-1` raised `oklch(0.948 0.009 78)`
- `--bg-2` sunken `oklch(0.912 0.011 76)`
- `--bg-3` `oklch(0.86 0.013 74)`
- `--text-primary` warm ink `oklch(0.26 0.012 55)`
- `--text-secondary` `oklch(0.44 0.012 50)` (~7:1 on paper)
- `--text-muted` `oklch(0.55 0.012 50)` (labels/large only)
- `--accent` clay `oklch(0.55 0.14 42)` (~5:1 on paper)
- `--accent-strong` `oklch(0.47 0.14 40)`
- `--accent-green` `oklch(0.52 0.12 150)`

### Dark (warm black)
- `--bg-0` `oklch(0.175 0.006 65)` (never pure #000)
- `--bg-1` `oklch(0.21 0.008 64)`
- `--bg-2` `oklch(0.25 0.009 62)`
- `--bg-3` `oklch(0.30 0.01 60)`
- `--text-primary` warm off-white `oklch(0.93 0.008 82)`
- `--text-secondary` `oklch(0.72 0.01 78)`
- `--text-muted` `oklch(0.54 0.01 72)`
- `--accent` clay-amber `oklch(0.74 0.13 55)`
- `--accent-strong` `oklch(0.80 0.12 58)`
- `--accent-green` `oklch(0.74 0.13 155)`

### Terminal (always dark, both themes)
Deep warm black, warm-off-white ink, clay prompt glyph, classic syntax: blue keys, amber strings, green values, red for HIGH risk. Kept literal to the product.

## Typography

- **Display / headings:** Spectral (warm literary serif; weights 400/500/600 + italic). Deliberately NOT a reflex-reject serif. h1 tracking −0.02em, h2 −0.015em, looser line-height than the old sans.
- **Body / UI:** Hanken Grotesk (clean neutral grotesque; 400/500/600/700). Replaces Inter — developer-honest without being the default.
- **Code / terminal:** JetBrains Mono (400/500). Kept — authentic to a CLI tool, not costume.
- Pairing axis: serif display × grotesque body × mono code. Contrast, not similarity.

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

- No gradient text. Emphasis via clay color + serif weight.
- No side-stripe (`border-left`/`right` >1px) accents.
- No neon-cyan cyber-terminal revival.
- No uppercase tracked kicker pill repeated per section.
