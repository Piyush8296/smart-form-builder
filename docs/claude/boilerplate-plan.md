# Boilerplate Plan: React + TS + Tailwind v4 + Vite + Vitest

## Stack
| Layer | Choice |
|-------|--------|
| Bundler | Vite 6 |
| UI | React 19 + TypeScript 5 |
| CSS | Tailwind CSS v4 |
| Test runner | Vitest 3 |
| Test utils | React Testing Library + jsdom |

## Tailwind v4 Notes
- No `tailwind.config.js` — CSS-first config
- `@import "tailwindcss"` in CSS (not `@tailwind base/components/utilities`)
- Plugin: `@tailwindcss/vite` (not PostCSS)

## Files

```
smart-form-builder/
├── index.html
├── package.json
├── vite.config.ts          ← Vite + Vitest combined config
├── tsconfig.json
├── tsconfig.app.json       ← includes "types": ["vitest/globals"]
├── tsconfig.node.json
└── src/
    ├── vite-env.d.ts
    ├── main.tsx
    ├── App.tsx
    ├── App.test.tsx        ← example test
    ├── index.css           ← @import "tailwindcss"
    └── setupTests.ts       ← import '@testing-library/jest-dom'
```

## Key Config

### vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },
})
```

### src/index.css
```css
@import "tailwindcss";
```

### src/setupTests.ts
```ts
import '@testing-library/jest-dom'
```

### tsconfig.app.json — key addition
```json
"types": ["vitest/globals"]
```

## Dependencies

```json
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
},
"devDependencies": {
  "@tailwindcss/vite": "^4.0.0",
  "@testing-library/jest-dom": "^6.4.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/user-event": "^14.5.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@vitejs/plugin-react": "^4.3.0",
  "jsdom": "^26.0.0",
  "typescript": "~5.6.0",
  "vite": "^6.0.0",
  "vitest": "^3.0.0"
}
```

## Additional Dependencies (added during UI/Logic phases)

```json
"dependencies": {
  "react-router-dom": "^7.0.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.0.0"
}
```

## Scripts
```json
"dev":       "vite",
"build":     "tsc -b && vite build",
"preview":   "vite preview",
"test":      "vitest",
"test:run":  "vitest run",
"coverage":  "vitest run --coverage"
```

## Verify
1. `npm install`
2. `npm run dev` → Tailwind styles render
3. `npm run test:run` → example test passes
4. `npm run build` → dist/ generated
