import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BuilderProvider } from '../contexts/BuilderContext';
import { useBuilder } from '../hooks/useBuilder';
import { useStorage } from '../hooks/useStorage';
import { useTemplateList } from '../hooks/useTemplateList';
import { useSession } from '../contexts/SessionContext';
import { isOwner } from '../storage/accessStore';
import { FieldList } from '../components/builder/FieldList';
import { AddFieldMenu } from '../components/builder/AddFieldMenu';
import { ConfigPanel } from '../components/builder/ConfigPanel';
import { TemplateSettingsModal } from '../components/builder/TemplateSettingsModal';
import { BuilderToolbar } from '../components/builder/BuilderToolbar';
import { Button } from '../components/ui/Button';
import { FieldKind } from '../types/fields';
import { BuilderActionType } from '../enums';
import { ICON_PLUS } from '../constants/icons';

function BuilderInner() {
  const {
    template, fields, selectedFieldId, selectedField, hasUnsavedChanges,
    addField, removeField, updateField, moveField, selectField, duplicateField,
    dispatch,
  } = useBuilder();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <BuilderToolbar
        title={template.title}
        hasUnsavedChanges={hasUnsavedChanges}
        onTitleChange={(title) => dispatch({ type: BuilderActionType.SET_TITLE, payload: title })}
        onSettings={() => setSettingsOpen(true)}
        onPreview={() => window.open(`/fill/${template.id}`, '_blank')}
        templateId={template.id}
      />

      <div className="hidden max-canvas:flex gap-1 px-3 py-2 bg-surface border-b border-border flex-none z-10">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setMobileLeft((v) => !v)}>
          {ICON_PLUS} Add
        </Button>
        <Button variant="primary" size="sm" className="flex-2">
          Fields ({fields.length})
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setMobileRight((v) => !v)}>
          ⚙
        </Button>
      </div>

      <div className="flex-1 min-h-0 grid grid-builder-layout max-canvas:block max-canvas:overflow-y-auto bg-bg">
        <aside
          className="overflow-y-auto bg-surface-2 border-r border-border max-canvas:hidden max-canvas:data-[mobile-open=true]:block max-canvas:data-[mobile-open=true]:fixed max-canvas:data-[mobile-open=true]:top-14 max-canvas:data-[mobile-open=true]:bottom-0 max-canvas:data-[mobile-open=true]:left-0 max-canvas:data-[mobile-open=true]:w-80 max-canvas:data-[mobile-open=true]:z-30 max-canvas:data-[mobile-open=true]:shadow-popover"
          data-mobile-open={mobileLeft || undefined}
        >
          <AddFieldMenu onAdd={(kind: FieldKind) => { addField(kind); setMobileLeft(false); }} />
        </aside>

        <main className="bg-bg px-6 py-7 pb-20 overflow-y-auto max-canvas:px-3 max-canvas:pt-5">
          <div className="max-w-content mx-auto">
            <div className="bg-surface border border-border border-t-4 border-t-ink rounded-lg px-7 py-6 mb-3.5 max-mob:px-5">
              <h2 className="text-title font-semibold tracking-snug m-0 mb-1.5">{template.title}</h2>
              {template.description && (
                <p className="text-muted text-ui m-0">{template.description}</p>
              )}
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="mb-3">No fields yet.</p>
                <Button variant="secondary" onClick={() => addField(FieldKind.TEXT_SINGLE)}>
                  {ICON_PLUS} Add your first field
                </Button>
              </div>
            ) : (
              <FieldList
                fields={fields}
                selectedFieldId={selectedFieldId}
                onSelect={selectField}
                onDuplicate={duplicateField}
                onDelete={removeField}
                onToggleRequired={(field) => updateField({ ...field, defaultRequired: !field.defaultRequired })}
                onMove={moveField}
              />
            )}

            <button
              className="flex items-center justify-center gap-2 p-3 border border-dashed border-border-strong rounded-lg mt-3.5 text-muted text-ui cursor-pointer w-full transition-colors hover:border-ink hover:text-ink hover:bg-surface"
              onClick={() => addField(FieldKind.TEXT_SINGLE)}
            >
              {ICON_PLUS} Add field
            </button>
          </div>
        </main>

        <aside
          className="overflow-y-auto bg-surface border-l border-border max-canvas:hidden max-canvas:data-[mobile-open=true]:block max-canvas:data-[mobile-open=true]:fixed max-canvas:data-[mobile-open=true]:top-14 max-canvas:data-[mobile-open=true]:bottom-0 max-canvas:data-[mobile-open=true]:right-0 max-canvas:data-[mobile-open=true]:w-80 max-canvas:data-[mobile-open=true]:z-30 max-canvas:data-[mobile-open=true]:shadow-popover"
          data-mobile-open={mobileRight || undefined}
        >
          {selectedField ? (
            <ConfigPanel
              field={selectedField}
              allFields={fields}
              onChange={updateField}
            />
          ) : (
            <div className="px-4 py-8 text-center text-muted text-caption">
              Select a field to edit its settings.
            </div>
          )}
        </aside>
      </div>

      <TemplateSettingsModal
        open={settingsOpen}
        settings={template.settings}
        onClose={() => setSettingsOpen(false)}
        onChange={(patch) => dispatch({ type: BuilderActionType.UPDATE_SETTINGS, payload: patch })}
      />
    </div>
  );
}

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadTemplate } = useStorage();
  const { createTemplate } = useTemplateList();
  const { session } = useSession();

  const isNew = !id || id === 'new';
  const hasCreated = useRef(false);

  useEffect(() => {
    if (isNew && !hasCreated.current) {
      hasCreated.current = true;
      const t = createTemplate();
      navigate(`/builder/${t.id}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SAFETY: session is non-null (AuthGuard); id is defined and non-'new' (isNew guard above returns early).
  const notOwner = !isNew && !isOwner(session!.userId, id!);
  useEffect(() => {
    if (notOwner) navigate(`/fill/${id}`, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notOwner]);

  if (isNew || notOwner) return null;

  const template = loadTemplate(id!);
  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted">Template not found.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Go home</Button>
      </div>
    );
  }

  return (
    <BuilderProvider template={template}>
      <BuilderInner />
    </BuilderProvider>
  );
}
