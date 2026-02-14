'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RetroWindow } from '@/components/retro';
import { scoreToColor } from '@/util/color';
import { cn } from '@/lib/utils';
import MoodDistributionChart from '@/components/MoodDistributionChart';

// Types
type AnalysisData = {
  id: string;
  createdAt: string | Date;
  analysis?: {
    sentimentScore?: number | null;
    mood?: string | null;
  } | null;
};

type MoodInsightsProps = {
  entries: AnalysisData[];
};

type TimelineDataPoint = {
  date: string;
  label: string;
  current?: number | null;
  previous?: number | null;
  currentCount?: number;
  previousCount?: number;
};

type HeatmapDataPoint = {
  day: number;
  score: number | null;
  count: number;
};

type MonthHeatmapData = {
  month: string;
  year: number;
  days: HeatmapDataPoint[];
  avgScore: number | null;
};

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const formatDateLabel = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Process entries for timeline chart
const processTimelineData = (
  entries: AnalysisData[],
  mode: '7days' | '30days'
): TimelineDataPoint[] => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const daysCount = mode === '7days' ? 7 : 30;

  // Group entries by date
  const entriesByDate: Record<string, number[]> = {};

  entries.forEach((entry) => {
    if (entry.analysis?.sentimentScore == null) return;
    const date = new Date(entry.createdAt);
    const key = getDateKey(date);
    if (!entriesByDate[key]) entriesByDate[key] = [];
    entriesByDate[key].push(entry.analysis.sentimentScore);
  });

  // Generate data points
  const data: TimelineDataPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const currentDate = new Date(now);
    currentDate.setDate(currentDate.getDate() - i);
    const currentKey = getDateKey(currentDate);

    const previousDate = new Date(now);
    previousDate.setDate(previousDate.getDate() - i - daysCount);
    const previousKey = getDateKey(previousDate);

    const currentScores = entriesByDate[currentKey] || [];
    const previousScores = entriesByDate[previousKey] || [];

    const currentAvg =
      currentScores.length > 0
        ? Math.round(
            (currentScores.reduce((a, b) => a + b, 0) / currentScores.length) *
              10
          ) / 10
        : null;

    const previousAvg =
      previousScores.length > 0
        ? Math.round(
            (previousScores.reduce((a, b) => a + b, 0) /
              previousScores.length) *
              10
          ) / 10
        : null;

    data.push({
      date: currentKey,
      label: formatDateLabel(currentDate),
      current: currentAvg,
      previous: previousAvg,
      currentCount: currentScores.length,
      previousCount: previousScores.length,
    });
  }

  return data;
};

// Process entries for heatmap
const processHeatmapData = (entries: AnalysisData[]): MonthHeatmapData[] => {
  const now = new Date();
  const months: MonthHeatmapData[] = [];

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    const monthData: MonthHeatmapData = {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year,
      days: [],
      avgScore: null,
    };

    // Initialize days
    const dayScores: Record<number, number[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dayScores[d] = [];
    }

    // Group entries by day
    entries.forEach((entry) => {
      if (entry.analysis?.sentimentScore == null) return;
      const entryDate = new Date(entry.createdAt);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        const day = entryDate.getDate();
        dayScores[day].push(entry.analysis.sentimentScore);
      }
    });

    // Calculate averages
    const totalScores: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const scores = dayScores[d];
      const avg =
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
            ) / 10
          : null;
      monthData.days.push({
        day: d,
        score: avg,
        count: scores.length,
      });
      if (scores.length > 0) totalScores.push(...scores);
    }

    monthData.avgScore =
      totalScores.length > 0
        ? Math.round(
            (totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 10
          ) / 10
        : null;

    months.push(monthData);
  }

  return months;
};

// Custom Tooltip for Timeline
type TooltipPayloadItem = {
  value: number | null;
  dataKey: string;
  payload: TimelineDataPoint;
};

const TimelineTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (!active || !payload?.length) return null;

  const dataPoint = payload[0]?.payload as TimelineDataPoint;

  return (
    <div className='bg-card border-2 border-foreground/20 shadow-[2px_2px_0_rgba(0,0,0,0.15)] p-3 min-w-[160px]'>
      <p className='text-xs font-mono text-muted-foreground mb-2'>
        {dataPoint.label}
      </p>
      {payload.map((p, idx: number) => {
        if (p.value == null) return null;
        const color = scoreToColor(p.value);
        const isPrevious = p.dataKey === 'previous';
        return (
          <div key={idx} className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <div
                className='w-3 h-3 border border-foreground/30'
                style={{
                  backgroundColor: isPrevious
                    ? 'var(--muted-foreground)'
                    : color,
                }}
              />
              <span className='text-xs font-mono'>
                {isPrevious ? 'Previous' : 'Current'}
              </span>
            </div>
            <span
              className='text-sm font-bold'
              style={{ color: isPrevious ? 'var(--muted-foreground)' : color }}
            >
              {p.value > 0 ? '+' : ''}
              {p.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Custom dot for current period
type DotProps = {
  cx?: number;
  cy?: number;
  payload?: TimelineDataPoint;
};

const CurrentDot = (props: DotProps) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.current == null || cx == null || cy == null)
    return null;
  const color = scoreToColor(payload.current);
  return (
    <rect
      x={cx - 4}
      y={cy - 4}
      width={8}
      height={8}
      fill={color}
      stroke='var(--foreground)'
      strokeWidth={1.5}
    />
  );
};

// Custom dot for previous period
const PreviousDot = (props: DotProps) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.previous == null || cx == null || cy == null)
    return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill='var(--muted)'
      stroke='var(--muted-foreground)'
      strokeWidth={1.5}
    />
  );
};

// Timeline Component
const MoodTimeline = ({ entries }: { entries: AnalysisData[] }) => {
  const [mode, setMode] = React.useState<'7days' | '30days'>('7days');
  const data = React.useMemo(
    () => processTimelineData(entries, mode),
    [entries, mode]
  );

  const hasData = data.some((d) => d.current != null || d.previous != null);

  return (
    <div className='space-y-4'>
      {/* Mode Toggle */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-bold uppercase tracking-wide'>
          Mood Timeline
        </h3>
        <div className='flex border-2 border-foreground/20'>
          <button
            onClick={() => setMode('7days')}
            className={cn(
              'px-3 py-1 text-xs font-bold uppercase transition-colors',
              mode === '7days'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent'
            )}
          >
            7 Days
          </button>
          <button
            onClick={() => setMode('30days')}
            className={cn(
              'px-3 py-1 text-xs font-bold uppercase transition-colors border-l-2 border-foreground/20',
              mode === '30days'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent'
            )}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className='h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey='label'
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                stroke='var(--muted-foreground)'
                tickLine={false}
                interval={mode === '30days' ? 4 : 0}
              />
              <YAxis
                domain={[-10, 10]}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                stroke='var(--muted-foreground)'
                tickLine={false}
                ticks={[-10, -5, 0, 5, 10]}
              />
              <ReferenceLine
                y={0}
                stroke='var(--border)'
                strokeDasharray='3 3'
              />
              <Tooltip content={<TimelineTooltip />} />
              <Legend
                verticalAlign='top'
                align='right'
                iconType='square'
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
              />
              <Line
                name={`Previous ${mode === '7days' ? '7' : '30'} days`}
                type='monotone'
                dataKey='previous'
                stroke='var(--muted-foreground)'
                strokeWidth={2}
                strokeDasharray='4 4'
                dot={<PreviousDot />}
                connectNulls
              />
              <Line
                name={`Last ${mode === '7days' ? '7' : '30'} days`}
                type='monotone'
                dataKey='current'
                stroke='var(--primary)'
                strokeWidth={2}
                dot={<CurrentDot />}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className='h-[200px] flex items-center justify-center text-muted-foreground text-sm'>
          No mood data available for this period
        </div>
      )}

      {/* Legend explanation */}
      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
        <div className='flex items-center gap-1'>
          <div className='w-8 h-0.5 bg-primary' />
          <span>Current period</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-8 h-0.5 bg-muted-foreground'
            style={{ borderTop: '2px dashed var(--muted-foreground)' }}
          />
          <span>Previous period</span>
        </div>
      </div>
    </div>
  );
};

// Heatmap Cell Component
const HeatmapCell = ({
  score,
  day,
  count,
}: {
  score: number | null;
  day: number;
  count: number;
}) => {
  const bgColor = score != null ? scoreToColor(score) : 'var(--muted)';
  const opacity = score != null ? 1 : 0.3;

  return (
    <div
      className='relative group cursor-default'
      title={
        score != null
          ? `Day ${day}: ${score > 0 ? '+' : ''}${score} (${count} entries)`
          : `Day ${day}: No entries`
      }
    >
      <div
        className='w-3 h-3 border border-foreground/10'
        style={{ backgroundColor: bgColor, opacity }}
      />
    </div>
  );
};

// Heatmap Component
const MoodHeatmap = ({ entries }: { entries: AnalysisData[] }) => {
  const heatmapData = React.useMemo(
    () => processHeatmapData(entries),
    [entries]
  );

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-bold uppercase tracking-wide'>
        Mood Heatmap (Last 12 Months)
      </h3>

      {/* Heatmap Grid */}
      <div className='overflow-x-auto'>
        <div className='min-w-[600px]'>
          {/* Month labels */}
          <div className='flex gap-1 mb-1'>
            <div className='w-10 shrink-0' /> {/* Spacer for day labels */}
            {heatmapData.map((month, idx) => (
              <div key={idx} className='flex-1 text-center'>
                <span className='text-[10px] font-mono text-muted-foreground uppercase'>
                  {month.month}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap rows (days 1-31) */}
          {Array.from({ length: 31 }, (_, dayIndex) => (
            <div key={dayIndex} className='flex gap-1 items-center'>
              {/* Day label (show every 5th day) */}
              <div className='w-10 shrink-0 text-right pr-2'>
                {(dayIndex + 1) % 5 === 1 && (
                  <span className='text-[10px] font-mono text-muted-foreground'>
                    {dayIndex + 1}
                  </span>
                )}
              </div>

              {/* Month cells */}
              {heatmapData.map((month, monthIdx) => {
                const dayData = month.days[dayIndex];
                if (!dayData) {
                  // Day doesn't exist in this month
                  return (
                    <div key={monthIdx} className='flex-1 flex justify-center'>
                      <div className='w-3 h-3' />
                    </div>
                  );
                }
                return (
                  <div key={monthIdx} className='flex-1 flex justify-center'>
                    <HeatmapCell
                      score={dayData.score}
                      day={dayData.day}
                      count={dayData.count}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly averages */}
      <div className='flex gap-1 items-center mt-2'>
        <div className='w-10 shrink-0 text-right pr-2'>
          <span className='text-[10px] font-mono text-muted-foreground'>
            AVG
          </span>
        </div>
        {heatmapData.map((month, idx) => (
          <div key={idx} className='flex-1 flex justify-center'>
            {month.avgScore != null ? (
              <span
                className='text-[10px] font-bold font-mono'
                style={{ color: scoreToColor(month.avgScore) }}
              >
                {month.avgScore > 0 ? '+' : ''}
                {month.avgScore}
              </span>
            ) : (
              <span className='text-[10px] text-muted-foreground'>-</span>
            )}
          </div>
        ))}
      </div>

      {/* Color scale legend */}
      <div className='flex items-center justify-center gap-2 mt-4'>
        <span className='text-[10px] font-mono text-muted-foreground'>-10</span>
        <div className='flex'>
          {Array.from({ length: 21 }, (_, i) => {
            const score = i - 10;
            return (
              <div
                key={i}
                className='w-3 h-3'
                style={{ backgroundColor: scoreToColor(score) }}
              />
            );
          })}
        </div>
        <span className='text-[10px] font-mono text-muted-foreground'>+10</span>
      </div>
    </div>
  );
};

// Export individual components for use in different pages
export { MoodTimeline, MoodHeatmap };

// Process timeline data for a specific date range (for Statistics page)
const processTimelineDataForRange = (
  entries: AnalysisData[],
  mode: 'alltime' | '30days'
): TimelineDataPoint[] => {
  if (mode === '30days') {
    return processTimelineData(entries, '30days');
  }

  // For all-time, group by week instead of day
  const entriesByWeek: Record<string, number[]> = {};
  const weekLabels: Record<string, string> = {};

  entries.forEach((entry) => {
    if (entry.analysis?.sentimentScore == null) return;
    const date = new Date(entry.createdAt);
    // Get week start (Sunday)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = getDateKey(weekStart);
    if (!entriesByWeek[key]) {
      entriesByWeek[key] = [];
      weekLabels[key] = weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    entriesByWeek[key].push(entry.analysis.sentimentScore);
  });

  // Sort by date and return
  return Object.keys(entriesByWeek)
    .sort()
    .map((key) => {
      const scores = entriesByWeek[key];
      const avg =
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
            ) / 10
          : null;
      return {
        date: key,
        label: weekLabels[key],
        current: avg,
        currentCount: scores.length,
      };
    });
};

// Statistics page Mood Timeline with All Time / 30 Days toggle
const StatsMoodTimeline = ({ entries }: { entries: AnalysisData[] }) => {
  const [mode, setMode] = React.useState<'alltime' | '30days'>('30days');
  const data = React.useMemo(
    () => processTimelineDataForRange(entries, mode),
    [entries, mode]
  );

  const hasData = data.some((d) => d.current != null);

  return (
    <div className='space-y-4'>
      {/* Mode Toggle */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-bold uppercase tracking-wide'>
          Mood Timeline
        </h3>
        <div className='flex border-2 border-foreground/20'>
          <button
            onClick={() => setMode('30days')}
            className={cn(
              'px-3 py-1 text-xs font-bold uppercase transition-colors',
              mode === '30days'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent'
            )}
          >
            30 Days
          </button>
          <button
            onClick={() => setMode('alltime')}
            className={cn(
              'px-3 py-1 text-xs font-bold uppercase transition-colors border-l-2 border-foreground/20',
              mode === 'alltime'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent'
            )}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className='h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey='label'
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                stroke='var(--muted-foreground)'
                tickLine={false}
                interval={mode === 'alltime' ? 'preserveStartEnd' : 4}
              />
              <YAxis
                domain={[-10, 10]}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                stroke='var(--muted-foreground)'
                tickLine={false}
                ticks={[-10, -5, 0, 5, 10]}
              />
              <ReferenceLine
                y={0}
                stroke='var(--border)'
                strokeDasharray='3 3'
              />
              <Tooltip content={<TimelineTooltip />} />
              {mode === '30days' && (
                <Legend
                  verticalAlign='top'
                  align='right'
                  iconType='square'
                  wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                />
              )}
              {mode === '30days' && (
                <Line
                  name='Previous 30 days'
                  type='monotone'
                  dataKey='previous'
                  stroke='var(--muted-foreground)'
                  strokeWidth={2}
                  strokeDasharray='4 4'
                  dot={<PreviousDot />}
                  connectNulls
                />
              )}
              <Line
                name={mode === '30days' ? 'Last 30 days' : 'Weekly average'}
                type='monotone'
                dataKey='current'
                stroke='var(--primary)'
                strokeWidth={2}
                dot={<CurrentDot />}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className='h-[200px] flex items-center justify-center text-muted-foreground text-sm'>
          No mood data available
        </div>
      )}

      {/* Legend explanation for 30 days mode */}
      {mode === '30days' && (
        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <div className='w-8 h-0.5 bg-primary' />
            <span>Current period</span>
          </div>
          <div className='flex items-center gap-1'>
            <div
              className='w-8 h-0.5 bg-muted-foreground'
              style={{ borderTop: '2px dashed var(--muted-foreground)' }}
            />
            <span>Previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { StatsMoodTimeline };

// Main MoodInsights Component (used on journal page - timeline only)
export default function MoodInsights({ entries }: MoodInsightsProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <RetroWindow
        title='Mood Insights'
        actions={
          <CollapsibleTrigger asChild>
            <button className='px-2 py-0.5 text-xs font-bold uppercase bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors'>
              {isOpen ? '▲ Collapse' : '▼ Expand'}
            </button>
          </CollapsibleTrigger>
        }
      >
        <CollapsibleContent>
          {/* Mood Timeline only */}
          <MoodTimeline entries={entries} />
        </CollapsibleContent>

        {/* Collapsed state summary */}
        {!isOpen && (
          <div className='text-sm text-muted-foreground text-center py-2'>
            Click expand to view mood timeline
          </div>
        )}
      </RetroWindow>
    </Collapsible>
  );
}

// Full Statistics MoodInsights Component (used on statistics page)
export function FullMoodInsights({ entries }: MoodInsightsProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <RetroWindow
        title='Mood Statistics'
        actions={
          <CollapsibleTrigger asChild>
            <button className='px-2 py-0.5 text-xs font-bold uppercase bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors'>
              {isOpen ? '▲ Collapse' : '▼ Expand'}
            </button>
          </CollapsibleTrigger>
        }
      >
        <CollapsibleContent>
          <div className='space-y-8'>
            {/* Mood Distribution bar chart */}
            <MoodDistributionChart entries={entries} />

            {/* Divider */}
            <div className='border-t-2 border-foreground/10' />

            {/* Mood Timeline with All Time / 30 Days */}
            <StatsMoodTimeline entries={entries} />

            {/* Divider */}
            <div className='border-t-2 border-foreground/10' />

            {/* Mood Heatmap (All Time) */}
            <MoodHeatmap entries={entries} />
          </div>
        </CollapsibleContent>

        {/* Collapsed state summary */}
        {!isOpen && (
          <div className='text-sm text-muted-foreground text-center py-2'>
            Click expand to view mood statistics and heatmap
          </div>
        )}
      </RetroWindow>
    </Collapsible>
  );
}
