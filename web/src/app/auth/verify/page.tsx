"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/layouts/AuthLayout";
import { WorldMapShowcase } from "@/components/auth/WordMapShowcase";
import OTPInput from "@/components/auth/OTPInput";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { useAuthContext } from "@/context/AuthContext";
import { HelpModal } from "@/components/auth/HelpModal";
import { EmailVerificationSuccess } from "@/components/auth/EmailVerificationSuccess";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, "$1***$2")
    : "your email";

  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [otp, setOtp] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { login } = useAuthContext();

  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!isVerified) return;
    const handler = (e: PopStateEvent) => { e.preventDefault(); window.history.pushState(null, "", window.location.href); };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isVerified]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleResend = async () => {
    if (!canResend || resendAttempts >= 3) return;
    setCanResend(false);
    setResendAttempts((p) => p + 1);
    setTimeLeft(60);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setNotification({ type: "success", message: "Verification code resent!" });
    } catch {
      setNotification({ type: "error", message: "Failed to resend. Please try again." });
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      setNotification({ type: "error", message: "Please enter the full 6-digit code" });
      return;
    }
    setNotification(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({ type: "error", message: data.detail ?? "Invalid or expired code" });
        return;
      }
      setNotification({ type: "success", message: "Email verified successfully!" });
      setTimeout(() => setIsVerified(true), 1000);
    } catch {
      setNotification({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setIsNavigating(true);
    try {
      // Already has a valid session from verification — just go to dashboard
      router.push("/dashboard/sender");
    } catch {
      setIsNavigating(false);
    }
  };

  return (
    <AuthLayout showcaseContent={<WorldMapShowcase />}>
      {isVerified ? (
        <EmailVerificationSuccess email={maskedEmail} onContinue={handleContinue} isLoading={isNavigating} />
      ) : (
        <div className="w-full flex-1 flex flex-col h-full lg:h-auto space-y-6">
          <Link href="/auth/sign-up" className="inline-flex items-center gap-1 text-sm text-[#717182] hover:text-[#18181B] transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>

          {notification && (
            <Alert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
          )}

          <div>
            <h1 className="text-3xl font-bold text-[#18181B] mb-2">Verify your email</h1>
            <p className="text-[#717182] text-sm leading-relaxed">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-[#18181B]">{maskedEmail}</span>
            </p>
          </div>

          <OTPInput length={6} onChange={setOtp} onComplete={(v) => { setOtp(v); handleVerify(v); }}
            error={notification?.type === "error"} />

          <div className="flex justify-center">
            <button onClick={handleResend} disabled={!canResend || resendAttempts >= 3}
              className={`text-sm font-semibold transition-colors ${!canResend || resendAttempts >= 3 ? "text-[#717182] cursor-default" : "text-[#5A42DE] hover:opacity-80"}`}>
              Resend Code{" "}
              <span className="font-bold">
                {resendAttempts >= 3 ? "(Max reached)" : canResend ? "Now" : formatTime(timeLeft)}
              </span>
            </button>
          </div>

          <Button variant="primary"
            className="w-full bg-[#5A42DE]! rounded-xl! text-base! font-semibold!"
            onClick={() => handleVerify()} isLoading={isSubmitting}>
            Verify Email
          </Button>

          <div className="text-center">
            <button onClick={() => setIsHelpModalOpen(true)}
              className="text-sm font-semibold text-[#5A42DE] hover:opacity-80 transition-opacity">
              Didn&apos;t receive a code?
            </button>
          </div>
        </div>
      )}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </AuthLayout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
