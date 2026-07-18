const HomeLoading = () => {
  return (
    <div className='space-y-8'>
      {/* Page Header Skeleton */}
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div className='space-y-2'>
          <div className='h-3 w-24 animate-pulse rounded-full bg-foreground/5' />
          <div className='h-9 w-40 animate-pulse rounded-lg bg-foreground/10' />
        </div>
        <div className='flex gap-2.5'>
          <div className='h-9 w-40 animate-pulse rounded-full bg-foreground/5' />
          <div className='h-9 w-28 animate-pulse rounded-full bg-foreground/10' />
        </div>
      </div>

      {/* Insights Skeleton */}
      <div className='rounded-2xl border border-border/70 bg-card p-6 shadow-card'>
        <div className='h-4 w-44 animate-pulse rounded-full bg-foreground/10' />
        <div className='mt-5 h-[200px] animate-pulse rounded-xl bg-foreground/5' />
      </div>

      {/* Entries Skeleton */}
      <div className='space-y-2.5'>
        <div className='h-4 w-56 animate-pulse rounded-full bg-foreground/5' />
        <div className='divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4 px-5 py-4'>
              <div className='h-3.5 w-16 animate-pulse rounded-full bg-foreground/5' />
              <div className='h-3.5 flex-1 animate-pulse rounded-full bg-foreground/5' />
              <div className='h-5 w-16 animate-pulse rounded-full bg-foreground/5' />
              <div className='h-3.5 w-8 animate-pulse rounded-full bg-foreground/5' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeLoading;
