# Phase B — Logic Implementation

Prerequisite: Phase A complete (`plan-a-ui.md`).  
Full spec: `/Users/self/Desktop/workflow/github/bu/plan.md`

---

## B0. `src/components/ui/` — props contracts
Defined here; Phase A shells have no prop types until this phase wires them.

- **`Button.tsx`** — `variant: 'primary'|'secondary'|'ghost'|'danger-ghost'`, `size?: 'sm'|'md'|'lg'`, `icon?: boolean`, `block?: boolean`; forwards all native `<button>` attrs
- **`Input.tsx`** — forwards ref; `error?: string` (adds danger border class); `prefix?: ReactNode`, `suffix?: ReactNode`; forwards native `<input>` attrs
- **`Select.tsx`** — forwards ref; children as `<option>` elements; forwards native `<select>` attrs
- **`Toggle.tsx`** — `checked: boolean`, `onChange: (checked: boolean) => void`, `disabled?: boolean`
- **`Modal.tsx`** — `open: boolean`, `title: string`, `onClose: () => void`, `children: ReactNode`; `.modal-backdrop` click + Escape key both call `onClose`; traps focus inside while open
- **`DragHandle.tsx`** — forwards dnd-kit `listeners` + `attributes` from `useSortable`; no other props
- **`Combobox.tsx`** — `value: string`, `onChange: (value: string) => void`, `options: Array<{ id: string; label: string }>`, `placeholder?: string`; stores selected option id; filters by label substring on input

---

## B1. `src/types/` — 6 new files

**`fields.ts`**
```typescript
export type FieldKind =
  | 'text-single' | 'text-multi' | 'number' | 'date' | 'time'
  | 'single-select' | 'multi-select' | 'file-upload'
  | 'section-header' | 'calculation'
  | 'rating' | 'linear-scale' | 'phone' | 'signature';

export const OTHER_OPTION_ID = '__other__';

interface FieldBase {
  id: string; kind: FieldKind; label: string; description?: string;
  conditions: Condition[]; defaultVisible: boolean; defaultRequired: boolean;
}
// + all 14 *Config interfaces (see plan.md for full definitions)
export type FieldConfig = TextSingleConfig | TextMultiConfig | NumberConfig | DateConfig
  | TimeConfig | SingleSelectConfig | MultiSelectConfig | FileUploadConfig
  | SectionHeaderConfig | CalculationConfig | RatingConfig | LinearScaleConfig
  | PhoneConfig | SignatureConfig;

export type FieldValue =
  | string | number | string[] | boolean
  | { base64: string; width: number; height: number }
  | null;
```

**`conditions.ts`** — `ConditionOperator`, `Condition`, `ConditionEffect`, `FieldVisibilityState`  
**`template.ts`** — `TemplateSettings` (5 fields), `DEFAULT_TEMPLATE_SETTINGS`, `Template`, `TemplateSummary`  
**`instance.ts`** — `FieldAnswer`, `Instance` (snapshots full field configs at submit time), `InstanceSummary`  
**`registry.ts`** — `FieldPlugin<T>`, `ConfigEditorProps<T>`, `FieldRendererProps<T>`  
**`index.ts`** — barrel re-export all

---

## B2. `src/utils/id.ts` + `src/utils/pdf.ts`

**`id.ts`**
```typescript
export function generateId(): string { return crypto.randomUUID(); }
```

**`pdf.ts`**
```typescript
export async function exportToPDF(
  template: Template,
  instance: Instance,
  visibilityMap: Map<string, FieldVisibilityState>,
): Promise<void> {
  const container = document.createElement('div');
  container.id = 'print-portal';
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  root.render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
  await new Promise(resolve => requestAnimationFrame(resolve));
  window.print();
  window.addEventListener('afterprint', () => {
    root.unmount();
    document.body.removeChild(container);
  }, { once: true });
}
```

---

## B3. `src/storage/` — 3 new files

**`keys.ts`**
```typescript
export const TEMPLATES_KEY = 'fb:templates';
export const templateKey = (id: string) => `fb:template:${id}`;
export const instancesKey = (tid: string) => `fb:instances:${tid}`;
export const instanceKey = (id: string) => `fb:instance:${id}`;
```

**`templateStore.ts`** — `listTemplates()`, `getTemplate(id)`, `saveTemplate(t)`, `deleteTemplate(id)`
- All JSON ops wrapped in try/catch
- `QuotaExceededError` → re-throw with user-friendly message
- Corrupted JSON → `console.warn` + return empty state

**`instanceStore.ts`** — `listInstances(tid)`, `getInstance(id)`, `saveInstance(i)`, `deleteInstance(id)`, `saveDraft(instance)`, `getDraft(tid)`, `clearDraft(tid)`
- Draft key: `fb:draft:{templateId}`

---

## B4. `src/logic/` — 3 new files

**`conditionEvaluator.ts`**
```typescript
export function evaluateAllFields(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
): Map<string, FieldVisibilityState> {
  // 1. Init from defaults
  // 2. Kahn's topological sort on condition dependency graph
  //    - Build adjacency: field → fields that have conditions targeting it
  //    - Cycle detection → defaultVisible fallback + console.warn
  // 3. For each field in sorted order:
  //    - Hidden target → treat targetValue as null
  //    - Evaluate each condition against targetValue
  //    - Apply effect: show/hide/require/unrequire
  // 4. Return Map<fieldId, FieldVisibilityState>
}
```

**`calculationEngine.ts`**
- `computeCalculation(config: CalculationConfig, answers, visibilityMap)` → `number | null`
- Collect values for `sourceFieldIds` where field is visible + has numeric value
- Hidden source → excluded (not zero)
- All sources hidden → return `null` (renders "—")
- Operations: Sum, Avg (denominator = visible source count), Min, Max

**`validationEngine.ts`**
- `validateAll(fields, answers, visibilityMap)` → `Map<string, string>` (fieldId → error message)
- Skip: hidden fields, `isDisplayOnly`, `isComputed`
- For each visible non-display non-computed field: call `plugin.validate(value, config, required)`
- `plugin.validate` returns `string | null` (null = valid)

---

## B5. `src/registry/` — 15 new files

**`index.ts`**
```typescript
const REGISTRY = new Map<FieldKind, FieldPlugin<FieldConfig>>();
export function registerField<T extends FieldConfig>(plugin: FieldPlugin<T>): void
export function getPlugin(kind: FieldKind): FieldPlugin<FieldConfig>
export function getAllPlugins(): FieldPlugin<FieldConfig>[]
// imports + registers all 14 plugins at bottom of file
```

**14 plugin files** — each exports `FieldPlugin<T>` with:
- `kind`, `displayName`, `icon` (SVG string), `group`
- `createDefault(id)` → T with sensible defaults
- `ConfigEditor: ComponentType<ConfigEditorProps<T>>` — builder config UI
- `FieldRenderer: ComponentType<FieldRendererProps<T>>` — fill UI
- `validate(value, config, required)` → `string | null`
- `formatForPrint(value, config)` → `string | null`

Plugin-specific notes:
- **text-single** / **text-multi**: regex validation — `new RegExp(validationPattern)` with try/catch; invalid regex = no-op + `console.warn`
- **single-select**: 4 variants (radio/dropdown/tiles/combobox); Fisher-Yates shuffle on fill mount when `shuffleOptions`; Other pinned last after shuffle; `OTHER_OPTION_ID` handling; `allowOther` → inline free-text input when selected; stored as `'__other__:<text>'`; `formatForPrint` strips prefix
- **multi-select**: same Other + shuffle logic; `searchable` → text filter above checkbox list (never auto-enabled); `minSelections`/`maxSelections` validation
- **calculation**: `isComputed=true`; `FieldRenderer` calls `calculationEngine.computeCalculation()` with context answers; value derived, not user-entered; `createDefault` creates `{ operation: 'sum', sourceFieldIds: [] }`
- **section-header**: `isDisplayOnly=true`; 5 size variants (XS/S/M/L/XL); no value, no validation, `formatForPrint` returns null
- **signature**: canvas element, pointer events for drawing; Clear button unmounts/remounts canvas; stores `{ base64: canvas.toDataURL(), width, height }`; `formatForPrint` returns base64 for `<img>` in print
- **file-upload**: metadata only — stores `Array<{ name, size, type }>`; no actual file binary; drop zone + click to open file picker
- **date**: `prefillToday` toggle — on mount set value to `new Date().toISOString().slice(0,10)` clamped to `[minDate, maxDate]`; `minDate > maxDate` builder blocks save
- **phone**: country code select (E.164 prefix list ~50 entries); combined value `"${code}${number}"`
- **rating**: `maxRating: 5 | 10`; star buttons, hover highlights up to hovered; value = selected count
- **linear-scale**: `minValue: 0 | 1`, `maxValue: 2–10`; numbered buttons; `minLabel`/`maxLabel` below endpoints

---

## B6. `src/contexts/` — 2 new files

**`BuilderContext.tsx`**

State:
```typescript
interface EditorState {
  template: Template;
  selectedFieldId: string | null;
  isDirty: boolean;
}
```

Actions:
- `ADD_FIELD` — append + auto-select
- `REMOVE_FIELD` — remove by id, clear selectedFieldId if matches
- `UPDATE_FIELD` — replace field by id
- `MOVE_FIELD` — reorder (from/to indices)
- `SELECT_FIELD` — set selectedFieldId
- `DUPLICATE_FIELD` — deep clone + new UUID via `generateId()` + clear `conditions` + insert after original + select clone
- `UPDATE_SETTINGS` — merge TemplateSettings
- `SET_TITLE` — update template.title
- `MARK_SAVED` — set isDirty = false

Auto-persist: call `templateStore.saveTemplate()` on every mutating action.

**`FillContext.tsx`**

State:
```typescript
interface FillState {
  template: Template;
  instance: Instance;
  answers: Map<string, FieldValue>;
  visibilityMap: Map<string, FieldVisibilityState>;
  errors: Map<string, string>;
  submitted: boolean;
}
```

Actions:
- `SET_ANSWER` — update answers + re-run `evaluateAllFields()` + re-run all `calculationEngine` computations + auto-draft save if `autoSaveDraft`
- `SUBMIT` — run `validateAll()`, set errors; if empty set submitted=true + `instanceStore.saveInstance()` + `instanceStore.clearDraft()`
- `RESET` — clear answers/errors/submitted, new instance id, load fresh draft check
- `LOAD_DRAFT` — load draft answers from `instanceStore.getDraft()`

---

## B7. `src/hooks/` — 4 new files

- **`useBuilder.ts`** — `useBuildContext()` shortcut; typed dispatch helpers: `addField(kind)`, `removeField(id)`, `updateField(config)`, `moveField(from, to)`, `selectField(id)`, `duplicateField(id)`, `updateSettings(partial)`, `setTitle(title)`
- **`useFill.ts`** — `useFillContext()` shortcut; `setAnswer(fieldId, value)`, `submit()`, `reset()`, `loadDraft()`
- **`useTemplateList.ts`** — reads `templateStore.listTemplates()` on mount; `templates`, `createTemplate()` (blank + navigate to `/builder/:id`), `deleteTemplate(id)`, `refresh()`
- **`useStorage.ts`** — `useStorage<T>(key: string, defaultValue: T)` — reads JSON from localStorage; writes on set; handles parse errors + quota errors

---

## B8. `src/components/builder/` — 7 new files

**`FieldList.tsx`**
- `DndContext` + `SortableContext` from `@dnd-kit/sortable`
- `onDragEnd` → dispatch `MOVE_FIELD` with from/to indices
- Renders `<FieldListItem>` per field

**`FieldListItem.tsx`**
- `useSortable(id)` hook; `<DragHandle>` with sortable listeners + attributes
- Click anywhere → `selectField(field.id)`
- Duplicate button → `duplicateField(field.id)`
- Delete button → `removeField(field.id)` (confirm if last field)
- Required toggle → `updateField({ ...field, defaultRequired: !field.defaultRequired })`
- Shows Conditional chip if `field.conditions.length > 0`
- Shows Hidden chip if `field.defaultVisible === false`

**`AddFieldMenu.tsx`**
- `getAllPlugins()` grouped by `plugin.group` (input/select/display/special)
- Click → `plugin.createDefault(generateId())` → `addField` → `selectField`
- Keyboard shortcuts: T→text-single, P→text-multi, N→number, D→date, S→single-select, M→multi-select, H→section-header

**`ConfigPanel.tsx`**
- Gets `selectedField` from context (`state.template.fields.find(f => f.id === selectedFieldId)`)
- Tabs: Field | Logic | Validation
- Field tab: renders `plugin.ConfigEditor` with `config=selectedField, allFields, onChange=f=>updateField(f)`
- Logic tab: renders `<ConditionEditor>`
- Validation tab: required toggle + visible-by-default toggle

**`ConditionEditor.tsx`**
- Lists `field.conditions`; add/remove/update
- Each row: effect select (show/hide/require/unrequire) + target field picker (all fields except self, display-only fields excluded as targets for show/hide/require) + operator select + value input
- `operator` options depend on target field kind:
  - Number/Calculation: equals, not_equals, greater_than, less_than, is_empty, is_not_empty
  - Text: equals, not_equals, contains, is_empty, is_not_empty
  - Select: equals, not_equals, is_empty, is_not_empty
- `onChange` dispatches `UPDATE_FIELD` with updated conditions array

**`TemplateSettingsModal.tsx`**
- `<Modal>` wrapping 5 toggle rows + confirmationMessage textarea
- Toggle rows: Show progress bar / Confirmation message / Show "submit another" link / Auto-save draft / Allow response editing
- All `onChange` dispatch `UPDATE_SETTINGS`

**`BuilderToolbar.tsx`**
- Title `input-bare`: `onBlur`/`onKeyDown(Enter)` → `setTitle(value)`
- Field count: `state.template.fields.length` (excludes section-headers)
- Saved status: `isDirty ? 'unsaved changes' : 'saved HH:MM'`
- Settings button → opens `TemplateSettingsModal`
- Preview button → `navigate('/fill/${state.template.id}')`
- Publish button → `templateStore.saveTemplate(state.template)` + `markSaved()`; blocks if `template.title` empty (inline error) or any select field has 0 options

---

## B9. `src/components/fill/` — 4 new files

**`FormField.tsx`**
- Looks up `getPlugin(field.kind)`
- `visibilityState = visibilityMap.get(field.id)` — returns null if hidden
- If hidden: `return null`
- If `isDisplayOnly` (section-header): renders `plugin.FieldRenderer` without fill-card wrapper
- Otherwise: wraps in `.fill-card` with `data-error={!!error}`; renders `plugin.FieldRenderer` + error message div

**`ProgressBar.tsx`**
- Only renders when `template.settings.showProgressBar`
- Percent = answered visible non-display non-computed fields / total visible non-display non-computed
- "Answered" = value is not null/empty/[]
- `.fill-progress` with `.fill-progress-meta` (STEP + %) + `.fill-progress-bar` coral fill

**`FillToolbar.tsx`**
- Submit button → `submit()` → if `errors.size > 0` scroll to first error field (`document.querySelector('[data-error="true"]')?.scrollIntoView()`)
- Export PDF button → `exportToPDF(template, instance, visibilityMap)`
- Save & exit → `instanceStore.saveDraft(instance with current answers)` → `navigate('/')`

**`PostSubmitScreen.tsx`**
- Replaces form content when `submitted === true`
- Shows `template.settings.confirmationMessage`
- "Submit another response" link (if `showSubmitAnotherLink`) → `reset()` → new instance
- "Download PDF" button → `exportToPDF(template, instance, visibilityMap)`

---

## B10. `src/components/print/PrintView.tsx`

Print-only portal DOM (no topbar, no interaction):
```
h1  template.title
p   template.description
div.print-meta  "Response · {instance.id}" | "Submitted {submittedAt}"

for each visible field (in field order):
  if isDisplayOnly → div.print-section  field.label
  else →
    div.print-field (page-break-inside: avoid)
      div.print-q  field.label  (+ "(calculated)" if isComputed)
      div.print-a  plugin.formatForPrint(answer, config)
        signature → <img src={base64} width="240" height="48">

div.print-footer  "Generated via window.print() · Smart Form Builder"  |  "Page 1 of 1"
```
Hidden fields excluded. Null `formatForPrint` → show "—".

---

## B11. Wire pages to real data

**`Home.tsx`** → replace stub array with `useTemplateList()`:
- `templates` array from localStorage
- `createTemplate()` on "New form" click
- `deleteTemplate(id)` in `⋯` menu
- Empty state when `templates.length === 0`

**`BuilderPage.tsx`** → wrap in `<BuilderContext.Provider>`:
- On mount: if `:id` param → `templateStore.getTemplate(id)` else create blank Template
- Pass template to Provider
- Replace hardcoded field list with `<FieldList>` + `<AddFieldMenu>`
- Replace hardcoded config panel with `<ConfigPanel>`
- Replace topbar with `<BuilderToolbar>`
- Replace hardcoded canvas with `fields.map(f => <FieldListItem>)`

**`FillPage.tsx`** → wrap in `<FillContext.Provider>`:
- On mount: load template + check for existing draft (`instanceStore.getDraft(templateId)`) → `LOAD_DRAFT`
- Replace hardcoded fields with `fields.map(f => <FormField>)`
- Replace footer with `<FillToolbar>`
- Add `<ProgressBar>` (conditionally shown)
- Show `<PostSubmitScreen>` when `submitted === true`

**`InstancesPage.tsx`**:
- Load instances: `instanceStore.listInstances(templateId)`
- Load template: `templateStore.getTemplate(templateId)` for title/settings
- Show Edit button per row when `template.settings.allowResponseEditing === true`
- Edit → `navigate('/fill/${templateId}')` with instance id in state → `FillContext` loads instance answers

---

## Verification
1. `tsc --noEmit` — zero errors, zero `any`
2. Create template with all 15 field types, save → reload → persists
3. Conditional chain: Number(A) → hidden field(B, show if A>10) → required field(C, require if B visible); fill: verify correct behaviour
4. Calculation: 3 number sources, fill values, real-time update; hide one source → excluded from calc
5. Submit blocks on empty required; skips hidden required
6. PDF: `window.print()` shows only portal content; title, visible fields only, correct values, signature as img
7. Instances page: submit 2 forms → both listed; re-download PDF from list
8. `autoSaveDraft=false` → SET_ANSWER skips draft; existing draft ignored on open
9. `allowResponseEditing=true` → Edit in instances loads answers into fill; re-submit overwrites
10. `Other` option: select + type text → PDF shows text without `__other__:` prefix
11. Duplicate field: new UUID, conditions cleared, inserted after original, auto-selected
12. `localStorage` quota error: caught in store, no crash (toast in Phase A stub → real error boundary here)
