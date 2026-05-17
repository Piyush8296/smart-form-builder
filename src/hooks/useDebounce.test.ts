import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } },
    );

    rerender({ value: 'world' });
    act(() => { vi.advanceTimersByTime(299); });

    expect(result.current).toBe('hello');
  });

  it('updates to the new value after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } },
    );

    rerender({ value: 'world' });
    act(() => { vi.advanceTimersByTime(300); });

    expect(result.current).toBe('world');
  });

  it('cancels the pending update when the value changes again before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(300); });

    // 'b' should never have been committed
    expect(result.current).toBe('c');
  });

  it('uses the default delay of 300 ms when no delay is supplied', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('a');

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('b');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });
    act(() => { vi.advanceTimersByTime(200); });

    expect(result.current).toBe(42);
  });

  it('works with object references', () => {
    const initial = { id: 1 };
    const next = { id: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: initial } },
    );

    rerender({ value: next });
    act(() => { vi.advanceTimersByTime(100); });

    expect(result.current).toBe(next);
  });

  it('respects a changed delay value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 100 } },
    );

    // Change value AND delay simultaneously
    rerender({ value: 'b', delay: 500 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a'); // old delay would have fired, new one hasn't

    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current).toBe('b');
  });
});
