import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wallets, transactions } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getAuthPayload } from "@/lib/auth-session";
import { createProblemDetails } from "@/lib/api-utils";

const FAUCET_AMOUNT = 10000; // 10,000 NGN testnet
const FAUCET_CURRENCY = "NGN";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return createProblemDetails("about:blank", "Unauthorized", 401, "Unauthorized");
    }

    const { userId } = payload;

    // Check if already claimed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingClaim = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.reference, "faucet-daily"),
          gte(transactions.createdAt, todayStart),
        ),
      )
      .limit(1);

    if (existingClaim.length > 0) {
      return createProblemDetails(
        "about:blank",
        "Too Many Requests",
        429,
        "You have already claimed your daily testnet funds today. Come back tomorrow!",
      );
    }

    await db.transaction(async (tx) => {
      // Ensure wallet exists
      const existing = await tx
        .select({ id: wallets.id })
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.currency, FAUCET_CURRENCY)))
        .limit(1);

      if (existing.length === 0) {
        await tx.insert(wallets).values({
          id: crypto.randomUUID(),
          userId,
          currency: FAUCET_CURRENCY,
          balance: FAUCET_AMOUNT,
        });
      } else {
        await tx
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${FAUCET_AMOUNT}`,
            updatedAt: new Date(),
          })
          .where(and(eq(wallets.userId, userId), eq(wallets.currency, FAUCET_CURRENCY)));
      }

      // Record the faucet transaction
      await tx.insert(transactions).values({
        id: crypto.randomUUID(),
        userId,
        type: "deposit",
        status: "completed",
        amount: FAUCET_AMOUNT,
        currency: FAUCET_CURRENCY,
        reference: "faucet-daily",
        provider: "testnet-faucet",
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: `₦${FAUCET_AMOUNT.toLocaleString()} testnet funds added to your wallet!`,
        amount: FAUCET_AMOUNT,
        currency: FAUCET_CURRENCY,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[FAUCET_ERROR]", error);
    return createProblemDetails("about:blank", "Internal Server Error", 500, "Internal server error");
  }
}
