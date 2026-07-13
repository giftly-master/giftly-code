"use client";

import React, { useMemo, useState } from "react";
import SendGiftDetailsForm, {
  GiftDetailsFormValues,
} from "@/components/gift/SendGiftDetailsForm";
import ReviewGiftDetails from "@/components/gift/ReviewGiftDetails";
import GiftSuccessModal from "@/components/gift/GiftSuccessModal";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/Toast";

const INITIAL_GIFT_VALUES: GiftDetailsFormValues = {
  recipientId: "",
  recipientName: "",
  recipientEmail: "",
  recipientPhone: "",
  amount: "",
  currency: "NGN",
  message: "",
  templateId: "",
  hideAmountUntilUnlock: false,
  anonymousUntilUnlock: false,
  unlockDate: "",
  unlockTime: "",
};

type FlowStep = "details" | "review";

export default function DashboardGiftsPage() {
  const { user } = useUser();
  const { error: toastError } = useToast();

  const [giftValues, setGiftValues] = useState<GiftDetailsFormValues>(INITIAL_GIFT_VALUES);
  const [step, setStep] = useState<FlowStep>("details");
  const [isProceeding, setIsProceeding] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const amount = Number(giftValues.amount || 0);
  const processingFee = useMemo(() => (amount > 0 ? Math.round(amount * 0.02) : 0), [amount]);

  const unlockLabel = giftValues.unlockDate && giftValues.unlockTime
    ? `${giftValues.unlockDate} at ${giftValues.unlockTime}`
    : giftValues.unlockDate || "Immediate";

  const handleProceed = async () => {
    if (!giftValues.recipientId) {
      toastError("Recipient not resolved. Please enter a valid phone number.");
      return;
    }
    setIsProceeding(true);
    try {
      const body: Record<string, unknown> = {
        recipient: giftValues.recipientId,
        amount,
        currency: giftValues.currency,
        message: giftValues.message || undefined,
        template: giftValues.templateId || undefined,
        hideAmount: giftValues.hideAmountUntilUnlock,
        isAnonymous: giftValues.anonymousUntilUnlock,
      };

      if (giftValues.unlockDate && giftValues.unlockTime) {
        body.unlockDatetime = new Date(`${giftValues.unlockDate}T${giftValues.unlockTime}`).toISOString();
      }

      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail ?? "Failed to send gift. Please try again.");
        return;
      }

      setIsSuccessModalOpen(true);
      setGiftValues(INITIAL_GIFT_VALUES);
      setStep("details");
    } catch {
      toastError("Network error. Please check your connection.");
    } finally {
      setIsProceeding(false);
    }
  };

  const stepIndex = step === "details" ? 0 : 1;
  const steps = ["Gift Details", "Review & Pay"];

  return (
    <div className="px-3 pb-3 md:px-6 md:pb-6">
      <div className="min-h-[calc(100vh-122px)] rounded-3xl bg-[#F5F5FA] dark:bg-[#1a1a24] border border-[#EEEEF3] dark:border-gray-700">

        {/* Step indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((label, index) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index <= stepIndex ? "bg-[#5A42DE] text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${index <= stepIndex ? "text-[#5A42DE]" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mb-4 rounded-full transition-colors ${index < stepIndex ? "bg-[#5A42DE]" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        {step === "details" && (
          <SendGiftDetailsForm
            value={giftValues}
            onChange={setGiftValues}
            onContinue={() => setStep("review")}
          />
        )}

        {step === "review" && (
          <ReviewGiftDetails
            recipientName={giftValues.recipientName || "Unknown"}
            recipientPhone={giftValues.recipientPhone}
            amount={amount}
            processingFee={processingFee}
            hideAmountUntilUnlock={giftValues.hideAmountUntilUnlock}
            anonymousUntilUnlock={giftValues.anonymousUntilUnlock}
            unlockLabel={unlockLabel}
            message={giftValues.message}
            onProceed={handleProceed}
            onBack={() => setStep("details")}
            isLoading={isProceeding}
            senderName={user?.name ?? user?.username ?? undefined}
          />
        )}
      </div>

      {isSuccessModalOpen && (
        <GiftSuccessModal
          isOpen={true}
          recipientName={giftValues.recipientName || "the recipient"}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
}
