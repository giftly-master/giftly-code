"use client";

import React, { useState } from "react";
import { Bell, Gift, CheckCircle, Clock } from "lucide-react";

type NotifType = "gift" | "system" | "unlock";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [];

const icons: Record<NotifType, React.ReactNode> = {
  gift: <Gift className="w-5 h-5 text-[#5A42DE]" />,
  system: <CheckCircle className="w-5 h-5 text-green-500" />,
  unlock: <Clock className="w-5 h-5 text-yellow-500" />,
};

const bgColors: Record<NotifType, string> = {
  gift: "bg-[#ECEFFE] dark:bg-[#2a2a4a]",
  system: "bg-green-50 dark:bg-green-900/20",
  unlock: "bg-yellow-50 dark:bg-yellow-900/20",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#18181B] dark:text-white">Notifications</h1>
            <p className="text-sm text-[#717182] dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-[#5A42DE] hover:opacity-80 transition-opacity"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List or empty state */}
        <div className="bg-white dark:bg-[#1e1e2a] rounded-2xl border border-[#E1E1E5] dark:border-gray-700 shadow-sm overflow-hidden">
          {notifications.length > 0 ? (
            notifications.map((notif, i) => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-5 transition-colors ${!notif.read ? "bg-[#FAFAFF] dark:bg-[#1a1a2e]" : "hover:bg-gray-50 dark:hover:bg-gray-800"} ${i < notifications.length - 1 ? "border-b border-[#E1E1E5] dark:border-gray-700" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColors[notif.type]}`}>
                  {icons[notif.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold text-[#18181B] dark:text-white ${!notif.read ? "font-bold" : ""}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-[#717182] dark:text-gray-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-sm text-[#717182] dark:text-gray-400 mt-0.5">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[#5A42DE] mt-1 shrink-0" aria-label="Unread" />
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 bg-[#ECEFFE] dark:bg-[#2a2a4a] rounded-2xl flex items-center justify-center">
                <Bell className="w-8 h-8 text-[#5A42DE]" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-[#18181B] dark:text-white">No notifications yet</p>
                <p className="text-sm text-[#717182] dark:text-gray-400 max-w-xs">
                  When someone sends you a gift or your gift unlocks, you'll see it here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
