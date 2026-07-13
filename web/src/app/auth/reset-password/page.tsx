"use client";
import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/layouts/AuthLayout";
import { WorldMapShowcase } from "@/components/auth/WordMapShowcase";
import { PasswordInput } from "@/components/PasswordInput";
import Button from "@/components/Button";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";
import { CheckCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calcStrength = (pwd: string): 0 | 1 | 2 | 3 | 4 => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) s++;
    return s as 0 | 1 | 2 | 3 | 4;
  };

  useEffect(() => {
    setStrength(calcStrength(password));
    if (confirmPassword && password !== confirmPassword) setError("Passwords do not match");
    else setError(null);
  }, [password, confirmPassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!token) { setError("Reset token is missing. Please use the link from your email."); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? "Failed to reset password. The link may have expired."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login?reset=success"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 8;

  return (
    <AuthLayout showcaseContent={<WorldMapShowcase />}>
      <div className="space-y-8 w-full">
        <Link href="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-[#717182] hover:text-[#18181B] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>

        {success ? (
          <div className="space-y-6 text-center pt-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#18181B] mb-2">Password reset!</h1>
              <p className="text-[#717182] text-sm">Redirecting you to login…</p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-[#18181B] mb-2">Create new password</h1>
              <p className="text-sm text-[#717182]">
                Your new password must be different from your previous one.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <PasswordInput id="password" label="New Password" placeholder="••••••••••••••"
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required autoComplete="new-password" />
                <PasswordStrengthIndicator strength={strength} />
                <p className="text-xs text-[#717182] px-1">
                  At least 8 characters with uppercase, lowercase, number and special character.
                </p>
              </div>

              <PasswordInput id="confirmPassword" label="Confirm Password" placeholder="••••••••••••••"
                value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                error={error || undefined} required autoComplete="new-password" />

              <Button type="submit" variant="primary"
                className="w-full bg-[#5A42DE]! rounded-xl! text-base! font-semibold!"
                isLoading={isLoading} disabled={!isFormValid || isLoading}>
                Reset Password
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
