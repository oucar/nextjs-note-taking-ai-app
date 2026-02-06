import { scoreToColor } from '@/util/color';
import { RetroBadge } from '@/components/retro';

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
  const summary = entry.analysis?.summary ?? 'No analysis yet...';
  const mood = entry.analysis?.mood ?? null;
  const score = entry.analysis?.sentimentScore ?? null;
  const color =
    score !== null ? scoreToColor(score) : (entry.analysis?.color ?? '#888888');

  return (
    <div className='flex items-center gap-4 py-3 px-2 hover:bg-accent/50 transition-colors group'>
      {/* Time */}
      <div className='w-20 shrink-0'>
        <span className='text-xs font-mono text-muted-foreground uppercase'>
          {time}
        </span>
      </div>

      {/* Summary */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors'>
          {summary}
        </p>
      </div>

      {/* Mood Badge */}
      {mood && (
        <RetroBadge variant='mood' className='shrink-0'>
          {mood}
        </RetroBadge>
      )}

      {/* Score */}
      {score !== null && (
        <div className='shrink-0 w-12 text-right'>
          <span className='text-xs font-bold font-mono' style={{ color }}>
            {score > 0 ? '+' : ''}
            {score}
          </span>
        </div>
      )}

      {/* Arrow indicator */}
      <div className='shrink-0 text-muted-foreground group-hover:text-foreground transition-colors'>
        <span className='text-xs'>→</span>
      </div>
    </div>
  );
};

export default EntryCard;
