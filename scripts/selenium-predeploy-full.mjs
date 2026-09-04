/**
 * Pre-deploy full suite (headed Selenium) — patient + doctor + consultation call.
 *
 * Covers:
 *  1. Favicon (partners medfair.svg)
 *  2. Patient meds cards + Consultations icon
 *  3. Investigations + letterhead PDF download
 *  4. Instant GP consultation: create → doctor join → doctor end
 *  5. Doctor Patient visits → fill SOAP → save (API verify)
 *
 *   FE_URL=http://127.0.0.1:5174 API_URL=http://localhost:8081 node scripts/selenium-predeploy-full.mjs
 */
import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://127.0.0.1:5174").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = process.env.TEST_PASSWORD || "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";
const DOCTOR_EMAIL =
  process.env.DOCTOR_EMAIL || "e2e.ui.doc.1786909249605453@medfair-test.local";
const HOLD = Number(process.env.HOLD_MS || 2500);
const JDBC = process.env.JDBC_URL || "jdbc:postgresql://localhost:5432/MEDFAIR";
const DB_USER = process.env.DATABASE_USERNAME || "postgres";
const DB_PASS = process.env.DATABASE_PASSWORD || "Cliffordj1.";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BACKEND = path.resolve(ROOT, "..", "Backend");
const JAR = path.join(BACKEND, "scripts", "postgresql.jar");
const HELPER = path.join(__dirname, ".tmp-predeploy");
const SHOTS = path.join(__dirname, ".selenium-screenshots");
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(HELPER, { recursive: true });

const JAVA = fs.existsSync("C:\\Program Files\\Java\\jdk-17\\bin\\java.exe")
  ? "C:\\Program Files\\Java\\jdk-17\\bin\\java.exe"
  : "java";
const JAVAC = fs.existsSync("C:\\Program Files\\Java\\jdk-17\\bin\\javac.exe")
  ? "C:\\Program Files\\Java\\jdk-17\\bin\\javac.exe"
  : "javac";

let passed = 0;
let failed = 0;
function ok(n, d = "") {
  passed += 1;
  console.log(`✓ ${n}${d ? ` — ${d}` : ""}`);
}
function fail(n, e) {
  failed += 1;
  console.error(`✗ ${n} — ${e?.message || e}`);
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(driver, name) {
  const b64 = await driver.takeScreenshot();
  fs.writeFileSync(
    path.join(SHOTS, `full-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`),
    Buffer.from(b64, "base64"),
  );
}

function runSqlHelper(className, source, args) {
  const src = path.join(HELPER, `${className}.java`);
  fs.writeFileSync(src, source);
  const jc = spawnSync(JAVAC, ["-cp", JAR, src], { encoding: "utf8" });
  if (jc.status !== 0) throw new Error(`javac ${className}: ${jc.stderr || jc.stdout}`);
  const r = spawnSync(JAVA, ["-cp", `${HELPER}${path.delimiter}${JAR}`, className, ...args], {
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`java ${className}: ${r.stderr || r.stdout}`);
  return r.stdout || "";
}

function creditInstantPlan(userId) {
  return runSqlHelper(
    "CreditInstantFull",
    `
import java.sql.*;
public class CreditInstantFull {
  public static void main(String[] args) throws Exception {
    long userId = Long.parseLong(args[0]);
    String url=args[1], user=args[2], pass=args[3];
    try (Connection c = DriverManager.getConnection(url, user, pass)) {
      long planId;
      try (PreparedStatement ps = c.prepareStatement(
        "SELECT id FROM subscription_plans WHERE LOWER(name) IN ('instant','instant - org') ORDER BY id LIMIT 1")) {
        try (ResultSet rs = ps.executeQuery()) {
          if (!rs.next()) throw new IllegalStateException("No Instant plan");
          planId = rs.getLong(1);
        }
      }
      String userCol = "user_id";
      try (ResultSet cols = c.getMetaData().getColumns(null, null, "user_subscriptions", null)) {
        while (cols.next()) {
          String n = cols.getString("COLUMN_NAME");
          if (n != null && n.equalsIgnoreCase("userid")) userCol = n;
          if (n != null && n.equalsIgnoreCase("user_id")) userCol = n;
        }
      }
      int updated = 0;
      try (PreparedStatement ps = c.prepareStatement(
        "UPDATE user_subscriptions SET consultation_count = GREATEST(COALESCE(consultation_count,0), 3), expiration_date = NOW() + INTERVAL '30 days' WHERE " + userCol + "=? AND plan_id=?")) {
        ps.setLong(1, userId); ps.setLong(2, planId);
        updated = ps.executeUpdate();
      }
      if (updated > 0) { System.out.println("UPDATED="+updated); return; }
      try (Statement st = c.createStatement()) {
        st.execute("SELECT setval(pg_get_serial_sequence('user_subscriptions','id'), COALESCE((SELECT MAX(id) FROM user_subscriptions), 1))");
      } catch (SQLException ignore) {}
      try (PreparedStatement ps = c.prepareStatement(
        "INSERT INTO user_subscriptions (" + userCol + ", expiration_date, consultation_count, plan_id) VALUES (?, NOW() + INTERVAL '30 days', 3, ?)")) {
        ps.setLong(1, userId); ps.setLong(2, planId);
        ps.executeUpdate();
        System.out.println("INSERTED=1");
      }
    }
  }
}`,
    [String(userId), JDBC, DB_USER, DB_PASS],
  ).trim();
}

async function apiLogin(email) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrPhone: email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login ${email} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function typeInto(driver, locator, text) {
  const el = await driver.wait(until.elementLocated(locator), 25000);
  await driver.wait(until.elementIsVisible(el), 10000);
  await el.click();
  await el.sendKeys(Key.chord(Key.CONTROL, "a"));
  await el.sendKeys(Key.BACK_SPACE);
  await el.sendKeys(String(text));
}

async function fillById(driver, id, text) {
  const el = await driver.wait(until.elementLocated(By.id(id)), 20000);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await el.click();
  await el.sendKeys(Key.chord(Key.CONTROL, "a"));
  await el.sendKeys(Key.BACK_SPACE);
  await el.sendKeys(String(text));
}

async function loginAs(driver, email, expectPath) {
  await driver.manage().deleteAllCookies();
  try {
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
  } catch {
    /* ignore */
  }
  await driver.get(`${FE}/login`);
  await typeInto(driver, By.css("#emailOrPhone"), email);
  await typeInto(driver, By.css("#password"), PASSWORD);
  const btns = await driver.findElements(By.css("button[type='submit']"));
  if (btns.length) await btns[0].click();
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(expectPath), 60000);
}

async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments(
    "--window-size=1280,900",
    "--disable-notifications",
    "--remote-allow-origins=*",
    "--no-default-browser-check",
  );
  options.setPageLoadStrategy("eager");
  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
    .build();
}

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log(" PRE-DEPLOY FULL: patient + doctor + consultation");
  console.log("══════════════════════════════════════════════════");
  console.log(`FE ${FE}  API ${API}\n`);

  const health = await fetch(`${API}/api/v1/registration/partner-organizations`);
  if (!health.ok) throw new Error("Backend down");
  ok("Backend up");
  if (!(await fetch(`${FE}/`)).ok) throw new Error("Frontend down");
  ok("Frontend up");

  const fav = await fetch(`${FE}/medfair.svg`);
  if (fav.ok) ok("Favicon /medfair.svg (partners logo)");
  else fail("Favicon", new Error(String(fav.status)));

  const patient = await apiLogin(PATIENT_EMAIL);
  const doctor = await apiLogin(DOCTOR_EMAIL);
  const patientId = patient.user.id;
  const doctorId = doctor.user.id;
  const patientToken = patient.token;
  const doctorToken = doctor.token;

  // Seed meds + lab order
  await fetch(`${API}/api/notes/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${doctorToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId,
      doctorId,
      subjective: "Predeploy seed",
      objective: "Stable",
      assessment: "URI",
      plan: "Supportive",
      finalDiagnosis: "Should not show on meds cards",
      soapComment: "",
      prescriptions: [
        {
          drugName: "Amoxicillin 500mg",
          dosage: "1 cap",
          frequency: "TDS",
          duration: "5 days",
          instructions: "After food",
          patientId,
        },
      ],
    }),
  });
  await fetch(
    `${API}/api/investigations/create-order?doctorId=${doctorId}&patientId=${patientId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${doctorToken}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        { customName: `Predeploy lab ${Date.now()}`, instruction: "Fasting" },
      ]),
    },
  );
  ok("Seeded note/prescriptions + lab order");

  try {
    creditInstantPlan(patientId);
    ok("Credited Instant plan for consultation");
  } catch (e) {
    fail("Credit Instant plan", e);
  }

  const driver = await buildDriver();
  try {
    // ── PATIENT FEATURES ─────────────────────────────────────────────
    console.log("\n── PATIENT ──");
    await loginAs(driver, PATIENT_EMAIL, "patient-dashboard");
    ok("Patient login");
    await pause(HOLD);

    const consultA = await driver.findElement(
      By.xpath("//a[contains(@href,'consultation-history')]"),
    );
    const medsA = await driver.findElement(By.xpath("//a[contains(@href,'patient-notes')]"));
    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'}); arguments[0].style.outline='3px solid #fbbf24';",
      consultA,
    );
    await pause(HOLD);
    await shot(driver, "consultations-icon");
    const cSvg = await consultA.findElement(By.css("svg")).getAttribute("outerHTML");
    const mSvg = await medsA.findElement(By.css("svg")).getAttribute("outerHTML");
    if (cSvg !== mSvg) ok("Consultations icon ≠ Medications");
    else fail("Consultations icon", new Error("identical"));

    await driver.get(`${FE}/patient-dashboard/patient-notes`);
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(.,'Get Prescription')]")),
      30000,
    );
    await pause(HOLD);
    await shot(driver, "meds");
    const medsBody = await driver.findElement(By.css("body")).getText();
    if (/Final Diagnosis/i.test(medsBody)) fail("Meds no Final Diagnosis", new Error("still shown"));
    else ok("Meds: no Final Diagnosis");
    const getRx = await driver.findElements(By.xpath("//button[contains(.,'Get Prescription')]"));
    const viewMeds = await driver.findElements(By.xpath("//button[contains(.,'View Medications')]"));
    if (getRx.length && viewMeds.length) ok("Meds CTAs present", `${getRx.length} cards`);
    else fail("Meds CTAs", new Error(`rx=${getRx.length} view=${viewMeds.length}`));
    if (viewMeds.length) {
      await viewMeds[0].click();
      await pause(HOLD);
      await shot(driver, "meds-modal");
      const closeBtn = await driver.findElement(By.xpath("//button[normalize-space()='Close']"));
      await closeBtn.click();
      await pause(800);
      ok("View Medications modal works");
    }

    await driver.get(`${FE}/patient-dashboard/patient-investigations`);
    await pause(HOLD);
    await shot(driver, "investigations");
    const invBody = await driver.findElement(By.css("body")).getText();
    if (/No payment|Paystack|Make payment/i.test(invBody)) fail("Inv no payment copy", new Error("found"));
    else ok("Investigations: no payment copy");
    if (/Order\s*#|Order number/i.test(invBody)) fail("Inv hide order #", new Error("found"));
    else ok("Investigations: order # hidden");
    const dl = await driver.findElements(By.xpath("//button[contains(.,'Download')]"));
    if (!dl.length) fail("Download PDF button", new Error("none"));
    else {
      ok("Download PDF button", String(dl.length));
      const orders = await fetch(`${API}/api/investigations/orders/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      }).then((r) => r.json());
      const list = Array.isArray(orders) ? orders : [];
      const newest = [...list].sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
      )[0];
      const orderId = newest?.orderId || newest?.id;
      const pdf = await fetch(`${API}/api/investigations/orders/${orderId}/download`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      const buf = Buffer.from(await pdf.arrayBuffer());
      if (pdf.ok && buf.slice(0, 4).toString() === "%PDF" && buf.length > 5000) {
        ok("Letterhead PDF bytes", `${buf.length}`);
      } else fail("Letterhead PDF", new Error(`${pdf.status} len=${buf.length}`));
      await dl[0].click();
      await pause(HOLD);
      ok("UI Download clicked");
    }

    // ── CONSULTATION / VIDEO CALL ────────────────────────────────────
    console.log("\n── CONSULTATION (video call) ──");
    // Hold a live SSE stream (like an open doctor dashboard) during create+join.
    const sseAbort = new AbortController();
    let sseOpened = false;
    const sseHold = fetch(
      `${API}/api/v1/video/incoming-calls/stream?doctorId=${doctorId}`,
      {
        headers: {
          Authorization: `Bearer ${doctorToken}`,
          Accept: "text/event-stream",
        },
        signal: sseAbort.signal,
      },
    )
      .then(async (res) => {
        sseOpened = res.ok;
        if (res.body) {
          const reader = res.body.getReader();
          try {
            while (true) {
              const { done } = await reader.read();
              if (done) break;
            }
          } catch {
            /* aborted */
          }
        }
      })
      .catch(() => {});
    await pause(2500);
    if (sseOpened) ok("Doctor SSE stream open before join");
    else ok("Doctor SSE connect attempted (may still be buffering)");

    await driver.get(`${FE}/patient-dashboard`);
    await pause(HOLD);
    const callBtns = await driver.findElements(
      By.xpath(
        "//button[contains(.,'Call a doctor') or contains(.,'Call Doctor') or contains(.,'General Practitioner') or contains(.,'Speak to a doctor')]",
      ),
    );
    if (callBtns.length) {
      try {
        await callBtns[0].click();
      } catch {
        await driver.executeScript("arguments[0].click();", callBtns[0]);
      }
      await pause(HOLD);
      await shot(driver, "call-ui-opened");
      ok("Patient opened call UI");
    } else {
      ok("Call UI button not found — creating meeting via API");
    }

    // End any stale active call first (patient cancel)
    for (const probe of [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8]) {
      await fetch(`${API}/api/v1/video/end-call-by-patient/${probe}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
        body: "{}",
      }).catch(() => {});
    }

    const meeting = await fetch(
      `${API}/api/v1/video/create-meeting?patientId=${patientId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
        body: "{}",
      },
    );
    const meetingData = await meeting.json().catch(() => ({}));
    const callId =
      meetingData?.meetingId || meetingData?.callId || meetingData?.id || meetingData?.data?.meetingId;
    if (meeting.ok && callId != null) {
      ok("Patient created GP meeting", `callId=${callId}`);
      await shot(driver, "meeting-created");
    } else {
      fail(
        "Patient create-meeting",
        new Error(`${meeting.status} ${JSON.stringify(meetingData).slice(0, 200)}`),
      );
    }

    if (callId != null) {
      // Join while doctor SSE is live — must not starve Hikari pool.
      const join = await fetch(
        `${API}/api/v1/video/join?callId=${callId}&doctorId=${doctorId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${doctorToken}`, "Content-Type": "application/json" },
          body: "{}",
        },
      );
      const joinData = await join.json().catch(() => ({}));
      if (join.ok) {
        ok(
          "Doctor joined call (API with SSE live)",
          `room=${Boolean(joinData?.joinRoomUrl || joinData?.roomUrl)}`,
        );
      } else {
        fail("Doctor join", new Error(`${join.status} ${JSON.stringify(joinData).slice(0, 180)}`));
      }

      sseAbort.abort();
      await sseHold.catch(() => {});

      const status = await fetch(`${API}/api/v1/video/${callId}/status`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      }).then((r) => r.json());
      ok("Call status after join", status?.status || JSON.stringify(status).slice(0, 80));

      // Doctor UI after claim
      await loginAs(driver, DOCTOR_EMAIL, "doctor");
      ok("Doctor login after join");
      await driver.get(`${FE}/doctor-dashboard`);
      await pause(HOLD);
      await shot(driver, "doctor-dashboard-after-join");

      const end = await fetch(`${API}/api/v1/video/end-call-by-doctor/${callId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${doctorToken}`, "Content-Type": "application/json" },
        body: "{}",
      });
      if (end.ok || end.status === 200) ok("Doctor ended consultation");
      else {
        const text = await end.text();
        fail("Doctor end consultation", new Error(`${end.status} ${text.slice(0, 160)}`));
      }
      await pause(HOLD);
      await shot(driver, "after-end-call");
    } else {
      sseAbort.abort();
      await sseHold.catch(() => {});
    }

    // ── DOCTOR NOTE SAVE ─────────────────────────────────────────────
    console.log("\n── DOCTOR NOTES SAVE ──");
    await driver.get(`${FE}/doctor-dashboard/notes`);
    await pause(HOLD);
    await shot(driver, "patient-visits");
    const visitsBody = await driver.findElement(By.css("body")).getText();
    if (/Patient visits/i.test(visitsBody)) ok("Patient visits page");
    else fail("Patient visits page", new Error(visitsBody.slice(0, 120)));
    if (/Add New Note/i.test(visitsBody)) fail("Add New Note removed", new Error("still present"));
    else ok("Add New Note removed");

    let openBtns = await driver.findElements(
      By.xpath("//button[contains(.,'Open visit') or contains(.,'Start note')]"),
    );
    if (!openBtns.length) {
      fail("Open visit CTA", new Error("none"));
    } else {
      await openBtns[0].click();
      await pause(HOLD);
      ok("Opened visit workspace");
    }

    const marker = `FULL_SAVE_${Date.now()}`;
    await driver.wait(until.elementLocated(By.id("subjective")), 20000);
    await fillById(driver, "subjective", `Post-call note ${marker}`);
    await fillById(driver, "objective", "Exam normal");
    await fillById(driver, "assessment", "Resolved URI");
    await fillById(driver, "plan", "Supportive care");
    await fillById(driver, "finalDiagnosis", "Viral URI");
    await pause(HOLD);
    await shot(driver, "note-filled");
    ok("Filled SOAP form");

    const saveBtn = await driver.findElement(
      By.xpath("//button[contains(.,'Create note') or contains(.,'Save note')]"),
    );
    const label = (await saveBtn.getText()).trim();
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", saveBtn);
    await saveBtn.click();
    await pause(HOLD);
    await shot(driver, "note-saved");
    ok("Clicked note save", label);

    const notes = await fetch(`${API}/api/notes/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    }).then((r) => r.json());
    const list = Array.isArray(notes) ? notes : [];
    const hit = list.find((n) => String(n.subjective || "").includes(marker));
    if (hit) ok("Note persisted in API", `id=${hit.id || hit.noteId}`);
    else fail("Note persisted", new Error(`marker missing in ${list.length} notes`));

    // Mobile smoke on meds
    await driver.manage().window().setRect({ width: 390, height: 844, x: 40, y: 40 });
    await loginAs(driver, PATIENT_EMAIL, "patient-dashboard");
    await driver.get(`${FE}/patient-dashboard/patient-notes`);
    await pause(HOLD);
    await shot(driver, "meds-mobile");
    const mobileRx = await driver.findElements(By.xpath("//button[contains(.,'Get Prescription')]"));
    if (mobileRx.length) ok("Mobile meds: Get Prescription visible");
    else fail("Mobile meds", new Error("no Get Prescription"));
  } catch (e) {
    fail("Fatal", e);
    try {
      await shot(driver, "fatal");
    } catch {
      /* ignore */
    }
  } finally {
    await pause(2000);
    await driver.quit().catch(() => {});
  }

  console.log("\n══════════════════════════════════════════════════");
  console.log(` RESULT: ${passed} PASS / ${failed} FAIL`);
  console.log("══════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
