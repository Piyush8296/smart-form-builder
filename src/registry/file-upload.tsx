import { useRef } from 'react';
import { FieldKind, FieldGroup } from '../enums';
import type { FieldPlugin } from '../types/registry';
import type { FileUploadConfig, FieldValue } from '../types/fields';
import { Input } from '../components/ui/Input';

interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

function isFileList(v: FieldValue): v is string[] {
  return Array.isArray(v);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseMetadata(entries: string[]): FileMetadata[] {
  return entries.map((e) => { try { return JSON.parse(e) as FileMetadata; } catch { return { name: e, size: 0, type: '' }; } });
}

export const fileUploadPlugin: FieldPlugin<FileUploadConfig> = {
  kind: FieldKind.FILE_UPLOAD,
  displayName: 'File upload',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
  group: FieldGroup.INPUT,

  createDefault: (id) => ({
    id,
    kind: FieldKind.FILE_UPLOAD,
    label: 'File upload',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    allowedTypes: [],
    maxFiles: 1,
  }),

  ConfigEditor: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Max files</label>
        <Input type="number" min={1} value={config.maxFiles} onChange={(e) => onChange({ ...config, maxFiles: Number(e.target.value) })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Max file size (MB)</label>
        <Input type="number" min={1} value={config.maxFileSizeMB ?? ''} onChange={(e) => onChange({ ...config, maxFileSizeMB: e.target.value ? Number(e.target.value) : undefined })} placeholder="No limit" />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Allowed types (comma-separated, e.g. .pdf,.png)</label>
        <Input value={config.allowedTypes.join(',')} onChange={(e) => onChange({ ...config, allowedTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Leave blank for any" />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const files = isFileList(value) ? parseMetadata(value) : [];

    function handleFiles(fileList: FileList | null) {
      if (!fileList) return;
      const newFiles: FileMetadata[] = [];
      for (const f of Array.from(fileList)) {
        if (config.maxFileSizeMB && f.size > config.maxFileSizeMB * 1024 * 1024) continue;
        newFiles.push({ name: f.name, size: f.size, type: f.type });
      }
      const combined = [...files, ...newFiles].slice(0, config.maxFiles);
      onChange(combined.map((f) => JSON.stringify(f)));
    }

    return (
      <div>
        <div
          className={`file-drop border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ink transition-colors${error ? ' border-danger' : ' border-border-strong'}`}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (!disabled) handleFiles(e.dataTransfer.files); }}
        >
          <p className="text-ui text-muted"><strong className="text-ink">Click to upload</strong> or drag and drop</p>
          {config.allowedTypes.length > 0 && <p className="text-caption text-muted mt-1">{config.allowedTypes.join(', ')}</p>}
          {config.maxFileSizeMB && <p className="text-caption text-muted">Max {config.maxFileSizeMB} MB</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple={config.maxFiles > 1}
          accept={config.allowedTypes.join(',')}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-caption text-ink-2 bg-surface-2 rounded px-2.5 py-1.5">
                <span>{f.name} <span className="text-muted">({formatBytes(f.size)})</span></span>
                <button className="text-danger hover:text-danger" onClick={() => onChange(value instanceof Array ? value.filter((_, j) => j !== i) : [])}>✕</button>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    const files = isFileList(value) ? value : [];
    if (required && files.length === 0) return config.requiredMessage ?? 'This field is required';
    return null;
  },

  formatForPrint: (value) => {
    if (!isFileList(value)) return null;
    return value.map((e) => { try { return (JSON.parse(e) as FileMetadata).name; } catch { return e; } }).join(', ');
  },
};
