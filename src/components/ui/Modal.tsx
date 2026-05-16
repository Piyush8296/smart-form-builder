import { type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-overlay grid place-items-center z-modal p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-surface rounded-xl w-full max-w-modal max-h-modal overflow-y-auto shadow-dialog"
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center px-card py-section border-b border-divider">
          <h2 id="modal-title" className="m-0 text-dialog font-semibold tracking-snug-xs">{title}</h2>
          <button
            className="inline-flex items-center justify-center w-7.5 h-7 rounded text-ink-2 hover:bg-surface-2 hover:text-ink"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-card py-section">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-card py-3.5 border-t border-divider">{footer}</div>
        )}
      </div>
    </div>
  );
}
