

export async function computeFingerprint(
  userAgent: string | null,
  ip: string,
): Promise<string> {
  // Use only user-agent for fingerprint — IP changes too often behind
  // proxies, NAT, and on localhost (127.0.0.1 vs ::1 vs LAN IP).
  const input = userAgent ?? "unknown";
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
