import ReactDOM from 'react-dom/client';
import { createElement } from 'react';
import type { Template } from '../types/template';
import type { Instance } from '../types/instance';
import type { FieldVisibilityState } from '../types/conditions';
import { PrintView } from '../components/print/PrintView';

export async function exportToPDF(
  template: Template,
  instance: Instance,
  visibilityMap: Map<string, FieldVisibilityState>,
): Promise<void> {
  const container = document.createElement('div');
  container.id = 'print-portal';
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  root.render(createElement(PrintView, { template, instance, visibilityMap }));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  window.print();
  window.addEventListener('afterprint', () => {
    root.unmount();
    document.body.removeChild(container);
  }, { once: true });
}
