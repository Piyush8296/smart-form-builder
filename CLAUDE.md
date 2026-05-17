# Claude Workspace — Frontend Engineering

## Quick Facts

- **Stack**: React 19, TypeScript 5 (strict), Vite 6, Tailwind CSS v4, React Router v7
- **State**: React built-ins (useState/useReducer/Context) — no external state lib by default
- **Testing**: Vitest 3 + React Testing Library + jsdom
- **Build**: npm, Vite 6, TypeScript strict mode

## Commands

```bash
npm run dev          # Dev server (Vite)
npm run build        # tsc -b && vite build
npm run preview      # Preview production build
npm test             # Vitest watch mode
npm run test:run     # Vitest single run
npm run coverage     # Vitest coverage report
```

## Code Style

- Zero `any` — use `unknown` + type guards. `interface` over `type`.
- Early returns, max 2 nesting levels. Named exports only.
- State order: Error → Loading (no data) → Empty → Success.
- Mutations: `disabled={isPending}` + `onError` shows toast.
- NEVER swallow errors silently. Semantic HTML first.

## Git

- Branch: `<type>/<ticket>-<slug>` — Commits: Conventional Commits
- PRs: squash merge, link ticket, separate commits per unrelated file

## Skill → File Mapping

| Files touched | Auto-loaded skill |
|---------------|-------------------|
| `src/components/**` | `react-patterns`, `frontend-design` |
| `src/hooks/**`, `src/state/**` | `state-management` |
| `**/*.test.*`, `**/*.spec.*` | `testing-strategy` |
| `**/*.css`, `src/index.css` | `css-architecture` |
| `src/pages/**`, routing files | `performance-optimization`, `seo-fundamentals` |
| Page metadata, `<head>` | `seo-fundamentals`, `structured-data` |
| Schema markup, JSON-LD | `structured-data` |
| Lighthouse / speed issues | `core-web-vitals` |
| Any UI component | `accessibility` |
| Bug investigation | `systematic-debugging` |
| Security concern | `security-audit` |
| Design/mockup work | `design-intelligence` |
| `src/storage/**` | `state-management` |
| `src/logic/**` | `systematic-debugging` |
| `src/registry/**` | `react-patterns` |
| Error boundaries, try/catch | `error-handling` |
| Auth, login, middleware | `auth-patterns` |
| `vite.config.ts`, build files | `monorepo-patterns` |
| Translations, locales | `i18n` |
| `.env*`, config files | env-config rule |

## Agent Delegation

| Concern | Agent | Model |
|---------|-------|-------|
| Code quality | `code-reviewer` | Sonnet |
| Performance | `performance-auditor` | Sonnet |
| Accessibility | `accessibility-auditor` | Sonnet |
| Refactoring | `refactor-planner` | Sonnet |
| Documentation | `doc-generator` | Haiku |
| Architecture | `architecture-reviewer` | Sonnet |
| Test coverage | `test-writer` | Sonnet |
| Full health check | `orchestrator` | Opus |
