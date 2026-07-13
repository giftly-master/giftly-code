"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@/assets/svg";
import { ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import EmptyStateImage from "../../../../public/empty-state.png";
import { Skeleton } from "@/components/Skeleton";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  status: "pending" | "completed" | "failed";
  amount: number;
  currency: string;
  reference: string | null;
  provider: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  completed: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  pending:   "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  failed:    "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
};

const typeLabel: Record<string, string> = {
  deposit:    "Received",
  withdrawal: "Sent",
  transfer:   "Transfer",
};

export const TransactionTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions?limit=5", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setTransactions(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currencySymbol = (c: string) => c === "NGN" ? "₦" : "$";

  return (
    <div className="bg-white dark:bg-[#1e1e2a] rounded-4xl space-y-2.5 p-4 min-h-102 flex flex-col border border-[#E1E1E5] dark:border-gray-700">
      <div className="flex items-center justify-between">
        <p className="text-[#18181B] dark:text-white font-semibold leading-6">Transactions</p>
        <Link href="/dashboard/wallet"
          className="flex items-center justify-center gap-1 text-[#5A42DE] text-xs font-semibold leading-3 hover:opacity-80">
          See all <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto max-w-full flex-1 flex">
        {loading ? (
          <div className="flex-1 space-y-3 pt-2">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : transactions.length > 0 ? (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                {["Reference", "Type", "Amount", "Date", "Status", ""].map((h) => (
                  <td key={h} className="px-4 py-3 bg-[#F7F7FC] dark:bg-gray-800 text-xs text-[#717182] dark:text-gray-400 font-medium">
                    {h}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[#F7F7FC] dark:border-gray-700 hover:bg-[#F7F7FC] dark:hover:bg-gray-800 transition-colors">
                  <td className="py-4 px-4 text-xs font-mono text-[#717182] dark:text-gray-400 truncate max-w-[120px]">
                    {tx.provider === "testnet-faucet" ? "faucet-claim" : (tx.reference ?? tx.id.slice(0, 8))}
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#18181B] dark:text-white">
                      {tx.type === "deposit"
                        ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-500" />
                        : <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                      {tx.provider === "testnet-faucet" ? "Faucet" : typeLabel[tx.type]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <span className={tx.type === "deposit" ? "text-green-600" : "text-red-500"}>
                      {tx.type === "deposit" ? "+" : "-"}
                      {currencySymbol(tx.currency)}{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-[#717182] dark:text-gray-400 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[tx.status]}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="pl-4">
                    <Link href="/dashboard/wallet"
                      className="flex gap-1 px-3 py-1.5 items-center border border-[#5A42DE] rounded-lg text-[#5A42DE] text-xs hover:bg-[#ECEFFE] dark:hover:bg-[#2a2a4a] transition-colors">
                      <span>Details</span>
                      <ArrowLeftIcon />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-full flex-1 items-center justify-center self-center">
            <div className="max-w-3xs flex flex-col gap-4 items-center justify-center">
              <Image src={EmptyStateImage.src} width={150} height={150} alt="Empty state" className="h-32 w-auto opacity-60" />
              <p className="text-sm text-center text-[#717182] dark:text-gray-400">
                No transactions yet. Claim testnet funds from your{" "}
                <Link href="/dashboard/wallet" className="text-[#5A42DE] font-semibold hover:underline">wallet</Link>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
