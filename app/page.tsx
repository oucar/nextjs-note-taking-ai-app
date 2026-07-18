import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();
  const href = userId ? '/journal' : '/new-user';

  return (
    <div className='paper-bg relative flex min-h-screen flex-col overflow-hidden'>
      {/* Top bar */}
      <header className='journal-container flex items-center justify-between py-6'>
        <span className='font-serif text-2xl font-medium tracking-tight'>
          Mood<span className='text-primary'>.</span>
        </span>
        {!userId && (
          <Link
            href='/sign-in'
            className='rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          >
            Sign in
          </Link>
        )}
      </header>

      {/* Hero */}
      <main className='journal-container flex flex-1 flex-col items-center justify-center pb-24 text-center'>
        <p className='rise rise-1 eyebrow mb-6'>An AI journal for your moods</p>

        <h1 className='rise rise-2 max-w-3xl font-serif text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl md:text-7xl'>
          A quiet place to hear{' '}
          <em className='font-light italic text-primary'>yourself</em> think.
        </h1>

        <p className='rise rise-3 mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground'>
          Write a little each day. Mood reads between the lines — following how
          you feel, surfacing patterns, and answering questions only your
          journal can.
        </p>

        <div className='rise rise-4 mt-10 flex items-center gap-4'>
          <Link
            href={href}
            className='group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-medium text-primary-foreground shadow-raised transition-all hover:-translate-y-0.5 hover:brightness-110'
          >
            {userId ? 'Open your journal' : 'Start writing'}
            <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
          </Link>
        </div>

        {/* Sample entry — a small promise of what's inside */}
        <div className='rise rise-5 mt-16 w-full max-w-md'>
          <div className='-rotate-1 rounded-2xl border border-border/70 bg-card p-5 text-left shadow-raised transition-transform duration-500 hover:rotate-0'>
            <div className='flex items-center justify-between'>
              <p className='eyebrow'>Tuesday, July 14</p>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-[#4d8544]/15 px-2.5 py-0.5 text-xs font-medium text-foreground/85'>
                <span className='size-1.5 rounded-full bg-[#4d8544]' />
                calm
              </span>
            </div>
            <p className='entry-prose mt-3 text-[15px] text-foreground/90'>
              Long walk after dinner, no headphones. Realized the deadline
              stress from last week has mostly lifted…
            </p>
            <p className='mt-3 text-xs text-muted-foreground'>
              Sentiment <span className='font-semibold text-[#4d8544]'>+6</span>{' '}
              · analyzed by Mood
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
