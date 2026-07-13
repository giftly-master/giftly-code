"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "@/assets/svg";
import { ChevronRight, GiftIcon, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PackageIcon from "@/assets/images/package.png";
import { KycCard } from "./KycCard";
import { GiftInfoCard } from "./GiftInfoCard";
import type { DashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/Skeleton";

interface LockedGift {
  id: string;
  amount: number;
  currency: string;
  unlock_datetime: string | null;
  role: "sender" | "recipient";
  hide_amount: boolean;
}

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number; total: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft => {
  const diff = +new Date(targetDate) - +new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
};

/* ─── GiftCard ──────────────────────────────────────────────────────── */
export const GiftCard = ({ stats, statsLoading }: { stats?: DashboardStats | null; statsLoading?: boolean }) => {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [gifts, setGifts] = useState<LockedGift[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gifts/locked", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setGifts(d.data ?? []); })
      .catch(() => {})
      .finally(() => setGiftsLoading(false));
  }, []);

  const tabs = [
    { id: "received" as const, name: "Received" },
    { id: "sent" as const, name: "Sent" },
  ];

  const filtered = gifts.filter((g) =>
    activeTab === "received" ? g.role === "recipient" : g.role === "sender"
  );

  return (
    <div className="space-y-5">
      {/* Desktop stat cards */}
      <div className="lg:flex gap-5 hidden">
        <StatCard amount={statsLoading ? "—" : String(stats?.giftsReceived ?? 0)} title="Gift received" bgColor="bg-[#F0FDF4]" textColor="text-[#22C55E]" />
        <StatCard amount={statsLoading ? "—" : String(stats?.giftsSent ?? 0)} title="Gift sent" bgColor="bg-[#FEF2F2]" textColor="text-[#EF4444]" />
        <StatCard amount={statsLoading ? "—" : String(stats?.unopenedGifts ?? 0)} title="Unopened Gift" bgColor="bg-[#ECEFFE]" textColor="text-[#5A42DE]" />
      </div>

      {/* Gift list */}
      <div className="p-6 bg-white dark:bg-[#1e1e2a] w-full rounded-4xl space-y-4 shadow-sm border border-[#E1E1E5] dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-4 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#5A42DE] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}>
                {tab.name}
              </button>
            ))}
          </div>
          <Link href="/dashboard/gifts" className="flex items-center gap-1 text-[#5A42DE] text-xs font-semibold hover:opacity-80">
            Send Gift <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {giftsLoading ? (
          <div className="flex gap-4">
            <Skeleton className="h-36 flex-1 rounded-xl" />
            <Skeleton className="h-36 flex-1 rounded-xl" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex gap-5 flex-col lg:flex-row">
            {filtered.map((gift) => (
              <GiftReleaseCard key={gift.id} gift={gift} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 bg-[#ECEFFE] dark:bg-[#2a2a4a] rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-[#5A42DE]" />
            </div>
            <p className="text-sm font-semibold text-[#18181B] dark:text-white">No {activeTab} gifts yet</p>
            <p className="text-xs text-[#717182] dark:text-gray-400 text-center max-w-[200px]">
              {activeTab === "received"
                ? "Gifts sent to you will appear here"
                : "Gifts you send will appear here"}
            </p>
            {activeTab === "sent" && (
              <Link href="/dashboard/gifts"
                className="mt-2 px-4 py-2 bg-[#5A42DE] text-white text-xs font-semibold rounded-xl hover:bg-[#4b35e5] transition-all">
                Send a Gift
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Show info + KYC only when there are zero gifts at all */}
      {!giftsLoading && gifts.length === 0 && (
        <div className="flex gap-5 flex-col lg:flex-row">
          <GiftInfoCard />
          <KycCard />
        </div>
      )}
    </div>
  );
};

/* ─── Countdown digit ───────────────────────────────────────────────── */
const AnimatedDigit = ({ value, id }: { value: string; id: string }) => (
  <div className="h-7 w-6 bg-[#44349F] rounded overflow-hidden relative text-white text-sm leading-7 font-bold text-center">
    <div key={id} className="animate-slide-down">{value}</div>
  </div>
);

/* ─── Gift release card ─────────────────────────────────────────────── */
const GiftReleaseCard = ({ gift }: { gift: LockedGift }) => {
  const unlockDate = gift.unlock_datetime ?? "";
  const [time, setTime] = useState(unlockDate ? calculateTimeLeft(unlockDate) : null);

  useEffect(() => {
    if (!unlockDate) return;
    const timer = setInterval(() => {
      const t = calculateTimeLeft(unlockDate);
      setTime(t);
      if (t.total <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [unlockDate]);

  const fmt = (n: number) => String(n).padStart(2, "0");

  const amountDisplay = gift.hide_amount
    ? "Hidden"
    : `${gift.currency} ${gift.amount.toLocaleString()}`;

  if (!time || time.total <= 0) {
    return (
      <div className="px-4 py-5 border border-[#E1E1E5] dark:border-gray-700 bg-white dark:bg-[#16161f] flex-1 rounded-xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#F7F7FC] dark:bg-gray-800 size-11 rounded-full flex items-center justify-center">
            <Image src={PackageIcon.src} width={24} height={24} alt="Package" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#18181B] dark:text-white">Gift Unlocked 🎉</p>
            <p className="text-xs text-[#717182] dark:text-gray-400">{amountDisplay}</p>
          </div>
        </div>
        <button className="w-full py-2.5 bg-[#5A42DE] text-white rounded-xl text-sm font-bold hover:bg-[#4b35e5] transition-all">
          Claim Now
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 border border-[#E1E1E5] dark:border-gray-700 bg-white dark:bg-[#16161f] flex-1 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#F7F7FC] dark:bg-gray-800 size-11 rounded-full flex items-center justify-center">
            <Image src={PackageIcon.src} width={24} height={24} alt="Package" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#18181B] dark:text-white">
              {gift.role === "sender" ? "Gift Sent" : "Gift Incoming"}
            </p>
            <p className="text-xs text-[#717182] dark:text-gray-400">{amountDisplay}</p>
          </div>
        </div>
        <div className="rounded-full border border-[#5A42DE] size-8 flex items-center justify-center">
          <ArrowLeftIcon />
        </div>
      </div>

      <p className="text-[10px] text-[#717182] dark:text-gray-500 mb-3">
        Unlocks: {unlockDate ? new Date(unlockDate).toLocaleString() : "—"}
      </p>

      <div className="flex justify-between items-center px-1">
        {[
          { label: "Days",    val: fmt(time.days) },
          { label: "Hours",   val: fmt(time.hours) },
          { label: "Mins",    val: fmt(time.minutes) },
          { label: "Secs",    val: fmt(time.seconds) },
        ].map((unit, idx) => (
          <React.Fragment key={unit.label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-0.5">
                {unit.val.split("").map((d, i) => (
                  <AnimatedDigit key={i} value={d} id={`${gift.id}-${unit.label}-${i}-${d}`} />
                ))}
              </div>
              <p className="text-[9px] uppercase font-bold text-[#71717A] dark:text-gray-500 tracking-tight">{unit.label}</p>
            </div>
            {idx < 3 && <span className="mb-4 font-bold text-[#44349F]">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ─── Stat card ─────────────────────────────────────────────────────── */
interface StatProps { amount: string; title: string; bgColor: string; textColor: string; }

export const StatCard = ({ amount, title, bgColor, textColor }: StatProps) => (
  <div className="py-7 px-4 rounded-2xl bg-white dark:bg-[#1e1e2a] flex-1 shadow-sm border border-[#E1E1E5] dark:border-gray-700">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm text-[#717182] dark:text-gray-400 font-medium">{title}</p>
      <div className={`${bgColor} size-8 rounded-xl flex items-center justify-center`}>
        <GiftIcon className={`size-4 ${textColor}`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-[#18181B] dark:text-white">{amount}</p>
  </div>
);
