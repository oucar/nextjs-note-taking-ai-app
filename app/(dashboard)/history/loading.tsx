import { Skeleton } from '@/components/ui/skeleton';

const HistoryLoading = () => {
  return (
    <div className='p-8 lg:p-12 max-w-7xl mx-auto space-y-10'>
      <div className='space-y-3'>
        <Skeleton className='h-10 w-56' />
        <Skeleton className='h-6 w-80' />
      </div>
      <Skeleton className='h-80 w-full rounded-xl' />
    </div>
  );
};

export default HistoryLoading;
