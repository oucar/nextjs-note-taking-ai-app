import { FullMoodInsights } from '@/components/MoodInsights';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';

// Get all entries for the user (for all-time statistics)
const getAllEntries = async () => {
  let user;
  try {
    user = await getUserFromClerkID();
  } catch {
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

const StatisticsPage = async () => {
  const entries = await getAllEntries();

  // Calculate some basic stats
  const totalEntries = entries.length;
  const entriesWithMood = entries.filter(
    (e) => e.analysis?.sentimentScore != null
  );
  const avgMood =
    entriesWithMood.length > 0
      ? Math.round(
          (entriesWithMood.reduce(
            (sum, e) => sum + (e.analysis?.sentimentScore ?? 0),
            0
          ) /
            entriesWithMood.length) *
            10
        ) / 10
      : null;

  // Get date range
  const oldestEntry = entries[entries.length - 1];
  const newestEntry = entries[0];
  const dateRange =
    oldestEntry && newestEntry
      ? {
          from: new Date(oldestEntry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          to: new Date(newestEntry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }
      : null;

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='space-y-1'>
        <h1 className='text-2xl font-black tracking-tight uppercase'>
          Statistics
        </h1>
        <p className='text-sm text-muted-foreground'>
          Your mood trends and insights over time
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='border-2 border-foreground/20 bg-card p-4'>
          <div className='text-2xl font-black'>{totalEntries}</div>
          <div className='text-xs text-muted-foreground uppercase tracking-wide'>
            Total Entries
          </div>
        </div>
        <div className='border-2 border-foreground/20 bg-card p-4'>
          <div className='text-2xl font-black'>
            {avgMood != null ? (avgMood > 0 ? `+${avgMood}` : avgMood) : '-'}
          </div>
          <div className='text-xs text-muted-foreground uppercase tracking-wide'>
            Avg Mood Score
          </div>
        </div>
        <div className='border-2 border-foreground/20 bg-card p-4 col-span-2'>
          <div className='text-sm font-bold truncate'>
            {dateRange ? `${dateRange.from} - ${dateRange.to}` : '-'}
          </div>
          <div className='text-xs text-muted-foreground uppercase tracking-wide'>
            Date Range
          </div>
        </div>
      </div>

      {/* Full Mood Insights with Timeline (All Time / 30 Days) and Heatmap */}
      <FullMoodInsights entries={entries} />
    </div>
  );
};

export default StatisticsPage;
