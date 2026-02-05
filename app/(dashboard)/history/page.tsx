import Editor from '@/components/Editor';
import { getUserFromClerkID } from '@/util/auth';
import { prisma } from '@/util/db';

const getEntry = async (id?: string) => {
  if (!id) return null;
  const user = await getUserFromClerkID();
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

const JournalEditorPage = async ({ params }: any) => {
  const id = params?.id;
  if (!id || typeof id !== 'string') {
    // No specific entry requested — render a simple placeholder or redirect as desired.
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <p className='text-lg text-muted-foreground'>No entry selected.</p>
      </div>
    );
  }

  const entry = await getEntry(id);

  return (
    <div className='h-full'>
      <Editor entry={entry} />
    </div>
  );
};

export default JournalEditorPage;
