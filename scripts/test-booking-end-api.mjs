/**
 * Live API smoke: doctor End call + 45min auto-end for booked appointments.
 * Prereq: Backend on :8081 with V34 + end endpoints deployed.
 *
 *   node scripts/test-booking-end-api.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = process.env.TEST_PASSWORD || "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BACKEND = path.resolve(ROOT, "..", "Backend");
const JAR = path.join(BACKEND, "scripts", "postgresql.jar");
const HELPER = path.join(__dirname, ".tmp-booking-end");
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

function runSqlHelper(className, source, args = []) {
  const src = path.join(HELPER, `${className}.java`);
  fs.writeFileSync(src, source, { encoding: "utf8" });
  const jc = spawnSync(JAVAC, ["-cp", JAR, "-encoding", "UTF-8", src], {
    encoding: "utf8",
  });
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

function ensureColumn() {
  return runSqlHelper(
    "EnsureEndedCol",
    `
import java.sql.*;
public class EnsureEndedCol {
  public static void main(String[] a) throws Exception {
    try (Connection c = DriverManager.getConnection(a[0], a[1], a[2]);
         Statement st = c.createStatement()) {
      st.execute("ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS consultation_ended_at TIMESTAMPTZ");
      System.out.println("OK");
    }
  }
}`,
    [JDBC, DB_USER, DB_PASS],
  );
}

function findDoctor() {
  const out = runSqlHelper(
    "FindDocEnd",
    `
import java.sql.*;
public class FindDocEnd {
  public static void main(String[] a) throws Exception {
    try (Connection c = DriverManager.getConnection(a[0], a[1], a[2]);
         PreparedStatement ps = c.prepareStatement(
           "SELECT id, email_address FROM users WHERE user_role='DOCTOR' AND email_address IS NOT NULL " +
           "AND COALESCE(account_deactivated,false)=false ORDER BY id DESC LIMIT 1")) {
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) throw new IllegalStateException("no doctor");
        System.out.println(rs.getLong(1) + "|" + rs.getString(2));
      }
    }
  }
}`,
    [JDBC, DB_USER, DB_PASS],
  );
  const [id, email] = out.trim().split("|");
  return { id: Number(id), email };
}

function setDoctorPassword(doctorId, bcryptHash) {
  return runSqlHelper(
    "SetDocPw",
    `
import java.sql.*;
public class SetDocPw {
  public static void main(String[] args) throws Exception {
    long id = Long.parseLong(args[0]);
    try (Connection c = DriverManager.getConnection(args[2], args[3], args[4]);
         PreparedStatement ps = c.prepareStatement(
           "UPDATE users SET password=?, confirmed_password=?, disabled=false, is_verified=true, " +
           "account_deactivated=false WHERE id=?")) {
      ps.setString(1, args[1]);
      ps.setString(2, args[1]);
      ps.setLong(3, id);
      System.out.println("UPDATED=" + ps.executeUpdate());
    }
  }
}`,
    [String(doctorId), bcryptHash, JDBC, DB_USER, DB_PASS],
  );
}

function seedActiveSlot(patientId, doctorId) {
  return runSqlHelper(
    "SeedEndActive",
    `
import java.sql.*;
import java.time.*;
public class SeedEndActive {
  public static void main(String[] args) throws Exception {
    long patientId = Long.parseLong(args[0]);
    long doctorId = Long.parseLong(args[1]);
    try (Connection c = DriverManager.getConnection(args[2], args[3], args[4])) {
      c.setAutoCommit(false);
      try (PreparedStatement ps = c.prepareStatement(
        "UPDATE appointment_slots SET cancelled=true WHERE patient_id=? AND cancelled=false " +
        "AND COALESCE(meeting_room_url,'') LIKE 'https://booking-end-test/%'")) {
        ps.setLong(1, patientId);
        ps.executeUpdate();
      }
      Instant start = Instant.now().minus(Duration.ofMinutes(5));
      long id;
      try (PreparedStatement ps = c.prepareStatement(
        "INSERT INTO appointment_slots " +
        "(doctor_id, patient_id, date_time, is_booked, meeting_created, meeting_room_url, " +
        " specialist_joined, booking_source, cancelled, consultation_ended_at) " +
        "VALUES (?, ?, ?, true, true, ?, true, 'MEDFAIR', false, NULL) RETURNING id")) {
        ps.setLong(1, doctorId);
        ps.setLong(2, patientId);
        ps.setTimestamp(3, Timestamp.from(start));
        ps.setString(4, "https://booking-end-test/active");
        try (ResultSet rs = ps.executeQuery()) {
          rs.next();
          id = rs.getLong(1);
        }
      }
      try (PreparedStatement ps = c.prepareStatement(
        "UPDATE appointment_slots SET meeting_room_url=? WHERE id=?")) {
        ps.setString(1, "https://booking-end-test/room-" + id);
        ps.setLong(2, id);
        ps.executeUpdate();
      }
      c.commit();
      System.out.println(String.valueOf(id));
    }
  }
}`,
    [String(patientId), String(doctorId), JDBC, DB_USER, DB_PASS],
  );
}

function seedExpiredSlot(patientId, doctorId) {
  return runSqlHelper(
    "SeedEndExpired",
    `
import java.sql.*;
import java.time.*;
public class SeedEndExpired {
  public static void main(String[] args) throws Exception {
    long patientId = Long.parseLong(args[0]);
    long doctorId = Long.parseLong(args[1]);
    try (Connection c = DriverManager.getConnection(args[2], args[3], args[4])) {
      Instant start = Instant.now().minus(Duration.ofMinutes(50));
      try (PreparedStatement ps = c.prepareStatement(
        "INSERT INTO appointment_slots " +
        "(doctor_id, patient_id, date_time, is_booked, meeting_created, meeting_room_url, " +
        " specialist_joined, booking_source, cancelled, consultation_ended_at) " +
        "VALUES (?, ?, ?, true, true, ?, true, 'MEDFAIR', false, NULL) RETURNING id")) {
        ps.setLong(1, doctorId);
        ps.setLong(2, patientId);
        ps.setTimestamp(3, Timestamp.from(start));
        ps.setString(4, "https://booking-end-test/expired");
        try (ResultSet rs = ps.executeQuery()) {
          rs.next();
          System.out.println(String.valueOf(rs.getLong(1)));
        }
      }
    }
  }
}`,
    [String(patientId), String(doctorId), JDBC, DB_USER, DB_PASS],
  );
}

function readEndedAt(slotId) {
  return runSqlHelper(
    "ReadEndedAt",
    `
import java.sql.*;
public class ReadEndedAt {
  public static void main(String[] args) throws Exception {
    long id = Long.parseLong(args[0]);
    try (Connection c = DriverManager.getConnection(args[1], args[2], args[3]);
         PreparedStatement ps = c.prepareStatement(
           "SELECT consultation_ended_at IS NOT NULL FROM appointment_slots WHERE id=?")) {
      ps.setLong(1, id);
      try (ResultSet rs = ps.executeQuery()) {
        rs.next();
        System.out.println(rs.getBoolean(1) ? "YES" : "NO");
      }
    }
  }
}`,
    [String(slotId), JDBC, DB_USER, DB_PASS],
  );
}

function cleanup(slotIds) {
  for (const id of slotIds) {
    try {
      runSqlHelper(
        "CleanupEndSlot",
        `
import java.sql.*;
public class CleanupEndSlot {
  public static void main(String[] args) throws Exception {
    long id = Long.parseLong(args[0]);
    try (Connection c = DriverManager.getConnection(args[1], args[2], args[3]);
         PreparedStatement ps = c.prepareStatement(
           "UPDATE appointment_slots SET cancelled=true WHERE id=?")) {
      ps.setLong(1, id);
      ps.executeUpdate();
      System.out.println("OK");
    }
  }
}`,
        [String(id), JDBC, DB_USER, DB_PASS],
      );
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  const cleaned = [];
  try {
    ensureColumn();
    ok("DB column consultation_ended_at ready");

    const patientLogin = await apiLogin(PATIENT_EMAIL);
    const patientId = patientLogin.user?.id ?? patientLogin.id ?? patientLogin.userId;
    const patientToken =
      patientLogin.token || patientLogin.accessToken || patientLogin.jwt;
    if (!patientId || !patientToken) throw new Error("patient id/token missing from login");
    ok("patient login", `id=${patientId}`);

    const doctor = findDoctor();
    const cryptoJar = path.join(BACKEND, "scripts", "spring-security-crypto.jar");
    const loggingJar = path.join(BACKEND, "scripts", "commons-logging.jar");
    const hashCp = [HELPER, cryptoJar, loggingJar].join(path.delimiter);
    const hashSrc = path.join(HELPER, "HashPwEnd.java");
    fs.writeFileSync(
      hashSrc,
      `
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashPwEnd {
  public static void main(String[] a) {
    System.out.println(new BCryptPasswordEncoder().encode(a[0]));
  }
}
`,
      "utf8",
    );
    const hashJc = spawnSync(
      JAVAC,
      ["-cp", `${cryptoJar}${path.delimiter}${loggingJar}`, "-encoding", "UTF-8", hashSrc],
      { encoding: "utf8" },
    );
    if (hashJc.status !== 0) throw new Error(`hash javac: ${hashJc.stderr || hashJc.stdout}`);
    const hashRun = spawnSync(
      JAVA,
      ["-cp", hashCp, "HashPwEnd", PASSWORD],
      { encoding: "utf8" },
    );
    if (hashRun.status !== 0) throw new Error(`hash java: ${hashRun.stderr || hashRun.stdout}`);
    const bcrypt = (hashRun.stdout || "").trim();
    setDoctorPassword(doctor.id, bcrypt);

    const doctorLogin = await apiLogin(doctor.email);
    const doctorToken =
      doctorLogin.token || doctorLogin.accessToken || doctorLogin.jwt;
    const doctorId = doctorLogin.user?.id ?? doctorLogin.id ?? doctor.id;
    if (!doctorToken) throw new Error("doctor token missing");
    ok("doctor login", `id=${doctorId} email=${doctor.email}`);

    // --- doctor end call ---
    const activeSlotId = Number(seedActiveSlot(patientId, doctorId).trim());
    cleaned.push(activeSlotId);

    const before = await fetch(`${API}/api/appointment/meetings/${activeSlotId}/status`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!before.ok) throw new Error(`status before ${before.status}: ${await before.text()}`);
    const beforeJson = await before.json();
    if (beforeJson.status !== "ACTIVE" || beforeJson.canJoin !== true) {
      throw new Error(`expected ACTIVE/canJoin before end, got ${JSON.stringify(beforeJson)}`);
    }
    ok("status ACTIVE before end", `slot=${activeSlotId}`);

    const endRes = await fetch(
      `${API}/api/appointment/meetings/${activeSlotId}/users/${doctorId}/end`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doctorToken}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      },
    );
    if (!endRes.ok) throw new Error(`end ${endRes.status}: ${await endRes.text()}`);
    const endJson = await endRes.json();
    if (endJson.status !== "ENDED" || endJson.canJoin !== false) {
      throw new Error(`end response unexpected: ${JSON.stringify(endJson)}`);
    }
    ok("doctor end → ENDED", `slot=${activeSlotId}`);

    if (readEndedAt(activeSlotId).trim() !== "YES") {
      throw new Error("consultation_ended_at not persisted");
    }
    ok("consultation_ended_at persisted");

    const upcoming = await fetch(
      `${API}/api/appointments/upcoming/patient/${patientId}?_=${Date.now()}`,
      { headers: { Authorization: `Bearer ${patientToken}` } },
    );
    if (upcoming.ok) {
      const list = await upcoming.json();
      const row = (Array.isArray(list) ? list : []).find(
        (a) => String(a.slotId) === String(activeSlotId),
      );
      if (row) {
        if (row.canJoin === true || row.joinStatus === "active") {
          throw new Error(`upcoming still active after end: ${JSON.stringify(row)}`);
        }
        ok("patient upcoming shows not joinable", `joinStatus=${row.joinStatus}`);
      } else {
        ok("patient upcoming no longer lists ended slot (filtered out)");
      }
    } else {
      fail("patient upcoming check", await upcoming.text());
    }

    // --- auto-end after 45min via status ---
    const expiredSlotId = Number(seedExpiredSlot(patientId, doctorId).trim());
    cleaned.push(expiredSlotId);
    const auto = await fetch(`${API}/api/appointment/meetings/${expiredSlotId}/status`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!auto.ok) throw new Error(`auto status ${auto.status}: ${await auto.text()}`);
    const autoJson = await auto.json();
    if (autoJson.status !== "ENDED" || autoJson.canJoin !== false) {
      throw new Error(`expected auto ENDED, got ${JSON.stringify(autoJson)}`);
    }
    ok("status auto-ends after 45min grace", `slot=${expiredSlotId}`);
    if (readEndedAt(expiredSlotId).trim() !== "YES") {
      throw new Error("auto-end did not persist consultation_ended_at");
    }
    ok("auto-end persisted consultation_ended_at");
  } catch (e) {
    fail("live API suite", e);
  } finally {
    cleanup(cleaned);
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
