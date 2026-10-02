/**
 * Selenium (live): seed a real upcoming appointment in local Postgres, then verify
 * patient Join follows server canJoin — including early unlock when doctor joined.
 *
 * Prereqs:
 *   Backend http://localhost:8081  (local Postgres MEDFAIR, latest join-window code)
 *   FE      http://127.0.0.1:5174  (VITE_API_URL=http://localhost:8081)
 *
 *   npm run test:selenium-join
 */
import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://127.0.0.1:5174").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = process.env.TEST_PASSWORD || "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";
const HEADED = process.env.HEADED !== "0";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BACKEND = path.resolve(ROOT, "..", "Backend");
const JAR = path.join(BACKEND, "scripts", "postgresql.jar");
const HELPER = path.join(__dirname, ".tmp-join-selenium");
const SHOTS = path.join(__dirname, ".selenium-screenshots");
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(HELPER, { recursive: true });

const JDBC = process.env.JDBC_URL || "jdbc:postgresql://localhost:5432/MEDFAIR";
const DB_USER = process.env.DATABASE_USERNAME || "postgres";
const DB_PASS = process.env.DATABASE_PASSWORD || "Cliffordj1.";
const JAVA = fs.existsSync("C:\\Program Files\\Java\\jdk-17\\bin\\java.exe")
  ? "C:\\Program Files\\Java\\jdk-17\\bin\\java.exe"
  : "java";
const JAVAC = fs.existsSync("C:\\Program Files\\Java\\jdk-17\\bin\\javac.exe")
  ? "C:\\Program Files\\Java\\jdk-17\\bin\\javac.exe"
  : "javac";

let passed = 0;
let failed = 0;
function ok(name, detail = "") {
  passed += 1;
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, err) {
  failed += 1;
  console.error(`✗ ${name} — ${err?.message || err}`);
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(driver, name) {
  const b64 = await driver.takeScreenshot();
  fs.writeFileSync(
    path.join(SHOTS, `join-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`),
    Buffer.from(b64, "base64"),
  );
}

function runSqlHelper(className, source, args = []) {
  const src = path.join(HELPER, `${className}.java`);
  // Strip BOM if any by writing utf8 without BOM via Buffer
  fs.writeFileSync(src, source, { encoding: "utf8" });
  const jc = spawnSync(JAVAC, ["-cp", JAR, "-encoding", "UTF-8", src], { encoding: "utf8" });
  if (jc.status !== 0) throw new Error(`javac ${className}: ${jc.stderr || jc.stdout}`);
  const r = spawnSync(JAVA, ["-cp", `${HELPER}${path.delimiter}${JAR}`, className, ...args], {
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`java ${className}: ${r.stderr || r.stdout}`);
  return (r.stdout || "").trim();
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

async function loginAs(driver, email) {
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
  await driver.wait(async () => (await driver.getCurrentUrl()).includes("/patient-dashboard"), 60000);
}

async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments(
    "--window-size=1280,900",
    "--disable-notifications",
    "--remote-allow-origins=*",
    "--no-default-browser-check",
  );
  if (!HEADED) options.addArguments("--headless=new");
  options.setPageLoadStrategy("eager");
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function countJoinButtons(driver) {
  const els = await driver.findElements(By.css("button"));
  let n = 0;
  for (const el of els) {
    try {
      if (!(await el.isDisplayed())) continue;
      const label = (await el.getText()).trim().toLowerCase();
      if (/^join\b/.test(label) || label === "join now" || label.includes("join video")) n += 1;
    } catch {
      /* stale */
    }
  }
  return n;
}

async function fetchUpcoming(patientId, token) {
  const res = await fetch(`${API}/api/appointments/upcoming/patient/${patientId}?_=${Date.now()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`upcoming API ${res.status}: ${await res.text()}`);
  return res.json();
}

function resolveDoctorId(preferredDoctorId) {
  if (preferredDoctorId) return Number(preferredDoctorId);
  const out = runSqlHelper(
    "FindDocJoin",
    `
import java.sql.*;
public class FindDocJoin {
  public static void main(String[] a) throws Exception {
    try (Connection c = DriverManager.getConnection(a[0], a[1], a[2]);
         PreparedStatement ps = c.prepareStatement(
           "SELECT id FROM users WHERE user_role='DOCTOR' ORDER BY id DESC LIMIT 1")) {
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) throw new IllegalStateException("no doctor in local DB");
        System.out.println(rs.getLong(1));
      }
    }
  }
}`,
    [JDBC, DB_USER, DB_PASS],
  );
  return Number(out.trim());
}

/** Insert booked slot ~2h ahead, doctor not joined yet. */
function seedUpcomingSlot(patientId, doctorId) {
  return runSqlHelper(
    "SeedJoinSlotLive",
    `
import java.sql.*;
import java.time.*;
public class SeedJoinSlotLive {
  public static void main(String[] args) throws Exception {
    long patientId = Long.parseLong(args[0]);
    long doctorId = Long.parseLong(args[1]);
    String url=args[2], user=args[3], pass=args[4];
    try (Connection c = DriverManager.getConnection(url, user, pass)) {
      c.setAutoCommit(false);
      try (PreparedStatement ps = c.prepareStatement(
        "UPDATE appointment_slots SET cancelled=true " +
        "WHERE patient_id=? AND cancelled=false AND COALESCE(meeting_room_url,'') LIKE 'https://selenium-join-test/%'")) {
        ps.setLong(1, patientId);
        ps.executeUpdate();
      }
      Instant start = Instant.now().plus(Duration.ofHours(2));
      long id;
      try (PreparedStatement ps = c.prepareStatement(
        "INSERT INTO appointment_slots " +
        "(doctor_id, patient_id, date_time, is_booked, meeting_created, meeting_room_url, " +
        " specialist_joined, booking_source, cancelled) " +
        "VALUES (?, ?, ?, true, false, ?, false, 'MEDFAIR', false) RETURNING id")) {
        ps.setLong(1, doctorId);
        ps.setLong(2, patientId);
        ps.setTimestamp(3, Timestamp.from(start));
        ps.setString(4, "https://selenium-join-test/pending");
        try (ResultSet rs = ps.executeQuery()) {
          rs.next();
          id = rs.getLong(1);
        }
      }
      try (PreparedStatement ps = c.prepareStatement(
        "UPDATE appointment_slots SET meeting_room_url=? WHERE id=?")) {
        ps.setString(1, "https://selenium-join-test/pending-" + id);
        ps.setLong(2, id);
        ps.executeUpdate();
      }
      c.commit();
      System.out.println("SLOT_ID=" + id);
      System.out.println("START_EPOCH_MS=" + start.toEpochMilli());
    }
  }
}`,
    [String(patientId), String(doctorId), JDBC, DB_USER, DB_PASS],
  );
}

function markDoctorJoined(slotId) {
  return runSqlHelper(
    "MarkDoctorJoinedLive",
    `
import java.sql.*;
public class MarkDoctorJoinedLive {
  public static void main(String[] args) throws Exception {
    long slotId = Long.parseLong(args[0]);
    String url=args[1], user=args[2], pass=args[3];
    try (Connection c = DriverManager.getConnection(url, user, pass);
         PreparedStatement ps = c.prepareStatement(
           "UPDATE appointment_slots SET specialist_joined=true, meeting_created=true, " +
           "meeting_room_url='https://selenium-join-test/room-' || id WHERE id=?")) {
      ps.setLong(1, slotId);
      System.out.println("UPDATED=" + ps.executeUpdate());
    }
  }
}`,
    [String(slotId), JDBC, DB_USER, DB_PASS],
  );
}

function cleanupSlot(slotId) {
  try {
    runSqlHelper(
      "CleanupJoinSlot",
      `
import java.sql.*;
public class CleanupJoinSlot {
  public static void main(String[] args) throws Exception {
    long slotId = Long.parseLong(args[0]);
    try (Connection c = DriverManager.getConnection(args[1], args[2], args[3]);
         PreparedStatement ps = c.prepareStatement(
           "UPDATE appointment_slots SET cancelled=true WHERE id=?")) {
      ps.setLong(1, slotId);
      System.out.println("CLEANED=" + ps.executeUpdate());
    }
  }
}`,
      [String(slotId), JDBC, DB_USER, DB_PASS],
    );
  } catch (e) {
    console.warn("cleanup warning:", e.message);
  }
}

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log(" SELENIUM LIVE: DB-seeded upcoming appointment");
  console.log("══════════════════════════════════════════════════");
  console.log(`FE ${FE}  API ${API}  DB ${JDBC}\n`);

  const apiUp = await fetch(`${API}/api/v1/registration/partner-organizations`).catch(() => null);
  if (!apiUp?.ok) throw new Error(`Backend not reachable at ${API}`);
  ok("Backend up");

  const feUp = await fetch(`${FE}/`).catch(() => null);
  if (!feUp?.ok) throw new Error(`Frontend not reachable at ${FE}`);
  ok("Frontend up");

  const patient = await apiLogin(PATIENT_EMAIL);
  const patientId = patient.user.id;
  const token = patient.token;
  ok("Patient login API", `${PATIENT_EMAIL} id=${patientId}`);

  const doctorId = resolveDoctorId(process.env.DOCTOR_ID);
  ok("Doctor resolved", `id=${doctorId}`);

  const seedOut = seedUpcomingSlot(patientId, doctorId);
  const slotId = Number(/SLOT_ID=(\d+)/.exec(seedOut)?.[1] || 0);
  if (!slotId) throw new Error(`seed failed: ${seedOut}`);
  ok("DB seeded appointment +2h", `slot ${slotId}`);

  const driver = await buildDriver();
  try {
    // --- API: before doctor joins ---
    let list = await fetchUpcoming(patientId, token);
    let row = (list || []).find((x) => Number(x.slotId) === slotId);
    if (!row) throw new Error("Seeded slot not returned by upcoming API");
    if (typeof row.canJoin !== "boolean" || !row.joinStatus) {
      fail("API join fields present", new Error(JSON.stringify(row)));
    } else {
      ok("API returns canJoin/joinStatus", `${row.joinStatus} canJoin=${row.canJoin}`);
    }
    if (row.canJoin === false && row.joinStatus === "upcoming" && row.doctorJoined === false) {
      ok("API: +2h, doctor not joined → upcoming / canJoin=false");
    } else {
      fail("API early state", new Error(JSON.stringify(row)));
    }

    await loginAs(driver, PATIENT_EMAIL);
    ok("Patient UI login");
    await pause(2500);
    await shot(driver, "before-doctor-joined");
    let joins = await countJoinButtons(driver);
    if (joins === 0) ok("UI: no Join before doctor joins (+2h)");
    else fail("UI: no Join before doctor", new Error(`Found ${joins} Join button(s)`));

    // --- Doctor joins in DB ---
    markDoctorJoined(slotId);
    ok("DB: marked specialist_joined + meeting ready");

    list = await fetchUpcoming(patientId, token);
    row = (list || []).find((x) => Number(x.slotId) === slotId);
    if (row?.canJoin === true && row?.doctorJoined === true && row?.joinStatus === "active") {
      ok("API: after doctor joined → canJoin=true / active");
    } else {
      fail("API after doctor joined", new Error(JSON.stringify(row)));
    }

    await driver.navigate().refresh();
    await pause(3000);
    await shot(driver, "after-doctor-joined");
    joins = await countJoinButtons(driver);
    if (joins >= 1) ok("UI: Join visible after doctor joined early");
    else fail("UI: Join after doctor joined", new Error("No Join button found"));

    const body = await driver.findElement(By.css("body")).getText();
    if (/Doctor is waiting|Appointment happening now|Join now|Join video/i.test(body)) {
      ok("UI: join-ready messaging shown");
    } else {
      fail("UI messaging", new Error(body.slice(0, 300)));
    }
  } finally {
    try {
      await driver.quit();
    } catch {
      /* ignore */
    }
    cleanupSlot(slotId);
  }

  console.log("\n────────────────────────────────────────");
  console.log(`Done: ${passed} passed, ${failed} failed`);
  console.log(`Screenshots: ${SHOTS}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
