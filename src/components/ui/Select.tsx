import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full h-9 border border-border rounded-md px-2.5 bg-surface text-ink text-ui transition-control hover:border-border-strong focus:outline-0 focus:border-accent focus:shadow-focus',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
