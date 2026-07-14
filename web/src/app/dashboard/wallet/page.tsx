"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Wallet, Droplets, ArrowDownLeft, ArrowUpRight, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

interface WalletBalance { currency: string; balance: number; }
interface Transaction {
  id: string; type: "deposit" | "withdrawal" | "transfer";
  status: "pending" | "completed" | "failed";
  amount: number; currency: string;
  reference: string | null; provider: string | null; createdAt: string;
}

const currencySymbol = (c: string) => ({ NGN: "₦", USD: "$", USDT: "$", USDC: "$" }[c] ?? c + " ");
const typeLabel: Record<string, string> = { deposit: "Received", withdrawal: "Sent", transfer: "Transfer" };
const statusCls: Record<string, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

async function apiFetch(url: string): Promise<any> {
  // retry once if connection refused
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) return await res.json();
      return null;
    } catch {
      if (i === 0) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return null;
}

export default function WalletPage() {
  const { success, error: toastError } = useToast();
  const [balances, setBalances]     = useState<WalletBalance[]>([]);
  const [transactions, setTxns]     = useState<Transaction[]>([]);
  const [loadingBal, setLoadingBal] = useState(true);
  const [loadingTxn, setLoadingTxn] = useState(true);
  const [claiming, setClaiming]     = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);

  const fetchBalances = useCallback(async () => {
    setLoadingBal(true);
    const data = await apiFetch("/api/wallet");
    setBalances(data?.wallets ?? []);
    setLoadingBal(false);
  }, []);

  const fetchTxns = useCallback(async () => {
    setLoadingTxn(true);
    const data = await apiFetch("/api/transactions?limit=20");
    setTxns(data?.data ?? []);
    setLoadingTxn(false);
  }, []);

  useEffect(() => { fetchBalances(); fetchTxns(); }, [fetchBalances, fetchTxns]);

  const handleRefresh = () => { fetchBalances(); fetchTxns(); };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch("/api/faucet/claim", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        success(data.message);
        setClaimedToday(true);
        await fetchBalances();
        await fetchTxns();
      } else if (res.status === 429) {
        setClaimedToday(true);
        toastError(data.detail);
      } else {
        toastError(data.detail ?? "Claim failed.");
      }
    } catch { toastError("Network error."); }
    finally { setClaiming(false); }
  };

  return (
    <div className="bg-[#F7F7FC] dark:bg-[#1a1a24] rounded-4xl p-6 h-full space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] dark:text-white">My Wallet</h1>
          <p className="text-sm text-[#717182] dark:text-gray-400 mt-1">Your testnet balance and transactions</p>
        </div>
        <button onClick={handleRefresh} aria-label="Refresh"
          className="p-2.5 rounded-xl border border-[#E1E1E5] dark:border-gray-700 text-[#717182] hover:text-[#18181B] dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loadingBal ? (
          <><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></>
        ) : balances.length > 0 ? balances.map((b) => (
          <div key={b.currency} className="bg-white dark:bg-[#1e1e2a] rounded-2xl p-5 border border-[#E1E1E5] dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#ECEFFE] dark:bg-[#2a2a4a] flex items-center justify-center">
                <Wallet className="w-4 h-4 text-[#5A42DE]" />
              </div>
              <span className="text-sm font-semibold text-[#717182] dark:text-gray-400 uppercase">{b.currency}</span>
            </div>
            <p className="text-3xl font-bold text-[#18181B] dark:text-white">
              {currencySymbol(b.currency)}{b.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#717182] dark:text-gray-500 mt-1">Testnet balance</p>
          </div>
        )) : (
          <div className="col-span-2 bg-white dark:bg-[#1e1e2a] rounded-2xl p-5 border border-[#E1E1E5] dark:border-gray-700 shadow-sm text-center space-y-2">
            <Wallet className="w-8 h-8 text-[#717182] mx-auto" />
            <p className="text-sm font-semibold text-[#18181B] dark:text-white">No balance yet</p>
            <p className="text-xs text-[#717182] dark:text-gray-400">Claim your free testnet funds below</p>
          </div>
        )}
      </div>

      {/* Daily faucet */}
      <div className="bg-gradient-to-br from-[#5A42DE] to-[#7B63F0] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-white/80" />
              <h2 className="font-bold text-lg">Daily Testnet Faucet</h2>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Claim <strong>₦10,000</strong> once per day to test the gift flow. Resets at midnight.
            </p>
          </div>
          <button onClick={handleClaim} disabled={claiming || claimedToday}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#5A42DE] text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {claiming ? (
              <><div className="w-4 h-4 border-2 border-[#5A42DE] border-t-transparent rounded-full animate-spin" />Claiming…</>
            ) : claimedToday ? (
              <><Clock className="w-4 h-4" />Come back tomorrow</>
            ) : (
              <><Droplets className="w-4 h-4" />Claim ₦10,000</>
            )}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E1E1E5] dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-[#18181B] dark:text-white">Transaction History</h2>
          <span className="text-xs text-[#717182] dark:text-gray-400">{transactions.length} records</span>
        </div>

        {loadingTxn ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-[#E1E1E5] dark:divide-gray-700">
            {transactions.map((tx) => {
              const isDeposit = tx.type === "deposit";
              const sym = currencySymbol(tx.currency);
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F7FC] dark:hover:bg-gray-800 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDeposit ? "bg-green-50 dark:bg-green-900/20 text-green-500" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                    {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#18181B] dark:text-white">
                      {tx.provider === "testnet-faucet" ? "Testnet Faucet Claim" : typeLabel[tx.type]}
                    </p>
                    <p className="text-xs text-[#717182] dark:text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isDeposit ? "text-green-500" : "text-red-500"}`}>
                      {isDeposit ? "+" : "-"}{sym}{tx.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusCls[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-[#F7F7FC] dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#717182]" />
            </div>
            <p className="font-semibold text-sm text-[#18181B] dark:text-white">No transactions yet</p>
            <p className="text-xs text-[#717182] dark:text-gray-400 text-center max-w-[200px]">
              Claim your daily testnet funds to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
