import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SessionProvider } from '../contexts/SessionContext'
import Home from './Home'

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

describe('Home', () => {
  it('renders heading', () => {
    render(<SessionProvider><MemoryRouter><Home /></MemoryRouter></SessionProvider>)
    expect(screen.getByRole('heading', { name: /templates/i })).toBeInTheDocument()
  })
})
