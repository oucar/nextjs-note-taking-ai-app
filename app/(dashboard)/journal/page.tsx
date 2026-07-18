import EntryCard from '@/components/EntryCard';
import NewEntry from '@/components/NewEntry';
import Question from '@/components/Question';
import MoodInsights from '@/components/MoodInsights';
import Onboarding from '@/components/Onboarding';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DAYS_PER_PAGE = 30;

// Get entries for the mood timeline (last 60 days to cover current + previous periods)
const getTimelineEntries = async (userId: string) => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 60); // 60 days for 30 current + 30 previous
  startDate.setHours(0, 0, 0, 0);

  return prisma.journalEntry.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      analysis: true,
    },
  });
};

// Get paginated entries for the list
const getEntries = async (page: number) => {
  let user;
  try {
    user = await getUserFromClerkID();
  } catch {
    // If the DB user hasn't been created yet, send the user to onboarding
    // where we create the local DB user (app/new-user/page.tsx).
    redirect('/new-user');
  }

  const now = new Date();
  const endDate = new Date(now);
  // Move backwards in 30-day windows based on the page index
  endDate.setDate(endDate.getDate() - page * DAYS_PER_PAGE);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (DAYS_PER_PAGE - 1));
  startDate.setHours(0, 0, 0, 0);

  const data = await prisma.journalEntry.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      analysis: true,
    },
  });

  // Check if there are older entries (for pagination)
  const olderEntryCount = await prisma.journalEntry.count({
    where: {
      userId: user.id,
      createdAt: {
        lt: startDate,
      },
    },
  });
  const timelineEntries = await getTimelineEntries(user.id);

  return {
    data,
    startDate,
    endDate,
    timelineEntries,
    hasOlderEntries: olderEntryCount > 0,
  };
};

// Group entries by date
type JournalEntry = {
  id: string;
  createdAt: string | Date;
  content: string;
  analysis?: {
    summary?: string | null;
    mood?: string | null;
    sentimentScore?: number | null;
    color?: string | null;
  } | null;
};

const groupEntriesByDate = (entries: JournalEntry[]) => {
  const groups: { [key: string]: JournalEntry[] } = {};

  entries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
  });

  return Object.entries(groups);
};

const PaginationControls = ({
  page,
  hasOlderEntries,
}: {
  page: number;
  hasOlderEntries: boolean;
}) => {
  const olderPage = page + 1; // further back in time
  const newerPage = page - 1; // closer to today
  const hasNewer = page > 0;

  // Don't render if there's nothing to navigate
  if (!hasNewer && !hasOlderEntries) return null;

  return (
    <div className='flex items-center justify-between text-xs text-muted-foreground'>
      {hasNewer ? (
        <Link
          href={newerPage === 0 ? '/journal' : `/journal?page=${newerPage}`}
          className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors hover:bg-accent hover:text-foreground'
        >
          <ArrowLeft className='size-3.5' />
          Newer 30 days
        </Link>
      ) : (
        <div />
      )}

      <span className='eyebrow'>Page {page + 1}</span>

      {hasOlderEntries ? (
        <Link
          href={`/journal?page=${olderPage}`}
          className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors hover:bg-accent hover:text-foreground'
        >
          Older 30 days
          <ArrowRight className='size-3.5' />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
};
type JournalPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

const JournalPage = async ({ searchParams }: JournalPageProps) => {
  const params = await searchParams;
  const rawPage = Number(params?.page ?? '0');
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  const { data, timelineEntries, hasOlderEntries } = await getEntries(page);
  const groupedEntries = groupEntriesByDate(data);

  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div className='rise rise-1 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='eyebrow'>Your journal</p>
          <h1 className='mt-1 font-serif text-4xl font-medium tracking-tight'>
            Entries
          </h1>
        </div>
        <div className='flex items-center gap-2.5'>
          <Question />
          <NewEntry />
        </div>
      </div>

      {/* Mood Insights - Timeline only (fixed last 30 days data) */}
      <div className='rise rise-2'>
        <MoodInsights entries={timelineEntries} />
      </div>

      <div className='rise rise-3 space-y-8'>
        <PaginationControls page={page} hasOlderEntries={hasOlderEntries} />

        {/* Entries List - Grouped by Day */}
        {groupedEntries.length === 0 ? (
          page === 0 ? (
            <Onboarding />
          ) : (
            <section className='rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center'>
              <p className='text-sm text-muted-foreground'>
                No entries in this period.
              </p>
            </section>
          )
        ) : (
          groupedEntries.map(([dateKey, entries]) => (
            <section key={dateKey} className='space-y-2.5'>
              <div className='flex items-center gap-4 px-1'>
                <h2 className='shrink-0 font-serif text-base font-medium text-foreground/90'>
                  {dateKey}
                </h2>
                <div className='h-px flex-1 bg-border/70' />
              </div>
              <div className='divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card'>
                {entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className='block'
                  >
                    <EntryCard entry={entry} />
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}

        <PaginationControls page={page} hasOlderEntries={hasOlderEntries} />
      </div>
    </div>
  );
};

export default JournalPage;
