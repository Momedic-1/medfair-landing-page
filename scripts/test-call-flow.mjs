import assert from "node:assert/strict";
import { applyIncomingCallEvent } from "../src/utils/incomingCallSse.js";
import { filterDismissedCalls, dismissIncomingCallId } from "../src/utils/dismissedIncomingCalls.js";

// applyIncomingCallEvent
let list = [{ callId: 1 }, { callId: 2 }];
list = applyIncomingCallEvent(list, { type: "CALL_ENDED", callId: 1 });
assert.equal(list.length, 1);
assert.equal(list[0].callId, 2);

list = applyIncomingCallEvent(list, {
  type: "NEW_CALL",
  call: { callId: 3, patientFirstName: "A" },
});
assert.equal(list.length, 2);
assert.equal(list[0].callId, 3);

list = applyIncomingCallEvent(list, { type: "NEW_CALL", call: { callId: 1 } }, [1]);
assert.equal(list.length, 2);

list = applyIncomingCallEvent(
  [{ callId: 10 }],
  { type: "CONNECTED", calls: [{ callId: 10 }, { callId: 11 }] },
  [10],
);
assert.deepEqual(list.map((c) => c.callId), [11]);

// Empty REFRESH must not wipe a brand-new SSE call (race before DB commit/poll).
list = applyIncomingCallEvent(
  [],
  { type: "NEW_CALL", call: { callId: 55, patientFirstName: "Pat" } },
);
assert.equal(list.length, 1);
list = applyIncomingCallEvent(list, { type: "REFRESH", calls: [] });
assert.equal(list.length, 1);
assert.equal(list[0].callId, 55);

// CALL_ENDED must clear even when id types differ (string vs number).
list = applyIncomingCallEvent(list, { type: "CALL_ENDED", callId: "55" });
assert.equal(list.length, 0);

// roomUrl parser must not append &callId onto Whereby URLs
import {
  parseRoomUrlFromSearch,
  normalizeWherebyRoomUrl,
} from "../src/utils/videoCallRoomUrl.js";

const encoded =
  "?roomUrl=" +
  encodeURIComponent("https://medfair.whereby.com/consult-abc") +
  "&callId=42";
assert.equal(
  parseRoomUrlFromSearch(encoded),
  "https://medfair.whereby.com/consult-abc",
);

const withRoomKey =
  "?roomUrl=" +
  encodeURIComponent("https://medfair.whereby.com/r?roomKey=xyz") +
  "&callId=99";
assert.equal(
  parseRoomUrlFromSearch(withRoomKey),
  "https://medfair.whereby.com/r?roomKey=xyz",
);

assert.equal(
  normalizeWherebyRoomUrl(
    "https://medfair.whereby.com/consult-abc&callId=42",
  ),
  "https://medfair.whereby.com/consult-abc",
);

// dismissedIncomingCalls (in-memory shim for localStorage)
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => mem.get(k) ?? null,
  setItem: (k, v) => mem.set(k, v),
  removeItem: (k) => mem.delete(k),
};

dismissIncomingCallId(42);
const filtered = filterDismissedCalls([
  { callId: 42 },
  { callId: 99 },
]);
assert.equal(filtered.length, 1);
assert.equal(filtered[0].callId, 99);

// TTL prune: expired dismissals should not hide calls
const expiredRaw = JSON.stringify([{ id: 7, at: Date.now() - 50 * 60 * 1000 }]);
globalThis.localStorage.setItem("dismissedIncomingCallIds", expiredRaw);
const afterExpire = filterDismissedCalls([{ callId: 7 }]);
assert.equal(afterExpire.length, 1);

console.log("call-flow tests passed");
