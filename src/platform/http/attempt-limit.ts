import { isIP } from "node:net";

// Best-effort brake on password guessing, held in the memory of one server instance. The Vercel
// Firewall rate-limit rules (docs/62) are the real limit at the edge; this catches bursts that
// reach the same instance. Counts only on Vercel, where the client address can be trusted.
type Window = { count: number; resetsAt: number };

export class AttemptLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  // true while the key is still under its limit; every call counts as one attempt.
  allow(key: string, now = Date.now()): boolean {
    const current = this.windows.get(key);
    if (!current || current.resetsAt <= now) {
      if (this.windows.size > 5_000) for (const [stale, window] of this.windows) if (window.resetsAt <= now) this.windows.delete(stale);
      this.windows.set(key, { count: 1, resetsAt: now + this.windowMs });
      return true;
    }
    current.count += 1;
    return current.count <= this.limit;
  }
}

export function clientAddress(request: Request, values: NodeJS.ProcessEnv = process.env): string | null {
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  return values.VERCEL === "1" && ip && isIP(ip) ? ip : null;
}

const fifteenMinutes = 15 * 60 * 1000;
const perAddress = new AttemptLimiter(30, fifteenMinutes);
const perAccount = new AttemptLimiter(10, fifteenMinutes);
const recoveryPerAddress = new AttemptLimiter(5, fifteenMinutes);

// Several Masisir can share one address (a sakan's wifi), so the per-address limit is looser
// than the limit for one email from that address.
export function signInAllowed(request: Request, email: string): boolean {
  const ip = clientAddress(request);
  if (!ip) return true;
  const address = perAddress.allow(ip);
  const account = perAccount.allow(`${ip}:${email.trim().toLowerCase()}`);
  return address && account;
}

export function recoveryAllowed(request: Request): boolean {
  const ip = clientAddress(request);
  return !ip || recoveryPerAddress.allow(ip);
}

export const sameOrigin = (request: Request): boolean => request.headers.get("origin") === new URL(request.url).origin;
