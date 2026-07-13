"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import { AuthLayout } from "@/layouts/AuthLayout";
import { WorldMapShowcase } from "@/components/auth/WordMapShowcase";
import { ChevronLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success even if email not found (security best practice)
      if (res.ok || res.status === 200) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.detail ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout showcaseContent={<WorldMapShowcase />}>
      <div className="space-y-8 w-full">
        <Link href="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-[#717182] hover:text-[#18181B] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>

        {sent ? (
          <div className="space-y-6 text-center pt-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#18181B] mb-2">Check your email</h1>
              <p className="text-[#717182] text-sm leading-relaxed">
                We've sent a password reset link to{" "}
                <span className="font-semibold text-[#18181B]">{email}</span>.
                It will expire in 15 minutes.
              </p>
            </div>
            <p className="text-xs text-[#717182]">
              Didn't receive it?{" "}
              <button onClick={() => setSent(false)} className="text-[#5A42DE] font-semibold hover:opacity-80">
                Try again
              </button>
            </p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-[#18181B] mb-2">Forgot password?</h1>
              <p className="text-sm text-[#717182]">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input id="email" type="email" label="Email Address"
                placeholder="name@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required autoComplete="email" autoFocus />

              <Button type="submit"
                className="w-full bg-[#5A42DE]! rounded-xl! text-base! font-semibold!"
                isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
