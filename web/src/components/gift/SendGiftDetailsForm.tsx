"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Eye, X } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import Button from "@/components/Button";
import GiftPreviewModal from "@/components/gift/GiftPreviewModal";
import UserProfile from "@/assets/images/avatar-female.svg";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];
const MAX_MESSAGE_LENGTH = 200;

export type GiftDetailsFormValues = {
  recipientId: string; recipientName: string; recipientEmail: string;
  recipientPhone: string; amount: string; currency: string; message: string;
  templateId: string; hideAmountUntilUnlock: boolean; anonymousUntilUnlock: boolean;
  unlockDate: string; unlockTime: string;
};

type ResolvedRecipient = { id: string; name: string | null; avatarUrl: string | null; };

export type SendGiftDetailsFormProps = {
  value?: GiftDetailsFormValues;
  onChange?: (val: GiftDetailsFormValues) => void;
  onContinue?: () => void;
};

export default function SendGiftDetailsForm({ value, onChange, onContinue }: SendGiftDetailsFormProps) {
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState(value?.recipientPhone || "");
  const [recipient, setRecipient] = useState<ResolvedRecipient | null>(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [rawAmount, setRawAmount] = useState(value?.amount || "");
  const [date, setDate] = useState(value?.unlockDate || "");
  const [time, setTime] = useState(value?.unlockTime || "");
  const [dateTimeError, setDateTimeError] = useState("");
  const [hideAmount, setHideAmount] = useState(value?.hideAmountUntilUnlock || false);
  const [anonymous, setAnonymous] = useState(value?.anonymousUntilUnlock || false);
  const [message, setMessage] = useState(value?.message || "");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // currency based on country code
  const currency = countryCode === "+234" ? "NGN" : "USD";
  const sym = countryCode === "+234" ? "₦" : "$";
  const amountNum = parseFloat(rawAmount) || 0;
  const isFormValid = !!recipient && amountNum > 0 && !dateTimeError && !recipientLoading;

  // Resolve recipient
  const resolveRecipient = useCallback(async (phone: string, code: string) => {
    const e164 = `${code}${phone.replace(/\D/g, "")}`;
    if (e164.length < 10) { setRecipient(null); setRecipientError(""); return; }
    setRecipientLoading(true); setRecipientError(""); setRecipient(null);
    try {
      const res = await fetch(`/api/users/resolve?phoneNumber=${encodeURIComponent(e164)}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setRecipient(d.data); }
      else if (res.status === 404) setRecipientError("No Giftly account found with this number");
      else setRecipientError("Could not verify recipient");
    } catch { setRecipientError("Network error. Please try again."); }
    finally { setRecipientLoading(false); }
  }, []);

  // Debounce phone lookup
  useEffect(() => {
    const t = setTimeout(() => {
      if (phoneNumber.replace(/\D/g, "").length >= 8) resolveRecipient(phoneNumber, countryCode);
      else { setRecipient(null); setRecipientError(""); }
    }, 700);
    return () => clearTimeout(t);
  }, [phoneNumber, countryCode, resolveRecipient]);

  // Date/time validation
  useEffect(() => {
    if (date && time) {
      setDateTimeError(new Date(`${date}T${time}`) <= new Date() ? "Delivery time must be in the future" : "");
    } else setDateTimeError("");
  }, [date, time]);

  // Sync to parent
  useEffect(() => {
    onChange?.({
      recipientId: recipient?.id ?? "",
      recipientName: recipient?.name ?? "",
      recipientEmail: value?.recipientEmail ?? "",
      recipientPhone: phoneNumber,
      amount: rawAmount,
      currency,
      message,
      templateId: value?.templateId ?? "",
      hideAmountUntilUnlock: hideAmount,
      anonymousUntilUnlock: anonymous,
      unlockDate: date,
      unlockTime: time,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient, phoneNumber, rawAmount, currency, message, hideAmount, anonymous, date, time]);

  return (
    <div className="w-full flex justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-[420px] rounded-3xl bg-white dark:bg-[#1e1e2a] border border-[#EEEEF3] dark:border-gray-700 p-5 md:p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#18181B] dark:text-white">Send a Gift</h2>
        <p className="text-sm text-[#717182] dark:text-gray-400 mt-1 mb-6">Enter recipient details and amount.</p>

        <div className="space-y-5">

          {/* Phone */}
          <div>
            <PhoneInput label="Recipient Phone Number" placeholder="812 345 6789"
              countryCode={countryCode}
              onCountryCodeChange={(c) => { setCountryCode(c); setRecipient(null); setPhoneNumber(""); }}
              value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            {recipientLoading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-[#717182]">
                <div className="w-4 h-4 border-2 border-[#5A42DE] border-t-transparent rounded-full animate-spin" />
                Looking up recipient…
              </div>
            )}
            {recipientError && !recipientLoading && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" />{recipientError}</p>
            )}
            {recipient && !recipientLoading && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <Image src={recipient.avatarUrl || UserProfile.src} alt={recipient.name ?? "Recipient"}
                  width={40} height={40} className="rounded-full object-cover border border-[#EEEEF3]" />
                <div>
                  <p className="text-sm font-semibold text-[#18181B] dark:text-white">{recipient.name ?? "Giftly User"}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">✓ Verified account</p>
                </div>
                <button onClick={() => { setRecipient(null); setPhoneNumber(""); }} className="ml-auto text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-2 px-1">Gift Amount ({currency})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717182] font-medium select-none">{sym}</span>
              <input type="number" min="1" placeholder="0" value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#18181B] dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A42DE]/20 focus:border-[#5A42DE] transition-all" />
            </div>
            {amountNum > 0 && (
              <p className="mt-1 text-xs text-[#717182] px-1">
                Fee: {sym}{Math.round(amountNum * 0.02).toLocaleString()} · Total: {sym}{(amountNum + Math.round(amountNum * 0.02)).toLocaleString()}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {PRESET_AMOUNTS.map((p) => (
                <button key={p} type="button" onClick={() => setRawAmount(String(p))}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                    rawAmount === String(p)
                      ? "bg-[#F1EDFF] border-[#5A42DE] text-[#5A42DE]"
                      : "bg-white dark:bg-gray-800 border-[#E5E7EB] dark:border-gray-700 text-[#717182] hover:bg-gray-50"
                  }`}>
                  {sym}{p >= 1000 ? `${p / 1000}k` : p}
                </button>
              ))}
            </div>
          </div>

          {/* Unlock */}
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-2 px-1">Unlock Date & Time (Optional)</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5A42DE]/20 focus:border-[#5A42DE]" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5A42DE]/20 focus:border-[#5A42DE]" />
            </div>
            {dateTimeError && <p className="mt-1.5 text-xs text-red-500">{dateTimeError}</p>}
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            {[
              { id: "hideAmount", label: "Hide amount until unlock", state: hideAmount, set: setHideAmount },
              { id: "anon", label: "Send anonymously", state: anonymous, set: setAnonymous },
            ].map((o) => (
              <label key={o.id} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={o.state} onChange={(e) => o.set(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#5A42DE] focus:ring-[#5A42DE]" />
                <span className="text-sm text-[#18181B] dark:text-white select-none">{o.label}</span>
              </label>
            ))}
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-between mb-2 px-1">
              <label className="text-xs text-[#9CA3AF]">Message (Optional)</label>
              <span className={`text-xs ${message.length >= MAX_MESSAGE_LENGTH ? "text-red-500" : "text-[#717182]"}`}>
                {message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <textarea maxLength={MAX_MESSAGE_LENGTH} rows={3} placeholder="Write a sweet note…"
              value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-sm text-[#18181B] dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5A42DE]/20 focus:border-[#5A42DE] resize-none" />
          </div>

          <button type="button" onClick={() => setIsPreviewOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-[#5A42DE] font-medium hover:opacity-80 transition-opacity">
            <Eye size={15} /> Preview recipient's view
          </button>

          <Button onClick={onContinue} disabled={!isFormValid}
            className="w-full h-12 rounded-xl bg-[#5A42DE] hover:bg-[#4E37CC] text-white text-base font-semibold transition-all disabled:opacity-50">
            Continue to Review
          </Button>
        </div>

        <GiftPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}
          data={{ recipientName: recipient?.name ?? "", amount: rawAmount, currency,
            message, hideAmount, unlockDate: date, unlockTime: time }} />
      </div>
    </div>
  );
}
