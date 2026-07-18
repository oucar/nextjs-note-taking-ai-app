'use client';

import { newEntry } from '@/util/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import Spinner from './Spinner';

export default function Onboarding() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateFirst = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const { data } = await newEntry();
      router.push(`/journal/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className='rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center shadow-card'>
      <p className='eyebrow'>Welcome to Mood</p>
      <h2 className='mx-auto mt-3 max-w-md font-serif text-3xl font-medium leading-snug tracking-tight'>
        Every pattern starts with a{' '}
        <em className='font-light italic text-primary'>first page</em>.
      </h2>
      <p className='mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground'>
        Write your first entry to unlock mood insights, timelines, and the
        ability to ask your journal questions.
      </p>
      <Button
        onClick={handleCreateFirst}
        disabled={creating}
        size='lg'
        className='mt-8 gap-2'
      >
        {creating ? <Spinner /> : <PenLine className='size-4' />}
        Write your first entry
      </Button>
    </section>
  );
}
