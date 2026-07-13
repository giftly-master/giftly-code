"use client";

import React from "react";
import { WalletConnect } from "@/components/WalletConnect";

export default function WalletPage() {
  return (
    <div className="bg-[#F7F7FC] dark:bg-[#1a1a24] rounded-4xl p-8 h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#18181B] dark:text-white">My Wallet</h1>
          <p className="text-[#717182] dark:text-gray-400">
            Connect your Stellar wallet to send gifts and manage balances.
          </p>
        </div>
        <WalletConnect />
      </div>
    </div>
  );
}
