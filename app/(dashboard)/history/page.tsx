import HistoryChart from '@/components/HistoryChart';
import { getUserFromClerkID } from '@/util/auth';
import { prisma } from '@/util/db';
import { Panel } from '@/components/journal';
import { scoreToColor } from '@/util/color';

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
    <div className='space-y-8'>
      {/* Page Header */}
      <div className='rise rise-1'>
        <p className='eyebrow'>Every entry, one line</p>
        <h1 className='mt-1 font-serif text-4xl font-medium tracking-tight'>
          History
        </h1>
      </div>

      {/* Stats */}
      <div className='rise rise-2 grid grid-cols-2 gap-4 sm:max-w-md'>
        <div className='rounded-2xl border border-border/70 bg-card p-5 shadow-card'>
          <p className='font-serif text-3xl font-medium tabular-nums tracking-tight'>
            {analyses.length}
          </p>
          <p className='eyebrow mt-1'>Entries analyzed</p>
        </div>
        <div className='rounded-2xl border border-border/70 bg-card p-5 shadow-card'>
          <p
            className='font-serif text-3xl font-medium tabular-nums tracking-tight'
            style={
              analyses.length > 0
                ? { color: scoreToColor(average) }
                : undefined
            }
          >
            {average > 0 ? '+' : ''}
            {average}
          </p>
          <p className='eyebrow mt-1'>Average score</p>
        </div>
      </div>

      {/* Chart */}
      <div className='rise rise-3'>
        <Panel eyebrow='All time' title='Sentiment, entry by entry'>
          <div className='h-80'>
            {analyses.length > 0 ? (
              <HistoryChart data={analyses} />
            ) : (
              <div className='flex h-full items-center justify-center'>
                <p className='text-sm text-muted-foreground'>
                  No data yet. Start journaling to see your mood trends.
                </p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default HistoryPage;
