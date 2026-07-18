import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationProgress } from '@/components/NavigationProgress';
import { NavLinks } from '@/components/NavLinks';
import { Suspense } from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='paper-bg min-h-screen'>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <header className='sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md'>
        <div className='journal-container flex min-h-16 flex-wrap items-center justify-between gap-x-3 py-2 sm:py-0'>
          <Link href='/journal' className='shrink-0'>
            <span className='font-serif text-xl font-medium tracking-tight'>
              Mood<span className='text-primary'>.</span>
            </span>
          </Link>

          <div className='order-3 -mx-1 w-full pb-1 sm:order-none sm:mx-0 sm:w-auto sm:pb-0'>
            <NavLinks />
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <ThemeToggle />
            <UserButton afterSignOutUrl='/' />
          </div>
        </div>
      </header>

      <main className='journal-container py-8 md:py-10'>{children}</main>
    </div>
  );
};

export default DashboardLayout;
