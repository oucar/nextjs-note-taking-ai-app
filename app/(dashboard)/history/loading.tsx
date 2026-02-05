import { Skeleton } from '@/components/ui/skeleton';

const HistoryLoading = () => {
  return (
    <div className='space-y-8 p-6 md:p-8'>
      <Skeleton className='h-9 w-48' />
      <Skeleton className='h-64 w-full rounded-xl' />
    </div>
  );
};

export default HistoryLoading;
