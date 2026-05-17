# Smart Form Builder

A browser-based form builder. Builder Mode to design templates, Fill Mode to collect responses, PDF export for every submission. Everything persists in `localStorage` — no backend.

**Live demo:** https://smart-form-builder-six.vercel.app/

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build (tsc -b && vite build)
npm run preview      # preview production build
npm run test:run     # run test suite once
npm test             # watch mode
npm run coverage     # coverage report
```

---

## localStorage schema

All keys are namespaced with `fb:` to avoid origin-level collisions.

| Key | Shape | Purpose |
|-----|-------|---------|
| `fb:templates` | `TemplateSummary[]` | Index for the home page list — avoids reading every full template just to render cards |
| `fb:template:{id}` | `Template` | Full template: fields, conditions, settings. Only loaded when editing or filling |
| `fb:instances:{templateId}` | `InstanceSummary[]` | Per-template index of submissions — cheap to scan for counts and timestamps |
| `fb:instance:{id}` | `Instance` | Full submission with answers and a field config snapshot |
| `fb:draft:{templateId}` | `Map<fieldId, FieldValue>` | In-progress fill. Cleared on submit. Survives refresh. |
| `fb:session` | `Session` | Current user session |
| `fb:users` | `Record<email, Session>` | User registry so returning users get the same ID |
| `fb:user-templates:{userId}` | `string[]` | Ownership index for access control |

**Why the two-level pattern (summary index + full record):** it mirrors what you'd do against a real database — the list view reads the lightweight index, the edit/fill views load a single full record. This keeps the home page fast even with many templates. When we eventually add a backend, the storage adapters in `src/storage/` are the only files that change.

**Why field snapshots in instances:** at submission time, `Instance.fieldSnapshots` captures the full field config alongside the answers. This means re-downloading a PDF months later shows the labels and structure as they were when the form was filled, not whatever the template looks like today after edits.

---

## Architecture

> **Architecture diagrams (HLD · LLD · sequence):** [docs/architecture.md](docs/architecture.md)

```
src/
├── registry/        # One file per field type — the only place that changes when adding a field
├── logic/           # Pure functions: condition evaluator, calculation engine, validation
├── state/           # Reducers: builderReducer, fillReducer
├── storage/         # localStorage adapters — swappable for a real backend
├── hooks/           # useBuilder, useFill, useHome, useStorage, useDebounce
├── contexts/        # BuilderContext, FillContext, SessionContext
├── pages/           # Route-level components
├── components/
│   ├── builder/     # Builder UI: FieldList, ConfigPanel, ConditionEditor, AddFieldMenu
│   ├── fill/        # Fill UI: FormField, FillToolbar, ProgressBar, PostSubmitScreen
│   ├── print/       # PrintView — isolated from Tailwind for window.print()
│   └── ui/          # Shared primitives: Button, Input, Modal, Toggle, ErrorBoundary
├── types/           # TypeScript interfaces — FieldConfig union, Instance, Template
├── enums/           # Shared enums: FieldKind, ConditionOperator, ConditionEffect
└── constants/       # Operator definitions, icons, group labels
```

### Adding an 11th field type

1. Create `src/registry/my-field.tsx` implementing `FieldPlugin<MyFieldConfig>`
2. Add one line to `src/registry/index.ts`: `registerField(myFieldPlugin)`

No other file changes. The plugin interface is the full contract:

```typescript
interface FieldPlugin<T extends FieldConfig> {
  kind: FieldKind;
  displayName: string;
  icon: string;
  group: FieldGroup;
  createDefault: (id: string) => T;                                  // initial config when added
  ConfigEditor: ComponentType<ConfigEditorProps<T>>;                 // right panel in Builder
  FieldRenderer: ComponentType<FieldRendererProps<T>>;               // renders in Fill mode
  validate: (value: FieldValue, config: T, required: boolean) => string | null;
  formatForPrint: (value: FieldValue, config: T) => string | null;   // PDF output
  isDisplayOnly?: boolean;   // section headers — no value, no validation
  isComputed?: boolean;      // calculation fields — value set by engine, not user
}
```

The `ConfigEditor` and `FieldRenderer` receive `config` typed to `T` specifically, not the wide `FieldConfig` union. TypeScript enforces this through the `FieldPlugin<T>` generic. A Number plugin cannot accidentally read `options` from its config.

---

## Type safety

Types in this codebase are meant to communicate design intent, not just satisfy the compiler.

**Discriminated union on `kind`** (`src/types/fields.ts`):
```typescript
type FieldConfig =
  | TextSingleConfig   // kind: FieldKind.TEXT_SINGLE
  | NumberConfig       // kind: FieldKind.NUMBER
  | DateConfig         // kind: FieldKind.DATE
  | SingleSelectConfig // kind: FieldKind.SINGLE_SELECT
  | ...                // 17 total
```
Switching on `field.kind` narrows the type fully. No casting, no optional chaining on `config.options` inside a Number renderer — TypeScript simply won't allow it.

**`FieldValue` union** documents exactly what a field can answer:
```typescript
type FieldValue = string | number | string[] | boolean | SignatureValue | AddressValue | null;
```
Any code that stores or reads field answers is constrained to this set. There's no `unknown` drift.

**`as never` casts have `// SAFETY:` comments** explaining why the cast is correct — e.g., why a function parameter is guaranteed non-null at that call site. This distinguishes "I thought about this" from "I silenced a type error."

Zero `any` in source. ESLint enforces this as an error-level rule.

---

## Conditional logic

### Evaluation model

All conditions on a field are evaluated independently. **Last matching effect wins** (left to right). Visibility and required state are tracked separately.

```
field.conditions.forEach(condition => {
  if (evaluateCondition(condition, targetFieldCurrentValue)) {
    apply(condition.effect);   // SHOW | HIDE | REQUIRE | UNREQUIRE
  }
})
```

This is neither pure AND nor pure OR. It is sequential override, which turns out to be the most expressive model for real form logic:

- **OR visibility**: set `defaultVisible: false`, add two SHOW conditions → field appears when either fires
- **AND visibility**: set `defaultVisible: false`, add two SHOW conditions where each shows on its own, and rely on the last to stick — not a natural AND. For true AND, use a single condition with the most specific operator
- **Override chain**: SHOW condition followed by a HIDE condition → later HIDE wins when it fires

### Chained conditions

Field A can condition on Field B, which itself conditions on Field C. Handled via topological sort before evaluation (`src/logic/conditionEvaluator.ts`). The sort ensures C is fully evaluated before B is evaluated, and B before A. No stale intermediate states.

**Circular dependency**: detected during the sort. Fields in a cycle fall back to their `defaultVisible` / `defaultRequired` and log a warning. This is the only safe fallback — refusing to render would break the form entirely.

### Hidden target propagation

If Field B is hidden, its value is treated as `null` when evaluating Field A's condition that targets B. A user cannot fill a hidden field, so conditioning on its value is meaningless — treating it as null ensures Field A falls back to its own default state. This prevents ghost dependencies where a field's visibility flickers based on a value the user never set.

### Hidden-but-required

The validation engine (`src/logic/validationEngine.ts`) only validates visible fields. A field that is `defaultRequired: true` and currently hidden by a condition is invisible to validation — it will not block submission and will not appear in the submitted data or PDF. The required constraint is dormant, not deleted. If the field becomes visible again, required validation resumes.

### Real-time updates

Every `SET_ANSWER` action in `fillReducer.ts` runs the full evaluation pipeline:
1. `evaluateAllFields(fields, answers)` → new visibility map
2. `applyCalculations(fields, answers, visibilityMap)` → updated computed values
3. React re-renders only the affected fields via `React.memo` on `FormField`

There is no debounce on condition evaluation. The spec requires real-time behaviour and the evaluation is O(n) over field count, fast enough for any realistic form.

---

## Product decisions — spec gaps

The spec leaves roughly 15–20% of behaviour unspecified. These are the decisions made:

**Target field has no value yet.**
Comparison operators (`equals`, `contains`, `greater than`, etc.) return `false` when the target value is null. `IS_EMPTY` returns `true`. This means a SHOW condition fires only once the user has entered something — sensible default.

**Calculation with hidden source fields.**
Hidden source fields are excluded from the calculation. If a Quantity field is hidden by a condition and the user can't see it, including it in a Total would produce a confusing phantom value.

**`contains_none_of` with an empty selection.**
Returns `true` (vacuous truth). No values are excluded, so the condition holds. Consistent with standard set semantics.

**Section headers in conditional logic.**
Section headers can have conditions applied to them, which hides or shows the entire section's visual grouping. This is not in the spec but is the obvious product behaviour — every form builder supports section-level visibility.

**Empty form submission.**
Allowed when no fields are required. A form with only optional fields or section headers should be submittable.

**Calculation with no source fields configured.**
Renders as empty/null. Not an error. The builder shows the field with no value until source fields are added.

**`Other` option ID collision prevention.**
The sentinel `__other__` is used as the option ID for the "Other" choice. Regular option IDs are `crypto.randomUUID()` values, so collision is impossible.

**Draft keyed by templateId, not instanceId.**
A draft represents "in-progress work on this form." One draft per template per browser is sufficient for the spec's use case. It is cleared on successful submit, and loaded automatically when the same form is opened again.

**Preview opens a new tab.**
The spec says "inline or in a modal." Opening a new tab was chosen because: (a) the template auto-saves before preview so the new tab always shows the current state, (b) a modal would require a separate in-memory snapshot, and (c) the user can interact with builder and fill simultaneously by switching tabs. A modal blocks the builder.

**Date comparison.**
ISO 8601 date strings (`YYYY-MM-DD`) are lexicographically ordered, so `"2024-03-15" < "2024-04-01"` is a correct string comparison. No date parsing, no timezone issues. This holds as long as date inputs produce ISO strings, which the native `<input type="date">` guarantees.

**File upload.**
Files are stored as `{ name, size, type }` metadata only. File contents are never read. Re-downloading a submitted PDF lists the filenames. If a user needs to prove they submitted a specific file, they need to retain their own copy — which is normal product behaviour (think: uploading a CV to a job application form).

**Multi-select operator values.**
For `contains any of / all of / none of`, the condition value stores comma-separated option IDs (not labels). This means conditions remain correct even if the option label is later renamed in the builder.

---

## PDF export

`window.print()` triggered against a React portal mounted into a detached DOM node. The portal renders `<PrintView>` — a dedicated component that uses inline styles throughout, not Tailwind classes, because Tailwind's CSS layer is scoped to the main document and unavailable in the print context.

The export includes:
- Form title and description
- Submission timestamp
- All visible fields (hidden fields excluded)
- Labels and formatted answer values
- Signature fields as inline base64 images
- File uploads as a named list
- Section headers as visual dividers
- Calculation fields showing their computed result

The output reads as a document, not a data dump. Field labels are typographically distinct from answers. Section structure is preserved.

The spec prohibits third-party PDF libraries. `window.print()` is the correct browser-native path — it delegates to the OS print dialog, which produces PDFs with vector text, correct font rendering, and page layout. Canvas-based approaches produce rasterised output with no text selection.

---

## Beyond the spec

Everything in this section was added on top of the ten required field types and three required views. None of it required changing the core plugin architecture.

### Authentication and access control

Email-based session (no password). On first visit a user enters their email and display name — the app looks up an existing session by email or creates a new one. Sessions persist in `localStorage` under `fb:session`.

Template ownership is tracked separately in `src/storage/accessStore.ts`. Each user sees only their own templates on the home page. Attempting to open another user's template in Builder Mode redirects to the public fill URL instead. Fill URLs are always public — a respondent does not need an account.

This is the minimal access model that makes the product usable in a shared environment. It is not security: anyone can spoof an email in localStorage. A real auth layer would swap out `authStore.ts` only.

### Test suite

**38 test files, 704 test cases.** Coverage is intentionally asymmetric:

- **100% on business logic**: `conditionEvaluator`, `calculationEngine`, `validationEngine`, `builderReducer`, `fillReducer` — these are pure functions and the correctness guarantees matter
- **Full page integration tests**: `BuilderPage.interactions.test.tsx` and `FillPage.interactions.test.tsx` test the builder → fill → submit flow end to end, including conditional visibility and calculation updates
- **All 17 field plugins**: validators and config editors exercised via umbrella test files
- **Hook-level tests**: `useBuilder`, `useFill`, `useHome`, `useLogin`, `useInstancesPage` — the state management layer

Primitive UI components (Button, Input, Modal) have lower coverage. They are stable contracts with no logic, and the page integration tests exercise them indirectly.

### Debouncing

`src/hooks/useDebounce.ts` — a custom hook (no lodash). Used in the Multi Select field renderer to debounce the search filter input at 300ms. Without it, every keystroke triggers a filter pass over the options list and re-renders the option set. The hook is unit-tested with Vitest's fake timers (11 test cases covering delay, cancellation, and cleanup).

### List virtualisation

The home page template grid is virtualised with `@tanstack/react-virtual` (`useWindowVirtualizer`). Templates are laid out in rows; only the visible rows are mounted. With 4 items per row and `overscan: 4`, this caps DOM nodes regardless of how many templates exist. The home page is the only list large enough to benefit — field lists in the builder and fill mode are bounded by practical form size.

### Code splitting

All five pages are lazy-loaded via React `lazy()` + `Suspense` (`src/router.tsx`). Vite's `manualChunks` config splits the bundle into vendor (React, React-DOM), router (`react-router-dom`), and app chunks. The builder, fill, and home pages do not pay for each other's code at load time.

### Performance: React.memo

`FormField`, `FillToolbar`, `ProgressBar`, `FieldListItem`, `AddFieldMenu`, `BuilderToolbar`, `ConfigPanel`, and `ConditionEditor` are all wrapped with `memo`. In Fill Mode, a `SET_ANSWER` action re-renders the context — without `memo`, every `FormField` on the page would re-render on every keystroke. With it, only the field whose answer changed re-renders (assuming stable `onChange` references from the parent, which the fill hook provides via `useCallback`).

### Error boundaries

`src/components/ui/ErrorBoundary.tsx` — a class component with `getDerivedStateFromError` + `componentDidCatch`. Placed at four points:

- **Root** (`App.tsx`) — catches any unhandled crash with a full-page fallback
- **BuilderPage outer** — isolates the builder from session/routing errors
- **FieldList in BuilderPage** — a broken field plugin won't crash the entire builder
- **ConfigPanel in BuilderPage** — a broken config editor won't crash the canvas
- **Field list in FillPage** — a broken field renderer shows an error and a retry button rather than a blank form

### Extra field types

Eight field types beyond the required ten: **Email**, **URL**, **Phone**, **Time**, **Address** (with optional street2/state/zip), **Rating** (5 or 10 stars), **Linear Scale** (0–10 configurable), **Signature** (canvas-based, stored as base64). Each implements the full `FieldPlugin` interface. Removing any of them is one line in `src/registry/index.ts`.

### Extra field config options

Beyond the spec's required config options, several fields have additional settings:

- Single and Multi Select: **Combobox** display variant (searchable dropdown), **"Other" option** with free-text input, **shuffle options** (Fisher-Yates on form load), configurable **column count** (1–3)
- Date: **disabled days of week** (e.g., disable weekends)
- File Upload: **max file size in MB**
- Section Header: optional **description text** and **horizontal divider** toggle
- Text fields: **validation regex pattern** with custom error message
- Number: configurable **step**

### Template and response management

- **Template settings modal**: configure submission confirmation message, toggle progress bar, toggle auto-save draft
- **CSV export**: download all responses for a template as a CSV file from the instances list page
- **Search responses**: filter the instances list by response ID
- **Delete responses**: remove individual submissions
- **Duplicate fields**: copy a field and its full config in the builder

### Mobile layout

Custom breakpoints (`--breakpoint-mob: 721px`, `--breakpoint-canvas: 1025px`) defined in CSS variables. The three-panel builder collapses to a single-panel view on narrow screens with drawer toggles for the left (Add Field) and right (Config) panels. Fill mode has a single-column layout throughout.

### Accessibility

- **Modal**: focus trap on open, restores focus on close, `role="dialog"` + `aria-modal` + `aria-labelledby`, Escape to close
- **Combobox**: full ARIA live region (`role="combobox"`, `aria-expanded`, `aria-autocomplete`, `aria-activedescendant`), keyboard navigation (Arrow Up/Down, Enter, Escape)
- **Toggle**: `role="switch"` + `aria-checked` + `aria-disabled`
- **ProgressBar**: `role="progressbar"` + `aria-valuenow` + `aria-valuemin/max`
- **DragHandle**: `aria-label` for screen readers, keyboard-accessible via `@dnd-kit`'s `KeyboardSensor`
- Semantic heading hierarchy throughout (h1 on fill form title, h2 on builder form preview, h3 on panel headings)

---

## What I'd improve with more time

**PDF fidelity.** `window.print()` produces a good result but layout is browser-controlled. A headless rendering approach (e.g., Playwright-based print-to-PDF in a serverless function) would give pixel-precise output with guaranteed page breaks and consistent cross-browser rendering. The `formatForPrint` plugin method is already designed for this — the data pipeline is correct, only the rendering layer would change.

**Per-field error isolation in Fill Mode.** `ErrorBoundary` currently wraps the entire field list. A plugin with a render bug breaks all fields below it. Wrapping each `<FormField>` individually would limit blast radius to one field.

**Undo / redo in the builder.** The builder state is a pure reducer already. Adding undo/redo is a matter of keeping a history stack alongside the current state — no architectural change needed. Without it, accidentally deleting a field with conditions is unrecoverable.

**Drag-to-reorder options.** Single and Multi Select options currently support add/remove but not reorder. The same `@dnd-kit` setup used for the field list could be applied to option lists with minimal additional code.

**Real-time collaboration safety.** Multiple tabs editing the same template will silently clobber each other on save. A `lastModified` timestamp comparison before write, with a conflict warning, would prevent data loss without needing a backend.

**Condition editor UX for chained fields.** The condition editor shows all eligible fields as targets but gives no indication of chain depth or potential conflicts. A dependency graph visualisation (even a simple text summary: "this field depends on X which depends on Y") would help form builders reason about complex logic.

**Storage limit handling.** `localStorage` is limited to 5–10 MB depending on the browser. The storage adapters currently catch `QuotaExceededError`, but there is no proactive warning when approaching the limit. Forms with many large signature fields could hit this silently.

**Test coverage on UI components.** Business logic (reducers, evaluator, validation, calculations) is fully tested. UI component tests cover pages and hooks but only ~45% of the primitive components.
