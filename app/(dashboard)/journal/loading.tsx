import { Skeleton } from '@/components/ui/skeleton';

const HomeLoading = () => {
  return (
    <div className='space-y-8 p-6 md:p-8'>
      <div className='space-y-2'>
        <Skeleton className='h-9 w-48' />
        <Skeleton className='h-5 w-72' />
      </div>
      <Skeleton className='h-24 w-full rounded-xl' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-40 w-full rounded-xl' />
        ))}
      </div>
    </div>
  );
};

export default HomeLoading;
