const HistoryLoading = () => {
  return (
    <div className='space-y-8'>
      {/* Page Header Skeleton */}
      <div className='space-y-2'>
        <div className='h-3 w-32 animate-pulse rounded-full bg-foreground/5' />
        <div className='h-9 w-40 animate-pulse rounded-lg bg-foreground/10' />
      </div>

      {/* Stat tiles Skeleton */}
      <div className='grid grid-cols-2 gap-4 sm:max-w-md'>
        <div className='h-24 animate-pulse rounded-2xl border border-border/70 bg-card shadow-card' />
        <div className='h-24 animate-pulse rounded-2xl border border-border/70 bg-card shadow-card' />
      </div>

      {/* Chart Skeleton */}
      <div className='rounded-2xl border border-border/70 bg-card p-6 shadow-card'>
        <div className='h-4 w-56 animate-pulse rounded-full bg-foreground/10' />
        <div className='mt-5 h-80 animate-pulse rounded-xl bg-foreground/5' />
      </div>
    </div>
  );
};

export default HistoryLoading;
