/**
 * Contract / regression tests for recent GP UX + earnings fixes.
 *
 * Covers:
 * 1. Waiting modal tells patient to wait 5 minutes / doctor may already be on call
 * 2. Cancel is blocked / redirected once doctor has joined (DOCTOR_JOINED)
 * 3. Backend settlement deducts patient then credits doctor (source contract)
 *
 * Run: node scripts/test-gp-wait-cancel-earn-fixes.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const backendRoot = path.resolve(__dirname, "../../Backend");

function read(relFromFrontend) {
  return fs.readFileSync(path.join(frontendRoot, relFromFrontend), "utf8");
}

function readBackend(relFromBackend) {
  return fs.readFileSync(path.join(backendRoot, relFromBackend), "utf8");
}

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}`);
    console.error(`      ${err.message}`);
    process.exitCode = 1;
  }
}

const modal = read("src/PatientDashboard/components/CallDoctorModal.jsx");
const dashboard = read("src/PatientDashboard/dashboard.jsx");
const vonage = readBackend(
  "userManagement/src/main/java/org/momedicbackend/vonage_video_api/VonageService.java",
);

console.log("=== GP wait / cancel / earn regression checks ===\n");

check("waiting copy asks patient to wait at least 5 minutes", () => {
  assert.match(
    modal,
    /Please wait at least 5 minutes\. A doctor may already be on the\s+call or have already accepted\./,
  );
});

check("waiting state still has Cancel call button (only while WAITING)", () => {
  assert.match(modal, /Cancel call/);
  const waitingUiStart = modal.indexOf('{callStatus === "WAITING" && (');
  const joinedUiStart = modal.indexOf('{callStatus === "DOCTOR_JOINED" && (');
  assert.ok(waitingUiStart > -1 && joinedUiStart > waitingUiStart);
  const waitingBlock = modal.slice(waitingUiStart, joinedUiStart);
  const joinedBlock = modal.slice(joinedUiStart);
  assert.match(waitingBlock, /Cancel call/);
  assert.doesNotMatch(joinedBlock, /Cancel call/);
});

check("doctor-ready screen keeps Join call CTA", () => {
  assert.match(modal, /Join call/);
  assert.match(modal, /Connecting you to the consultation/);
});

check("dashboard cancel re-checks status before ending call", () => {
  assert.match(dashboard, /handleCancelWaiting/);
  assert.match(dashboard, /confirmCancelCall/);
  assert.match(dashboard, /statusPayload\?\.status === "DOCTOR_JOINED"/);
  assert.match(
    dashboard,
    /A doctor has already joined\. Please tap Join call — you can no longer cancel\./,
  );
});

check("dashboard does not wipe call state when cancel fails because doctor joined", () => {
  assert.match(dashboard, /doctorAlreadyJoined/);
  assert.match(dashboard, /markDoctorReadyForPatient/);
  // The old bug cleared persistence even on cancel API failure — ensure that
  // path returns early after doctorAlreadyJoined instead of always clearing.
  const confirmFn = dashboard.slice(
    dashboard.indexOf("const confirmCancelCall"),
    dashboard.indexOf("useEffect(() => {\n    const now = new Date()"),
  );
  assert.match(confirmFn, /if \(doctorAlreadyJoined\)/);
  assert.match(confirmFn, /return;/);
});

check("backend endCall rejects cancel after doctor joined", () => {
  assert.match(
    vonage,
    /You cannot end the call after the doctor has joined\./,
  );
});

check("backend settlement uses a fresh transaction after join commit", () => {
  assert.match(vonage, /TransactionTemplate tx = new TransactionTemplate\(transactionManager\)/);
  assert.match(vonage, /settleFirstDoctorJoin/);
});

check("backend settlement deducts then credits 1000 — nothing less", () => {
  const settle = vonage.slice(
    vonage.indexOf("private void settleFirstDoctorJoin"),
    vonage.indexOf("private void deductPaymentForCall"),
  );
  const deductAt = settle.indexOf("deductPaymentForCall");
  const creditAt = settle.indexOf("creditForInstantCall");
  assert.ok(deductAt > -1, "deductPaymentForCall missing");
  assert.ok(creditAt > -1, "creditForInstantCall missing");
  assert.ok(deductAt < creditAt, "deduct must come before credit");
  assert.match(settle, /BigDecimal\.valueOf\(1000\)/);
  // Must not catch deduct alone and still credit
  assert.doesNotMatch(
    settle,
    /Still credit the doctor/,
  );
});

check("backend loads specialty from doctor_profile to avoid lazy-load failure", () => {
  assert.match(vonage, /doctorProfileRepository/);
  assert.match(vonage, /findByUser_Id\(doctorId\)/);
  assert.match(vonage, /GENERAL_PRACTITIONER/);
});

console.log(`\n${passed} checks passed`);
if (process.exitCode) {
  console.error("\nOne or more checks failed.");
  process.exit(1);
}
console.log("\nAll GP wait/cancel/earn regression checks passed.");
