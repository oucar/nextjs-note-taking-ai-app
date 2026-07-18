import Editor from '@/components/Editor';
import { getUserFromClerkID } from '@/util/auth';
import { prisma } from '@/util/db';
import { notFound } from 'next/navigation';

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

const JournalEditorPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const entry = await getEntry(id);

  if (!entry) notFound();

  return <Editor entry={entry} />;
};

export default JournalEditorPage;
