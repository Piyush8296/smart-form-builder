import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { router } from './router'
import { SessionProvider } from './contexts/SessionContext'

export default function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
      <Analytics />
    </SessionProvider>
  )
}
