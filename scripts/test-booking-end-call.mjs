/**
 * Smoke checks for booking End Call helpers (no browser).
 * Run: node scripts/test-booking-end-call.mjs
 */
import assert from "node:assert/strict";
import {
  canJoinAppointment,
  getAppointmentStatus,
} from "../src/utils/appointmentStatus.js";

function testServerEndedBlocksJoin() {
  const apt = {
    slotId: 1,
    canJoin: false,
    joinStatus: "over",
    startTime: new Date().toISOString(),
  };
  assert.equal(getAppointmentStatus(apt), "over");
  assert.equal(canJoinAppointment(apt), false);
}

function testGraceFallbackOver() {
  const start = new Date(Date.now() - 50 * 60 * 1000);
  const apt = {
    slotId: 2,
    startTime: start.toISOString(),
  };
  assert.equal(getAppointmentStatus(apt, new Date()), "over");
  assert.equal(canJoinAppointment(apt, new Date()), false);
}

function testActiveInsideWindowWithoutServerFlags() {
  const start = new Date(Date.now() - 5 * 60 * 1000);
  const apt = {
    slotId: 3,
    startTime: start.toISOString(),
  };
  assert.equal(getAppointmentStatus(apt, new Date()), "active");
  assert.equal(canJoinAppointment(apt, new Date()), true);
}

function testServerCanJoinPreferred() {
  const start = new Date(Date.now() - 5 * 60 * 1000);
  const apt = {
    slotId: 4,
    startTime: start.toISOString(),
    canJoin: false,
    joinStatus: "over",
  };
  assert.equal(canJoinAppointment(apt, new Date()), false);
  assert.equal(getAppointmentStatus(apt, new Date()), "over");
}

testServerEndedBlocksJoin();
testGraceFallbackOver();
testActiveInsideWindowWithoutServerFlags();
testServerCanJoinPreferred();

console.log("booking-end-call appointmentStatus checks: PASS (4)");
