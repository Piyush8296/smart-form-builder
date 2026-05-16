import { useRef, useEffect, useState } from 'react';
import type { FieldPlugin } from '../types/registry';
import type { SignatureConfig, SignatureValue, FieldValue } from '../types/fields';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function isSignatureValue(v: FieldValue): v is SignatureValue {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && 'base64' in v;
}

function SignatureCanvas({ onChange, disabled }: { onChange: (v: SignatureValue | null) => void; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent) {
    if (disabled) return;
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current!;
    onChange({ base64: canvas.toDataURL(), width: canvas.width, height: canvas.height });
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={120}
      className="border border-border rounded-md w-full touch-none bg-white"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerLeave={end}
    />
  );
}

export const signaturePlugin: FieldPlugin<SignatureConfig> = {
  kind: 'signature',
  displayName: 'Signature',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 19c4-4 8 4 12 0s4-12 6-12"/><path d="M3 21h18"/></svg>',
  group: 'special',

  createDefault: (id) => ({
    id,
    kind: 'signature',
    label: 'Signature',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  }),

  ConfigEditor: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Description</label>
        <Input value={config.description ?? ''} onChange={(e) => onChange({ ...config, description: e.target.value || undefined })} />
      </div>
    </div>
  ),

  FieldRenderer: ({ config: _config, value, onChange, error, disabled }) => {
    const [key, setKey] = useState(0);
    const hasValue = isSignatureValue(value);

    return (
      <div>
        {!hasValue ? (
          <SignatureCanvas key={key} onChange={onChange} disabled={disabled} />
        ) : (
          <img src={value.base64} width={value.width} height={value.height} className="border border-border rounded-md max-w-full" alt="Signature" />
        )}
        {!disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => { onChange(null); setKey((k) => k + 1); }}
          >
            Clear
          </Button>
        )}
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    if (required && !isSignatureValue(value)) return config.requiredMessage ?? 'This field is required';
    return null;
  },

  formatForPrint: (value) => {
    if (!isSignatureValue(value)) return null;
    return value.base64;
  },
};

