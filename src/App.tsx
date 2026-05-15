import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Form Builder</h1>
        <p className="text-gray-500">React 19 · TypeScript · Tailwind v4 · Vite</p>
      </div>
      <Analytics />
    </main>
  )
}
