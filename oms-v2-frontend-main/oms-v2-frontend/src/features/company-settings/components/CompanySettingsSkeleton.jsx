"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogoSkeleton } from "./CompanyLogoSkeleton";
import { CompanyBasicInformationSkeleton } from "./CompanyBasicInformationSkeleton";

export const CompanySettingsSkeleton = () => {
  return (
    <div className="my-8 space-y-4 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Setup Progress Banner Skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-5 w-10 rounded-md" />
            <Skeleton className="h-4 w-48 rounded hidden sm:inline-block" />
          </div>
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="flex items-center gap-4 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <Skeleton className="h-3.5 w-16 rounded" />
              {i < 4 && <Skeleton className="h-0.5 flex-1 rounded hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Company Logo and Basic Info Skeletons */}
      <div className="flex gap-5 items-start flex-wrap">
        <CompanyLogoSkeleton />
        <CompanyBasicInformationSkeleton />
      </div>

      {/* Services Table Skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsSkeleton;
