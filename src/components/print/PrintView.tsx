import type { Template } from '../../types/template';
import type { Instance } from '../../types/instance';
import type { FieldVisibilityState } from '../../types/conditions';
import { getPlugin } from '../../registry';

interface PrintViewProps {
  template: Template;
  instance: Instance;
  visibilityMap: Map<string, FieldVisibilityState>;
}

export function PrintView({ template, instance, visibilityMap }: PrintViewProps) {
  const answersById = new Map(instance.answers.map((a) => [a.fieldId, a]));

  const visibleFields = template.fields.filter((f) => {
    const state = visibilityMap.get(f.id);
    return state?.visible !== false;
  });

  // Inline styles intentional: Tailwind utility classes depend on @layer ordering which
  // breaks in browser print contexts. Inline styles are print-safe and self-contained.
  return (
    <div id="print-view" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ borderTop: '4px solid #000', paddingTop: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>{template.title}</h1>
        {template.description && (
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{template.description}</p>
        )}
        <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          Submitted: {new Date(instance.submittedAt).toLocaleString()}
        </p>
      </div>

      {visibleFields.map((field) => {
        const plugin = getPlugin(field.kind);
        if (plugin.isDisplayOnly) {
          return (
            <div key={field.id} style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                {field.label}
              </h2>
              {field.description && (
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{field.description}</p>
              )}
            </div>
          );
        }

        const answer = answersById.get(field.id);
        const printed = answer ? plugin.formatForPrint(answer.value, field as never) : null;

        return (
          <div key={field.id} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 }}>
              {field.label}
            </div>
            {plugin.isComputed ? (
              <div style={{ fontSize: 15 }}>{printed ?? '—'}</div>
            ) : printed ? (
              printed.startsWith('data:image/') ? (
                <img src={printed} style={{ maxWidth: '100%', height: 80, objectFit: 'contain', border: '1px solid #eee' }} alt="Signature" />
              ) : (
                <div style={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{printed}</div>
              )
            ) : (
              <div style={{ fontSize: 15, color: '#aaa', fontStyle: 'italic' }}>No answer</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
