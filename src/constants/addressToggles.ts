export type AddressToggleKey = 'includeStreet2' | 'includeState' | 'includeZip';

export const ADDRESS_TOGGLE_CONFIGS: { key: AddressToggleKey; label: string }[] = [
  { key: 'includeStreet2', label: 'Include address line 2' },
  { key: 'includeState', label: 'Include state / province' },
  { key: 'includeZip', label: 'Include ZIP / postal code' },
];
