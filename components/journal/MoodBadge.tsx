import * as React from 'react';
import { cn } from '@/lib/utils';

interface MoodBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Accent color for the dot + tint (usually from scoreToColor) */
  color?: string;
  muted?: boolean;
}

/**
 * A quiet pill for mood words: colored dot + lowercase label on a soft tint.
 */
export function MoodBadge({
  color,
  muted = false,
  className,
  children,
  ...props
}: MoodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium lowercase',
        muted
          ? 'border-border/70 bg-muted/60 text-muted-foreground'
          : 'border-transparent text-foreground/85',
        className
      )}
      style={
        color && !muted
          ? {
              backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
              borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
            }
          : undefined
      }
      {...props}
    >
      {color && (
        <span
          aria-hidden
          className='size-1.5 shrink-0 rounded-full'
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}
