"use client";

import { BankIcon, CoinIcon, GiftSentIcon, MoneyBag, WithdrawalIcon } from "@/assets/svg";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import type { DashboardStats } from "@/hooks/useDashboardStats";
import type { User } from "@/hooks/useUser";

interface Props {
  stats?: DashboardStats | null;
  statsLoading?: boolean;
  user?: User | null;
}

export const AccountBalanceCard = ({ stats, statsLoading, user }: Props) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const balance = stats?.accountBalance?.find((w) => w.currency === "USDT")?.balance
    ?? stats?.accountBalance?.[0]?.balance
    ?? 0;

  const currency = stats?.accountBalance?.[0]?.currency?.toUpperCase() ?? "USDT";

  const handleCopy = () => {
    const id = user?.phoneNumber ?? user?.email ?? "";
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    success("Account ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-white dark:bg-[#1e1e2a] w-full sm:max-w-102.25 rounded-4xl space-y-8 border border-[#E1E1E5] dark:border-gray-700 shadow-sm">
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between w-full mb-2">
            <span className="leading-6 text-base text-[#18181B] dark:text-white flex items-center">
              <div className="mr-2 inline-flex items-center justify-center size-6 bg-[#F7F7FC] dark:bg-gray-800 rounded-full">
                <MoneyBag />
              </div>
              Account Balance
            </span>
            <div className="py-1 px-3 rounded-3xl border border-[#F5F6F7] dark:border-gray-700 bg-[#F5F6F7] dark:bg-gray-800 uppercase text-sm font-medium text-[#17171C] dark:text-white gap-x-2 items-center justify-center flex">
              <CoinIcon />
              {currency}
            </div>
          </div>
          {statsLoading ? (
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl font-semibold leading-8 text-[#18181B] dark:text-white">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between gap-6 min-w-max">
            {[
              { icon: <GiftSentIcon />, label: "Send Gift", href: "/dashboard/gifts" },
              { icon: <BankIcon />, label: "Add a Bank", href: "/dashboard/accounts" },
              { icon: <WithdrawalIcon />, label: "Withdraw", href: "/dashboard/wallet" },
            ].map((action) => (
              <a key={action.label} href={action.href} className="flex items-center flex-col gap-2 group">
                <div className="bg-[#5A42DE] group-hover:bg-[#4b35e5] transition-colors size-10 rounded-xl flex justify-center items-center">
                  {action.icon}
                </div>
                <p className="text-sm leading-5 text-[#18181B] dark:text-white whitespace-nowrap">{action.label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="space-y-1">
        <p className="text-base leading-6 text-[#18181B] dark:text-white">Giftly account details</p>
        <div className="p-5 border border-[#C9CEFC] dark:border-gray-700 rounded-2xl bg-[#F7F7FC] dark:bg-gray-800 space-y-1">
          <div className="flex justify-between items-center w-full">
            <p className="text-lg font-semibold leading-6 text-[#18181B] dark:text-white truncate max-w-[160px]">
              {user?.username ? `@${user.username}` : user?.email ?? "—"}
            </p>
            <button
              onClick={handleCopy}
              className="flex gap-2 h-8 text-sm font-medium leading-5 text-[#18181B] dark:text-white items-center justify-center px-3 bg-white dark:bg-gray-700 rounded-full py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {copied ? <Check className="text-green-500 w-4 h-4" /> : <Copy className="text-[#5A42DE] w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="leading-6 text-[#717182] dark:text-gray-400 text-sm">{user?.name ?? "—"}</p>
        </div>
      </div>
    </div>
  );
};
