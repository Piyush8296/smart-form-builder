import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  error?: string;
}

const BASE = 'w-full h-9 border border-border rounded-md px-2.5 bg-surface text-ink text-ui transition-control hover:border-border-strong focus:outline-0 focus:border-accent focus:shadow-focus';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, suffix, error, className, ...props }, ref) => {
    const inputClass = cn(BASE, error && 'border-danger hover:border-danger focus:border-danger', prefix && 'pl-8', suffix && 'pr-8', className);
    if (prefix || suffix) {
      return (
        <div className="relative">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
              {prefix}
            </span>
          )}
          <input ref={ref} className={inputClass} {...props} />
          {suffix && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
              {suffix}
            </span>
          )}
        </div>
      );
    }
    return <input ref={ref} className={inputClass} {...props} />;
  },
);
Input.displayName = 'Input';
