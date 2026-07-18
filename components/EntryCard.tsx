import { scoreToColor } from '@/util/color';
import { MoodBadge } from '@/components/journal';
import { ArrowRight } from 'lucide-react';

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
  const date = new Date(entry.createdAt);
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const summary = entry.analysis?.summary ?? 'Not analyzed yet…';
  const mood = entry.analysis?.mood ?? null;
  const score = entry.analysis?.sentimentScore ?? null;
  const color = score !== null ? scoreToColor(score) : undefined;

  return (
    <div className='group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/50 sm:px-5'>
      <span className='w-16 shrink-0 text-xs tabular-nums text-muted-foreground'>
        {time}
      </span>

      <p className='min-w-0 flex-1 truncate text-[15px] text-foreground/90'>
        {summary}
      </p>

      {mood && (
        <MoodBadge color={color} className='hidden shrink-0 sm:inline-flex'>
          {mood}
        </MoodBadge>
      )}

      {score !== null && (
        <span
          className='w-9 shrink-0 text-right text-xs font-semibold tabular-nums'
          style={{ color }}
        >
          {score > 0 ? '+' : ''}
          {score}
        </span>
      )}

      <ArrowRight className='size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100' />
    </div>
  );
};

export default EntryCard;
