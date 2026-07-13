import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthPayload } from "@/lib/auth-session";
import { createProblemDetails } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return createProblemDetails("about:blank", "Unauthorized", 401, "Unauthorized");
    }

    const userWallets = await db
      .select({ currency: wallets.currency, balance: wallets.balance, updatedAt: wallets.updatedAt })
      .from(wallets)
      .where(eq(wallets.userId, payload.userId));

    return NextResponse.json({ success: true, wallets: userWallets });
  } catch (error) {
    console.error("[WALLET_GET]", error);
    return createProblemDetails("about:blank", "Internal Server Error", 500, "Internal server error");
  }
}
