"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import { DashboardSkeleton } from "@/components/Skeleton";
import { Gift, Clock, Unlock } from "lucide-react";
import Link from "next/link";

export default function RecipientDashboard() {
  const { user, isLoading } = useUser();

  if (isLoading) return <DashboardSkeleton />;

  const name = user?.name?.split(" ")[0] ?? user?.username ?? "there";

  return (
    <div className="bg-[#F7F7FC] dark:bg-[#1a1a24] rounded-4xl p-6 h-full space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-[#18181B] dark:text-white">
          Hello, {name}! 🎁
        </h1>
        <p className="text-sm text-[#717182] dark:text-gray-400 mt-1">
          Your gifts are waiting for you
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Gift className="w-5 h-5" />, label: "Total Received", value: "0", color: "text-[#5A42DE]", bg: "bg-[#ECEFFE] dark:bg-[#2a2a4a]" },
          { icon: <Clock className="w-5 h-5" />, label: "Pending Unlock", value: "0", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { icon: <Unlock className="w-5 h-5" />, label: "Claimed", value: "0", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#1e1e2a] rounded-2xl p-5 border border-[#E1E1E5] dark:border-gray-700 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#18181B] dark:text-white">{stat.value}</p>
              <p className="text-xs text-[#717182] dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-[#ECEFFE] dark:bg-[#2a2a4a] rounded-2xl flex items-center justify-center">
          <Gift className="w-8 h-8 text-[#5A42DE]" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-[#18181B] dark:text-white">No gifts yet</p>
          <p className="text-sm text-[#717182] dark:text-gray-400 max-w-xs">
            When someone sends you a gift, it will appear here. Share your profile to get started.
          </p>
        </div>
        <Link
          href="/profile"
          className="px-5 py-2.5 bg-[#5A42DE] text-white text-sm font-semibold rounded-xl hover:bg-[#4b35e5] transition-all"
        >
          Share My Profile
        </Link>
      </div>
    </div>
  );
}
