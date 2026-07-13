"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/layouts/AuthLayout";
import { WorldMapShowcase } from "@/components/auth/WordMapShowcase";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";
import { PasswordInput } from "@/components/PasswordInput";
import Button from "@/components/Button";

interface FormData {
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const SignUp: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    countryCode: "+234",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Must contain a number";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) newErrors.fullName = "Full name must be at least 2 characters";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else { const e = validatePassword(formData.password); if (e) newErrors.password = e; }
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const phone = `${formData.countryCode}${formData.phoneNumber.replace(/\s/g, "")}`;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          phoneNumber: phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: data.detail ?? "Email already registered" });
        } else {
          setErrors({ general: data.detail ?? "Registration failed. Please try again." });
        }
        return;
      }

      // Pass email to verify page via query param
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <AuthLayout showcaseContent={<WorldMapShowcase />}>
      <div className="space-y-8 w-full">
        <div className="gap-1 flex flex-col">
          <h1 className="text-xl md:text-[2rem] leading-tight font-bold text-[#18181B]">
            Create an account
          </h1>
          <p className="text-xs text-[#717182]">To start sending and receiving cash gifts</p>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input id="fullName" label="Full Name" type="text" placeholder="John Eze"
            value={formData.fullName} onChange={handleChange("fullName")}
            error={errors.fullName} autoFocus autoComplete="name" />

          <PhoneInput id="phoneNumber" label="Phone Number" placeholder="81 123 456 78"
            value={formData.phoneNumber} onChange={handleChange("phoneNumber")}
            error={errors.phoneNumber} countryCode={formData.countryCode}
            onCountryCodeChange={(code) => setFormData((prev) => ({ ...prev, countryCode: code }))}
            autoComplete="tel" />

          <Input id="email" label="Email address" type="email" placeholder="john123@gmail.com"
            value={formData.email} onChange={handleChange("email")}
            error={errors.email} autoComplete="email" />

          <PasswordInput id="password" label="Password" placeholder="••••••••••••••"
            value={formData.password} onChange={handleChange("password")}
            error={errors.password}
            helperText="At least 8 characters with uppercase, lowercase and numbers"
            autoComplete="new-password" />

          <PasswordInput id="confirmPassword" label="Confirm Password" placeholder="••••••••••••••"
            value={formData.confirmPassword} onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword} autoComplete="new-password" />

          <div className="pt-2">
            <Button type="submit" variant="primary"
              className="w-full bg-[#5A42DE]! rounded-lg! text-base! font-medium! cursor-pointer"
              isLoading={isLoading}>
              Create Account
            </Button>
          </div>

          <p className="text-center text-sm text-[#717182] pt-1">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#5A42DE] font-semibold hover:opacity-80 transition-opacity">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
