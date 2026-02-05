import { scoreToColor } from '@/util/color';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card className='overflow-hidden py-0 gap-0 transition-shadow hover:shadow-md'>
      <div className='h-2' style={{ background: color }} />
      <CardHeader className='flex flex-row items-center justify-between py-3'>
        <span className='text-sm text-muted-foreground'>{date}</span>
        {score !== null && (
          <Badge
            className='text-white border-0'
            style={{ background: color }}
          >
            {score > 0 ? '+' : ''}
            {score}
          </Badge>
        )}
      </CardHeader>
      <CardContent className='pb-3 text-sm'>{summary}</CardContent>
      <CardFooter className='pb-4'>
        <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {mood}
        </span>
      </CardFooter>
    </Card>
  );
};

export default EntryCard;
