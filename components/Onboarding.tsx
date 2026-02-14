'use client';

import { newEntry } from '@/util/api';
import { useRouter } from 'next/navigation';
import { RetroWindow, RetroButton } from '@/components/retro';
import { PenLine } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();

  const handleCreateFirst = async () => {
    const { data } = await newEntry();
    router.push(`/journal/${data.id}`);
  };

  return (
    <RetroWindow title='Welcome to MOOD'>
      <div className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Your journal is empty. Write your first entry to unlock mood
          insights, timelines, and the ability to ask your journal
          questions.
        </p>
        <RetroButton onClick={handleCreateFirst} className='gap-2'>
          <PenLine className='h-4 w-4' />
          Create your first entry
        </RetroButton>
      </div>
    </RetroWindow>
  );
}
