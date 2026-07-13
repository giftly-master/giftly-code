import { useEffect, useState } from "react";

export interface DashboardStats {
  giftsReceived: number;
  giftsSent: number;
  unopenedGifts: number;
  accountBalance: { currency: string; balance: number }[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { if (data.success) setStats(data.stats); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
