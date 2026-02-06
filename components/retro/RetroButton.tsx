'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

const retroButtonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-bold uppercase tracking-wide',
    'transition-all cursor-pointer select-none',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'border-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground border-primary',
          'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
          'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px]',
          'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground border-secondary-foreground/20',
          'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]',
          'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px]',
          'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
        ],
        destructive: [
          'bg-destructive text-white border-destructive',
          'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
          'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px]',
          'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
        ],
        ghost: [
          'bg-transparent text-foreground border-transparent',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        outline: [
          'bg-background text-foreground border-foreground/30',
          'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]',
          'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)] hover:translate-x-[1px] hover:translate-y-[1px]',
          'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface RetroButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
  asChild?: boolean;
}

export function RetroButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: RetroButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      className={cn(retroButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
