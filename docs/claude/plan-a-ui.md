# Phase A — UI Implementation

Design source: `/tmp/design-bundle/form-builder/`  
Full spec: `/Users/self/Desktop/workflow/github/bu/plan.md`  
Aesthetic: Geist + Geist Mono, `oklch(0.985 0.003 80)` bg, `oklch(0.18 0.005 270)` ink, `oklch(0.62 0.15 35)` coral accent, hairline borders.

---

## A1. `index.html`
- Add `preconnect` for fonts.googleapis.com + fonts.gstatic.com
- Add Google Fonts: Geist 400/500/600/700 + Geist Mono 400/500
- Update `<title>` → "Smart Form Builder"
- Add `<meta name="description" content="Form builder">`

---

## A2. `src/index.css`
Translate `styles.css` + `styles-screens.css` from bundle. Keep Tailwind `@import` at top, append CSS below.

**Tokens:**
```css
:root {
  --bg: oklch(0.985 0.003 80);
  --surface: #ffffff;
  --surface-2: oklch(0.97 0.004 80);
  --surface-3: oklch(0.945 0.005 80);
  --border: oklch(0.91 0.004 80);
  --border-strong: oklch(0.82 0.005 80);
  --divider: oklch(0.935 0.004 80);
  --ink: oklch(0.18 0.005 270);
  --ink-2: oklch(0.32 0.005 270);
  --muted: oklch(0.52 0.005 80);
  --muted-2: oklch(0.65 0.005 80);
  --accent: oklch(0.62 0.15 35);
  --accent-ink: oklch(0.42 0.13 32);
  --accent-tint: oklch(0.96 0.025 35);
  --accent-tint-strong: oklch(0.92 0.05 35);
  --danger: oklch(0.55 0.18 25);
  --danger-tint: oklch(0.96 0.03 25);
  --success: oklch(0.55 0.13 150);
  --focus-ring: oklch(0.62 0.15 35 / 0.32);
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px;
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --header-h: 56px;
  --max-content: 1280px;
}
```

**Classes to implement** (verbatim from design bundle CSS):
- Base: resets, antialiasing, `::selection` → accent-tint-strong
- Layout: `.app-shell`, `.topbar` (sticky, backdrop-blur), `.topbar-inner`, `.brand`, `.brand-mark` (22×22 ink bg), `.nav-tabs`, `.nav-tab` (active state), `.topbar-spacer`, `.page`, `.container`
- Buttons: `.btn` + `.btn-primary/secondary/ghost/danger-ghost` + `.btn-sm/lg/block/icon`
- Inputs: `.input`, `.textarea`, `.select`, `.input-bare`, `.label`, `.label-mono`, `.field-required`, `.helper`
- Toggle: `.toggle` (32×18px pill, pseudo-element thumb, ink when `[data-on="true"]`), `.toggle-row`
- Surfaces: `.chip`, `.chip-accent`, `.chip-success`, `.kbd`, `.card`, `.card-pad`, `.section-title`, `.divider`, `.placeholder-stripes`
- Home: `.home-hero`, `.home-title`, `.home-sub`, `.home-filters`, `.template-grid` (auto-fill minmax 280px 1fr), `.template-card` (hover lift), `.new-card` (dashed border, grid place-items-center)
- Builder: `.builder` (grid 260px 1fr 320px, height calc 100vh − header), `.builder-pane` (left: surface-2 + right border; right: surface + left border), `.builder-canvas` (bg var, scroll), `.pane-header` (sticky), `.pane-body`, `.field-type-group`, `.field-type-group-title`, `.field-type` (cursor grab, hover surface), `.ft-icon` (24×24 surface border), `.builder-titlebar`, `.builder-title-input`, `.builder-status`, `.form-canvas` (max-w 720px centered), `.form-header-card` (4px ink top border), `.canvas-field` + `[data-selected]` (left coral bar + ink border) + `[data-hidden]` (opacity 0.55), `.canvas-field-grip` (absolute left −22px, opacity 0→1 on hover/selected), `.canvas-field-body`, `.canvas-field-label-row`, `.canvas-field-desc`, `.canvas-field-preview`, `.canvas-field-footer`, `.add-field-bar` (dashed), `.config-tabs`, `.config-tab` (active: bottom border ink), `.config-group`, `.option-row`, `.condition-row`, `.condition-effect`
- Fill: `.fill-shell` (max-w 720px auto), `.fill-progress` (sticky top header-h, gradient fade bottom), `.fill-progress-bar` (4px height accent fill), `.fill-progress-meta` (mono uppercase), `.fill-header` (4px ink top border), `.fill-card` + `[data-error]` (danger border + 3px shadow), `.fill-footer`, `.section-divider` (sizes: xl 26px / l 22px / m 18px / s 15px / xs 13px uppercase muted), `.choice-list`, `.choice-row` + selected (ink border + surface-2), `.dot` (radio dot) + `.box` (checkbox), `.tile-grid` (auto-fill minmax 120px), `.tile` + selected (ink bg ink color), `.scale-row`, `.scale-btn` + selected (ink), `.scale-endpoints`, `.stars-row`, `.star-btn` + `[data-on]` (accent), `.file-drop` (dashed, surface-2 bg), `.signature-pad` (grid line bg, "Sign here" pseudo, cleared when `[data-signed]`), `.phone-row` (88px 1fr), `.calc-result` (mono, baseline flex)
- Instances: `.inst-header`, `.inst-table`, `.inst-row` (5-col: 160px 1fr 140px 120px 100px), `.inst-row.head` (mono uppercase surface-2), `.inst-id` (mono muted), `.actions`
- Print preview: `.print-preview-page` (surface-3 bg), `.print-paper` (white, 8.5in max, 0.75in padding, shadow), `.print-meta` (mono 9pt, border-bottom), `.print-field` (page-break-inside avoid), `.print-q` (bold 11pt), `.print-a` (dotted bottom border), `.print-section` (13pt bold, border-top), `.print-footer` (mono 9pt, border-top)
- Modal: `.modal-backdrop` (fixed inset, dark overlay 40%, grid place-items-center), `.modal` (surface, radius-lg, max-w 520px, shadow), `.modal-header`, `.modal-body`, `.modal-footer`
- Empty: `.empty`, `.empty-icon` (48×48 surface-2, radius 12px)
- Responsive:
  - `≤1024px`: `.builder` → single col; panes hidden → fixed drawers when `[data-mobile-open="true"]` (320px, z-index 30); `.builder-mobile-tabs` visible (sticky, surface, border-bottom)
  - `≥1025px`: `.builder-mobile-tabs { display: none }`
  - `≤720px`: `.nav-tabs { display: none }`, `.nav-tabs-mobile { display: flex }`, container padding shrinks, `.inst-row` → single col, `.inst-row.head { display: none }`, `.actions { justify-content: flex-start }`
  - `≥721px`: `.nav-tabs-mobile { display: none }`
- Print media:
  ```css
  @media print {
    body > *:not(#print-portal) { display: none !important; }
    #print-portal { display: block; }
  }
  ```

---

## A3. Install dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities clsx tailwind-merge
```

---

## A4. `src/utils/cn.ts` (new)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

---

## A5. `src/components/ui/` — 9 new files
All use CSS class names from A2. No props defined here — props spec in `plan-b-logic.md § B0`.

- **`Button.tsx`** — renders `.btn` + variant/size modifier classes
- **`Input.tsx`** — renders `.input`; wrapper div for prefix/suffix slot
- **`Select.tsx`** — renders `.select`
- **`Toggle.tsx`** — renders `.toggle` div with `data-on` attribute (not native checkbox)
- **`Modal.tsx`** — renders `.modal-backdrop` + `.modal` with header/body/footer slots
- **`DragHandle.tsx`** — renders 6-dot grip SVG (3×2 grid of circles), `aria-label="Drag to reorder"`
- **`Combobox.tsx`** — text input + filtered dropdown list below; keyboard nav (↑↓ Enter Esc); closes on outside click
- **`SvgIcon.tsx`** — renders inline SVG from string; used by field type list icons and registry plugins
- **`Brand.tsx`** — brand mark + optional wordmark; props: `nameHidden?: boolean`, `noLink?: boolean`; used in topbar + Suspense fallback

---

## A6. `src/pages/Home.tsx` — full redesign
Match `homeScreen()` from `/tmp/design-bundle/form-builder/project/screens.js`.

Structure:
```
<topbar>          brand + nav tabs (Templates active) + Import JSON + New form
<main.page>
  <div.container>
    <div.home-hero>   h1 "Templates" + subtitle + CTA buttons
    <div.home-filters>  search input + All/Recent/Archived + Sort label
    <div.template-grid>
      new-card (dashed, "Start a blank form")
      template-card × N (swatch + name + desc + meta footer)
```

Template card details:
- 28×28 rounded swatch (color from template data; default `oklch(0.62 0.15 35)`)
- `⋯` button top-right (ghost icon)
- Name: font-weight 500, 15px
- Desc: 2-line clamp, muted, 12.5px
- Footer: "N fields · N responses" + updated time, mono 11.5px, top divider

Links:
- New form → `/builder/new`
- Card click → `/builder/:id`
- Responses footer stat → `/templates/:id/instances`
- `⋯` menu → delete template

Data: stub array of 6 hardcoded templates (same as `screens.js`); empty state `.empty` when none.

---

## A7. `src/pages/BuilderPage.tsx` — layout shell
Match `builderScreen()` + `builderScreenMobile()`.

**Topbar** (builder variant):
- Brand mark only (no nav tabs)
- Editable title: `<input class="input-bare builder-title-input">`
- Status: "14 fields · saved 12:04" (`.builder-status`, mono)
- Settings icon button, Preview secondary, Publish primary

**Left pane** (260px, surface-2):
- Sticky header "ADD FIELD"
- Field type groups: Input (Short text T / Paragraph P / Number N / Date D / Time / Phone / Email / URL / Address), Choice (Single select S / Multi select M / Linear scale / Rating), Special (File upload / Signature / Section header H / Calculation)
- Each row: 24×24 icon box + label + optional kbd chip
- Divider + help text at bottom

**Center canvas**:
- `form-header-card`: 4px ink top border, editable title h2 + desc p
- Canvas field cards (see field card spec below)
- `+ Add field` dashed bar

**Canvas field card**:
- Absolute grip (left: −22px, opacity 0→1 on hover/selected)
- Body: label row (label + required asterisk + Conditional/Hidden chips) + optional desc + field preview
- Footer: type label (mono) + required indicator + Duplicate/Branch/Required toggle/Delete buttons
- `data-selected`: left 3px coral border + ink border
- `data-hidden`: 0.55 opacity

**Right pane** (320px):
- Tabs: Field | Logic | Validation
- Field group: label input, desc input, variant picker (2×2 grid for single-select)
- Options group: sortable option rows (grip + radio dot + input + delete) + Add option + Bulk paste + toggles (Allow Other, Shuffle)
- Conditions group: condition row cards + Add condition button
- Required/Visible default toggles

**Mobile (≤1024px)**:
- `.builder-mobile-tabs`: Add / Form(14) / Settings buttons (sticky below topbar)
- Panes as off-canvas fixed drawers

Stub: 7 hardcoded fields matching the design mockup.

---

## A8. `src/pages/FillPage.tsx` — layout shell
Match `fillScreen()`.

Structure:
```
<topbar>   brand + "Save PDF" ghost button
<div.fill-shell>
  <div.fill-progress>   "STEP 1 OF 1" + "62% COMPLETE" + coral progress bar
  <div.fill-header>     4px ink top border + form title h1 + desc p
  fill-card × N        (q-label + q-desc + field renderer + optional error-msg)
  <div.fill-footer>     draft status text + Save & exit + Submit response
```

Field renderer stubs (hardcoded sample for each type):
- text-single: `<input class="input">`
- text-multi: `<textarea class="textarea">`
- single-select radio: `.choice-list` with `.choice-row` items
- single-select tiles: `.tile-grid` with `.tile` items
- linear-scale: `.scale-row` + `.scale-endpoints`
- rating: `.stars-row` with `.star-btn`
- phone: `.phone-row` (select + input)
- signature: `.signature-pad` (with sample SVG path when signed)
- calculation: `.calc-result` (number + formula)
- file-upload: `.file-drop`
- multi-select: `.choice-list` with checkbox `.box`

Error state: second card shows `data-error="true"` + `.error-msg` with alert icon.

Stub: hardcoded sample form matching design mockup.

---

## A9. `src/pages/InstancesPage.tsx` — layout shell
Match `instancesScreen()`.

Structure:
```
<topbar>   brand + Templates/Responses tabs (Responses active)
<main.page>
  <div.container>
    <div.inst-header>   label-mono ID chip + h1 + subtitle + CSV/Edit/Open buttons
    <div.home-filters>  search + All/Submitted/Drafts
    <div.inst-table>
      inst-row.head    ID / Respondent / Submitted / Status / Actions
      inst-row × 6    data rows (mono ID, name+email, date, status chip, action buttons)
```

Status chips: `.chip-success` for "submitted", plain `.chip` for "draft".
Action buttons per row: Download PDF (icon), View (text), ⋯ (icon).

Mobile ≤720px: rows collapse to single-col, head row hidden, actions left-aligned.

Stub: 6 hardcoded rows matching design mockup.

---

## A10. `src/router.tsx` — update
5 lazy pages. `AuthGuard` as nested layout route (see `code-splitting-plan.md` for full router shape).

```typescript
const Home          = lazy(() => import('./pages/Home'))
const BuilderPage   = lazy(() => import('./pages/BuilderPage'))
const FillPage      = lazy(() => import('./pages/FillPage'))
const InstancesPage = lazy(() => import('./pages/InstancesPage'))
const LoginPage     = lazy(() => import('./pages/LoginPage'))
```

Public routes: `/login`, `/fill/:templateId`  
Protected (children of AuthGuard layout): `/`, `/builder/new`, `/builder/:id`, `/templates/:id/instances`

Suspense fallback: `<Brand nameHidden noLink />` centred on `--bg` background.

---

## Verification
1. `npm run build` — zero TypeScript errors
2. `/` renders Geist font, warm bg, coral swatches, responsive grid (3 col → 2 → 1)
3. `/builder/new` — 3 panes at 1280px; mobile tabs + canvas only at 390px
4. `/fill/x` — progress bar, field cards, error state card styled correctly
5. `/templates/x/instances` — 5-col table at desktop, stacked at 390px
6. `nav-tabs-mobile` visible ≤720px, hidden ≥721px
