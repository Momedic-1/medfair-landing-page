/**
 * Local FE simulation for server-driven join flags (no device clock for canJoin).
 * Run: node scripts/test-join-window-local.mjs
 */
import assert from "node:assert/strict";

function getAppointmentStatus(appointment, now = new Date()) {
  const serverStatus = appointment?.joinStatus;
  if (serverStatus === "upcoming" || serverStatus === "active" || serverStatus === "over") {
    return serverStatus;
  }
  const appointmentTime = appointment.startTime
    ? new Date(appointment.startTime)
    : null;
  if (!appointmentTime || Number.isNaN(appointmentTime.getTime())) return "unknown";
  const minutesDiff = Math.floor((now.getTime() - appointmentTime.getTime()) / 60000);
  if (minutesDiff > 45) return "over";
  if (minutesDiff >= -5 && minutesDiff <= 45) return "active";
  return "upcoming";
}

function canJoinAppointment(appointment, now = new Date()) {
  if (typeof appointment?.canJoin === "boolean") return appointment.canJoin;
  return getAppointmentStatus(appointment, now) === "active";
}

const start = new Date("2026-10-02T14:00:00.000Z"); // 15:00 Lagos
const nineAmWrongPhone = new Date("2026-10-02T08:03:00.000Z"); // phone says morning

// Server says upcoming / canJoin false even if phone clock is wrong later
const morningFromServer = {
  startTime: start.toISOString(),
  canJoin: false,
  joinStatus: "upcoming",
  doctorJoined: false,
  serverNow: "2026-10-02T08:03:00.000Z",
};
assert.equal(canJoinAppointment(morningFromServer, new Date("2099-01-01T00:00:00Z")), false);
assert.equal(getAppointmentStatus(morningFromServer, nineAmWrongPhone), "upcoming");

// Doctor joined early — server unlocks Join
const doctorWaiting = {
  startTime: start.toISOString(),
  canJoin: true,
  joinStatus: "active",
  doctorJoined: true,
  serverNow: "2026-10-02T13:00:00.000Z", // 14:00 Lagos
  joinOpensAt: "2026-10-02T13:55:00.000Z",
};
assert.equal(canJoinAppointment(doctorWaiting), true);
assert.equal(getAppointmentStatus(doctorWaiting), "active");

// Wrong phone clock must not force Join if server says no
const phoneThinksActive = new Date(start.getTime() - 2 * 60 * 1000);
const serverSaysNo = {
  startTime: start.toISOString(),
  canJoin: false,
  joinStatus: "upcoming",
};
assert.equal(getAppointmentStatus(serverSaysNo, phoneThinksActive), "upcoming");
assert.equal(canJoinAppointment(serverSaysNo, phoneThinksActive), false);

// Fallback when old API has no canJoin
const legacy = { startTime: start.toISOString() };
assert.equal(canJoinAppointment(legacy, new Date(start.getTime() - 4 * 60 * 1000)), true);
assert.equal(canJoinAppointment(legacy, new Date(start.getTime() - 30 * 60 * 1000)), false);

console.log("PASS: FE join-window local simulation (4 scenarios)");
