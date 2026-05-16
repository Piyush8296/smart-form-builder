import type { FieldKind, FieldConfig } from '../types/fields';
import type { FieldPlugin } from '../types/registry';

const REGISTRY = new Map<FieldKind, FieldPlugin<FieldConfig>>();

export function registerField<T extends FieldConfig>(plugin: FieldPlugin<T>): void {
  REGISTRY.set(plugin.kind, plugin as unknown as FieldPlugin<FieldConfig>);
}

export function getPlugin(kind: FieldKind): FieldPlugin<FieldConfig> {
  const plugin = REGISTRY.get(kind);
  if (!plugin) throw new Error(`No plugin registered for field kind: ${kind}`);
  return plugin;
}

export function getAllPlugins(): FieldPlugin<FieldConfig>[] {
  return Array.from(REGISTRY.values());
}

// Register all plugins
import { textSinglePlugin } from './text-single';
import { textMultiPlugin } from './text-multi';
import { numberPlugin } from './number';
import { datePlugin } from './date';
import { timePlugin } from './time';
import { emailPlugin } from './email';
import { urlPlugin } from './url';
import { addressPlugin } from './address';
import { singleSelectPlugin } from './single-select';
import { multiSelectPlugin } from './multi-select';
import { fileUploadPlugin } from './file-upload';
import { sectionHeaderPlugin } from './section-header';
import { calculationPlugin } from './calculation';
import { ratingPlugin } from './rating';
import { linearScalePlugin } from './linear-scale';
import { phonePlugin } from './phone';
import { signaturePlugin } from './signature';

registerField(textSinglePlugin);
registerField(textMultiPlugin);
registerField(numberPlugin);
registerField(datePlugin);
registerField(timePlugin);
registerField(emailPlugin);
registerField(urlPlugin);
registerField(addressPlugin);
registerField(singleSelectPlugin);
registerField(multiSelectPlugin);
registerField(fileUploadPlugin);
registerField(sectionHeaderPlugin);
registerField(calculationPlugin);
registerField(ratingPlugin);
registerField(linearScalePlugin);
registerField(phonePlugin);
registerField(signaturePlugin);
