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

const CustomTooltip = ({ payload, label, active }) => {
  if (!active || !payload?.length) return null;

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
    <div className='bg-card border-2 border-foreground/20 shadow-[2px_2px_0_rgba(0,0,0,0.15)] p-3'>
      <div className='flex items-center gap-2'>
        <div className='h-2 w-2' style={{ background: color }} />
        <p className='text-xs text-muted-foreground font-mono'>{dateLabel}</p>
      </div>
      <p className='text-lg font-black uppercase' style={{ color }}>
        {analysis.mood}
      </p>
      <p className='text-xs text-muted-foreground font-mono'>
        Score: {analysis.sentimentScore > 0 ? '+' : ''}
        {analysis.sentimentScore}
      </p>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = scoreToColor(payload.sentimentScore);
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

const HistoryChart = ({ data }) => {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart width={300} height={100} data={data}>
        <Line
          type='monotone'
          dataKey='sentimentScore'
          stroke='var(--primary)'
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 8, fill: 'var(--primary)' }}
        />
        <XAxis
          dataKey='updatedAt'
          tick={{ fontSize: 10, fontFamily: 'monospace' }}
          stroke='var(--muted-foreground)'
        />
        <YAxis domain={[-10, 10]} hide />
        <ReferenceLine y={0} stroke='var(--border)' strokeDasharray='3 3' />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
