import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationProgress } from '@/components/NavigationProgress';
import { Suspense } from 'react';

const links = [
  { name: 'Journals', href: '/journal' },
  { name: 'Statistics', href: '/statistics' },
  { name: 'History', href: '/history' },
];

const DashboardLayout = ({ children }) => {
  return (
    <div className='min-h-screen retro-bg'>
      {/* Navigation Progress Bar */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {/* Retro Header Bar */}
      <header className='sticky top-0 z-50 border-b-2 border-foreground/20 bg-card shadow-[0_2px_0_0_rgba(0,0,0,0.1)]'>
        <div className='retro-container'>
          <div className='flex h-14 items-center justify-between'>
            {/* Left: Logo */}
            <div className='flex items-center gap-8'>
              <Link href='/journal' className='no-underline'>
                <span className='text-xl font-black tracking-tight uppercase'>
                  <span className='text-primary'>[ </span>
                  MOOD
                  <span className='text-primary'> ]</span>
                </span>
              </Link>

              {/* Nav Links */}
              <nav className='hidden sm:flex items-center gap-1'>
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className='px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-foreground/80 hover:text-foreground hover:bg-accent border-2 border-transparent hover:border-foreground/10 transition-colors no-underline'
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: Theme Toggle + User */}
            <div className='flex items-center gap-3'>
              <ThemeToggle />
              <div className='border-l-2 border-foreground/10 pl-3'>
                <UserButton afterSignOutUrl='/' />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='retro-container py-6 md:py-8'>{children}</main>
    </div>
  );
};

export default DashboardLayout;
