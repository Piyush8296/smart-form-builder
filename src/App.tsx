import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { router } from './router'
import { SessionProvider } from './contexts/SessionContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <RouterProvider router={router} />
        <Analytics />
      </SessionProvider>
    </ErrorBoundary>
  )
}
