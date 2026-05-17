import { Button } from '../ui/Button';
import { ICON_CHECK_CIRCLE } from '../../constants/icons';

interface PostSubmitScreenProps {
  message: string;
  showSubmitAnother: boolean;
  onSubmitAnother: () => void;
}

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
