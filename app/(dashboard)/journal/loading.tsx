import { RetroWindow } from '@/components/retro';

const HomeLoading = () => {
  return (
    <div className='space-y-6'>
      {/* Page Header Skeleton */}
      <div className='space-y-1'>
        <div className='h-8 w-32 bg-foreground/10 animate-pulse' />
        <div className='h-4 w-48 bg-foreground/5 animate-pulse' />
      </div>

      {/* Action Bar Skeleton */}
      <RetroWindow title='Actions'>
        <div className='flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between'>
          <div className='flex-1 max-w-xl h-10 bg-foreground/5 animate-pulse' />
          <div className='h-10 w-32 bg-foreground/10 animate-pulse' />
        </div>
      </RetroWindow>

      {/* Entries Skeleton */}
      <RetroWindow title='Loading...'>
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4 py-3'>
              <div className='w-20 h-4 bg-foreground/5 animate-pulse' />
              <div className='flex-1 h-4 bg-foreground/5 animate-pulse' />
              <div className='w-16 h-5 bg-foreground/5 animate-pulse' />
              <div className='w-8 h-4 bg-foreground/5 animate-pulse' />
            </div>
          ))}
        </div>
      </RetroWindow>
    </div>
  );
};

export default HomeLoading;
