# Design System & Guidelines (Dify.ai Inspired)

This document outlines the core design tokens, typography, colors, and layout principles used to replicate the clean, modern, and developer-focused aesthetic of the landing page.

## 1. Color Palette

### Primary Brand Colors
- **Primary Blue**: `blue-600` (`#2563EB`) — Used for primary CTAs (Call to Actions), active states, highlighting key terms, and the case study background.
- **Deep Blue/Hover**: `blue-700` (`#1D4ED8`) — Used for button hover states.
- **Soft Blue Background**: `blue-50` (`#EFF6FF`) — Used for subtle active tab backgrounds, pill tags, and light accents.

### Neutrals & Backgrounds
- **Pure White**: `white` (`#FFFFFF`) — The primary background color, emphasizing negative space and cleanliness.
- **Off-White / Light Slate**: `slate-50` (`#F8FAFC`) — Used for alternating sections and highlighting cards/UI mockups without heavy borders.
- **Borders**: `gray-200` (`#E5E7EB`) — Crucial for the "blueprint" or "bento-box" structural aesthetic. Used extensively to divide grid sections.

### Typography Colors
- **Primary Text**: `slate-900` (`#0F172A`) — High contrast for headings and primary body copy.
- **Secondary Text**: `slate-600` (`#475569`) — Used for subtitles, descriptive paragraphs, and navigation links.
- **Muted Text**: `slate-400` / `slate-500` — Used for inactive tabs, decorative numbers ("01", "02"), and footer text.

## 2. Typography

- **Font Family**: Modern Sans-Serif (system fonts, Inter). Clean, legible, and professional.
- **Headings**:
  - Large, bold, and tightly tracked (e.g., `text-5xl lg:text-7xl font-bold tracking-tight`).
  - Line heights are tight (`leading-[1.1]`) to keep multi-line headlines cohesive.
- **Body Copy**:
  - Legible and relaxed (e.g., `text-lg text-slate-600 leading-relaxed`).
- **Accents**:
  - Monospace or distinct styling for numerical accents (e.g., the `01`, `02` step indicators).

## 3. Layout & Structure

- **The Grid / "Bento Box" Layout**: The design heavily utilizes 1px solid borders (`border-gray-200` or `border-gray-100`) to create a structural, grid-like layout (especially in the Impact and Startup sections). This gives a highly technical, organized, and engineered feel.
- **Container Width**: Max-width constraints (`max-w-[1400px]`) keep the design focused on ultra-wide screens without letting it stretch uncontrollably.
- **Spacing**: Generous use of padding (`py-24`, `p-16`) creates an airy, uncrowded interface that lets the typography and UI graphics breathe.

## 4. UI Components

- **Buttons**:
  - Primary: Solid Blue (`bg-blue-600`), white text, medium rounded edges (`rounded-lg`), often paired with a right-facing arrow.
  - Secondary/Tabs: Borderless or subtle borders with hover states that transition text from muted to primary colors.
- **Mockups / UI Showcases**:
  - Framed inside rounded containers (`rounded-xl`) with soft shadows (`shadow-2xl`) and subtle borders to lift them off the canvas.
  - Elements inside mockups use miniature scales (`text-xs`, `w-3 h-3`) and pastel accent colors (amber, green, cyan) to simulate complex application interfaces.
- **Navigation**: Sticky top bar with a frosted glass effect (`bg-white/80 backdrop-blur-md`) to ensure it remains visible without completely blocking the content beneath.

## 5. Visual Accents

- **Icons**: Clean, uniform vector-based icons (`lucide-react`).
- **Logos**: Kept in grayscale (`grayscale`) with a hover effect to reveal color (`hover:grayscale-0`) or rendered in muted tones. This keeps the visual focus entirely on the product and layout.
- **Case Study Imagery**: High-contrast, dithered, or monotone imagery (e.g., black and white mountains) contrasting sharply against vibrant solid blue typography blocks.
