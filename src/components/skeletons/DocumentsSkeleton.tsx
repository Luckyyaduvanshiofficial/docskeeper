import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const DocumentsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header Skeleton */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browse Categories Skeleton */}
      <div>
        <Skeleton className="h-5 w-36 mb-4 rounded-lg" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 w-28 h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Browse All Files Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-10 w-full mb-4 rounded-lg" />

        {/* Actions Skeleton */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        {/* Documents Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-lg mb-1" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsSkeleton;
