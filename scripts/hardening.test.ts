import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../lib/rate-limit";
import { sanitizeAuditMetadata } from "../lib/audit-log";

test("Rate-Limiter erlaubt Requests unter Limit und blockiert darüber", () => {
  const key = `test-${Date.now()}-${Math.random()}`;
  const opts = { limit: 3, windowMs: 60_000 };
  assert.equal(checkRateLimit(key, opts).allowed, true);
  assert.equal(checkRateLimit(key, opts).allowed, true);
  assert.equal(checkRateLimit(key, opts).allowed, true);
  const blocked = checkRateLimit(key, opts);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test("Audit-Metadata entfernt Secrets", () => {
  const cleaned = sanitizeAuditMetadata({
    count: 5,
    api_key: "should-be-removed",
    token: "abc",
    note: "sk_test_123",
    nested: { authorization: "Bearer xyz", ok: true },
  });
  assert.equal(cleaned.count, 5);
  assert.equal(cleaned.api_key, "[redacted]");
  assert.equal(cleaned.token, "[redacted]");
  assert.equal(cleaned.note, "[redacted]");
  assert.deepEqual(cleaned.nested, { authorization: "[redacted]", ok: true });
});

test("Audit-Metadata lässt harmlose Werte unverändert", () => {
  const cleaned = sanitizeAuditMetadata({ route: "notifications/send", delivered: 2 });
  assert.equal(cleaned.route, "notifications/send");
  assert.equal(cleaned.delivered, 2);
});
