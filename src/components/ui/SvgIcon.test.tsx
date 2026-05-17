import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SvgIcon } from './SvgIcon';

describe('SvgIcon', () => {
  it('renders a span with aria-hidden', () => {
    const { container } = render(<SvgIcon svg="<svg></svg>" />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('aria-hidden', 'true');
  });

  it('injects the svg string as inner HTML', () => {
    const svg = '<svg viewBox="0 0 24 24"><circle r="10"/></svg>';
    const { container } = render(<SvgIcon svg={svg} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('applies the default class "contents" when no className is provided', () => {
    const { container } = render(<SvgIcon svg="<svg></svg>" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('contents');
  });

  it('applies a custom className when provided', () => {
    const { container } = render(<SvgIcon svg="<svg></svg>" className="w-4 h-4" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('w-4');
    expect(span).toHaveClass('h-4');
    expect(span).not.toHaveClass('contents');
  });

  it('is not discoverable by accessible queries (aria-hidden)', () => {
    render(<SvgIcon svg='<svg aria-label="icon"><path/></svg>' />);
    // The wrapping span is aria-hidden so screen readers skip it entirely;
    // nothing should be queryable by role in the accessibility tree.
    expect(screen.queryByRole('img')).toBeNull();
  });
});
