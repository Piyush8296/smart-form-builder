import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';
import { FillProvider } from '../contexts/FillContext';
import { useFill } from '../hooks/useFill';
import { FormField } from '../components/fill/FormField';
import { ProgressBar } from '../components/fill/ProgressBar';
import { FillToolbar } from '../components/fill/FillToolbar';
import { PostSubmitScreen } from '../components/fill/PostSubmitScreen';
import { useStorage } from '../hooks/useStorage';
import { ICON_DOWNLOAD } from '../constants/icons';

function FillForm() {
  const {
    template, visibleFields, visibilityMap, submitted, submitError,
    setAnswer, getAnswer, isVisible, getError, loadDraft, reset, submit,
    completedCount, interactiveFieldCount,
  } = useFill();
  const { loadDraft: loadDraftFromStorage } = useStorage();

  useEffect(() => {
    const draft = loadDraftFromStorage(template.id);
    if (draft && draft.size > 0) loadDraft(draft);
  }, [template.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (submitted) {
    return (
      <PostSubmitScreen
        message={template.settings.confirmationMessage}
        showSubmitAnother={template.settings.showSubmitAnotherLink}
        onSubmitAnother={reset}
      />
    );
  }

  return (
    <div className="max-w-content mx-auto px-5 pt-8 pb-20 w-full max-mob:px-4">
      {template.settings.showProgressBar && (
        <ProgressBar answered={completedCount} total={interactiveFieldCount} />
      )}

      <div className="border border-border border-t-4 border-t-ink bg-surface rounded-lg px-8 py-7 mb-4 max-mob:px-5 max-mob:py-5">
        <h1 className="m-0 mb-2 text-heading font-semibold tracking-heading max-mob:text-title">
          {template.title}
        </h1>
        {template.description && (
          <p className="m-0 text-muted text-sm">{template.description}</p>
        )}
      </div>

      <ErrorBoundary>
        {visibleFields.map((field) => {
          if (!isVisible(field.id)) return null;
          const vState = visibilityMap.get(field.id) ?? { fieldId: field.id, visible: true, required: field.defaultRequired };
          return (
            <FormField
              key={field.id}
              field={field}
              value={getAnswer(field.id)}
              onChange={(value) => setAnswer(field.id, value)}
              error={getError(field.id)}
              visibilityState={vState}
            />
          );
        })}
      </ErrorBoundary>

      <FillToolbar
        answeredCount={completedCount}
        totalVisible={interactiveFieldCount}
        onSubmit={submit}
        submitError={submitError}
        hasDraft={template.settings.autoSaveDraft}
      />
    </div>
  );
}

function FillPageInner() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border topbar-glass sticky top-0 z-40 flex items-center px-5">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <Brand noLink />
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handlePrint}>{ICON_DOWNLOAD} Save PDF</Button>
        </div>
      </header>
      <FillForm />
    </div>
  );
}

export default function FillPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { loadTemplate } = useStorage();

  if (!templateId) {
    navigate('/');
    return null;
  }

  const template = loadTemplate(templateId);
  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted">Form not found.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Go home</Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <FillProvider template={template}>
        <FillPageInner />
      </FillProvider>
    </ErrorBoundary>
  );
}
