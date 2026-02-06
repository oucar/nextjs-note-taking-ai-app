import EntryCard from '@/components/EntryCard';
import NewEntry from '@/components/NewEntry';
import Question from '@/components/Question';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';
import Link from 'next/link';
import { RetroWindow } from '@/components/retro';

const getEntries = async () => {
  let user;
  try {
    user = await getUserFromClerkID();
  } catch {
    // If the DB user hasn't been created yet, send the user to onboarding
    // where we create the local DB user (app/new-user/page.tsx).
    redirect('/new-user');
  }
  const data = await prisma.journalEntry.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      analysis: true,
    },
  });

  return data;
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

const JournalPage = async () => {
  const data = await getEntries();
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
    </div>
  );
};

export default JournalPage;
