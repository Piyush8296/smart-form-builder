import { render, screen } from '@testing-library/react'
import Home from './Home'

describe('Home', () => {
  it('renders heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /smart form builder/i })).toBeInTheDocument()
  })
})
