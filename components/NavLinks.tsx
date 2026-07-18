'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { name: 'Journal', href: '/journal' },
  { name: 'Statistics', href: '/statistics' },
  { name: 'History', href: '/history' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className='flex items-center gap-1'>
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              'relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
