import { RetroWindow } from '@/components/retro';

const HistoryLoading = () => {
  return (
    <div className='space-y-6'>
      {/* Page Header Skeleton */}
      <div className='space-y-1'>
        <div className='h-8 w-32 bg-foreground/10 animate-pulse' />
        <div className='h-4 w-48 bg-foreground/5 animate-pulse' />
      </div>

      {/* Chart Skeleton */}
      <RetroWindow title='Loading...'>
        <div className='h-80 bg-foreground/5 animate-pulse' />
      </RetroWindow>
    </div>
  );
};

export default HistoryLoading;
