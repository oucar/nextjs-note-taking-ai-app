import { Skeleton } from '@/components/ui/skeleton';

const HomeLoading = () => {
  return (
    <div className='p-8 lg:p-12 max-w-7xl mx-auto space-y-10'>
      <div className='space-y-3'>
        <Skeleton className='h-10 w-56' />
        <Skeleton className='h-6 w-80' />
      </div>
      <Skeleton className='h-32 w-full rounded-xl' />
      <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-[180px] w-full rounded-xl' />
        ))}
      </div>
    </div>
  );
};

export default HomeLoading;
