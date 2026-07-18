'use client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { scoreToColor } from '@/util/color';

type HistoryPoint = {
  updatedAt: string | Date;
  sentimentScore: number;
  mood: string;
};

const CustomTooltip = ({
  payload,
  label,
  active,
}: {
  payload?: Array<{ payload: HistoryPoint }>;
  label?: string;
  active?: boolean;
}) => {
  if (!active || !payload?.length || label == null) return null;

  const analysis = payload[0].payload;
  const color = scoreToColor(analysis.sentimentScore);
  const dateLabel = new Date(label).toLocaleString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div className='rounded-xl border border-border/70 bg-popover p-3 shadow-raised'>
      <p className='eyebrow'>{dateLabel}</p>
      <p className='mt-1 flex items-center gap-1.5 text-sm font-medium lowercase'>
        <span
          aria-hidden
          className='size-2 rounded-full'
          style={{ backgroundColor: color }}
        />
        {analysis.mood}
      </p>
      <p className='text-xs text-muted-foreground'>
        Score:{' '}
        <span className='font-semibold' style={{ color }}>
          {analysis.sentimentScore > 0 ? '+' : ''}
          {analysis.sentimentScore}
        </span>
      </p>
    </div>
  );
};

const CustomDot = (props: {
  cx?: number;
  cy?: number;
  payload?: HistoryPoint;
}) => {
  const { cx, cy, payload } = props;
  if (payload == null || cx == null || cy == null) return null;
  const color = scoreToColor(payload.sentimentScore);
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

const HistoryChart = ({ data }: { data: HistoryPoint[] }) => {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart data={data}>
        <Line
          type='monotone'
          dataKey='sentimentScore'
          stroke='var(--primary)'
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--card)' }}
        />
        <XAxis
          dataKey='updatedAt'
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          stroke='var(--border)'
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          }
        />
        <YAxis domain={[-10, 10]} hide />
        <ReferenceLine y={0} stroke='var(--border)' strokeDasharray='3 3' />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
