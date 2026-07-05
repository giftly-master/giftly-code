"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#18181B] dark:text-white">
            Something went wrong
          </h1>
          <p className="text-[#717182] dark:text-gray-400">
            An unexpected error occurred. Don't worry — your gifts are safe.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5A42DE] text-white rounded-xl font-semibold hover:bg-[#4b35e5] transition-all shadow-lg shadow-[#5A42DE]/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E1E1E5] dark:border-gray-700 text-[#18181B] dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
