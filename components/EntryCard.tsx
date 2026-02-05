import { scoreToColor } from '@/util/color';

type EntryCardProps = {
  entry: {
    createdAt: string | Date;
    analysis?: {
      summary?: string | null;
      mood?: string | null;
      sentimentScore?: number | null;
      color?: string | null;
    } | null;
  };
};

const EntryCard = ({ entry }: EntryCardProps) => {
  const date = new Date(entry.createdAt).toDateString();
  const summary = entry.analysis?.summary ?? 'No analysis yet.';
  const mood = entry.analysis?.mood ?? '—';
  const score = entry.analysis?.sentimentScore ?? null;
  const color =
    score !== null ? scoreToColor(score) : entry.analysis?.color ?? '#d4d4d4';

  return (
    <div className='overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow'>
      <div className='h-2' style={{ background: color }} />
      <div className='px-4 py-3 sm:px-6 flex items-center justify-between'>
        <span className='text-sm text-gray-500'>{date}</span>
        {score !== null && (
          <span
            className='text-xs font-bold px-2 py-0.5 rounded-full text-white'
            style={{ background: color }}
          >
            {score > 0 ? '+' : ''}
            {score}
          </span>
        )}
      </div>
      <div className='px-4 py-3 sm:px-6 text-sm text-gray-700'>{summary}</div>
      <div className='px-4 py-3 sm:px-6 text-xs font-medium uppercase tracking-wide text-gray-400'>
        {mood}
      </div>
    </div>
  );
};

export default EntryCard;
