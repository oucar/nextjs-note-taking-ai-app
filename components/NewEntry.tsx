'use client';

import { newEntry } from '@/util/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import Spinner from './Spinner';

const NewEntry = () => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleOnClick = async () => {
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
    <Button onClick={handleOnClick} disabled={creating} className='gap-2'>
      {creating ? <Spinner /> : <PenLine className='size-4' />}
      New entry
    </Button>
  );
};

export default NewEntry;
