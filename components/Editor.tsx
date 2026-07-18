'use client';
import { updateEntry, deleteEntry } from '@/util/api';
import { useState } from 'react';
import { useAutosave } from 'react-autosave';
import Spinner from './Spinner';
import { useRouter } from 'next/navigation';
import { scoreToColor } from '@/util/color';
import { Panel, MoodBadge } from '@/components/journal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SentimentMeter = ({ score }: { score: number }) => {
  const color = scoreToColor(score);
  const magnitude = Math.min(Math.abs(score), 10) / 10; // 0..1
  const half = magnitude * 50; // % of track, from center

  return (
    <div className='space-y-2'>
      <div className='flex items-baseline justify-between'>
        <span className='eyebrow'>Sentiment</span>
        <span className='text-sm font-semibold tabular-nums' style={{ color }}>
          {score > 0 ? '+' : ''}
          {score}
        </span>
      </div>
      {/* Diverging meter: fill grows from the neutral center */}
      <div className='relative h-2 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='absolute top-0 h-full rounded-full transition-all duration-500'
          style={{
            backgroundColor: color,
            left: score < 0 ? `${50 - half}%` : '50%',
            width: `${half}%`,
          }}
        />
        <div className='absolute left-1/2 top-0 h-full w-px bg-border' />
      </div>
      <div className='flex justify-between text-[10px] tabular-nums text-muted-foreground'>
        <span>-10</span>
        <span>0</span>
        <span>+10</span>
      </div>
    </div>
  );
};

type EditorEntry = {
  id: string;
  content: string;
  createdAt: string | Date;
  analysis?: {
    subject?: string | null;
    mood?: string | null;
    summary?: string | null;
    negative?: boolean | null;
    sentimentScore: number;
  } | null;
};

const Editor = ({ entry }: { entry: EditorEntry }) => {
  const [text, setText] = useState(entry.content);
  const [currentEntry, setEntry] = useState(entry);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const analysis = currentEntry.analysis;
  const color = analysis ? scoreToColor(analysis.sentimentScore) : undefined;

  const handleDelete = async () => {
    await deleteEntry(entry.id);
    router.push('/journal');
  };

  useAutosave({
    data: text,
    onSave: async (_text) => {
      if (_text === entry.content || !isEditMode) return;
      setIsSaving(true);

      const { data } = await updateEntry(entry.id, { content: _text });

      setEntry(data);
      setIsSaving(false);
    },
  });

  // Format date for title
  const entryDate = new Date(entry.createdAt);
  const dateTitle = entryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeTitle = entryDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className='space-y-5'>
      {/* Back navigation */}
      <Link
        href='/journal'
        className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <ArrowLeft className='size-4' />
        Back to journal
      </Link>

      {/* Two-column layout */}
      <div className='grid items-start gap-5 lg:grid-cols-[1fr_320px]'>
        {/* Left: Writing surface */}
        <section className='rounded-2xl border border-border/70 bg-card shadow-card'>
          <header className='flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-4 sm:px-8'>
            <div className='min-w-0'>
              <p className='eyebrow'>
                {dateTitle} · {timeTitle}
              </p>
              <h1 className='mt-0.5 truncate font-serif text-2xl font-medium tracking-tight'>
                {analysis?.subject || 'Untitled entry'}
              </h1>
            </div>

            <div className='flex items-center gap-3'>
              {isEditMode && (
                <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  {isSaving ? (
                    <>
                      <Spinner />
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className='size-1.5 rounded-full bg-[#4d8544]' />
                      Saved
                    </>
                  )}
                </span>
              )}
              <Button
                variant={isEditMode ? 'secondary' : 'outline'}
                size='sm'
                onClick={() => setIsEditMode(!isEditMode)}
                className='gap-1.5'
              >
                {isEditMode ? (
                  <>
                    <Eye className='size-3.5' />
                    Read
                  </>
                ) : (
                  <>
                    <Pencil className='size-3.5' />
                    Write
                  </>
                )}
              </Button>
            </div>
          </header>

          {isEditMode ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className='entry-prose min-h-[420px] w-full resize-none bg-transparent px-6 py-6 text-foreground/95 placeholder:text-muted-foreground/60 focus:outline-none sm:px-8'
              placeholder='Write your thoughts…'
              autoFocus
            />
          ) : (
            <div
              className={cn(
                'entry-prose min-h-[420px] whitespace-pre-wrap px-6 py-6 sm:px-8',
                text
                  ? 'text-foreground/95'
                  : 'italic text-muted-foreground/70'
              )}
            >
              {text || 'Nothing here yet — switch to Write and let it out.'}
            </div>
          )}
        </section>

        {/* Right: Analysis Panel */}
        <Panel title='Analysis' accentColor={color} className='lg:sticky lg:top-24'>
          <div className='space-y-6'>
            {analysis ? (
              <>
                <SentimentMeter score={analysis.sentimentScore} />

                <div className='space-y-5'>
                  <div className='space-y-1'>
                    <p className='eyebrow'>Mood</p>
                    {analysis.mood ? (
                      <MoodBadge color={color}>{analysis.mood}</MoodBadge>
                    ) : (
                      <p className='text-sm text-muted-foreground'>—</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='eyebrow'>Summary</p>
                    <p className='font-serif text-[15px] italic leading-relaxed text-foreground/85'>
                      {analysis.summary ? `“${analysis.summary}”` : '—'}
                    </p>
                  </div>

                  {analysis.negative && (
                    <div className='rounded-xl border border-[#b2492c]/25 bg-[#b2492c]/8 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground'>
                      This entry leans heavy. Be kind to yourself today.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className='text-sm leading-relaxed text-muted-foreground'>
                Write a few sentences and Mood will read between the lines —
                sentiment, mood, and a short summary appear here.
              </p>
            )}

            <div className='border-t border-border/60 pt-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDelete}
                className='w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive'
              >
                <Trash2 className='size-3.5' />
                Delete entry
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default Editor;
