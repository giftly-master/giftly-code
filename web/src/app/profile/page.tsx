"use client";

import React, { useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Settings, Mail, Phone, User, Shield, ChevronLeft, Camera, AtSign } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useUser();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [copied, setCopied] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCopyUsername = () => {
    const val = user?.username ? `@${user.username}` : user?.email ?? "";
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(true);
    success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toastError("File too large. Max 10MB."); return; }
    if (!["image/jpeg", "image/png"].includes(file.type)) { toastError("JPEG or PNG only."); return; }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.avatarUrl) {
          updateUser({ ...user!, avatarUrl: data.user.avatarUrl });
          success("Profile photo updated!");
        }
      } else {
        toastError("Upload failed. Please try again.");
      }
    } catch {
      toastError("Network error.");
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "G";

  const statusConfig: Record<string, { label: string; cls: string }> = {
    active:     { label: "Active",     cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    unverified: { label: "Unverified", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    suspended:  { label: "Suspended",  cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const status = statusConfig[user?.status ?? "unverified"] ?? statusConfig.unverified;

  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] pb-10">

      {/* Back button */}
      <div className="px-6 pt-6 md:px-10">
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[#717182] dark:text-gray-400 hover:text-[#18181B] dark:hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-10 space-y-5 mt-4">

        {/* ── Hero card ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Cover banner */}
          <div className="h-28 bg-gradient-to-br from-[#5A42DE] via-[#7B63F0] to-[#9B7FFF] relative">
            {/* Settings shortcut */}
            <Link href="/settings" aria-label="Settings"
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
              <Settings className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            {/* Avatar overlapping the banner */}
            <div className="relative -mt-12 mb-4 inline-block">
              <div className="relative">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="Profile photo" width={96} height={96}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-[#1e1e2a] shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-[#1e1e2a] shadow-lg bg-gradient-to-br from-[#5A42DE] to-[#9B7FFF] flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                )}

                {/* Camera upload button */}
                <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                  aria-label="Change profile photo"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#5A42DE] hover:bg-[#4b35e5] border-2 border-white dark:border-[#1e1e2a] flex items-center justify-center shadow-md transition-all disabled:opacity-60">
                  {uploadingAvatar
                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera className="w-3.5 h-3.5 text-white" />}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            {/* Name + username + status */}
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[#18181B] dark:text-white leading-tight">
                {user?.name ?? "No name set"}
              </h1>

              <button onClick={handleCopyUsername}
                className="flex items-center gap-1.5 text-[#5A42DE] text-sm font-medium hover:opacity-80 transition-opacity">
                <AtSign className="w-3.5 h-3.5" />
                {user?.username ?? user?.email}
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
                <Shield className="w-3 h-3" /> {status.label}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E1E1E5] dark:border-gray-700 mt-5 pt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F7F7FC] dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#717182]" />
                </div>
                <div>
                  <p className="text-xs text-[#717182] dark:text-gray-400">Email</p>
                  <p className="font-medium text-[#18181B] dark:text-white">{user?.email}</p>
                </div>
              </div>

              {user?.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F7FC] dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#717182]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#717182] dark:text-gray-400">Phone</p>
                    <p className="font-medium text-[#18181B] dark:text-white">{user.phoneNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F7F7FC] dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#717182]" />
                </div>
                <div>
                  <p className="text-xs text-[#717182] dark:text-gray-400">Role</p>
                  <p className="font-medium text-[#18181B] dark:text-white capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick links ───────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm overflow-hidden">
          {[
            { label: "Account Settings", desc: "Update your name, username and email", href: "/settings", icon: Settings },
            { label: "Security", desc: "Change your password", href: "/settings?tab=security", icon: Shield },
          ].map((item, i, arr) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center justify-between p-5 hover:bg-[#F7F7FC] dark:hover:bg-gray-800 transition-colors ${i < arr.length - 1 ? "border-b border-[#E1E1E5] dark:border-gray-700" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECEFFE] dark:bg-[#2a2a4a] flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-[#5A42DE]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#18181B] dark:text-white">{item.label}</p>
                  <p className="text-xs text-[#717182] dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#717182] rotate-180" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
