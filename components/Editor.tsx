'use client';
import { updateEntry, deleteEntry } from '@/util/api';
import { useState } from 'react';
import { useAutosave } from 'react-autosave';
import Spinner from './Spinner';
import { useRouter } from 'next/navigation';
import { scoreToColor } from '@/util/color';

const SentimentBar = ({ score }: { score: number }) => {
  // Map -10..10 to 0..100%
  const pct = ((score + 10) / 20) * 100;
  const color = scoreToColor(score);

  return (
    <div className='px-8 py-4'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-sm font-semibold'>Sentiment</span>
        <span className='text-sm font-bold' style={{ color }}>
          {score > 0 ? '+' : ''}
          {score}/10
        </span>
      </div>
      <div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden'>
        <div
          className='h-full rounded-full transition-all duration-500'
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className='flex justify-between text-[10px] text-gray-400 mt-0.5'>
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
    <div className='w-full h-full grid grid-cols-3 gap-0 relative'>
      <div className='absolute left-0 top-0 p-2'>
        {isSaving ? (
          <Spinner />
        ) : (
          <div className='w-[16px] h-[16px] rounded-full bg-green-500'></div>
        )}
      </div>
      <div className='col-span-2'>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='w-full h-full text-xl p-8'
        />
      </div>
      <div className='border-l border-black/5'>
        <div
          style={{ background: color }}
          className='h-[100px] text-white p-8'
        >
          <h2 className='text-2xl bg-white/25 text-black'>Analysis</h2>
        </div>
        {analysis && <SentimentBar score={analysis.sentimentScore} />}
        <div>
          <ul role='list' className='divide-y divide-gray-200'>
            <li className='py-4 px-8 flex items-center justify-between'>
              <div className='text-xl font-semibold w-1/3'>Subject</div>
              <div className='text-xl'>{analysis?.subject}</div>
            </li>

            <li className='py-4 px-8 flex items-center justify-between'>
              <div className='text-xl font-semibold'>Mood</div>
              <div className='text-xl'>{analysis?.mood}</div>
            </li>

            <li className='py-4 px-8 flex items-center justify-between'>
              <div className='text-xl font-semibold'>Negative</div>
              <div className='text-xl'>
                {analysis?.negative ? 'True' : 'False'}
              </div>
            </li>
            <li className='py-4 px-8 flex items-center justify-between'>
              <button
                onClick={handleDelete}
                type='button'
                className='rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Editor;
