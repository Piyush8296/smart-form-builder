# Software Architect Frontend Prompt

You are a senior frontend software architect and UI systems designer.

Create a detailed Phase A UI implementation plan for a modern form builder application using React, TypeScript, Tailwind CSS v4, Vite, and Vitest.

The output should feel like a real architecture handoff document prepared for a frontend engineering team.

Use clean engineering language with practical implementation detail.

The design direction is:
- minimal and premium
- Geist and Geist Mono typography
- warm neutral backgrounds
- coral accent color
- thin borders
- strong spacing rhythm
- modern dashboard style UX

Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/Um9_RrMcU_pJgykpWvfj2g?open_file=index.html
Implement: index.html

The plan should include the following sections.

## HTML Setup
Describe updates required for:
- Google Fonts preconnect
- Geist and Geist Mono imports
- page title
- meta description

## Global CSS System
Create a complete UI token system using CSS variables.

Include:
- background colors
- surfaces
- borders
- typography colors
- accent colors
- radius scale
- font stacks
- layout constants

Explain that Tailwind CSS v4 should use:
- @import "tailwindcss"
- CSS first architecture
- no tailwind.config.js
- @tailwindcss/vite plugin

## Core Utility Classes
Define implementation requirements for:
- layout containers
- top navigation
- cards
- chips
- buttons
- forms
- toggles
- dividers
- placeholders
- empty states
- modal system

The styles should support:
- hover states
- active states
- focus states
- responsive behavior
- print mode

## Responsive Rules
Define breakpoints and responsive layout behavior.

Include:
- desktop three pane builder layout
- mobile off canvas drawers
- mobile navigation tabs
- responsive tables
- responsive grids

## UI Components
Create implementation requirements for reusable UI components inside src/components/ui.

Include:
- Button
- Input
- Select
- Toggle
- Modal
- DragHandle
- Combobox
- SvgIcon
- Brand

Mention:
- all components should rely on shared utility classes
- styling should stay CSS driven
- component APIs should remain minimal

## Utility Helpers
Create a utility helper for merging class names using:
- clsx
- tailwind merge

## Dependency Installation
List additional frontend dependencies required for:
- drag and drop
- utility styling
- sortable lists

Include:
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
- clsx
- tailwind-merge

## Home Page
Describe the full Home page redesign.

Include:
- sticky topbar
- templates hero section
- search and filters
- responsive template grid
- blank template card
- template cards with metadata
- empty state handling

The layout should resemble a polished SaaS dashboard.

## Builder Page
Describe a professional three pane form builder UI.

Include:
- builder topbar
- left field palette
- center form canvas
- right configuration panel
- drag handles
- selected field state
- hidden field state
- conditional logic UI
- sortable options
- mobile drawer experience

The builder should feel production ready and highly interactive.

## Fill Page
Describe the form filling experience.

Include:
- progress header
- sticky progress bar
- question cards
- field renderers
- validation error state
- file upload area
- signature pad
- linear scale
- rating UI
- submit footer

The experience should feel calm and distraction free.

## Instances Page
Describe a responses dashboard.

Include:
- response table
- status chips
- search and filters
- CSV export actions
- responsive mobile layout
- action buttons

## Router Structure
Define lazy loaded routes for:
- Home
- BuilderPage
- FillPage
- InstancesPage
- LoginPage

Include:
- AuthGuard layout
- public routes
- protected routes
- Suspense fallback using Brand component

## Verification Checklist
Provide a checklist to confirm:
- successful build
- responsive layouts
- mobile behavior
- typography rendering
- print styles
- route rendering

The output should:
- use markdown formatting
- feel like a real frontend architecture plan
- avoid unnecessary explanations
- avoid marketing language
- remain implementation focused