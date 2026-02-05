import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen, History } from 'lucide-react';

const links = [
  { name: 'Journals', href: '/journal', icon: BookOpen },
  { name: 'History', href: '/history', icon: History },
];

const DashboardLayout = ({ children }) => {
  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <aside className='flex w-64 flex-col border-r bg-card shrink-0'>
        <div className='flex h-16 items-center px-6'>
          <span className='text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            MOOD
          </span>
        </div>
        <Separator />
        <nav className='flex flex-col gap-1 p-4'>
          {links.map((link) => (
            <Button
              key={link.name}
              variant='ghost'
              className='justify-start gap-3 h-11'
              asChild
            >
              <Link href={link.href}>
                <link.icon className='h-5 w-5' />
                {link.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className='mt-auto p-4'>
          <Separator className='mb-4' />
          <div className='flex items-center justify-between px-2'>
            <span className='text-sm text-muted-foreground'>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
      <div className='flex flex-1 flex-col min-w-0'>
        <header className='flex h-16 items-center justify-end border-b bg-card/50 px-8 shrink-0'>
          <UserButton afterSignOutUrl='/' />
        </header>
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
