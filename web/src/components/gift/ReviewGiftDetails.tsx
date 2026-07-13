"use client";

import React, { useState } from "react";
import Button from "@/components/Button";

interface ReviewGiftDetailsProps {
  recipientName: string;
  recipientPhone: string;
  amount: number;
  processingFee: number;
  hideAmountUntilUnlock: boolean;
  anonymousUntilUnlock: boolean;
  unlockLabel: string;
  message: string;
  onProceed: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  senderName?: string;
}

const rowLabel = "text-sm md:text-[14px] text-[#18181B] font-medium";
const rowValue = "text-sm md:text-[14px] text-[#717182] text-right";

const ReviewGiftDetails: React.FC<ReviewGiftDetailsProps> = ({
  recipientName,
  recipientPhone,
  amount,
  processingFee,
  hideAmountUntilUnlock,
  anonymousUntilUnlock,
  unlockLabel,
  message,
  onProceed,
  onBack,
  isLoading = false,
  senderName,
}) => {
  const total = amount + processingFee;

  const [balance, setBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balanceChecked, setBalanceChecked] = useState(false);

  const handleCheckBalance = async () => {
    setIsCheckingBalance(true);
    try {
      const res = await fetch("/api/dashboard/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const wallets: { currency: string; balance: number }[] = data.stats?.accountBalance ?? [];
        const found = wallets.find((w) => w.currency === "NGN") ?? wallets[0];
        setBalance(found?.balance ?? 0);
      } else {
        setBalance(0);
      }
    } catch {
      setBalance(0);
    } finally {
      setIsCheckingBalance(false);
      setBalanceChecked(true);
    }
  };

  const hasSufficientBalance = balance !== null && balance >= total;

  return (
    <div className="w-full flex justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-[400px] rounded-3xl bg-[#FAFAFB] border border-[#EEEEF3] p-5 md:p-6 shadow-sm">
        <h2 className="text-[24px] md:text-[28px] leading-tight font-semibold text-[#18181B]">
          Review Gift details
        </h2>
        <p className="text-[12px] md:text-[13px] leading-relaxed text-[#717182] mt-2">
          Please review all details carefully, transactions once completed are
          irreversible.
        </p>

        <div className="mt-6 rounded-2xl border border-[#EEEEF3] bg-white p-4 space-y-3 shadow-sm">
          {}
          <div className="flex justify-between items-start">
            <p className={rowLabel}>Recipient</p>
            <div className={rowValue}>
              <p className="text-[#18181B] font-medium">{recipientName}</p>
              <p className="text-[12px] mt-0.5">{recipientPhone}</p>
            </div>
          </div>

          {}
          <div className="flex justify-between items-center pt-2">
            <p className={rowLabel}>Amount</p>
            <p className={rowValue}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>

          {}
          <div className="flex justify-between items-center pt-2">
            <p className={rowLabel}>Processing Fee</p>
            <p className={rowValue}>${processingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>

          {}
          <div className="flex justify-between items-end border-t border-[#EEEEF3] pt-4 mt-2">
            <p className={rowLabel}>Total Amount</p>
            <p className="text-[32px] md:text-[36px] leading-none text-[#18181B] font-semibold tracking-tight">
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          {}
          <div className="flex justify-between items-center pt-4 border-t border-[#EEEEF3] mt-2">
            <p className={rowLabel}>Amount Privacy</p>
            <p className={rowValue}>
              {hideAmountUntilUnlock ? "Hide amount sent" : "Visible"}
            </p>
          </div>

          {}
          <div className="flex justify-between items-center pt-2">
            <p className={rowLabel}>Sender Privacy</p>
            <p className={rowValue}>
              {anonymousUntilUnlock ? "Anonymous" : "Identified"}
            </p>
          </div>

          {}
          <div className="flex justify-between items-start pt-2">
            <p className={rowLabel}>Unlock date and time</p>
            <p className={`${rowValue} max-w-[150px]`}>{unlockLabel}</p>
          </div>

          {}
          <div className="space-y-1.5 pt-2">
            <p className={rowLabel}>Message for the recipient</p>
            <p className="text-[13px] text-[#717182] bg-[#FAFAFB] p-3 rounded-xl border border-[#EEEEF3] break-words">
              {message || "No message provided."}
            </p>
          </div>
        </div>

        {}
        <div className="mt-4 flex items-center justify-between bg-white border border-[#EEEEF3] rounded-2xl px-4 py-3 shadow-sm">
          <div>
            <p className="text-[13px] font-medium text-[#18181B]">Your Balance</p>
            {balance !== null ? (
              <p className="text-[20px] font-semibold text-[#5A42DE]">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            ) : (
              <p className="text-[13px] text-[#717182]">
                Click to check your balance
              </p>
            )}
          </div>
          <button
            onClick={handleCheckBalance}
            disabled={isCheckingBalance}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4F2FF] text-[#5A42DE] text-[13px] font-semibold hover:bg-[#EBE8FF] transition-all duration-200 disabled:opacity-60"
          >
            {isCheckingBalance ? (
              <>
                {}
                <svg
                  className="animate-spin h-4 w-4 text-[#5A42DE]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Checking...
              </>
            ) : (
              "Check Balance"
            )}
          </button>
        </div>

        <p className="text-[11px] text-[#717182] mt-6 text-center">
          By proceeding, you have accepted Giftly&apos;s{" "}
          <a href="/terms" className="text-[#5A42DE] font-medium hover:underline">Terms</a> and{" "}
          <a href="/privacy" className="text-[#5A42DE] font-medium hover:underline">Privacy Policy</a>
        </p>

        {balanceChecked && !hasSufficientBalance && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              Insufficient balance. Please top up your wallet before proceeding.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          {onBack && (
            <Button onClick={onBack} disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#18181B] dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
              Back
            </Button>
          )}
          <Button onClick={onProceed} isLoading={isLoading}
            disabled={isLoading || (balanceChecked && !hasSufficientBalance)}
            className={`h-12 rounded-xl bg-[#5A42DE] hover:bg-[#4E37CC] text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${onBack ? "flex-1" : "w-full"}`}>
            Confirm & Send Gift
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewGiftDetails;