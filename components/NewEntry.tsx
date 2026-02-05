'use client';

import { newEntry } from '@/util/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const NewEntry = () => {
  const router = useRouter();

  const handleOnClick = async () => {
    const { data } = await newEntry();
    router.push(`/journal/${data.id}`);
  };

  return (
    <Card
      className='cursor-pointer items-center justify-center transition-colors hover:bg-muted/50'
      onClick={handleOnClick}
    >
      <CardContent className='flex flex-col items-center gap-2'>
        <PlusCircle className='h-8 w-8 text-muted-foreground' />
        <span className='text-lg font-medium text-muted-foreground'>
          New Entry
        </span>
      </CardContent>
    </Card>
  );
};

export default NewEntry;
