import HistoryChart from '@/components/HistoryChart';
import { getUserFromClerkID } from '@/util/auth';
import { prisma } from '@/util/db';
import { RetroWindow } from '@/components/retro';

const getData = async () => {
  const user = await getUserFromClerkID();
  const analyses = await prisma.entryAnalysis.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: 'asc',
    },
  });

  const total = analyses.reduce(
    (acc: number, curr) => acc + curr.sentimentScore,
    0
  );
  const average = analyses.length > 0 ? Math.round(total / analyses.length) : 0;

  return { analyses, average };
};

const HistoryPage = async () => {
  const { analyses, average } = await getData();

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='space-y-1'>
        <h1 className='text-2xl font-black tracking-tight uppercase'>
          History
        </h1>
        <p className='text-sm text-muted-foreground'>
          Your mood trends over time
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        <RetroWindow title='Entries'>
          <p className='text-3xl font-black font-mono'>{analyses.length}</p>
        </RetroWindow>
        <RetroWindow title='Avg Score'>
          <p className='text-3xl font-black font-mono'>
            {average > 0 ? '+' : ''}
            {average}
          </p>
        </RetroWindow>
      </div>

      {/* Chart */}
      <RetroWindow title='Mood Timeline'>
        <div className='h-80'>
          {analyses.length > 0 ? (
            <HistoryChart data={analyses} />
          ) : (
            <div className='h-full flex items-center justify-center'>
              <p className='text-muted-foreground'>
                No data yet. Start journaling to see your mood trends.
              </p>
            </div>
          )}
        </div>
      </RetroWindow>
    </div>
  );
};

export default HistoryPage;
