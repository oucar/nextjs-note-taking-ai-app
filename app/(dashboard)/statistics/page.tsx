import { FullMoodInsights } from '@/components/MoodInsights';
import { getUserFromClerkID } from '@/util/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/util/db';
import { scoreToColor } from '@/util/color';

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

const StatTile = ({
  label,
  value,
  valueColor,
  wide = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  wide?: boolean;
}) => (
  <div
    className={`rounded-2xl border border-border/70 bg-card p-5 shadow-card ${
      wide ? 'col-span-2' : ''
    }`}
  >
    <p
      className='truncate font-serif text-3xl font-medium tabular-nums tracking-tight'
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </p>
    <p className='eyebrow mt-1'>{label}</p>
  </div>
);

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
    <div className='space-y-8'>
      {/* Page Header */}
      <div className='rise rise-1'>
        <p className='eyebrow'>The numbers behind the feelings</p>
        <h1 className='mt-1 font-serif text-4xl font-medium tracking-tight'>
          Statistics
        </h1>
      </div>

      {/* Quick Stats */}
      <div className='rise rise-2 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <StatTile label='Total entries' value={String(totalEntries)} />
        <StatTile
          label='Avg mood score'
          value={
            avgMood != null ? (avgMood > 0 ? `+${avgMood}` : `${avgMood}`) : '–'
          }
          valueColor={avgMood != null ? scoreToColor(avgMood) : undefined}
        />
        <StatTile
          label='Writing since'
          value={dateRange ? dateRange.from : '–'}
          wide
        />
      </div>

      {/* Full Mood Insights with Timeline (All Time / 30 Days) and Heatmap */}
      <div className='rise rise-3'>
        <FullMoodInsights entries={entries} />
      </div>
    </div>
  );
};

export default StatisticsPage;
