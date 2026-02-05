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
    <div className='p-4 bg-white shadow-md border border-black/10 rounded-lg relative'>
      <div
        className='absolute left-2 top-2 w-2 h-2 rounded-full'
        style={{ background: color }}
      />
      <p className='text-sm text-black/30 ml-4'>{dateLabel}</p>
      <p className='text-xl uppercase font-semibold' style={{ color }}>
        {analysis.mood}
      </p>
      <p className='text-sm text-black/50'>
        Score: {analysis.sentimentScore > 0 ? '+' : ''}
        {analysis.sentimentScore}
      </p>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = scoreToColor(payload.sentimentScore);
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke='white' strokeWidth={2} />;
};

const HistoryChart = ({ data }) => {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart width={300} height={100} data={data}>
        <Line
          type='monotone'
          dataKey='sentimentScore'
          stroke='#8884d8'
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 8 }}
        />
        <XAxis dataKey='updatedAt' />
        <YAxis domain={[-10, 10]} hide />
        <ReferenceLine y={0} stroke='#d4d4d4' strokeDasharray='3 3' />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
