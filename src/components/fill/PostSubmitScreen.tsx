import { Button } from '../ui/Button';

interface PostSubmitScreenProps {
  message: string;
  showSubmitAnother: boolean;
  onSubmitAnother: () => void;
}

const ICON_CHECK_CIRCLE = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" />
  </svg>
);

export function PostSubmitScreen({ message, showSubmitAnother, onSubmitAnother }: PostSubmitScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <span className="text-accent mb-4">{ICON_CHECK_CIRCLE}</span>
      <p className="text-ui text-ink max-w-sm">{message}</p>
      {showSubmitAnother && (
        <Button variant="secondary" className="mt-6" onClick={onSubmitAnother}>
          Submit another response
        </Button>
      )}
    </div>
  );
}
