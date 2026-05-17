---
description: Scaffold a new FieldPlugin — enum entry, config type, renderer skeleton, and registry registration
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm run build*)
argument-hint: <field-name> [group] [display name]
---

# Add Field

Scaffold a new field type for the smart-form-builder registry.

Arguments: $ARGUMENTS

## Step 1 — Parse arguments

From `$ARGUMENTS`, derive all name variants. Arguments format:
`<field-name> [group] ["display name"]`

Examples:
- `color-picker` → group=input, displayName="Color Picker"
- `color-picker select "Pick a Color"` → group=select, displayName="Pick a Color"
- `section-divider display` → group=display, displayName="Section Divider"

Derive these from the first argument (kebab-case field name):
- **`ENUM_KEY`**: uppercase + underscores. `color-picker` → `COLOR_PICKER`
- **`kebabName`**: as given. `color-picker`
- **`CamelName`**: PascalCase. `color-picker` → `ColorPicker`
- **`camelName`**: camelCase. `color-picker` → `colorPicker`
- **`displayName`**: if provided as 3rd arg use it; else title-case the kebab name. `color-picker` → `"Color Picker"`
- **`FieldGroup`**: map group arg: `input`→`INPUT`, `select`→`SELECT`, `display`→`DISPLAY`, `special`→`SPECIAL`. Default: `INPUT`

## Step 2 — Guard: check for existing field

Read `src/enums/index.ts`. If `ENUM_KEY` already exists in the `FieldKind` enum, stop and tell the user the field already exists.

## Step 3 — Edit `src/enums/index.ts`

Add the new enum member to `FieldKind`. Insert it before the closing `}` of the enum, after the last existing entry:

```ts
  ENUM_KEY = 'kebab-name',
```

Example result for `color-picker`:
```ts
  COLOR_PICKER = 'color-picker',
```

## Step 4 — Edit `src/types/fields.ts`

### 4a — Add config interface

Insert a new exported interface immediately before the `export type FieldConfig =` union line:

```ts
export interface CamelNameConfig extends FieldBase {
  kind: FieldKind.ENUM_KEY;
  // TODO: add field-specific properties
}

```

### 4b — Add to FieldConfig union

The union ends with `| SignatureConfig;`. Replace that closing line with:

```ts
  | SignatureConfig
  | CamelNameConfig;
```

## Step 5 — Create `src/registry/kebab-name.tsx`

Create this file (do not overwrite if it exists — guard in step 2 covers the enum, but also check this file):

```tsx
import { FieldKind, FieldGroup } from '../enums';
import type { FieldPlugin } from '../types/registry';
import type { CamelNameConfig } from '../types/fields';

export const camelNamePlugin: FieldPlugin<CamelNameConfig> = {
  kind: FieldKind.ENUM_KEY,
  displayName: 'Display Name Here',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  group: FieldGroup.GROUP_ENUM,

  createDefault: (id) => ({
    id,
    kind: FieldKind.ENUM_KEY,
    label: 'Display Name Here',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  }),

  ConfigEditor: ({ config: _config, onChange: _onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        {/* TODO: implement config editor UI */}
      </div>
    </div>
  ),

  FieldRenderer: ({ config: _config, value: _value, onChange: _onChange, error: _error, disabled: _disabled }) => (
    <div>
      {/* TODO: implement field renderer */}
    </div>
  ),

  validate: (value, config, required) => {
    if (required && (value === null || value === undefined || value === '')) {
      return config.requiredMessage ?? 'This field is required';
    }
    return null;
  },

  formatForPrint: (value) => (value !== null && value !== undefined ? String(value) : null),
};
```

Replace every placeholder token:
- `CamelNameConfig` → e.g. `ColorPickerConfig`
- `camelNamePlugin` → e.g. `colorPickerPlugin`
- `FieldKind.ENUM_KEY` → e.g. `FieldKind.COLOR_PICKER`
- `FieldGroup.GROUP_ENUM` → e.g. `FieldGroup.INPUT`
- `'Display Name Here'` → e.g. `'Color Picker'`
- Import type `CamelNameConfig` → e.g. `ColorPickerConfig`

## Step 6 — Edit `src/registry/index.ts`

### 6a — Add import

Append after the last `import { ... } from './...'` line (currently `import { signaturePlugin } from './signature';`):

```ts
import { camelNamePlugin } from './kebab-name';
```

### 6b — Add registerField call

Append after the last `registerField(...)` call (currently `registerField(signaturePlugin);`):

```ts
registerField(camelNamePlugin);
```

## Step 7 — Verify build

Run:
```bash
npm run build
```

If it fails, show the TypeScript errors and fix them before reporting success.

## Step 8 — Summary

Print a summary table:

| File | Action |
|------|--------|
| `src/enums/index.ts` | Added `FieldKind.ENUM_KEY` |
| `src/types/fields.ts` | Added `CamelNameConfig` interface + union member |
| `src/registry/kebab-name.tsx` | Created plugin skeleton |
| `src/registry/index.ts` | Imported + registered plugin |

Then print next steps:
- Implement `ConfigEditor` in `src/registry/kebab-name.tsx`
- Implement `FieldRenderer` in `src/registry/kebab-name.tsx`
- Add field-specific properties to `CamelNameConfig` in `src/types/fields.ts`
- Update `validate` logic if the field has custom validation rules
