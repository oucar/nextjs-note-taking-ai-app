import EntryCard from '@/components/EntryCard';
import NewEntry from '@/components/NewEntry';
import Question from '@/components/Question';
import MoodInsights from '@/components/MoodInsights';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';
import Link from 'next/link';
import { RetroWindow } from '@/components/retro';

const DAYS_PER_PAGE = 30;

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

  return { data, startDate, endDate };
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

const PaginationControls = ({ page }: { page: number }) => {
  const olderPage = page + 1; // further back in time
  const newerPage = page - 1; // closer to today
  const hasNewer = page > 0;

  return (
    <div className='flex items-center justify-between text-xs sm:text-sm text-muted-foreground'>
      <Link
        href={`/journal?page=${olderPage}`}
        className='inline-flex items-center gap-1 hover:underline'
      >
        <span>{''}</span>
        <span>Older 30 days</span>
      </Link>
      <span className='font-medium tracking-tight uppercase'>
        Page {page + 1}
      </span>
      {hasNewer ? (
        <Link
          href={newerPage === 0 ? '/journal' : `/journal?page=${newerPage}`}
          className='inline-flex items-center gap-1 hover:underline'
        >
          <span>Newer 30 days</span>
          <span>{''}</span>
        </Link>
      ) : (
        <span className='inline-flex items-center gap-1 opacity-40'>
          <span>Newer 30 days</span>
          <span>{''}</span>
        </span>
      )}
    </div>
  );
};

type JournalPageProps = {
  searchParams?: {
    page?: string;
  };
};

const JournalPage = async ({ searchParams }: JournalPageProps) => {
  const rawPage = Number(searchParams?.page ?? '0');
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  const { data, startDate, endDate } = await getEntries(page);
  const groupedEntries = groupEntriesByDate(data);

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='space-y-1'>
        <h1 className='text-2xl font-black tracking-tight uppercase'>
          Journals
        </h1>
        <p className='text-sm text-muted-foreground'>
          Your journal entries and reflections
        </p>
      </div>

      {/* Pagination Controls - Top */}
      <PaginationControls page={page} />

      {/* Mood Insights - Timeline & Heatmap for current window */}
      <MoodInsights entries={data} />

      {/* Action Bar: Question + New Entry */}
      <RetroWindow title='Actions' className='overflow-hidden'>
        <div className='flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between'>
          <div className='flex-1 max-w-xl'>
            <Question />
          </div>
          <NewEntry />
        </div>
      </RetroWindow>

      {/* Entries List - Grouped by Day */}
      <div className='space-y-4'>
        {groupedEntries.length === 0 ? (
          <RetroWindow title='No Entries'>
            <p className='text-muted-foreground text-center py-8'>
              No journal entries yet. Click the button above to create your
              first entry.
            </p>
          </RetroWindow>
        ) : (
          groupedEntries.map(([dateKey, entries]) => (
            <RetroWindow key={dateKey} title={dateKey}>
              <div className='divide-y-2 divide-foreground/5'>
                {entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className='block no-underline'
                  >
                    <EntryCard entry={entry} />
                  </Link>
                ))}
              </div>
            </RetroWindow>
          ))
        )}
      </div>

      {/* Pagination Controls - Bottom */}
      <PaginationControls page={page} />
    </div>
  );
};

export default JournalPage;
