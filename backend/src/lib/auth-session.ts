import { NextRequest } from "next/server";
import { verifyAccessToken, type TokenPayload } from "@/lib/tokens";

export async function getAuthPayload(
  request: Request | NextRequest,
): Promise<TokenPayload | null> {
  // 1. Try Authorization: Bearer <token> header first
  const header =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (header) {
    const [scheme, token] = header.split(" ");
    if (token && scheme.toLowerCase() === "bearer") {
      return await verifyAccessToken(token);
    }
  }

  // 2. Fall back to access_token cookie (set by login route)
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("access_token="));

  if (cookieMatch) {
    const token = cookieMatch.split("=").slice(1).join("=");
    if (token) {
      return await verifyAccessToken(token);
    }
  }

  return null;
}
