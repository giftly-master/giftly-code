"use client";

import React, { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Settings, Mail, Phone, User, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(`@${user.username}`);
      setCopied(true);
      success("Username copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-5">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "G";

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    unverified: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile card */}
        <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl p-8 border border-[#E1E1E5] dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#E1E1E5] dark:border-gray-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#5A42DE] flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-[#18181B] dark:text-white">
                  {user?.name ?? "No name set"}
                </h1>
                {user?.username && (
                  <button
                    onClick={handleCopyUsername}
                    className="flex items-center gap-1.5 text-[#5A42DE] text-sm font-medium mt-1 hover:opacity-80 transition-opacity"
                  >
                    @{user.username}
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${statusColors[user?.status ?? "unverified"] ?? statusColors.unverified}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.status ?? "unverified"}
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              className="p-2.5 rounded-xl border border-[#E1E1E5] dark:border-gray-700 text-[#717182] hover:text-[#18181B] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              aria-label="Account settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          {/* Info rows */}
          <div className="space-y-4 border-t border-[#E1E1E5] dark:border-gray-700 pt-6">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-[#717182]" />
              <span className="text-[#717182] dark:text-gray-400 w-20 shrink-0">Email</span>
              <span className="font-medium text-[#18181B] dark:text-white">{user?.email}</span>
            </div>
            {user?.phoneNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[#717182]" />
                <span className="text-[#717182] dark:text-gray-400 w-20 shrink-0">Phone</span>
                <span className="font-medium text-[#18181B] dark:text-white">{user.phoneNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-[#717182]" />
              <span className="text-[#717182] dark:text-gray-400 w-20 shrink-0">Role</span>
              <span className="font-medium text-[#18181B] dark:text-white capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm overflow-hidden">
          {[
            { label: "Account Settings", desc: "Update your photo and account info", href: "/settings" },
            { label: "Security", desc: "Change your password and security settings", href: "/settings" },
          ].map((item, i, arr) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between p-5 hover:bg-[#F7F7FC] dark:hover:bg-gray-800 transition-colors ${i < arr.length - 1 ? "border-b border-[#E1E1E5] dark:border-gray-700" : ""}`}
            >
              <div>
                <p className="font-semibold text-sm text-[#18181B] dark:text-white">{item.label}</p>
                <p className="text-xs text-[#717182] dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <Settings className="w-4 h-4 text-[#717182]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
