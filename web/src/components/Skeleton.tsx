import React from "react";
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="bg-[#F7F7FC] dark:bg-[#1a1a24] rounded-4xl p-6 h-full space-y-5">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Stat cards */}
      <div className="flex gap-5 overflow-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-36 shrink-0 rounded-2xl" />
        ))}
      </div>
      {/* Main cards */}
      <div className="flex gap-5 flex-col xl:flex-row">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      {/* Table */}
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl p-6 border border-[#E1E1E5] dark:border-gray-700 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
