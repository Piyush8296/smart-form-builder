import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger-ghost';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  block = false,
  icon = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-md border border-transparent text-ui font-medium whitespace-nowrap transition-interactive select-none active:translate-y-px focus-visible:focus-ring-outline',
        variant === 'primary' && 'bg-ink text-bg border-transparent hover:bg-ink-hover',
        variant === 'secondary' && 'bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong',
        variant === 'ghost' && 'bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink',
        variant === 'danger-ghost' && 'text-danger bg-transparent hover:bg-danger-tint',
        size === 'sm' && 'h-7 px-2 text-xs rounded',
        size === 'lg' && 'h-10 px-4 text-sm',
        block && 'w-full',
        icon && 'w-7.5 px-0',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
