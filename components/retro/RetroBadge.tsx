'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const retroBadgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
    'border-2 select-none',
  ],
  {
    variants: {
      variant: {
        default: ['bg-primary text-primary-foreground border-primary'],
        secondary: [
          'bg-secondary text-secondary-foreground border-secondary-foreground/20',
        ],
        outline: ['bg-transparent text-foreground border-foreground/30'],
        mood: ['bg-muted text-muted-foreground border-muted-foreground/30'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface RetroBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof retroBadgeVariants> {
  color?: string;
}

export function RetroBadge({
  className,
  variant,
  color,
  style,
  ...props
}: RetroBadgeProps) {
  const customStyle = color
    ? { backgroundColor: color, borderColor: color, color: '#fff', ...style }
    : style;

  return (
    <span
      className={cn(retroBadgeVariants({ variant, className }))}
      style={customStyle}
      {...props}
    />
  );
}
