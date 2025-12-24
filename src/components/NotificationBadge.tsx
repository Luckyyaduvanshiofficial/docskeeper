import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className }) => {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
        "flex items-center justify-center",
        "bg-destructive text-destructive-foreground",
        "text-[10px] font-bold rounded-full",
        "animate-scale-in",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
