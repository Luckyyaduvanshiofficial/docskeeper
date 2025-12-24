import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-24">
      {/* Hero Skeleton */}
      <Card className="border-border bg-card shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <Skeleton className="w-20 h-20 rounded-2xl" />
          </div>
        </CardContent>
      </Card>

      {/* Search Skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Quick Actions Skeleton */}
      <div>
        <Skeleton className="h-4 w-24 mb-3 rounded-lg" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex-1 border-border bg-card">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-3 w-12 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="flex gap-4 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <Skeleton className="h-3 w-12 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Collections Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-28 rounded-lg" />
          <Skeleton className="h-4 w-14 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-3 flex flex-col items-center">
                <Skeleton className="w-12 h-12 rounded-xl mb-2" />
                <Skeleton className="h-3 w-16 rounded-lg mb-1" />
                <Skeleton className="h-3 w-10 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Documents Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <Skeleton className="h-4 w-14 rounded-lg" />
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-0 divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-lg mb-1" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
