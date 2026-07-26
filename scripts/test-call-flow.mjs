import assert from "node:assert/strict";
import { applyIncomingCallEvent } from "../src/utils/incomingCallSse.js";
import {
  filterDismissedCalls,
  dismissIncomingCallId,
} from "../src/utils/dismissedIncomingCalls.js";
import {
  parseRoomUrlFromSearch,
  normalizeWherebyRoomUrl,
} from "../src/utils/videoCallRoomUrl.js";
import { toViewableDocumentUrl } from "../src/utils/documentUrl.js";

globalThis.window = {
  location: { origin: "https://www.medfairtechnologies.com" },
};
globalThis.localStorage = {
  _data: new Map(),
  getItem(k) {
    return this._data.get(k) ?? null;
  },
  setItem(k, v) {
    this._data.set(k, String(v));
  },
  removeItem(k) {
    this._data.delete(k);
  },
};

function buildVideoCallUrl(roomUrl, callId = null) {
  const base = `${window.location.origin}/video-call`;
  const params = new URLSearchParams();
  if (callId != null && String(callId).trim() !== "") {
    params.set("callId", String(callId));
    return `${base}?${params.toString()}`;
  }
  if (roomUrl) params.set("roomUrl", roomUrl);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

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
assert.deepEqual(
  list.map((c) => c.callId),
  [11],
);

list = applyIncomingCallEvent(
  [],
  { type: "NEW_CALL", call: { callId: 55, patientFirstName: "Pat" } },
);
assert.equal(list.length, 1);
list = applyIncomingCallEvent(list, { type: "REFRESH", calls: [] });
assert.equal(list.length, 1);
assert.equal(list[0].callId, 55);

list = applyIncomingCallEvent(list, { type: "CALL_ENDED", callId: "55" });
assert.equal(list.length, 0);

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

const built = buildVideoCallUrl(
  "https://medfair-tech.whereby.com/room-abc",
  653,
);
assert.equal(built.includes("callId=653"), true);
assert.equal(built.includes("roomUrl="), false);

const roomOnly = buildVideoCallUrl("https://medfair-tech.whereby.com/room-abc");
assert.equal(roomOnly.includes("roomUrl="), true);
assert.equal(roomOnly.includes("callId="), false);

assert.equal(
  toViewableDocumentUrl({
    url: "http://res.cloudinary.com/demo/image/upload/v1/report.pdf",
    fileName: "report.pdf",
    fileType: "application/pdf",
  }),
  "https://res.cloudinary.com/demo/raw/upload/v1/report.pdf",
);

dismissIncomingCallId(42);
const filtered = filterDismissedCalls([{ callId: 42 }, { callId: 99 }]);
assert.equal(filtered.length, 1);
assert.equal(filtered[0].callId, 99);

const expiredRaw = JSON.stringify([{ id: 7, at: Date.now() - 50 * 60 * 1000 }]);
globalThis.localStorage.setItem("dismissedIncomingCallIds", expiredRaw);
const afterExpire = filterDismissedCalls([{ callId: 7 }]);
assert.equal(afterExpire.length, 1);

console.log("call-flow tests passed");
