import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReactDOM from 'react-dom/client';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

// Stub ReactDOM.createRoot so we never actually try to render a React tree into
// the detached jsdom body — createRoot + requestAnimationFrame would otherwise
// fight the test runner.
vi.mock('react-dom/client', () => {
  const render = vi.fn();
  const unmount = vi.fn();
  return {
    default: {
      createRoot: vi.fn(() => ({ render, unmount })),
    },
  };
});

// Stub the PrintView component so the test is not coupled to its rendering logic.
vi.mock('../components/print/PrintView', () => ({
  PrintView: vi.fn(() => null),
}));

// ---------------------------------------------------------------------------
// Import SUT *after* mocks are in place (Vitest hoists vi.mock automatically)
// ---------------------------------------------------------------------------
import { exportToPDF } from './pdf';
import type { Template } from '../types/template';
import type { Instance } from '../types/instance';
import type { FieldVisibilityState } from '../types/conditions';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: 'tmpl-1',
    title: 'Test form',
    description: '',
    fields: [],
    settings: {
      showProgressBar: false,
      confirmationMessage: 'Done',
      showSubmitAnotherLink: false,
      autoSaveDraft: false,
      allowResponseEditing: false,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeInstance(overrides: Partial<Instance> = {}): Instance {
  const now = new Date().toISOString();
  return {
    id: 'inst-1',
    templateId: 'tmpl-1',
    answers: [],
    submittedAt: now,
    createdAt: now,
    ...overrides,
  };
}

function makeVisibilityMap(): Map<string, FieldVisibilityState> {
  return new Map();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('exportToPDF', () => {
  let printSpy: ReturnType<typeof vi.spyOn>;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    // Make requestAnimationFrame call its callback synchronously so the
    // awaited Promise resolves immediately inside the test.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up any lingering #print-portal nodes
    document.getElementById('print-portal')?.remove();
  });

  it('calls window.print() after rendering', async () => {
    await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());
    expect(printSpy).toHaveBeenCalledOnce();
  });

  it('appends a #print-portal div to document.body before printing', async () => {
    let portalDuringPrint: HTMLElement | null = null;
    printSpy.mockImplementation(() => {
      portalDuringPrint = document.getElementById('print-portal');
    });

    await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());

    expect(portalDuringPrint).not.toBeNull();
    // SAFETY: asserted not-null above; TS can't narrow across mock closure so double-cast is required
    expect((portalDuringPrint as unknown as HTMLElement).id).toBe('print-portal');
  });

  it('creates a React root on the portal container', async () => {
    await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());
    expect(ReactDOM.createRoot).toHaveBeenCalledOnce();
    // The argument should be the portal div that was appended to the body
    const container = (ReactDOM.createRoot as ReturnType<typeof vi.fn>).mock.calls[0][0] as HTMLElement;
    expect(container.id).toBe('print-portal');
  });

  it('calls root.render() with the PrintView element', async () => {
    await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());
    const rootMock = (ReactDOM.createRoot as ReturnType<typeof vi.fn>).mock.results[0].value as { render: ReturnType<typeof vi.fn> };
    expect(rootMock.render).toHaveBeenCalledOnce();
  });

  it('registers an afterprint listener with { once: true }', async () => {
    await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());

    const afterprintCalls = (addEventListenerSpy.mock.calls as [string, EventListener, AddEventListenerOptions | undefined][])
      .filter(([event]) => event === 'afterprint');

    expect(afterprintCalls).toHaveLength(1);
    expect(afterprintCalls[0][2]).toMatchObject({ once: true });
  });

  it('unmounts root and removes portal container when afterprint fires', async () => {
    await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());

    const rootMock = (ReactDOM.createRoot as ReturnType<typeof vi.fn>).mock.results[0].value as {
      render: ReturnType<typeof vi.fn>;
      unmount: ReturnType<typeof vi.fn>;
    };

    // Manually trigger the afterprint listener that was registered
    const afterprintHandler = (addEventListenerSpy.mock.calls as [string, EventListener][])
      .find(([event]) => event === 'afterprint')![1];

    afterprintHandler(new Event('afterprint'));

    expect(rootMock.unmount).toHaveBeenCalledOnce();
    expect(document.getElementById('print-portal')).toBeNull();
  });

  it('returns a Promise that resolves to undefined', async () => {
    const result = await exportToPDF(makeTemplate(), makeInstance(), makeVisibilityMap());
    expect(result).toBeUndefined();
  });
});
