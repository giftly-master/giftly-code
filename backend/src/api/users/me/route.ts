import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthPayload } from "@/lib/auth-session";
import { createProblemDetails } from "@/lib/api-utils";
import { sanitizeInput } from "@/lib/validation";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return createProblemDetails("about:blank", "Unauthorized", 401, "Unauthorized");
    }

    const body = await request.json();
    const { name, username, phoneNumber } = body;

    // Build update object with only provided fields
    const updates: Record<string, string | null> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      updates.name = name ? sanitizeInput(String(name)).slice(0, 100) : null;
    }

    if (username !== undefined) {
      if (username) {
        const clean = sanitizeInput(String(username)).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
        if (clean.length < 3) {
          return createProblemDetails("about:blank", "Bad Request", 400, "Username must be at least 3 characters");
        }
        // Check uniqueness
        const existing = await db.query.users.findFirst({
          where: eq(users.username, clean),
          columns: { id: true },
        });
        if (existing && existing.id !== payload.userId) {
          return createProblemDetails("about:blank", "Conflict", 409, "Username already taken");
        }
        updates.username = clean;
      } else {
        updates.username = null;
      }
    }

    if (phoneNumber !== undefined) {
      updates.phoneNumber = phoneNumber ? sanitizeInput(String(phoneNumber)).slice(0, 20) : null;
    }

    await db.update(users).set(updates as any).where(eq(users.id, payload.userId));

    const updated = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        username: true,
        phoneNumber: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, user: updated }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/users/me]", error);
    return createProblemDetails("about:blank", "Internal Server Error", 500, "Internal server error");
  }
}
