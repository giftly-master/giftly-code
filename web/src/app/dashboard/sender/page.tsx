"use client";

import { AccountBalanceCard } from "@/components/dashboard/dashboard/AccountBalanceCard";
import { GiftCard, StatCard } from "@/components/dashboard/dashboard/GiftCard";
import { TransactionTable } from "@/components/dashboard/dashboard/TransactionTable";
import { useUser } from "@/hooks/useUser";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function SenderDashboard() {
  const { user, isLoading: userLoading } = useUser();
  const { stats, isLoading: statsLoading } = useDashboardStats();

  if (userLoading) return <DashboardSkeleton />;

  const greeting = user?.name
    ? `Hello, ${user.name.split(" ")[0]}! 👋`
    : user?.username
    ? `Hello, @${user.username}! 👋`
    : "Welcome back! 👋";

  return (
    <div className="bg-[#F7F7FC] dark:bg-[#1a1a24] rounded-4xl p-6 h-full space-y-5">
      <div>
        <h1 className="text-2xl leading-8 font-medium text-[#18181B] dark:text-white">
          {greeting}
        </h1>
        <p className="text-sm text-[#717182] dark:text-gray-400 leading-6">
          Here's an overview of your account
        </p>
      </div>

      {/* Mobile stat cards */}
      <div className="flex gap-5 lg:hidden overflow-auto">
        <StatCard
          amount={statsLoading ? "—" : String(stats?.giftsReceived ?? 0)}
          title="Gift received"
          bgColor="bg-[#F0FDF4]"
          textColor="text-[#22C55E]"
        />
        <StatCard
          amount={statsLoading ? "—" : String(stats?.giftsSent ?? 0)}
          title="Gift sent"
          bgColor="bg-[#FEF2F2]"
          textColor="text-[#EF4444]"
        />
        <StatCard
          amount={statsLoading ? "—" : String(stats?.unopenedGifts ?? 0)}
          title="Unopened Gift"
          bgColor="bg-[#ECEFFE]"
          textColor="text-[#5A42DE]"
        />
      </div>

      <div className="flex gap-5 flex-col xl:flex-row">
        <AccountBalanceCard stats={stats} statsLoading={statsLoading} user={user} />
        <div className="w-full flex-1">
          <GiftCard stats={stats} statsLoading={statsLoading} />
        </div>
      </div>
      <TransactionTable />
    </div>
  );
}
