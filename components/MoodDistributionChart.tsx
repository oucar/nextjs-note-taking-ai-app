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
import { Segmented } from '@/components/journal';

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
    .map(([, v]) => ({
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
    <div className='min-w-[140px] rounded-xl border border-border/70 bg-popover p-3 shadow-raised'>
      <p className='max-w-[200px] truncate text-sm font-medium lowercase'>
        {d.mood}
      </p>
      <p className='mt-0.5 text-xs text-muted-foreground'>
        {d.count} {d.count === 1 ? 'entry' : 'entries'}
      </p>
      <p className='text-xs text-muted-foreground'>
        Avg score:{' '}
        <span className='font-semibold' style={{ color: d.color }}>
          {d.avgScore > 0 ? '+' : ''}
          {d.avgScore}
        </span>
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
        <h3 className='font-serif text-base font-medium tracking-tight'>
          Mood distribution
        </h3>
        <div className='flex h-[280px] items-center justify-center text-sm text-muted-foreground'>
          No mood data yet. Add entries to see distribution.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='font-serif text-base font-medium tracking-tight'>
            Mood distribution
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
        <Segmented
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'donut', label: 'Donut' },
            { value: 'bar', label: 'Bar' },
          ]}
        />
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
                paddingAngle={2}
                cornerRadius={3}
                stroke='var(--card)'
                strokeWidth={2}
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
                iconType='circle'
                iconSize={8}
                wrapperStyle={{ fontSize: '11px' }}
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
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                stroke='var(--border)'
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                angle={-35}
                textAnchor='end'
                interval={0}
                tickFormatter={(v) =>
                  v.length > 12 ? v.slice(0, 10) + '…' : v
                }
              />
              <YAxis
                type='number'
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                stroke='var(--border)'
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent)' }} />
              <Bar dataKey='count' radius={[4, 4, 0, 0]} maxBarSize={40}>
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
