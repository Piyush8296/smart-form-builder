import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('handles conditional class objects', () => {
    expect(cn({ active: true, inactive: false })).toBe('active');
  });

  it('deduplicates conflicting tailwind utilities (last wins)', () => {
    // twMerge should resolve: p-2 wins over p-4 when p-4 comes last? No — later overrides earlier
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('returns empty string when no arguments are passed', () => {
    expect(cn()).toBe('');
  });

  it('merges tailwind bg classes correctly', () => {
    // bg-red-500 then bg-blue-500 — the latter should win
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
