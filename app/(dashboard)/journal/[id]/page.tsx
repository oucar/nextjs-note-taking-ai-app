import Editor from '@/components/Editor';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';

const getEntry = async (id) => {
  let user;
  try {
    user = await getUserFromClerkID();
  } catch {
    redirect('/new-user');
  }
  const entry = await prisma.journalEntry.findUnique({
    where: {
      userId_id: {
        userId: user.id,
        id,
      },
    },
    include: {
      analysis: true,
    },
  });

  return entry;
};

const JournalEditorPage = async ({ params }) => {
  const entry = await getEntry(params.id);

  return (
    <div className='h-full'>
      <Editor entry={entry} />
    </div>
  );
};

export default JournalEditorPage;
