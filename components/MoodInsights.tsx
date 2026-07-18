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
} from 'recharts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Panel, Segmented } from '@/components/journal';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
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

// Shared axis styling
const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' };

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
    <div className='min-w-[160px] rounded-xl border border-border/70 bg-popover p-3 shadow-raised'>
      <p className='eyebrow mb-2'>{dataPoint.label}</p>
      {payload.map((p, idx: number) => {
        if (p.value == null) return null;
        const color = scoreToColor(p.value);
        const isPrevious = p.dataKey === 'previous';
        return (
          <div key={idx} className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <span
                className='size-2 rounded-full'
                style={{
                  backgroundColor: isPrevious
                    ? 'var(--muted-foreground)'
                    : color,
                }}
              />
              <span className='text-xs text-muted-foreground'>
                {isPrevious ? 'Previous' : 'Current'}
              </span>
            </div>
            <span className='text-sm font-semibold tabular-nums text-foreground'>
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
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke='var(--card)'
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
      r={3}
      fill='var(--muted-foreground)'
      stroke='var(--card)'
      strokeWidth={1.5}
    />
  );
};

const PeriodLegend = ({ periodLabel }: { periodLabel: string }) => (
  <div className='flex items-center gap-5 text-xs text-muted-foreground'>
    <div className='flex items-center gap-1.5'>
      <span className='inline-block h-0.5 w-6 rounded-full bg-primary' />
      <span>Last {periodLabel}</span>
    </div>
    <div className='flex items-center gap-1.5'>
      <span
        className='inline-block w-6 border-t-2 border-dashed border-muted-foreground'
        aria-hidden
      />
      <span>Previous {periodLabel}</span>
    </div>
  </div>
);

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
      <div className='flex items-center justify-between gap-3'>
        <h3 className='font-serif text-base font-medium tracking-tight'>
          Mood timeline
        </h3>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: '7days', label: '7 days' },
            { value: '30days', label: '30 days' },
          ]}
        />
      </div>

      {hasData ? (
        <div className='h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey='label'
                tick={axisTick}
                stroke='var(--border)'
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval={mode === '30days' ? 4 : 0}
              />
              <YAxis
                domain={[-10, 10]}
                tick={axisTick}
                stroke='var(--border)'
                tickLine={false}
                axisLine={false}
                ticks={[-10, -5, 0, 5, 10]}
              />
              <ReferenceLine
                y={0}
                stroke='var(--border)'
                strokeDasharray='3 3'
              />
              <Tooltip content={<TimelineTooltip />} cursor={{ stroke: 'var(--border)' }} />
              <Line
                name='Previous period'
                type='monotone'
                dataKey='previous'
                stroke='var(--muted-foreground)'
                strokeWidth={1.5}
                strokeDasharray='4 4'
                dot={<PreviousDot />}
                connectNulls
              />
              <Line
                name='Current period'
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
        <div className='flex h-[200px] items-center justify-center text-sm text-muted-foreground'>
          No mood data available for this period
        </div>
      )}

      <PeriodLegend periodLabel={mode === '7days' ? '7 days' : '30 days'} />
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
  return (
    <div
      className='group relative cursor-default'
      title={
        score != null
          ? `Day ${day}: ${score > 0 ? '+' : ''}${score} (${count} entries)`
          : `Day ${day}: No entries`
      }
    >
      <div
        className='size-3 rounded-[3px]'
        style={
          score != null
            ? { backgroundColor: scoreToColor(score) }
            : { backgroundColor: 'var(--muted)' }
        }
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
      <h3 className='font-serif text-base font-medium tracking-tight'>
        A year of moods
      </h3>

      {/* Heatmap Grid */}
      <div className='overflow-x-auto'>
        <div className='min-w-[600px]'>
          {/* Month labels */}
          <div className='mb-1.5 flex gap-1'>
            <div className='w-10 shrink-0' /> {/* Spacer for day labels */}
            {heatmapData.map((month, idx) => (
              <div key={idx} className='flex-1 text-center'>
                <span className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {month.month}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap rows (days 1-31) */}
          {Array.from({ length: 31 }, (_, dayIndex) => (
            <div key={dayIndex} className='flex items-center gap-1 pb-px'>
              {/* Day label (show every 5th day) */}
              <div className='w-10 shrink-0 pr-2 text-right'>
                {(dayIndex + 1) % 5 === 1 && (
                  <span className='text-[10px] tabular-nums text-muted-foreground'>
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
                    <div key={monthIdx} className='flex flex-1 justify-center'>
                      <div className='size-3' />
                    </div>
                  );
                }
                return (
                  <div key={monthIdx} className='flex flex-1 justify-center'>
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

          {/* Monthly averages */}
          <div className='mt-2 flex items-center gap-1 border-t border-border/50 pt-2'>
            <div className='w-10 shrink-0 pr-2 text-right'>
              <span className='eyebrow text-[10px]'>Avg</span>
            </div>
            {heatmapData.map((month, idx) => (
              <div key={idx} className='flex flex-1 justify-center'>
                {month.avgScore != null ? (
                  <span
                    className='text-[10px] font-semibold tabular-nums'
                    style={{ color: scoreToColor(month.avgScore) }}
                  >
                    {month.avgScore > 0 ? '+' : ''}
                    {month.avgScore}
                  </span>
                ) : (
                  <span className='text-[10px] text-muted-foreground'>–</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color scale legend */}
      <div className='flex items-center justify-center gap-2'>
        <span className='text-[10px] tabular-nums text-muted-foreground'>
          -10
        </span>
        <div className='flex overflow-hidden rounded-full'>
          {Array.from({ length: 21 }, (_, i) => {
            const score = i - 10;
            return (
              <div
                key={i}
                className='h-2 w-3'
                style={{ backgroundColor: scoreToColor(score) }}
              />
            );
          })}
        </div>
        <span className='text-[10px] tabular-nums text-muted-foreground'>
          +10
        </span>
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
      <div className='flex items-center justify-between gap-3'>
        <h3 className='font-serif text-base font-medium tracking-tight'>
          Mood timeline
        </h3>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: '30days', label: '30 days' },
            { value: 'alltime', label: 'All time' },
          ]}
        />
      </div>

      {hasData ? (
        <div className='h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey='label'
                tick={axisTick}
                stroke='var(--border)'
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval={mode === 'alltime' ? 'preserveStartEnd' : 4}
              />
              <YAxis
                domain={[-10, 10]}
                tick={axisTick}
                stroke='var(--border)'
                tickLine={false}
                axisLine={false}
                ticks={[-10, -5, 0, 5, 10]}
              />
              <ReferenceLine
                y={0}
                stroke='var(--border)'
                strokeDasharray='3 3'
              />
              <Tooltip content={<TimelineTooltip />} cursor={{ stroke: 'var(--border)' }} />
              {mode === '30days' && (
                <Line
                  name='Previous 30 days'
                  type='monotone'
                  dataKey='previous'
                  stroke='var(--muted-foreground)'
                  strokeWidth={1.5}
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
        <div className='flex h-[200px] items-center justify-center text-sm text-muted-foreground'>
          No mood data available
        </div>
      )}

      {mode === '30days' ? (
        <PeriodLegend periodLabel='30 days' />
      ) : (
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <span className='inline-block h-0.5 w-6 rounded-full bg-primary' />
          <span>Weekly average</span>
        </div>
      )}
    </div>
  );
};

export { StatsMoodTimeline };

const CollapseButton = ({ isOpen }: { isOpen: boolean }) => (
  <CollapsibleTrigger asChild>
    <Button variant='ghost' size='icon-sm' className='text-muted-foreground'>
      <ChevronDown
        className={cn(
          'size-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
      <span className='sr-only'>{isOpen ? 'Collapse' : 'Expand'}</span>
    </Button>
  </CollapsibleTrigger>
);

// Main MoodInsights Component (used on journal page - timeline only)
export default function MoodInsights({ entries }: MoodInsightsProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Panel
        eyebrow='Insights'
        title='How you’ve been feeling'
        actions={<CollapseButton isOpen={isOpen} />}
      >
        <CollapsibleContent>
          <MoodTimeline entries={entries} />
        </CollapsibleContent>

        {!isOpen && (
          <p className='text-sm text-muted-foreground'>
            Expand to see your mood timeline.
          </p>
        )}
      </Panel>
    </Collapsible>
  );
}

// Full Statistics MoodInsights Component (used on statistics page)
export function FullMoodInsights({ entries }: MoodInsightsProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Panel
        eyebrow='Insights'
        title='Mood statistics'
        actions={<CollapseButton isOpen={isOpen} />}
      >
        <CollapsibleContent>
          <div className='space-y-8'>
            <MoodDistributionChart entries={entries} />
            <div className='border-t border-border/50' />
            <StatsMoodTimeline entries={entries} />
            <div className='border-t border-border/50' />
            <MoodHeatmap entries={entries} />
          </div>
        </CollapsibleContent>

        {!isOpen && (
          <p className='text-sm text-muted-foreground'>
            Expand to see distribution, timeline, and a year of moods.
          </p>
        )}
      </Panel>
    </Collapsible>
  );
}
