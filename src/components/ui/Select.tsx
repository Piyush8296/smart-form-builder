import { type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full h-9 border border-border rounded-md px-2.5 bg-surface text-ink text-ui transition-control hover:border-border-strong focus:outline-0 focus:border-accent focus:shadow-focus',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
