import { type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

const BASE = 'w-full h-9 border border-border rounded-md px-2.5 bg-surface text-ink text-ui transition-control hover:border-border-strong focus:outline-0 focus:border-accent focus:shadow-focus';

export function Input({ prefix, suffix, className, ...props }: InputProps) {
  if (prefix || suffix) {
    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
            {prefix}
          </span>
        )}
        <input className={cn(BASE, prefix && 'pl-8', className)} {...props} />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
            {suffix}
          </span>
        )}
      </div>
    );
  }
  return <input className={cn(BASE, className)} {...props} />;
}
