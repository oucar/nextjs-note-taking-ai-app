import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const links = [
  { name: 'Journals', href: '/journal' },
  { name: 'History', href: '/history' },
];

const DashboardLayout = ({ children }) => {
  return (
    <div className='flex h-screen w-screen'>
      <aside className='flex w-56 flex-col border-r bg-muted/40'>
        <div className='flex h-14 items-center px-4'>
          <span className='text-xl font-bold tracking-tight'>MOOD</span>
        </div>
        <Separator />
        <nav className='flex flex-col gap-1 p-4'>
          {links.map((link) => (
            <Button
              key={link.name}
              variant='ghost'
              className='justify-start'
              asChild
            >
              <Link href={link.href}>{link.name}</Link>
            </Button>
          ))}
        </nav>
      </aside>
      <div className='flex flex-1 flex-col'>
        <header className='flex h-14 items-center justify-end border-b px-6'>
          <UserButton afterSignOutUrl='/' />
        </header>
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
