import type { FieldPlugin } from '../types/registry';
import type { PhoneConfig } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const COUNTRY_CODES = [
  { code: '+1', label: '🇺🇸 +1 (US/CA)' },
  { code: '+44', label: '🇬🇧 +44 (UK)' },
  { code: '+91', label: '🇮🇳 +91 (IN)' },
  { code: '+61', label: '🇦🇺 +61 (AU)' },
  { code: '+49', label: '🇩🇪 +49 (DE)' },
  { code: '+33', label: '🇫🇷 +33 (FR)' },
  { code: '+81', label: '🇯🇵 +81 (JP)' },
  { code: '+86', label: '🇨🇳 +86 (CN)' },
  { code: '+55', label: '🇧🇷 +55 (BR)' },
  { code: '+52', label: '🇲🇽 +52 (MX)' },
  { code: '+34', label: '🇪🇸 +34 (ES)' },
  { code: '+39', label: '🇮🇹 +39 (IT)' },
  { code: '+7', label: '🇷🇺 +7 (RU)' },
  { code: '+82', label: '🇰🇷 +82 (KR)' },
  { code: '+31', label: '🇳🇱 +31 (NL)' },
  { code: '+46', label: '🇸🇪 +46 (SE)' },
  { code: '+47', label: '🇳🇴 +47 (NO)' },
  { code: '+45', label: '🇩🇰 +45 (DK)' },
  { code: '+41', label: '🇨🇭 +41 (CH)' },
  { code: '+32', label: '🇧🇪 +32 (BE)' },
  { code: '+43', label: '🇦🇹 +43 (AT)' },
  { code: '+48', label: '🇵🇱 +48 (PL)' },
  { code: '+351', label: '🇵🇹 +351 (PT)' },
  { code: '+30', label: '🇬🇷 +30 (GR)' },
  { code: '+90', label: '🇹🇷 +90 (TR)' },
  { code: '+966', label: '🇸🇦 +966 (SA)' },
  { code: '+971', label: '🇦🇪 +971 (AE)' },
  { code: '+20', label: '🇪🇬 +20 (EG)' },
  { code: '+27', label: '🇿🇦 +27 (ZA)' },
  { code: '+234', label: '🇳🇬 +234 (NG)' },
  { code: '+254', label: '🇰🇪 +254 (KE)' },
  { code: '+62', label: '🇮🇩 +62 (ID)' },
  { code: '+60', label: '🇲🇾 +60 (MY)' },
  { code: '+65', label: '🇸🇬 +65 (SG)' },
  { code: '+63', label: '🇵🇭 +63 (PH)' },
  { code: '+66', label: '🇹🇭 +66 (TH)' },
  { code: '+84', label: '🇻🇳 +84 (VN)' },
  { code: '+92', label: '🇵🇰 +92 (PK)' },
  { code: '+880', label: '🇧🇩 +880 (BD)' },
  { code: '+64', label: '🇳🇿 +64 (NZ)' },
  { code: '+56', label: '🇨🇱 +56 (CL)' },
  { code: '+57', label: '🇨🇴 +57 (CO)' },
  { code: '+54', label: '🇦🇷 +54 (AR)' },
  { code: '+51', label: '🇵🇪 +51 (PE)' },
  { code: '+58', label: '🇻🇪 +58 (VE)' },
  { code: '+972', label: '🇮🇱 +972 (IL)' },
  { code: '+98', label: '🇮🇷 +98 (IR)' },
  { code: '+353', label: '🇮🇪 +353 (IE)' },
  { code: '+36', label: '🇭🇺 +36 (HU)' },
  { code: '+420', label: '🇨🇿 +420 (CZ)' },
];

function parsePhone(value: string): { code: string; number: string } {
  for (const { code } of COUNTRY_CODES) {
    if (value.startsWith(code)) return { code, number: value.slice(code.length) };
  }
  return { code: '+1', number: value };
}

export const phonePlugin: FieldPlugin<PhoneConfig> = {
  kind: 'phone',
  displayName: 'Phone',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'phone',
    label: 'Phone',
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
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Default country code</label>
        <Select value={config.defaultCountryCode ?? '+1'} onChange={(e) => onChange({ ...config, defaultCountryCode: e.target.value })}>
          {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </Select>
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const str = typeof value === 'string' ? value : '';
    const { code, number } = parsePhone(str || (config.defaultCountryCode ?? '+1'));

    return (
      <div className="flex gap-2">
        <Select
          className="w-36 shrink-0"
          value={code}
          onChange={(e) => onChange(`${e.target.value}${number}`)}
          disabled={disabled}
        >
          {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </Select>
        <Input
          type="tel"
          className="flex-1"
          value={number}
          onChange={(e) => onChange(`${code}${e.target.value}`)}
          placeholder="Phone number"
          disabled={disabled}
          error={error ?? undefined}
        />
      </div>
    );
  },

  validate: (value, config, required) => {
    const str = typeof value === 'string' ? value : '';
    if (required && !str.replace(/^\+\d+/, '').trim()) return config.requiredMessage ?? 'This field is required';
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
