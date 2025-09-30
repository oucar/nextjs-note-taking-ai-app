import Editor from '@/components/Editor';
import { getUserFromClerkID } from '@/util/auth';
import { prisma } from '@/util/db';

const getEntry = async (id: string) => {
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
  const entry = await getEntry(params.id as string);

  return (
    <div className='w-full h-full'>
      <Editor entry={entry} />
    </div>
  );
};

export default JournalEditorPage;
