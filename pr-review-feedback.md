# Code Review & Refactoring Feedback

## Overview

The current implementation works functionally, but there are multiple issues related to:
- maintainability
- scalability
- separation of concerns
- reusability
- performance
- consistency
- type safety

A lot of business logic, constants, rendering logic, reducers, and utility functions are tightly coupled inside component files. The implementation should be refactored into a more modular and declarative architecture.

---

# 1. Implement Debouncing For Search / Multi Select

Search inputs and multi-select filtering should use debouncing to avoid:
- unnecessary renders
- excessive filtering
- laggy typing UX
- repeated expensive computations

## Expected

- Create reusable `useDebounce` hook
- Filter using debounced value
- Memoize filtered results

## Example

```ts
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
```

```ts
const debouncedQuery = useDebounce(query, 300);

const filteredOptions = useMemo(() => {
  return options.filter(...);
}, [debouncedQuery, options]);
```

---

# 2. Avoid Inline `dangerouslySetInnerHTML`

This should not exist inline inside components:

```tsx
return <span dangerouslySetInnerHTML={{ __html: svg }} className="contents" />;
```

## Expected

Create reusable abstraction/helper component.

## Example

```tsx
// SvgIcon.tsx

type SvgIconProps = {
  svg: string;
  className?: string;
};

export function SvgIcon({
  svg,
  className,
}: SvgIconProps) {
  return (
    <span
      className={className ?? 'contents'}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

---

# 3. Move Group Label Logic Into Constants

This logic should not exist inline:

```ts
const groupLabel = (g: string) =>
  g === 'input'
    ? 'Input'
    : g === 'choice'
    ? 'Choice'
    : g === 'special'
    ? 'Special'
    : g;
```

## Expected

Use constants/maps.

## Example

```ts
// constants/groupLabels.ts

export const GROUP_LABELS: Record<string, string> = {
  input: 'Input',
  choice: 'Choice',
  special: 'Special',
};
```

```ts
const label = GROUP_LABELS[group] ?? group;
```

---

# 4. Move Icons Into Separate Constants File

Icons should not be declared inside components.

## Expected Structure

```txt
/constants
  icons.ts
```

## Example

```ts
export const ICON_SETTINGS = ...;
export const ICON_DELETE = ...;
export const ICON_EDIT = ...;
export const ICON_WARNING = ...;
```

This prevents:
- unnecessary re-creation
- bloated component files
- poor discoverability

---

# 5. Improve Prop Naming

`isDirty` is vague and unclear.

## Prefer Explicit Naming

Instead of:

```ts
isDirty
```

Use:

```ts
hasUnsavedChanges
hasPendingChanges
isModified
```

Prop names should clearly communicate intent.

---

# 6. Move Constants Out Of Components

Constants should never be recreated per render.

## Bad

```ts
const OPERATORS = ...
const EFFECTS = ...
```

inside component body.

## Expected

```txt
/constants
  operators.ts
  effects.ts
```

## Example

```ts
export const OPERATORS = [
  ...
];
```

---

# 7. Separate Logic From UI

Business logic should not live directly inside JSX-heavy component files.

Current implementation tightly couples:
- rendering
- state orchestration
- calculations
- reducers
- selectors
- business rules

## Expected

Extract logic into:
- custom hooks
- reducers
- services
- utilities

---

# 8. Avoid Arbitrary String Literals

These are problematic:

```ts
['Field', 'Logic', 'Validation']

tab === 'Logic'

'sum'

'is_empty'

'SELECT_FIELD'
```

String literals spread across codebase become:
- error-prone
- hard to refactor
- inconsistent
- non-type-safe

---

# 9. Use Enums / Constants

## Expected

```ts
export enum BuilderTab {
  FIELD = 'FIELD',
  LOGIC = 'LOGIC',
  VALIDATION = 'VALIDATION',
}
```

```ts
export enum CalculationOperation {
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
}
```

```ts
export enum ValidationOperator {
  IS_EMPTY = 'IS_EMPTY',
}
```

```ts
export enum FormActionType {
  SELECT_FIELD = 'SELECT_FIELD',
}
```

---

# 10. Type Definitions Should Be Separate

Types/interfaces should not sit at the top of component files.

## Expected Structure

```txt
/types
  form-builder.ts
  calculations.ts
  validation.ts
```

This improves:
- discoverability
- reuse
- cleaner components
- better architecture

---

# 11. Implement Memoization Properly

Heavy calculations/selectors should be memoized.

## Use

- `useMemo`
- `useCallback`
- `React.memo`

## Avoid

- recreating arrays/functions/objects every render
- inline callback creation
- expensive recomputation

## Example

```ts
const computedFields = useMemo(() => {
  return buildComputedFields(data);
}, [data]);
```

---

# 12. Reducers Should Be Separate Modules

Reducers should not live inside components.

## Bad

```tsx
function Component() {
  const reducer = (...) => ...
}
```

## Expected

```txt
/state
  formBuilderReducer.ts
```

This improves:
- testability
- readability
- reuse
- separation of concerns

---

# 13. Action Types Should Not Be Arbitrary Strings

This:

```ts
'SELECT_FIELD'
```

should be type-safe.

## Expected

```ts
export enum FormActionType {
  SELECT_FIELD = 'SELECT_FIELD',
}
```

or action creators.

---

# 14. Move Utility Functions Out Of Components

These should not be inside component files:

- `buildInitialState`
- `recomputeState`
- `clearHiddenAnswers`
- `applyCalculations`
- `buildInitialAnswers`

## Expected

Move into:
- `/utils`
- `/services`
- `/state`

## Example

```txt
/utils
  calculations.ts
  formState.ts
```

---

# 15. Avoid Repeated DOM Nodes

This is repetitive:

```tsx
<Toggle
  on={config.includeStreet2}
  onChange={(v) =>
    onChange({ ...config, includeStreet2: v })
  }
  label="Include address line 2"
/>

<Toggle
  on={config.includeState}
  onChange={(v) =>
    onChange({ ...config, includeState: v })
  }
  label="Include state / province"
/>

<Toggle
  on={config.includeZip}
  onChange={(v) =>
    onChange({ ...config, includeZip: v })
  }
  label="Include ZIP / postal code"
/>
```

## Expected

Use configuration-driven rendering.

## Example

```ts
const toggleConfigs = [
  {
    key: 'includeStreet2',
    label: 'Include address line 2',
  },
  {
    key: 'includeState',
    label: 'Include state / province',
  },
  {
    key: 'includeZip',
    label: 'Include ZIP / postal code',
  },
];
```

```tsx
{toggleConfigs.map(({ key, label }) => (
  <Toggle
    key={key}
    on={config[key]}
    onChange={(v) =>
      onChange({
        ...config,
        [key]: v,
      })
    }
    label={label}
  />
))}
```

---

# 16. Select Options Should Be Generated Via Maps

This is repetitive:

```tsx
<option value="sum">Sum</option>
<option value="avg">Average</option>
<option value="min">Min</option>
<option value="max">Max</option>
```

## Expected

```ts
export const CALCULATION_OPERATIONS = [
  {
    value: 'sum',
    label: 'Sum',
  },
  {
    value: 'avg',
    label: 'Average',
  },
  {
    value: 'min',
    label: 'Min',
  },
  {
    value: 'max',
    label: 'Max',
  },
];
```

```tsx
{CALCULATION_OPERATIONS.map((operation) => (
  <option
    key={operation.value}
    value={operation.value}
  >
    {operation.label}
  </option>
))}
```

---

# 17. DOM Generation Should Be Data-Driven

Large repeated JSX trees indicate poor abstraction.

## Expected

Use:
- config-driven rendering
- reusable components
- maps
- schema-based rendering

Avoid copy-pasting JSX with tiny differences.

---

# 18. Extract Component-Level Hooks

Complex state orchestration should move into hooks.

## Example

```txt
/hooks
  useFormBuilder.ts
  useCalculationEngine.ts
  useValidationEngine.ts
```

This keeps UI components lean and focused on rendering.

---

# 19. Improve Overall Maintainability

Current implementation mixes:
- UI
- business logic
- constants
- reducers
- helper functions
- rendering logic
- state management

inside the same files.

This creates:
- large component files
- poor readability
- difficult debugging
- low reuse
- hard testing
- weak scalability

---

# Final Goal

The implementation should aim to be:

- modular
- declarative
- reusable
- scalable
- type-safe
- testable
- maintainable
- performance-conscious

The current implementation needs significant architectural cleanup and refactoring before it can scale properly.