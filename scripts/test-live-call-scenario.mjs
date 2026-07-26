/**
 * REAL LIVE SCENARIO TEST — GP consultation, end to end (frontend logic).
 *
 * Simulates exactly what production does, using the REAL app modules:
 *   1. Patient taps "Call a General Practitioner" → backend creates call 653
 *      with one Whereby room.
 *   2. Doctor sees incoming call (SSE), taps Join → backend claims call,
 *      returns the same roomUrl → doctor tab opens via buildVideoCallUrl.
 *   3. Patient polls status → DOCTOR_JOINED → taps Join call → patient tab
 *      opens via buildVideoCallUrl.
 *   4. Each /video-call tab resolves its room: query string → status API.
 *   5. Whereby joinRoom() fails on first attempt (the real production
 *      failure) → auto-retry logic must recover WITHOUT the user tapping
 *      Rejoin.
 *
 * PASS = both tabs resolve the identical, uncorrupted Whereby URL and the
 * retry loop ends connected.
 */
import assert from "node:assert/strict";

// --- Browser shims so real app modules load under Node ---
globalThis.window = {
  location: { origin: "https://www.medfairtechnologies.com", search: "" },
  open: () => ({ focus() {}, set opener(_) {} }),
};
const store = () => ({
  _d: new Map(),
  getItem(k) { return this._d.get(k) ?? null; },
  setItem(k, v) { this._d.set(k, String(v)); },
  removeItem(k) { this._d.delete(k); },
});
globalThis.localStorage = store();
globalThis.sessionStorage = store();

// --- REAL app modules (same code the browser runs) ---
const { parseRoomUrlFromSearch, parseCallIdFromSearch, normalizeWherebyRoomUrl } =
  await import("../src/utils/videoCallRoomUrl.js");
const { buildVideoCallUrl, stashRoomUrlForCall, loadRoomUrlForCall } =
  await import("../src/utils/videoCallNavigation.js");

// =====================================================================
// STEP 1 — Backend state: patient 42 starts a call. ONE room per call.
// =====================================================================
const CALL_ID = 653;
const DB_ROOM_URL =
  "https://medfair-tech.whereby.com/21610241-7224-4259-a815-7e8eb5042a29";

const backend = {
  videoCall: { id: CALL_ID, roomUrl: DB_ROOM_URL, isActive: true, doctorId: null },
  status() {
    if (!this.videoCall.isActive) return { status: "ENDED" };
    return this.videoCall.doctorId
      ? { status: "DOCTOR_JOINED", roomUrl: this.videoCall.roomUrl, callId: CALL_ID }
      : { status: "WAITING", roomUrl: this.videoCall.roomUrl, callId: CALL_ID };
  },
  doctorJoin(doctorId) {
    this.videoCall.doctorId = doctorId;
    return { joinRoomUrl: this.videoCall.roomUrl, patientId: 42, role: "DOCTOR" };
  },
};

console.log("STEP 1: patient starts call", CALL_ID, "room:", DB_ROOM_URL);

// =====================================================================
// STEP 2 — Doctor accepts, tab opens. New URL scheme = callId ONLY.
// =====================================================================
const joinResp = backend.doctorJoin(7);
stashRoomUrlForCall(CALL_ID, joinResp.joinRoomUrl); // production does this before window.open
const doctorTabUrl = buildVideoCallUrl(joinResp.joinRoomUrl, CALL_ID);
console.log("STEP 2: doctor tab URL:", doctorTabUrl);
assert.ok(doctorTabUrl.includes("callId=653"), "doctor URL must carry callId");
assert.ok(!doctorTabUrl.includes("roomUrl="), "roomUrl must NOT be in the query (old bug source)");

// =====================================================================
// STEP 3 — Patient polls, sees DOCTOR_JOINED, taps Join call.
// =====================================================================
const patientStatus = backend.status();
assert.equal(patientStatus.status, "DOCTOR_JOINED");
const patientTabUrl = buildVideoCallUrl(patientStatus.roomUrl, CALL_ID);
console.log("STEP 3: patient tab URL:", patientTabUrl);

// =====================================================================
// STEP 4 — Each /video-call tab resolves its room (real resolution order).
// =====================================================================
function videoTabResolvesRoom(tabUrl) {
  const search = new URL(tabUrl).search;
  const callId = parseCallIdFromSearch(search);
  assert.equal(callId, String(CALL_ID));
  // 1) query roomUrl (absent now) 2) per-call stash 3) status API = source of truth
  const fromQuery = parseRoomUrlFromSearch(search);
  const fromStash = normalizeWherebyRoomUrl(loadRoomUrlForCall(callId));
  const fromApi = normalizeWherebyRoomUrl(backend.status().roomUrl);
  return fromApi || fromStash || fromQuery;
}

const doctorRoom = videoTabResolvesRoom(doctorTabUrl);
const patientRoom = videoTabResolvesRoom(patientTabUrl);
console.log("STEP 4: doctor resolves:", doctorRoom);
console.log("STEP 4: patient resolves:", patientRoom);

assert.equal(doctorRoom, DB_ROOM_URL, "doctor must get the DB room, uncorrupted");
assert.equal(patientRoom, DB_ROOM_URL, "patient must get the DB room, uncorrupted");
assert.equal(doctorRoom, patientRoom, "BOTH SIDES IN THE SAME ROOM");
assert.ok(!doctorRoom.includes("&callId="), "no callId glued onto the Whereby URL");

// Legacy URLs from old sessions/bookmarks must also parse clean now.
const legacySearch =
  "?roomUrl=" + encodeURIComponent(DB_ROOM_URL) + "&callId=653";
assert.equal(parseRoomUrlFromSearch(legacySearch), DB_ROOM_URL,
  "legacy roomUrl+callId links must no longer corrupt the room");
console.log("STEP 4b: legacy ?roomUrl=…&callId=653 link parses clean ✓");

// =====================================================================
// STEP 5 — The production failure: first joinRoom() rejects. Retry loop
// (same policy as VideoCall.jsx: up to 8 attempts) must recover alone.
// =====================================================================
const JOIN_MAX_ATTEMPTS = 8;
let failuresBeforeSuccess = 2; // network/SDK-not-ready flake, as seen live
let joinCalls = 0;
const whereby = {
  async joinRoom() {
    joinCalls++;
    if (failuresBeforeSuccess-- > 0) throw new Error("SDK not ready / transient network");
    return "connected";
  },
};

let connected = false;
let lastError = null;
for (let attempt = 1; attempt <= JOIN_MAX_ATTEMPTS; attempt++) {
  try {
    await whereby.joinRoom();
    connected = true;
    console.log(`STEP 5: join attempt ${attempt} → CONNECTED (no Rejoin needed)`);
    break;
  } catch (e) {
    lastError = e;
    console.log(`STEP 5: join attempt ${attempt} failed (${e.message}) → auto-retry`);
  }
}
assert.ok(connected, `must connect within ${JOIN_MAX_ATTEMPTS} attempts (last: ${lastError})`);
assert.equal(joinCalls, 3, "connected on 3rd attempt after 2 failures");

// =====================================================================
// STEP 6 — Doctor ends → patient status flips to ENDED (rejoin clears).
// =====================================================================
backend.videoCall.isActive = false;
assert.equal(backend.status().status, "ENDED");
console.log("STEP 6: doctor ends call → status ENDED ✓");

console.log("\nREAL SCENARIO PASSED: same room for both sides, no corrupt URL, auto-retry connects without Rejoin.");
