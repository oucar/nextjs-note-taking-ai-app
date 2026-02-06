'use client';

import { newEntry } from '@/util/api';
import { useRouter } from 'next/navigation';
import { RetroButton } from '@/components/retro';
import { PlusCircle } from 'lucide-react';

const NewEntry = () => {
  const router = useRouter();

  const handleOnClick = async () => {
    const { data } = await newEntry();
    router.push(`/journal/${data.id}`);
  };

  return (
    <RetroButton onClick={handleOnClick} className='gap-2'>
      <PlusCircle className='h-4 w-4' />
      New Entry
    </RetroButton>
  );
};

export default NewEntry;
