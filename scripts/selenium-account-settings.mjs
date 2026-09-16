/**
 * Selenium: test new Account Settings (change password + deactivate).
 *
 * Prereqs:
 *   Backend http://localhost:8081
 *   FE http://127.0.0.1:5173 with VITE_API_URL=http://localhost:8081
 *
 *   node scripts/selenium-account-settings.mjs
 */
import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://127.0.0.1:5173").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = process.env.TEST_PASSWORD || "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";
/** Spare doctor so we do not break the main e2e doctor permanently. */
const DOCTOR_EMAIL =
  process.env.DEACTIVATE_DOCTOR_EMAIL ||
  "e2e.ui.doc.1786905846100754@medfair-test.local";
const STAFF_EMAIL =
  process.env.STAFF_EMAIL || "e2e.staff.verify@medfair-test.local";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "TestPass123!";
const TEMP_PASS = "TempPass123!";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, ".selenium-screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

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
  const file = path.join(
    SHOTS,
    `settings-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`
  );
  fs.writeFileSync(file, Buffer.from(b64, "base64"));
}

async function typeInto(driver, locator, text, timeout = 20000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.click();
  await el.sendKeys(Key.chord(Key.CONTROL, "a"));
  await el.sendKeys(Key.BACK_SPACE);
  await el.sendKeys(String(text));
  const current = await el.getAttribute("value");
  if (current !== String(text)) {
    await driver.executeScript(
      `
      const el = arguments[0];
      const val = arguments[1];
      el.focus();
      el.value = val;
      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: val, inputType: "insertText" }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      `,
      el,
      String(text)
    );
  }
  return el;
}

async function waitClick(driver, locator, timeout = 20000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.click();
  return el;
}

async function apiLogin(email, password = PASSWORD) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ emailOrPhone: email, password }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function staffLogin() {
  const res = await fetch(`${API}/api/internal/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: STAFF_EMAIL, password: STAFF_PASSWORD }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, token: data.token || data.accessToken, data };
}

async function reactivateByEmail(email) {
  const staff = await staffLogin();
  if (!staff.token) {
    // SQL fallback
    const psql = "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
    if (!fs.existsSync(psql)) throw new Error("Staff login failed and psql missing");
    const sql = `UPDATE users SET account_deactivated=false, deactivated_at=NULL WHERE LOWER(email_address)=LOWER('${email.replace(/'/g, "''")}');`;
    const r = spawnSync(
      psql,
      ["-U", "postgres", "-h", "localhost", "-d", "MEDFAIR", "-c", sql],
      {
        env: { ...process.env, PGPASSWORD: process.env.DATABASE_PASSWORD || "Cliffordj1." },
        encoding: "utf8",
      }
    );
    if (r.status !== 0) throw new Error(r.stderr || r.stdout || "SQL reactivate failed");
    return { via: "sql" };
  }
  const list = await fetch(
    `${API}/api/internal/platform-users?search=${encodeURIComponent(email)}&page=1&pageSize=5`,
    { headers: { Authorization: `Bearer ${staff.token}`, Accept: "application/json" } }
  );
  const listData = await list.json();
  const id = listData?.items?.[0]?.id;
  if (!id) throw new Error("Could not find user id for reactivate");
  const re = await fetch(`${API}/api/internal/platform-users/${id}/reactivate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${staff.token}`, Accept: "application/json" },
  });
  if (!re.ok) {
    const t = await re.text();
    throw new Error(`reactivate HTTP ${re.status}: ${t.slice(0, 200)}`);
  }
  return { via: "api", id };
}

async function loginUi(driver, email, password, expectPathPart) {
  await driver.get(`${FE}/login`);
  await pause(800);
  await driver.wait(until.elementLocated(By.css("#emailOrPhone")), 30000);
  await typeInto(driver, By.css("#emailOrPhone"), email);
  await typeInto(driver, By.css("#password"), password);
  const buttons = await driver.findElements(By.css("button[type='submit']"));
  if (buttons.length) await buttons[0].click();
  else await waitClick(driver, By.xpath("//button[contains(.,'Sign in')]"));
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes(expectPathPart);
  }, 90000);
}

async function fillPasswordFields(driver, current, next, confirm) {
  // Inputs are in order: current, new, confirm
  const inputs = await driver.findElements(By.css("input[type='password']"));
  if (inputs.length < 3) throw new Error(`Expected 3 password inputs, found ${inputs.length}`);
  for (let i = 0; i < 3; i++) {
    const val = [current, next, confirm][i];
    const el = inputs[i];
    await el.click();
    await el.sendKeys(Key.chord(Key.CONTROL, "a"));
    await el.sendKeys(Key.BACK_SPACE);
    await el.sendKeys(val);
    const got = await el.getAttribute("value");
    if (got !== val) {
      await driver.executeScript(
        `arguments[0].value=arguments[1];
         arguments[0].dispatchEvent(new Event('input',{bubbles:true}));
         arguments[0].dispatchEvent(new Event('change',{bubbles:true}));`,
        el,
        val
      );
    }
  }
}

async function openSettings(driver, rolePath) {
  // Prefer sidebar link, else direct URL
  try {
    const links = await driver.findElements(By.xpath("//a[contains(.,'Settings')]"));
    if (links.length) {
      await links[0].click();
      await pause(1000);
    } else {
      await driver.get(`${FE}/${rolePath}/settings`);
    }
  } catch {
    await driver.get(`${FE}/${rolePath}/settings`);
  }
  await driver.wait(until.urlContains("/settings"), 20000);
  await pause(1200);
  const body = await driver.findElement(By.css("body")).getText();
  if (!/Change password|Deactivate account/i.test(body)) {
    throw new Error(`Settings page missing expected copy: ${body.slice(0, 250)}`);
  }
}

async function run() {
  console.log(`
══════════════════════════════════════════════════
 Selenium — Account Settings (new features)
══════════════════════════════════════════════════
FE  ${FE}
API ${API}
`);

  const health = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => null);
  if (!health) {
    console.error("Backend not reachable on", API);
    process.exit(1);
  }
  ok("Backend up");

  console.log(`ChromeDriver ${chromedriver.path}`);
  const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);
  const options = new chrome.Options();
  options.addArguments(
    "--disable-gpu",
    "--window-size=1280,900",
    "--disable-notifications",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--remote-allow-origins=*"
  );
  options.setPageLoadStrategy("eager");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build();

  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 60000, script: 30000 });

  try {
    // ── PATIENT: settings + change password ───────────────────────────
    console.log("\n── PATIENT SETTINGS ──");
    await loginUi(driver, PATIENT_EMAIL, PASSWORD, "patient-dashboard");
    ok("Patient login");
    await openSettings(driver, "patient-dashboard");
    await shot(driver, "patient-settings");
    ok("Patient Settings page loads");

    // Wrong current password should toast / stay on page
    await fillPasswordFields(driver, "WrongPass999!", TEMP_PASS, TEMP_PASS);
    await waitClick(driver, By.xpath("//button[contains(.,'Update password')]"));
    await pause(2000);
    let url = await driver.getCurrentUrl();
    if (url.includes("/settings")) ok("Wrong current password stays on Settings");
    else fail("Wrong current password stays on Settings", new Error(url));

    // Correct change → force re-login
    await fillPasswordFields(driver, PASSWORD, TEMP_PASS, TEMP_PASS);
    await waitClick(driver, By.xpath("//button[contains(.,'Update password')]"));
    await driver.wait(async () => (await driver.getCurrentUrl()).includes("/login"), 30000);
    await shot(driver, "patient-after-password-change");
    ok("Password change forces re-login");

    // Old password fails (API)
    const oldLogin = await apiLogin(PATIENT_EMAIL, PASSWORD);
    if (!oldLogin.ok) ok("Old password rejected by API");
    else fail("Old password rejected by API", new Error(`status ${oldLogin.status}`));

    // Login with new password
    await loginUi(driver, PATIENT_EMAIL, TEMP_PASS, "patient-dashboard");
    ok("Login with new password");

    // Restore original password via Settings
    await openSettings(driver, "patient-dashboard");
    await fillPasswordFields(driver, TEMP_PASS, PASSWORD, PASSWORD);
    await waitClick(driver, By.xpath("//button[contains(.,'Update password')]"));
    await driver.wait(async () => (await driver.getCurrentUrl()).includes("/login"), 30000);
    ok("Restored original password (forced re-login)");

    const restored = await apiLogin(PATIENT_EMAIL, PASSWORD);
    if (restored.ok) ok("Original password works again");
    else fail("Original password works again", new Error(`status ${restored.status}`));

    // ── DOCTOR: settings + deactivate ─────────────────────────────────
    console.log("\n── DOCTOR SETTINGS / DEACTIVATE ──");
    // Ensure doctor is active first
    try {
      await reactivateByEmail(DOCTOR_EMAIL);
    } catch {
      /* may already be active */
    }

    let docApi = await apiLogin(DOCTOR_EMAIL, PASSWORD);
    if (!docApi.ok) {
      fail("Doctor login (API) before deactivate", new Error(`status ${docApi.status}`));
    } else {
      ok("Doctor login (API) before deactivate");
      await loginUi(driver, DOCTOR_EMAIL, PASSWORD, "doctor-dashboard");
      ok("Doctor login UI");
      await openSettings(driver, "doctor-dashboard");
      await shot(driver, "doctor-settings");
      ok("Doctor Settings page loads");

      // Open deactivate confirm UI
      await waitClick(driver, By.xpath("//button[contains(.,'Deactivate my account')]"));
      await pause(600);
      const confirmInputs = await driver.findElements(
        By.css("input[placeholder='DEACTIVATE'], input[type='text']")
      );
      let typed = false;
      for (const el of confirmInputs) {
        const ph = (await el.getAttribute("placeholder")) || "";
        if (/DEACTIVATE/i.test(ph) || true) {
          await el.click();
          await el.sendKeys(Key.chord(Key.CONTROL, "a"));
          await el.sendKeys("DEACTIVATE");
          typed = true;
          break;
        }
      }
      if (!typed) throw new Error("Could not find DEACTIVATE confirm input");
      await waitClick(driver, By.xpath("//button[contains(.,'Confirm deactivate')]"));
      await driver.wait(async () => (await driver.getCurrentUrl()).includes("/login"), 45000);
      await shot(driver, "doctor-after-deactivate");
      ok("Deactivate logs doctor out");

      const blocked = await apiLogin(DOCTOR_EMAIL, PASSWORD);
      if (!blocked.ok) {
        const msg = JSON.stringify(blocked.data || {}).toLowerCase();
        if (/deactivat/.test(msg) || blocked.status >= 400) {
          ok("Deactivated doctor cannot login", `status=${blocked.status}`);
        } else {
          ok("Deactivated doctor cannot login", `status=${blocked.status}`);
        }
      } else {
        fail("Deactivated doctor cannot login", new Error("login still succeeded"));
      }

      const re = await reactivateByEmail(DOCTOR_EMAIL);
      ok("Admin/SQL re-enabled doctor", JSON.stringify(re));

      const again = await apiLogin(DOCTOR_EMAIL, PASSWORD);
      if (again.ok) ok("Re-enabled doctor can login");
      else fail("Re-enabled doctor can login", new Error(`status ${again.status}`));
    }

    await pause(2000);
  } catch (err) {
    fail("Fatal", err);
    try {
      await shot(driver, "fatal");
    } catch {
      /* ignore */
    }
  } finally {
    // Always try to leave doctor active + patient password restored
    try {
      await reactivateByEmail(DOCTOR_EMAIL);
    } catch {
      /* ignore */
    }
    try {
      await driver.quit();
    } catch {
      /* ignore */
    }
  }

  console.log(`
══════════════════════════════════════════════════
 Done: ${passed} passed, ${failed} failed
 Screenshots: ${SHOTS}
══════════════════════════════════════════════════
`);
  process.exit(failed ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
