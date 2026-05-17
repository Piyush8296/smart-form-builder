import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrintView } from './PrintView';
import { FieldKind, CalculationOperation, SectionHeaderSize } from '../../enums';
import type { Template } from '../../types/template';
import type { Instance, FieldAnswer } from '../../types/instance';
import type { FieldVisibilityState } from '../../types/conditions';
import type {
  TextSingleConfig,
  SectionHeaderConfig,
  CalculationConfig,
  SignatureConfig,
} from '../../types/fields';
import { DEFAULT_TEMPLATE_SETTINGS } from '../../types/template';

// ---------------------------------------------------------------------------
// Field config factories
// ---------------------------------------------------------------------------

function makeTextSingleField(overrides: Partial<TextSingleConfig> = {}): TextSingleConfig {
  return {
    id: 'field-text',
    kind: FieldKind.TEXT_SINGLE,
    label: 'Full name',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  };
}

function makeSectionHeaderField(overrides: Partial<SectionHeaderConfig> = {}): SectionHeaderConfig {
  return {
    id: 'field-section',
    kind: FieldKind.SECTION_HEADER,
    label: 'Personal Details',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    size: SectionHeaderSize.MD,
    showDivider: false,
    ...overrides,
  };
}

function makeCalculationField(overrides: Partial<CalculationConfig> = {}): CalculationConfig {
  return {
    id: 'field-calc',
    kind: FieldKind.CALCULATION,
    label: 'Total Score',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    operation: CalculationOperation.SUM,
    sourceFieldIds: [],
    ...overrides,
  };
}

function makeSignatureField(overrides: Partial<SignatureConfig> = {}): SignatureConfig {
  return {
    id: 'field-sig',
    kind: FieldKind.SIGNATURE,
    label: 'Your Signature',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Template / Instance factories
// ---------------------------------------------------------------------------

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 'tmpl-1',
    title: 'Contact Form',
    description: 'Please fill in your details.',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  };
}

function makeInstance(overrides: Partial<Instance> = {}): Instance {
  return {
    id: 'inst-1',
    templateId: 'tmpl-1',
    answers: [],
    submittedAt: new Date('2024-06-15T10:30:00').toISOString(),
    createdAt: new Date('2024-06-15T10:29:00').toISOString(),
    ...overrides,
  };
}

function makeAnswer(fieldId: string, value: FieldAnswer['value'], fieldKind: FieldKind = FieldKind.TEXT_SINGLE): FieldAnswer {
  return {
    fieldId,
    value,
    fieldSnapshot: makeTextSingleField({ id: fieldId, kind: fieldKind } as never),
  };
}

// ---------------------------------------------------------------------------
// Visibility map helpers
// ---------------------------------------------------------------------------

function allVisible(fieldIds: string[]): Map<string, FieldVisibilityState> {
  return new Map(
    fieldIds.map((id) => [id, { fieldId: id, visible: true, required: false }]),
  );
}

function withHidden(base: Map<string, FieldVisibilityState>, hiddenIds: string[]): Map<string, FieldVisibilityState> {
  const result = new Map(base);
  for (const id of hiddenIds) {
    result.set(id, { fieldId: id, visible: false, required: false });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Props factory
// ---------------------------------------------------------------------------

interface PrintViewPropsOverrides {
  template?: Partial<Template>;
  instance?: Partial<Instance>;
  visibilityMap?: Map<string, FieldVisibilityState>;
}

function getProps(overrides: PrintViewPropsOverrides = {}) {
  const template = makeTemplate(overrides.template);
  const instance = makeInstance(overrides.instance);
  const visibilityMap =
    overrides.visibilityMap ?? allVisible(template.fields.map((f) => f.id));
  return { template, instance, visibilityMap };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PrintView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Header section
  // -------------------------------------------------------------------------
  describe('header', () => {
    it('renders the template title as an h1', () => {
      render(<PrintView {...getProps({ template: { title: 'My Survey' } })} />);
      expect(screen.getByRole('heading', { level: 1, name: 'My Survey' })).toBeInTheDocument();
    });

    it('renders the template description when present', () => {
      render(
        <PrintView
          {...getProps({ template: { description: 'Please complete this form.' } })}
        />,
      );
      expect(screen.getByText('Please complete this form.')).toBeInTheDocument();
    });

    it('does not render a description paragraph when description is empty', () => {
      render(<PrintView {...getProps({ template: { description: '' } })} />);
      expect(screen.queryByText(/complete this form/i)).not.toBeInTheDocument();
    });

    it('renders the submission timestamp', () => {
      const submittedAt = new Date('2024-06-15T10:30:00').toISOString();
      render(<PrintView {...getProps({ instance: { submittedAt } })} />);
      // Check that some "Submitted:" label is present
      expect(screen.getByText(/submitted:/i)).toBeInTheDocument();
    });

    it('wraps the content in an element with id="print-view"', () => {
      const { container } = render(<PrintView {...getProps()} />);
      expect(container.querySelector('#print-view')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Section header (display-only) field
  // -------------------------------------------------------------------------
  describe('section header field', () => {
    it('renders the section label as an h2', () => {
      const sectionField = makeSectionHeaderField({ label: 'Personal Details' });
      const template = makeTemplate({ fields: [sectionField] });
      const instance = makeInstance();
      const visibilityMap = allVisible([sectionField.id]);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByRole('heading', { level: 2, name: 'Personal Details' })).toBeInTheDocument();
    });

    it('renders the section description when present', () => {
      const sectionField = makeSectionHeaderField({
        label: 'Contact',
        description: 'All fields are required.',
      });
      const template = makeTemplate({ fields: [sectionField] });
      const instance = makeInstance();
      const visibilityMap = allVisible([sectionField.id]);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
    });

    it('does not render a description paragraph when section description is absent', () => {
      const sectionField = makeSectionHeaderField({ label: 'Section A' });
      const template = makeTemplate({ fields: [sectionField] });
      const instance = makeInstance();
      const visibilityMap = allVisible([sectionField.id]);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      // The section renders as h2, not as a regular field label div
      expect(screen.queryByText('All fields are required.')).not.toBeInTheDocument();
    });

    it('does not render an answer area for section-header fields', () => {
      const sectionField = makeSectionHeaderField({ label: 'My Section' });
      const template = makeTemplate({ fields: [sectionField] });
      const instance = makeInstance();
      const visibilityMap = allVisible([sectionField.id]);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      // Should NOT render a "No answer" fallback for display-only fields
      expect(screen.queryByText(/no answer/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Regular field — answered
  // -------------------------------------------------------------------------
  describe('regular field with an answer', () => {
    it('renders the field label', () => {
      const field = makeTextSingleField({ label: 'Full name', id: 'f1' });
      const template = makeTemplate({ fields: [field] });
      const instance = makeInstance({ answers: [makeAnswer('f1', 'Jane Doe')] });
      const visibilityMap = allVisible(['f1']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('Full name')).toBeInTheDocument();
    });

    it('renders the answer value', () => {
      const field = makeTextSingleField({ label: 'Full name', id: 'f1' });
      const template = makeTemplate({ fields: [field] });
      const instance = makeInstance({ answers: [makeAnswer('f1', 'Jane Doe')] });
      const visibilityMap = allVisible(['f1']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Regular field — no answer
  // -------------------------------------------------------------------------
  describe('regular field without an answer', () => {
    it('shows "No answer" in italic when no answer is recorded', () => {
      const field = makeTextSingleField({ label: 'Nickname', id: 'f-nick' });
      const template = makeTemplate({ fields: [field] });
      const instance = makeInstance({ answers: [] });
      const visibilityMap = allVisible(['f-nick']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText(/no answer/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Computed (calculation) field
  // -------------------------------------------------------------------------
  describe('calculation (computed) field', () => {
    it('renders the calculation field label', () => {
      const calcField = makeCalculationField({ id: 'f-calc', label: 'Total Score' });
      const template = makeTemplate({ fields: [calcField] });
      const instance = makeInstance({ answers: [makeAnswer('f-calc', 42, FieldKind.CALCULATION)] });
      const visibilityMap = allVisible(['f-calc']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('Total Score')).toBeInTheDocument();
    });

    it('renders the formatted calculation result', () => {
      const calcField = makeCalculationField({ id: 'f-calc', label: 'Total Score' });
      const template = makeTemplate({ fields: [calcField] });
      const instance = makeInstance({ answers: [makeAnswer('f-calc', 42, FieldKind.CALCULATION)] });
      const visibilityMap = allVisible(['f-calc']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders an em-dash when calculation has no answer', () => {
      const calcField = makeCalculationField({ id: 'f-calc', label: 'Total Score' });
      const template = makeTemplate({ fields: [calcField] });
      const instance = makeInstance({ answers: [] });
      const visibilityMap = allVisible(['f-calc']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Signature field
  // -------------------------------------------------------------------------
  describe('signature field', () => {
    it('renders the signature field label', () => {
      const sigField = makeSignatureField({ id: 'f-sig', label: 'Your Signature' });
      const template = makeTemplate({ fields: [sigField] });
      const base64 = 'data:image/png;base64,abc123';
      const answer = makeAnswer('f-sig', { base64, width: 400, height: 120 }, FieldKind.SIGNATURE);
      const instance = makeInstance({ answers: [answer] });
      const visibilityMap = allVisible(['f-sig']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('Your Signature')).toBeInTheDocument();
    });

    it('renders an img element for a signature answer', () => {
      const sigField = makeSignatureField({ id: 'f-sig', label: 'Your Signature' });
      const template = makeTemplate({ fields: [sigField] });
      const base64 = 'data:image/png;base64,abc123';
      const answer = makeAnswer('f-sig', { base64, width: 400, height: 120 }, FieldKind.SIGNATURE);
      const instance = makeInstance({ answers: [answer] });
      const visibilityMap = allVisible(['f-sig']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      const img = screen.getByRole('img', { name: /signature/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', base64);
    });

    it('shows "No answer" when signature field has no answer', () => {
      const sigField = makeSignatureField({ id: 'f-sig', label: 'Your Signature' });
      const template = makeTemplate({ fields: [sigField] });
      const instance = makeInstance({ answers: [] });
      const visibilityMap = allVisible(['f-sig']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText(/no answer/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Visibility map filtering
  // -------------------------------------------------------------------------
  describe('visibility filtering', () => {
    it('renders a field that is marked visible', () => {
      const field = makeTextSingleField({ label: 'Visible Field', id: 'f-vis' });
      const template = makeTemplate({ fields: [field] });
      const instance = makeInstance({ answers: [makeAnswer('f-vis', 'Hello')] });
      const visibilityMap = allVisible(['f-vis']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('Visible Field')).toBeInTheDocument();
    });

    it('does not render a field that is marked hidden', () => {
      const field = makeTextSingleField({ label: 'Hidden Field', id: 'f-hid' });
      const template = makeTemplate({ fields: [field] });
      const instance = makeInstance();
      const visibilityMap = withHidden(allVisible(['f-hid']), ['f-hid']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.queryByText('Hidden Field')).not.toBeInTheDocument();
    });

    it('renders only visible fields when some are hidden', () => {
      const f1 = makeTextSingleField({ label: 'Keep Me', id: 'f1' });
      const f2 = makeTextSingleField({ label: 'Hide Me', id: 'f2' });
      const template = makeTemplate({ fields: [f1, f2] });
      const instance = makeInstance({ answers: [makeAnswer('f1', 'yes'), makeAnswer('f2', 'no')] });
      const visibilityMap = withHidden(allVisible(['f1', 'f2']), ['f2']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('Keep Me')).toBeInTheDocument();
      expect(screen.queryByText('Hide Me')).not.toBeInTheDocument();
    });

    it('treats a field with no visibility entry as visible (state?.visible !== false)', () => {
      const field = makeTextSingleField({ label: 'No Entry Field', id: 'f-none' });
      const template = makeTemplate({ fields: [field] });
      const instance = makeInstance({ answers: [makeAnswer('f-none', 'value')] });
      // Empty map — no entry for the field
      const visibilityMap = new Map<string, FieldVisibilityState>();
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByText('No Entry Field')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Multiple fields — ordering preserved
  // -------------------------------------------------------------------------
  describe('multiple fields', () => {
    it('renders all visible fields in order', () => {
      const f1 = makeTextSingleField({ label: 'First', id: 'f1' });
      const f2 = makeTextSingleField({ label: 'Second', id: 'f2' });
      const f3 = makeTextSingleField({ label: 'Third', id: 'f3' });
      const template = makeTemplate({ fields: [f1, f2, f3] });
      const instance = makeInstance({
        answers: [
          makeAnswer('f1', 'A'),
          makeAnswer('f2', 'B'),
          makeAnswer('f3', 'C'),
        ],
      });
      const visibilityMap = allVisible(['f1', 'f2', 'f3']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      const labels = screen.getAllByText(/^(First|Second|Third)$/);
      expect(labels[0]).toHaveTextContent('First');
      expect(labels[1]).toHaveTextContent('Second');
      expect(labels[2]).toHaveTextContent('Third');
    });
  });

  // -------------------------------------------------------------------------
  // Empty state — no fields
  // -------------------------------------------------------------------------
  describe('empty state', () => {
    it('renders header but no field content when template has no fields', () => {
      render(<PrintView {...getProps({ template: { fields: [], title: 'Empty Form' } })} />);
      expect(screen.getByRole('heading', { level: 1, name: 'Empty Form' })).toBeInTheDocument();
      // No "No answer" text should appear
      expect(screen.queryByText(/no answer/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Mixed field types in one render
  // -------------------------------------------------------------------------
  describe('mixed field types', () => {
    it('renders section header, regular field, and calculation together', () => {
      const section = makeSectionHeaderField({ id: 'f-sec', label: 'Section A' });
      const textField = makeTextSingleField({ id: 'f-txt', label: 'Name' });
      const calcField = makeCalculationField({ id: 'f-calc', label: 'Score' });
      const template = makeTemplate({ fields: [section, textField, calcField] });
      const instance = makeInstance({
        answers: [
          makeAnswer('f-txt', 'Alice'),
          makeAnswer('f-calc', 100, FieldKind.CALCULATION),
        ],
      });
      const visibilityMap = allVisible(['f-sec', 'f-txt', 'f-calc']);
      render(<PrintView template={template} instance={instance} visibilityMap={visibilityMap} />);
      expect(screen.getByRole('heading', { level: 2, name: 'Section A' })).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});
