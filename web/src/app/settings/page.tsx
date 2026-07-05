"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, User, Mail, AtSign, Phone, Camera, Lock, Shield, Eye, EyeOff, Check } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";

/* ─── Reusable field row ─────────────────────────────────────────────── */
function FieldRow({
  label, icon, value, saving, onSave, type = "text", placeholder, hint, prefix,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  saving?: boolean;
  onSave: (val: string) => Promise<void>;
  type?: string;
  placeholder?: string;
  hint?: string;
  prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [show, setShow] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    await onSave(draft);
    setEditing(false);
  };

  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="flex items-start gap-4 py-5 border-b border-[#E1E1E5] dark:border-gray-700 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-[#F7F7FC] dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5 text-[#717182]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#717182] dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182] text-sm select-none">{prefix}</span>
              )}
              <input
                autoFocus
                type={inputType}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                className={`w-full border border-[#5A42DE] rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-[#18181B] dark:text-white outline-none focus:ring-2 focus:ring-[#5A42DE]/20 ${prefix ? "pl-7" : ""}`}
                placeholder={placeholder}
              />
              {type === "password" && (
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 bg-[#5A42DE] text-white text-sm font-semibold rounded-xl hover:bg-[#4b35e5] transition-all disabled:opacity-60 shrink-0"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setDraft(value); }}
              className="px-4 py-2.5 border border-[#E1E1E5] dark:border-gray-700 text-sm font-semibold rounded-xl text-[#717182] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[#18181B] dark:text-white truncate">
              {type === "password" ? "••••••••" : value ? (prefix ? `${prefix}${value}` : value) : <span className="text-[#717182] italic">Not set</span>}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-[#5A42DE] hover:opacity-80 transition-opacity shrink-0"
            >
              Edit
            </button>
          </div>
        )}
        {hint && !editing && <p className="text-xs text-[#717182] dark:text-gray-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}

/* ─── Settings Page ─────────────────────────────────────────────────── */
export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, error: userError, updateUser } = useUser();
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    if (user?.avatarUrl) setLocalAvatarUrl(user.avatarUrl);
  }, [user?.avatarUrl]);

  /* Generic field saver */
  const saveField = async (field: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Failed to save");
      updateUser({ ...user!, ...data.user });
      success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    } catch (e: any) {
      toastError(e.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (avatarUrl: string) => {
    setLocalAvatarUrl(avatarUrl);
    success("Profile picture updated!");
  };

  /* Loading */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  /* Not authed */
  if (userError && !user) {
    return (
      <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-[#5A42DE] mx-auto" />
          <h1 className="text-2xl font-bold text-[#18181B] dark:text-white">Access Denied</h1>
          <p className="text-[#717182]">Please log in to access account settings.</p>
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#5A42DE] text-white rounded-xl font-semibold hover:bg-[#4b35e5] transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "G";

  const tabs = [
    { id: "profile" as const, label: "Profile" },
    { id: "security" as const, label: "Security" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] p-4 md:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#717182] hover:text-[#18181B] dark:hover:text-white transition-colors mb-5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-[#18181B] dark:text-white">Account Settings</h1>
          <p className="text-[#717182] dark:text-gray-400 mt-1">Manage your profile, security and preferences</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl p-6 border border-[#E1E1E5] dark:border-gray-700 shadow-sm mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {(localAvatarUrl || user?.avatarUrl) ? (
                <Image
                  src={localAvatarUrl || user?.avatarUrl || ""}
                  alt="Avatar"
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-[#E1E1E5] dark:border-gray-700"
                />
              ) : (
                <div className="w-18 h-18 rounded-2xl bg-[#5A42DE] flex items-center justify-center text-white text-2xl font-bold w-[72px] h-[72px]">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#18181B] dark:text-white">{user?.name ?? "No name set"}</p>
              <p className="text-sm text-[#717182] dark:text-gray-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Check className="w-3 h-3" /> {user?.status}
              </span>
            </div>
            <ImageUpload
              onUpload={handleAvatarUpload}
              authToken={undefined}
              className="shrink-0"
              compact
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F0F0F5] dark:bg-gray-800 p-1 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#1e1e2a] text-[#18181B] dark:text-white shadow-sm"
                  : "text-[#717182] hover:text-[#18181B] dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm px-6">
            <FieldRow
              label="Full Name"
              icon={<User className="w-4 h-4" />}
              value={user?.name ?? ""}
              saving={saving}
              onSave={(v) => saveField("name", v)}
              placeholder="Your full name"
            />
            <FieldRow
              label="Username"
              icon={<AtSign className="w-4 h-4" />}
              value={user?.username ?? ""}
              saving={saving}
              onSave={(v) => saveField("username", v)}
              placeholder="yourhandle"
              prefix="@"
              hint="Letters, numbers and underscores only. Min 3 characters."
            />
            <FieldRow
              label="Email Address"
              icon={<Mail className="w-4 h-4" />}
              value={user?.email ?? ""}
              saving={saving}
              onSave={(v) => saveField("email", v)}
              placeholder="you@example.com"
              type="email"
              hint="Changing your email will require re-verification."
            />
            <FieldRow
              label="Phone Number"
              icon={<Phone className="w-4 h-4" />}
              value={user?.phoneNumber ?? ""}
              saving={saving}
              onSave={(v) => saveField("phoneNumber", v)}
              placeholder="+2348012345678"
              hint="Used for OTP verification and payouts."
            />
          </div>
        )}

        {/* Security tab */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm px-6">
            <FieldRow
              label="Password"
              icon={<Lock className="w-4 h-4" />}
              value=""
              saving={saving}
              onSave={(v) => saveField("password", v)}
              placeholder="New password"
              type="password"
              hint="Use at least 8 characters with a mix of letters, numbers and symbols."
            />
            <div className="py-5">
              <p className="text-xs font-medium text-[#717182] dark:text-gray-400 uppercase tracking-wide mb-3">Two-Factor Authentication</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#18181B] dark:text-white">Authenticator App</p>
                  <p className="text-xs text-[#717182] dark:text-gray-400 mt-0.5">Secure your account with OTP codes</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-[#ECEFFE] dark:bg-[#2a2a4a] text-[#5A42DE] rounded-full">Coming Soon</span>
              </div>
            </div>
            <div className="py-5 border-t border-[#E1E1E5] dark:border-gray-700">
              <p className="text-xs font-medium text-[#717182] dark:text-gray-400 uppercase tracking-wide mb-3">Danger Zone</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600">Delete Account</p>
                  <p className="text-xs text-[#717182] dark:text-gray-400 mt-0.5">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
