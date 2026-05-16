import { Modal } from '../ui/Modal';
import { Toggle } from '../ui/Toggle';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { TemplateSettings } from '../../types/template';

interface TemplateSettingsModalProps {
  open: boolean;
  settings: TemplateSettings;
  onClose: () => void;
  onChange: (patch: Partial<TemplateSettings>) => void;
}

export function TemplateSettingsModal({ open, settings, onClose, onChange }: TemplateSettingsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Form settings"
      footer={<Button variant="primary" onClick={onClose}>Done</Button>}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Confirmation message</label>
          <Input
            value={settings.confirmationMessage}
            onChange={(e) => onChange({ confirmationMessage: e.target.value })}
            placeholder="Your response has been submitted."
          />
        </div>
        <Toggle
          on={settings.showProgressBar}
          onChange={(v) => onChange({ showProgressBar: v })}
          label="Show progress bar"
          sub="Displays completion percentage at the top of the form."
        />
        <Toggle
          on={settings.showSubmitAnotherLink}
          onChange={(v) => onChange({ showSubmitAnotherLink: v })}
          label="Show Submit Another link"
          sub="Appears on the confirmation screen."
        />
        <Toggle
          on={settings.autoSaveDraft}
          onChange={(v) => onChange({ autoSaveDraft: v })}
          label="Auto-save draft"
          sub="Saves progress to local storage on every answer change."
        />
      </div>
    </Modal>
  );
}
