import * as React from 'react';
import { cn } from '@/lib/utils';

interface PanelProps {
  title?: string;
  eyebrow?: string;
  /** Optional accent color rendered as a small dot next to the title */
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  actions?: React.ReactNode;
}

export function Panel({
  title,
  eyebrow,
  accentColor,
  children,
  className,
  contentClassName,
  actions,
}: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/70 bg-card shadow-card',
        className
      )}
    >
      {(title || actions) && (
        <header className='flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6'>
          <div className='min-w-0'>
            {eyebrow && <p className='eyebrow mb-0.5'>{eyebrow}</p>}
            {title && (
              <h2 className='flex items-center gap-2 font-serif text-lg font-medium tracking-tight'>
                {accentColor && (
                  <span
                    aria-hidden
                    className='inline-block size-2 shrink-0 rounded-full'
                    style={{ backgroundColor: accentColor }}
                  />
                )}
                <span className='truncate'>{title}</span>
              </h2>
            )}
          </div>
          {actions && (
            <div className='flex shrink-0 items-center gap-2'>{actions}</div>
          )}
        </header>
      )}
      <div
        className={cn(
          'px-5 pb-5 sm:px-6',
          !title && !actions && 'pt-5',
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
