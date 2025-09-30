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
    <div className='px-6 py-8 bg-zinc-100/50 h-full'>
      <h1 className='text-4xl mb-12'>Journals</h1>
      <div className='my-8'>
        <Question />
      </div>
      <div className='grid grid-cols-3 gap-4'>
        <NewEntry />
        {data.map((entry) => (
          <div key={entry.id}>
            <Link href={`/journal/${entry.id}`}>
              <EntryCard entry={entry} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalPage;
