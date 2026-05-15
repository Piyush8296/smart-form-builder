# Plan: Route-Based Code Splitting

## Context
Orchestrator flagged code splitting as a pre-feature requirement. Bundle is currently 192K monolithic. Adding React Router + React.lazy + Suspense + Vite manualChunks now so all future pages land in separate async chunks automatically.

## Stack additions
- `react-router-dom` v7 — routing + lazy route support

## Changes

### `package.json`
Add to `dependencies`:
```json
"react-router-dom": "^7.0.0"
```

### `vite.config.ts`
Add `build.rollupOptions` for vendor chunk splitting:
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
      },
    },
  },
},
```

### `src/router.tsx` (new)
Export both `routes` (for tests) and `router` (for production):
```tsx
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('./pages/Home'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
]

export const router = createBrowserRouter(routes)
```

### `src/App.tsx` (modify)
Replace with `RouterProvider`:
```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export default function App() {
  return <RouterProvider router={router} />
}
```

### `src/pages/Home.tsx` (new)
Move current App content here:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Form Builder</h1>
        <p className="text-gray-500">React 19 · TypeScript · Tailwind v4 · Vite</p>
      </div>
    </main>
  )
}
```

### `src/App.test.tsx` (modify)
`RouterProvider` owns its context — use `createMemoryRouter`, not `MemoryRouter`:
```tsx
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './router'

describe('App routing', () => {
  it('renders home page at /', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)
    expect(await screen.findByRole('heading', { name: /smart form builder/i })).toBeInTheDocument()
  })
})
```

### `src/pages/Home.test.tsx` (new)
```tsx
import { render, screen } from '@testing-library/react'
import Home from './Home'

describe('Home', () => {
  it('renders heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /smart form builder/i })).toBeInTheDocument()
  })
})
```

## Files touched
| File | Action |
|------|--------|
| `package.json` | add react-router-dom |
| `vite.config.ts` | add manualChunks |
| `src/router.tsx` | create |
| `src/App.tsx` | replace with RouterProvider |
| `src/App.test.tsx` | update for lazy route (findBy not getBy) |
| `src/pages/Home.tsx` | create |
| `src/pages/Home.test.tsx` | create |

## Verification
1. `npm install` — react-router-dom added
2. `npm run test:run` — all tests pass
3. `npm run build` — dist/ has separate `vendor`, `router`, `Home` chunks
4. `npm run dev` — navigate to `/`, heading renders
