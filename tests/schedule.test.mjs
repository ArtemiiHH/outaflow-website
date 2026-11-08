import { test } from "node:test";
import assert from "node:assert/strict";
import { activeDrop } from "../src/lib/schedule.mjs";
const drop = {
  id: "test",
  startsAt: "2026-11-08T12:00:00+02:00",
  endsAt: "2026-11-08T14:00:00+02:00",
};
test("drop starts inclusively, ends exclusively and respects timezone", () => {
  assert.equal(activeDrop([drop], Date.parse("2026-11-08T09:59:59Z")), null);
  assert.equal(activeDrop([drop], Date.parse("2026-11-08T10:00:00Z")), drop);
  assert.equal(activeDrop([drop], Date.parse("2026-11-08T11:59:59Z")), drop);
  assert.equal(activeDrop([drop], Date.parse("2026-11-08T12:00:00Z")), null);
});
test("missing and malformed drops are inactive", () => {
  assert.equal(activeDrop([]), null);
  assert.equal(activeDrop([{ startsAt: "invalid", endsAt: "invalid" }]), null);
});
