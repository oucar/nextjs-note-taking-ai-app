'use client';
import { updateEntry, deleteEntry } from '@/util/api';
import { useState } from 'react';
import { useAutosave } from 'react-autosave';
import Spinner from './Spinner';
import { useRouter } from 'next/navigation';
import { scoreToColor } from '@/util/color';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SentimentBar = ({ score }: { score: number }) => {
  // Map -10..10 to 0..100%
  const pct = ((score + 10) / 20) * 100;
  const color = scoreToColor(score);

  return (
    <div className='px-6 py-4'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-sm font-semibold'>Sentiment</span>
        <span className='text-sm font-bold' style={{ color }}>
          {score > 0 ? '+' : ''}
          {score}/10
        </span>
      </div>
      <div className='w-full h-3 bg-muted rounded-full overflow-hidden'>
        <div
          className='h-full rounded-full transition-all duration-500'
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className='flex justify-between text-[10px] text-muted-foreground mt-0.5'>
        <span>-10</span>
        <span>0</span>
        <span>+10</span>
      </div>
    </div>
  );
};

const Editor = ({ entry }) => {
  const [text, setText] = useState(entry.content);
  const [currentEntry, setEntry] = useState(entry);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const analysis = currentEntry.analysis;
  const color = analysis
    ? scoreToColor(analysis.sentimentScore)
    : analysis?.color ?? '#6366f1';

  const handleDelete = async () => {
    await deleteEntry(entry.id);
    router.push('/journal');
  };
  useAutosave({
    data: text,
    onSave: async (_text) => {
      if (_text === entry.content) return;
      setIsSaving(true);

      const { data } = await updateEntry(entry.id, { content: _text });

      setEntry(data);
      setIsSaving(false);
    },
  });

  return (
    <div className='flex h-full w-full'>
      {/* Editor area */}
      <div className='relative flex-1'>
        <div className='absolute left-3 top-3 z-10'>
          {isSaving ? (
            <Spinner />
          ) : (
            <div className='h-3 w-3 rounded-full bg-green-500' />
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='h-full w-full resize-none p-8 text-lg focus:outline-none bg-background'
        />
      </div>

      {/* Analysis sidebar */}
      <div className='w-80 border-l'>
        <div style={{ background: color }} className='p-6'>
          <h2 className='text-lg font-semibold text-white'>Analysis</h2>
        </div>

        {analysis && <SentimentBar score={analysis.sentimentScore} />}

        <div className='space-y-4 px-6 pb-6'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>Subject</p>
            <p className='text-base'>{analysis?.subject}</p>
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>Mood</p>
            <p className='text-base'>{analysis?.mood}</p>
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>
              Negative
            </p>
            <Badge variant={analysis?.negative ? 'destructive' : 'secondary'}>
              {analysis?.negative ? 'Yes' : 'No'}
            </Badge>
          </div>
          <Separator />
          <Button variant='destructive' size='sm' onClick={handleDelete}>
            Delete Entry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
