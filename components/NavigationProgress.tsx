'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const progressRef = useRef(0);

  // Keep ref in sync
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // Reset on route change complete
    setIsNavigating(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isNavigating) {
      // Start progress animation
      setProgress(10);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          // Slow down as we get higher
          const increment = Math.max(1, (90 - prev) / 10);
          return Math.min(90, prev + increment);
        });
      }, 100);
    } else if (progressRef.current > 0) {
      // Complete the progress bar
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isNavigating]);

  // Listen for link clicks to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link) {
        const href = link.getAttribute('href');
        // Check if it's an internal navigation link
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          const currentUrl = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`;
          if (href !== currentUrl && href !== pathname) {
            setIsNavigating(true);
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, searchParams]);

  if (progress === 0) return null;

  return (
    <div className='fixed top-0 left-0 right-0 z-[100]'>
      <Progress value={progress} className='h-1 rounded-none bg-transparent' />
    </div>
  );
}
