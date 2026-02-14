'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { scoreToColor } from '@/util/color';
import { cn } from '@/lib/utils';

// When there are more than this many moods, we show top N (bar chart)
const MAX_BARS_WHEN_MANY = 40;
// Donut shows top N slices for readability
const MAX_DONUT_SLICES = 15;

type EntryWithAnalysis = {
  id: string;
  analysis?: {
    mood?: string | null;
    sentimentScore?: number | null;
  } | null;
};

type MoodDistributionChartProps = {
  entries: EntryWithAnalysis[];
};

type BarDataPoint = {
  mood: string;
  count: number;
  avgScore: number;
  color: string;
};

function processMoodDistribution(entries: EntryWithAnalysis[]): {
  data: BarDataPoint[];
  totalMoods: number;
  showingTopN: number | null;
} {
  const withMood = entries.filter(
    (e) => e.analysis?.mood != null && String(e.analysis.mood).trim() !== ''
  );
  if (withMood.length === 0)
    return { data: [], totalMoods: 0, showingTopN: null };

  const byKey: Record<
    string,
    { count: number; totalScore: number; displayLabel: string }
  > = {};

  withMood.forEach((entry) => {
    const raw = String(entry.analysis!.mood).trim();
    const key = raw.toLowerCase();
    const score = entry.analysis?.sentimentScore ?? 0;

    if (!byKey[key]) {
      byKey[key] = { count: 0, totalScore: 0, displayLabel: raw };
    }
    byKey[key].count += 1;
    byKey[key].totalScore += score;
  });

  const sorted = Object.entries(byKey)
    .map(([_, v]) => ({
      mood: v.displayLabel,
      count: v.count,
      avgScore:
        v.count > 0 ? Math.round((v.totalScore / v.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const totalMoods = sorted.length;
  const data =
    totalMoods > MAX_BARS_WHEN_MANY
      ? sorted.slice(0, MAX_BARS_WHEN_MANY)
      : sorted;

  return {
    data: data.map((d) => ({
      ...d,
      color: scoreToColor(d.avgScore),
    })),
    totalMoods,
    showingTopN: totalMoods > MAX_BARS_WHEN_MANY ? MAX_BARS_WHEN_MANY : null,
  };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: BarDataPoint }[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className='bg-card border-2 border-foreground/20 shadow-[2px_2px_0_rgba(0,0,0,0.15)] p-3 min-w-[140px]'>
      <p className='text-sm font-bold uppercase truncate max-w-[200px]'>
        {d.mood}
      </p>
      <p className='text-xs font-mono text-muted-foreground'>
        {d.count} {d.count === 1 ? 'entry' : 'entries'}
      </p>
      <p className='text-xs font-mono' style={{ color: d.color }}>
        Avg score: {d.avgScore > 0 ? '+' : ''}
        {d.avgScore}
      </p>
    </div>
  );
};

type ViewMode = 'bar' | 'donut';

export default function MoodDistributionChart({
  entries,
}: MoodDistributionChartProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('donut');
  const { data, totalMoods, showingTopN } = React.useMemo(
    () => processMoodDistribution(entries),
    [entries]
  );

  const donutData = React.useMemo(
    () =>
      data
        .slice(0, MAX_DONUT_SLICES)
        .map((d) => ({ ...d, name: d.mood, value: d.count })),
    [data]
  );
  const donutShowingTop = data.length > MAX_DONUT_SLICES;

  if (data.length === 0) {
    return (
      <div className='space-y-4'>
        <h3 className='text-sm font-bold uppercase tracking-wide'>
          Mood Distribution
        </h3>
        <div className='h-[280px] flex items-center justify-center text-muted-foreground text-sm'>
          No mood data yet. Add entries to see distribution.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-sm font-bold uppercase tracking-wide'>
            Mood Distribution
          </h3>
          {viewMode === 'bar' ? (
            showingTopN != null ? (
              <p className='text-xs text-muted-foreground mt-0.5'>
                Showing top {showingTopN} moods by frequency (of {totalMoods}{' '}
                total)
              </p>
            ) : (
              <p className='text-xs text-muted-foreground mt-0.5'>
                All {totalMoods} moods
              </p>
            )
          ) : donutShowingTop ? (
            <p className='text-xs text-muted-foreground mt-0.5'>
              Top {MAX_DONUT_SLICES} moods (of {totalMoods} total)
            </p>
          ) : (
            <p className='text-xs text-muted-foreground mt-0.5'>
              All {totalMoods} moods
            </p>
          )}
        </div>
        <div className='flex border-2 border-foreground/20 shrink-0'>
          <button
            type='button'
            onClick={() => setViewMode('donut')}
            className={cn(
              'px-3 py-1 text-xs font-bold uppercase transition-colors',
              viewMode === 'donut'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent'
            )}
          >
            Donut
          </button>
          <button
            type='button'
            onClick={() => setViewMode('bar')}
            className={cn(
              'px-3 py-1 text-xs font-bold uppercase transition-colors border-l-2 border-foreground/20',
              viewMode === 'bar'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent'
            )}
          >
            Bar
          </button>
        </div>
      </div>
      <div className='h-[280px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          {viewMode === 'donut' ? (
            <PieChart>
              <Pie
                data={donutData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius='55%'
                outerRadius='85%'
                paddingAngle={1}
                stroke='var(--card)'
                strokeWidth={1.5}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout='vertical'
                align='right'
                verticalAlign='middle'
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                formatter={(value) =>
                  value.length > 14 ? value.slice(0, 12) + '…' : value
                }
              />
            </PieChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
            >
              <XAxis
                dataKey='mood'
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                stroke='var(--muted-foreground)'
                tickLine={false}
                angle={-35}
                textAnchor='end'
                interval={0}
                tickFormatter={(v) =>
                  v.length > 12 ? v.slice(0, 10) + '…' : v
                }
              />
              <YAxis
                type='number'
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                stroke='var(--muted-foreground)'
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='count' radius={[2, 2, 0, 0]} maxBarSize={48}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
