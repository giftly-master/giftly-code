"use client";

import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 bg-[#ECEFFE] dark:bg-[#2a2a4a] rounded-3xl flex items-center justify-center">
            <Gift className="w-12 h-12 text-[#5A42DE]" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-[#5A42DE]">404</h1>
          <h2 className="text-2xl font-bold text-[#18181B] dark:text-white">
            Page not found
          </h2>
          <p className="text-[#717182] dark:text-gray-400">
            Looks like this gift got lost in transit. The page you're looking for doesn't exist.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5A42DE] text-white rounded-xl font-semibold hover:bg-[#4b35e5] transition-all shadow-lg shadow-[#5A42DE]/20"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E1E1E5] dark:border-gray-700 text-[#18181B] dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
