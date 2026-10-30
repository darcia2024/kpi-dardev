import assert from "node:assert/strict";
import test from "node:test";
import { AttemptLimiter, clientAddress, sameOrigin } from "../src/platform/http/attempt-limit";
import { securityHeaders } from "../src/platform/http/security-headers";

test("attempt limiter blocks after the limit and resets after the window", () => {
  const limiter = new AttemptLimiter(3, 1_000);
  for (let index = 0; index < 3; index += 1) assert.equal(limiter.allow("a", 0), true);
  assert.equal(limiter.allow("a", 10), false);
  assert.equal(limiter.allow("b", 10), true, "other keys are separate");
  assert.equal(limiter.allow("a", 1_000), true, "window resets");
});

test("client address is trusted only from the Vercel ingress header on Vercel", () => {
  const request = (headers: Record<string, string>) => new Request("https://kpi.test/api", { headers });
  assert.equal(clientAddress(request({ "x-vercel-forwarded-for": "203.0.113.7" }), { VERCEL: "1" } as NodeJS.ProcessEnv), "203.0.113.7");
  assert.equal(clientAddress(request({ "x-vercel-forwarded-for": "203.0.113.7" }), {} as NodeJS.ProcessEnv), null, "not on Vercel");
  assert.equal(clientAddress(request({ "x-forwarded-for": "203.0.113.7" }), { VERCEL: "1" } as NodeJS.ProcessEnv), null, "client-supplied header ignored");
  assert.equal(clientAddress(request({ "x-vercel-forwarded-for": "bukan-ip" }), { VERCEL: "1" } as NodeJS.ProcessEnv), null);
});

test("auth routes accept only same-origin requests", () => {
  assert.equal(sameOrigin(new Request("https://kpi.test/api/v1/auth/sign-in", { method: "POST", headers: { origin: "https://kpi.test" } })), true);
  assert.equal(sameOrigin(new Request("https://kpi.test/api/v1/auth/sign-in", { method: "POST", headers: { origin: "https://jahat.test" } })), false);
  assert.equal(sameOrigin(new Request("https://kpi.test/api/v1/auth/sign-in", { method: "POST" })), false);
});

test("production headers forbid framing, eval, and outside origins", () => {
  const headers = new Map(securityHeaders(false).map((item) => [item.key, item.value]));
  const csp = headers.get("Content-Security-Policy")!;
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /connect-src 'self'/);
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.match(headers.get("Strict-Transport-Security")!, /max-age=\d+/);
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.match(securityHeaders(true).find((item) => item.key === "Content-Security-Policy")!.value, /unsafe-eval/, "dev needs eval");
});
