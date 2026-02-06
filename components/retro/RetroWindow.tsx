'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RetroWindowProps {
  title?: string;
  titleBarColor?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  actions?: React.ReactNode;
}

export function RetroWindow({
  title,
  titleBarColor,
  children,
  className,
  contentClassName,
  actions,
}: RetroWindowProps) {
  return (
    <div
      className={cn(
        'retro-window bg-card border-2 border-foreground/20',
        'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]',
        'dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {title && (
        <div
          className={cn(
            'retro-title-bar flex items-center justify-between px-3 py-2',
            'border-b-2 border-foreground/20',
            'bg-primary text-primary-foreground',
            'font-bold text-sm tracking-wide uppercase select-none'
          )}
          style={titleBarColor ? { backgroundColor: titleBarColor } : undefined}
        >
          <div className='flex items-center gap-2'>
            <span className='inline-block w-2 h-2 bg-primary-foreground/60' />
            <span>{title}</span>
          </div>
          {actions && <div className='flex items-center gap-1'>{actions}</div>}
        </div>
      )}
      <div className={cn('retro-content p-4', 'bg-card', contentClassName)}>
        {children}
      </div>
    </div>
  );
}

interface RetroWindowInsetProps {
  children: React.ReactNode;
  className?: string;
}

export function RetroWindowInset({
  children,
  className,
}: RetroWindowInsetProps) {
  return (
    <div
      className={cn(
        'retro-inset p-4',
        'border-2 border-foreground/10',
        'bg-background',
        'shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]',
        'dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      {children}
    </div>
  );
}
