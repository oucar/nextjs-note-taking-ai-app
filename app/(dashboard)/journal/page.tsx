import EntryCard from '@/components/EntryCard';
import NewEntry from '@/components/NewEntry';
import Question from '@/components/Question';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';
import Link from 'next/link';

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

const JournalPage = async () => {
  const data = await getEntries();
  return (
    <div className='flex-1 space-y-8 p-6 md:p-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Journals</h1>
        <p className='text-muted-foreground'>
          Your journal entries and reflections.
        </p>
      </div>
      <Question />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <NewEntry />
        {data.map((entry) => (
          <Link key={entry.id} href={`/journal/${entry.id}`}>
            <EntryCard entry={entry} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JournalPage;
