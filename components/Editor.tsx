'use client';
import { updateEntry, deleteEntry } from '@/util/api';
import { useState } from 'react';
import { useAutosave } from 'react-autosave';
import Spinner from './Spinner';
import { useRouter } from 'next/navigation';
import { scoreToColor } from '@/util/color';
import { RetroWindow, RetroButton, RetroBadge } from '@/components/retro';
import { ArrowLeft, Pencil, Eye } from 'lucide-react';
import Link from 'next/link';

const SentimentBar = ({ score }: { score: number }) => {
  // Map -10..10 to 0..100%
  const pct = ((score + 10) / 20) * 100;
  const color = scoreToColor(score);

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold uppercase tracking-wide'>
          Sentiment
        </span>
        <span className='text-sm font-bold font-mono' style={{ color }}>
          {score > 0 ? '+' : ''}
          {score}/10
        </span>
      </div>
      <div className='w-full h-4 bg-background border-2 border-foreground/20 bevel-inset overflow-hidden'>
        <div
          className='h-full transition-all duration-500'
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className='flex justify-between text-[10px] text-muted-foreground font-mono'>
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
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const analysis = currentEntry.analysis;
  const color = analysis
    ? scoreToColor(analysis.sentimentScore)
    : (analysis?.color ?? '#6366f1');

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
    <div className='space-y-4'>
      {/* Back navigation */}
      <Link
        href='/journal'
        className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline'
      >
        <ArrowLeft className='h-4 w-4' />
        <span className='font-bold uppercase tracking-wide'>
          Back to Journals
        </span>
      </Link>

      {/* Two-column layout */}
      <div className='grid lg:grid-cols-[1fr_320px] gap-4'>
        {/* Left: Entry Content */}
        <RetroWindow
          title={analysis?.subject || dateTitle}
          actions={
            <div className='flex items-center gap-3'>
              {/* Edit Mode Toggle */}
              <RetroButton
                variant={isEditMode ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <Eye className='h-3 w-3' />
                    <span>View</span>
                  </>
                ) : (
                  <>
                    <Pencil className='h-3 w-3' />
                    <span>Edit</span>
                  </>
                )}
              </RetroButton>

              {/* Save Status */}
              {isEditMode && (
                <>
                  {isSaving ? (
                    <div className='flex items-center gap-2 text-xs'>
                      <Spinner />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2 text-xs'>
                      <span className='inline-block w-2 h-2 bg-green-500' />
                      <span>Saved</span>
                    </div>
                  )}
                </>
              )}
            </div>
          }
          className='min-h-[400px] flex flex-col'
          contentClassName='flex-1 p-0'
        >
          {isEditMode ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className='w-full h-full min-h-[350px] resize-none p-4 text-base leading-relaxed bg-background border-0 focus:outline-none'
              placeholder='Write your thoughts...'
            />
          ) : (
            <div className='w-full h-full min-h-[350px] p-4 text-base leading-relaxed bg-background whitespace-pre-wrap'>
              {text}
            </div>
          )}
        </RetroWindow>

        {/* Right: Analysis Panel */}
        <RetroWindow title='Analysis' titleBarColor={color} className='h-fit'>
          <div className='space-y-5'>
            {/* Sentiment Bar */}
            {analysis && <SentimentBar score={analysis.sentimentScore} />}

            {/* Analysis Fields */}
            <div className='space-y-4'>
              <div className='space-y-1'>
                <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  Subject
                </p>
                <p className='text-sm'>{analysis?.subject || '—'}</p>
              </div>

              <div className='space-y-1'>
                <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  Mood
                </p>
                {analysis?.mood ? (
                  <RetroBadge variant='mood'>{analysis.mood}</RetroBadge>
                ) : (
                  <p className='text-sm'>—</p>
                )}
              </div>

              <div className='space-y-1'>
                <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  Negative Content
                </p>
                <RetroBadge
                  variant={analysis?.negative ? 'default' : 'secondary'}
                >
                  {analysis?.negative ? 'Yes' : 'No'}
                </RetroBadge>
              </div>

              <div className='space-y-1'>
                <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  Summary
                </p>
                <p className='text-sm text-muted-foreground'>
                  {analysis?.summary || '—'}
                </p>
              </div>

              <div className='space-y-1'>
                <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  Created
                </p>
                <p className='text-sm font-mono'>{timeTitle}</p>
              </div>
            </div>

            {/* Divider */}
            <div className='border-t-2 border-foreground/10 pt-4'>
              <RetroButton
                variant='destructive'
                size='sm'
                onClick={handleDelete}
                className='w-full'
              >
                Delete Entry
              </RetroButton>
            </div>
          </div>
        </RetroWindow>
      </div>
    </div>
  );
};

export default Editor;
