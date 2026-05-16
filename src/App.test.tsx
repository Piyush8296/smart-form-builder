import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { SessionProvider } from './contexts/SessionContext'
import { routes } from './router'

const mockSession = {
  userId: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
}

beforeEach(() => {
  localStorage.setItem('fb:session', JSON.stringify(mockSession))
})

afterEach(() => {
  localStorage.clear()
})

describe('App routing', () => {
  it('renders home page at /', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<SessionProvider><RouterProvider router={router} /></SessionProvider>)
    expect(await screen.findByRole('heading', { name: /templates/i })).toBeInTheDocument()
  })
})
