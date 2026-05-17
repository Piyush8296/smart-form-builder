# Software Architect Frontend Prompt

You are a senior frontend software architect designing the logic layer for a scalable form builder application.

Create a detailed Phase B implementation plan focused on frontend application logic, architecture, state management, validation, persistence, plugin systems, and dynamic rendering.

The application uses:
- React
- TypeScript
- Tailwind CSS v4
- Vite
- Vitest

The output should feel like a real architecture implementation document written for a frontend engineering team.

Use concise and implementation focused engineering language.

The plan should include the following sections.

## Component Contracts
Define typed prop contracts for reusable UI components.

Include:
- Button
- Input
- Select
- Toggle
- Modal
- DragHandle
- Combobox

Mention:
- forwarded refs where appropriate
- native attribute forwarding
- keyboard accessibility
- focus management
- drag and drop listener support

## Enums Architecture
Create a centralized enums file for all application enums.

Include enums for:
- field types
- builder actions
- fill actions
- conditions
- calculations
- field groups
- builder tabs
- select variants
- section header sizes

Explain that enums should never live inline inside type files.

## Type System
Create a strongly typed field architecture.

Include:
- base field interface
- 17 field configuration interfaces
- field value unions
- condition types
- template types
- instance types
- plugin interfaces
- address value object
- signature value object

Mention:
- barrel exports
- reusable shared contracts
- no duplicated types

## Utility Layer
Create utility modules for:
- id generation
- PDF export
- form state recomputation

The form state utility should:
- recompute visibility
- recompute calculations
- support conditional logic
- be reusable across reducers and providers

## Local Storage Persistence
Design a storage layer using localStorage.

Include:
- template storage
- instance storage
- draft storage
- session storage
- user storage

Requirements:
- graceful JSON parse failure handling
- quota exceeded handling
- safe serialization for Maps
- reusable storage keys

## Condition Evaluation Engine
Design a dynamic condition engine.

Include:
- topological dependency resolution
- cycle detection
- visibility evaluation
- required state evaluation
- hidden field behavior
- dependency graph traversal

Mention:
- Kahn topological sort
- default visibility fallback
- console warnings for cycles

## Calculation Engine
Create a calculation engine for computed fields.

Support:
- sum
- average
- minimum
- maximum

Requirements:
- ignore hidden fields
- null output when all sources hidden
- real time recomputation

## Validation Engine
Design a plugin driven validation system.

Requirements:
- validation per field plugin
- hidden fields skipped
- display only fields skipped
- computed fields skipped
- field level error maps

## Field Registry System
Create a plugin based field registry architecture.

The registry should support:
- field renderers
- config editors
- validation
- print formatting
- SVG icons
- default config creation

Include plugins for:
- text
- textarea
- number
- date
- email
- url
- address
- single select
- multi select
- calculation
- section header
- rating
- linear scale
- phone
- file upload
- signature

Mention advanced behaviors:
- shuffle options
- other option support
- searchable multi select
- regex validation
- drag sortable options
- signature canvas
- calculation derived values
- date prefills
- E.164 phone formatting

## Reducer Architecture
Create standalone reducers for:
- builder state
- fill state

Requirements:
- reducer purity
- action enums
- draft loading
- answer recomputation
- unsaved change tracking
- submission state handling

Mention:
- reducers should remain testable
- side effects should stay outside reducers

## Context Architecture
Create thin context providers around reducers.

Include:
- BuilderContext
- FillContext

Responsibilities:
- persistence side effects
- autosave
- submission handling
- validation before submit
- draft restoration

## Custom Hooks
Design reusable hooks for:
- builder workflows
- fill workflows
- template listing
- local storage syncing

Mention:
- memoized derived state
- ergonomic APIs
- navigation helpers
- reusable storage abstraction

## Builder Components
Describe architecture for:
- draggable field lists
- sortable field items
- add field menus
- config panels
- condition editors
- template settings modal
- builder toolbar

Requirements:
- dnd kit integration
- keyboard shortcuts
- field duplication
- conditional chips
- required toggles
- settings persistence

## Fill Components
Describe architecture for:
- dynamic form fields
- progress bars
- fill toolbar
- post submit screen

Requirements:
- plugin driven rendering
- conditional visibility
- scroll to first error
- PDF export
- save draft
- completion metrics

## Print System
Design a print only rendering portal.

Requirements:
- print optimized layout
- visible fields only
- signature image rendering
- calculated field labels
- page safe sections
- print footer metadata

Use window.print based workflow.

## Page Integration
Describe how pages connect to live state and storage.

Include:
- Home page
- Builder page
- Fill page
- Instances page

Mention:
- provider wiring
- localStorage hydration
- draft restoration
- live field rendering
- editable responses

## Verification Checklist
Provide a thorough implementation checklist covering:
- TypeScript correctness
- persistence
- conditional logic
- calculations
- validation
- PDF export
- draft saving
- editing responses
- localStorage quota handling
- duplicate field behavior

The output should:
- use markdown formatting
- feel like a production frontend architecture plan
- stay implementation focused
- avoid unnecessary explanations
- avoid marketing style writing
