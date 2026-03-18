'use client';

import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PRBadgeProps {
  type?: 'weight' | 'reps' | 'volume';
  value?: string | number;
  className?: string;
}

export function PRBadge({ value, className }: PRBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm',
        'animate-in fade-in zoom-in duration-300',
        className
      )}
    >
      <Trophy className="h-3 w-3" />
      <span>PR!</span>
      {value && <span className="opacity-90">{value}</span>}
    </div>
  );
}

