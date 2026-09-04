/**
 * Headed Selenium UI smoke test (local DB + local APIs).
 * Shows Chrome while driving: Patient → Doctor → Partner admin.
 *
 * Prereqs (already running):
 *   Backend http://localhost:8081  (local Postgres MEDFAIR)
 *   Patient/Doctor FE http://127.0.0.1:5174  (VITE_API_URL=http://localhost:8081)
 *   Partners FE http://localhost:3000        (NEXT_PUBLIC_BASE_URL=http://localhost:8081)
 *
 *   node scripts/selenium-ui-local.mjs
 */
import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://127.0.0.1:5174").replace(/\/$/, "");
const PARTNERS = (process.env.PARTNERS_URL || "http://localhost:3000").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = process.env.TEST_PASSWORD || "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";
const DOCTOR_EMAIL =
  process.env.DOCTOR_EMAIL || "e2e.ui.doc.1786909249605453@medfair-test.local";
const ORG_EMAIL = process.env.ORG_EMAIL || "admin@testcare.ng";

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

async function shot(driver, name) {
  const b64 = await driver.takeScreenshot();
  const file = path.join(SHOTS, `${String(passed + failed + 1).padStart(2, "0")}-${name}.png`);
  fs.writeFileSync(file, Buffer.from(b64, "base64"));
}

async function waitClick(driver, locator, timeout = 20000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await driver.wait(until.elementIsEnabled(el), timeout);
  await el.click();
  return el;
}

async function typeInto(driver, locator, text, timeout = 20000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await driver.wait(until.elementIsEnabled(el), timeout);
  await el.click();
  // Prefer real keystrokes so React controlled inputs update state.
  await el.sendKeys(Key.chord(Key.CONTROL, "a"));
  await el.sendKeys(Key.BACK_SPACE);
  await el.sendKeys(String(text));
  // Fallback for stubborn controlled inputs
  const current = await el.getAttribute("value");
  if (current !== String(text)) {
    await driver.executeScript(
      `
      const el = arguments[0];
      const val = arguments[1];
      el.focus();
      el.select?.();
      document.execCommand("selectAll", false);
      document.execCommand("insertText", false, val);
      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: val, inputType: "insertText" }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      `,
      el,
      String(text),
    );
  }
  return el;
}

async function pause(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Visit a page and assert it loads without a crash / blank auth bounce. */
async function smokePage(driver, name, url, expectRe, opts = {}) {
  const { timeout = 25000, settleMs = 1200 } = opts;
  try {
    await driver.get(url);
    await pause(settleMs);
    const current = await driver.getCurrentUrl();
    if (/\/login/i.test(current) && !/login/i.test(url)) {
      fail(name, new Error(`Bounced to login: ${current}`));
      return;
    }
    const body = await driver.findElement(By.css("body")).getText();
    if (/Something went wrong|Unexpected Application Error|Internal Server Error|Cannot GET/i.test(body)) {
      fail(name, new Error(body.slice(0, 250)));
      return;
    }
    if (expectRe && !expectRe.test(body) && !expectRe.test(current)) {
      fail(name, new Error(`Expected ${expectRe}: ${body.slice(0, 220)}`));
      return;
    }
    ok(name);
  } catch (err) {
    fail(name, err);
  }
}

/** Seed a recent completed GP call so consultation chat is open (24h window). */
function seedOpenChatCall() {
  const psql = "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
  if (!fs.existsSync(psql)) {
    console.warn("psql not found — skipping chat seed");
    return;
  }
  const sql = `
INSERT INTO video_calls (patient_id, doctor_id, is_active, start_time, end_time, room_url)
SELECT 66, 67, false, NOW() - interval '1 hour', NOW() - interval '30 minutes', 'https://example.local/room'
WHERE NOT EXISTS (
  SELECT 1 FROM video_calls
  WHERE patient_id = 66 AND doctor_id = 67
    AND room_url = 'https://example.local/room'
);
`;
  const r = spawnSync(psql, ["-U", "postgres", "-h", "localhost", "-d", "MEDFAIR", "-c", sql], {
    env: { ...process.env, PGPASSWORD: process.env.DATABASE_PASSWORD || "Cliffordj1." },
    encoding: "utf8",
  });
  if (r.status !== 0) console.warn("seed warn:", r.stderr || r.stdout);
  else console.log("Seeded open chat video call (if missing)");
}

async function loginMedfair(driver, email, password, expectPathPart) {
  await driver.get(`${FE}/login`);
  await pause(800);
  await driver.wait(until.elementLocated(By.css("#emailOrPhone")), 30000);
  await typeInto(driver, By.css("#emailOrPhone"), email);
  await typeInto(driver, By.css("#password"), password);
  const buttons = await driver.findElements(By.css("button[type='submit']"));
  if (buttons.length) {
    await buttons[0].click();
  } else {
    await waitClick(driver, By.xpath("//button[contains(.,'Sign in')]"));
  }
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes(expectPathPart);
  }, 90000);
}

async function openMobileSidebar(driver) {
  // Shrink viewport so hamburger shows
  await driver.manage().window().setRect({ width: 420, height: 860, x: 40, y: 40 });
  await pause(500);
  const hamburgers = await driver.findElements(By.xpath("//button[@aria-label='Open menu' or contains(.,'☰')]"));
  if (hamburgers.length) {
    await hamburgers[0].click();
    await pause(800);
  }
}

async function runPatient(driver) {
  console.log("\n── PATIENT ──");
  await loginMedfair(driver, PATIENT_EMAIL, PASSWORD, "patient-dashboard");
  await shot(driver, "patient-dashboard");
  ok("Patient login");

  await openMobileSidebar(driver);
  await shot(driver, "patient-sidebar");
  const xs = await driver.findElements(By.xpath("//button[@aria-label='Close menu' or normalize-space(.)='✕']"));
  if (xs.length === 0) ok("Sidebar has no close X (space fixed)");
  else fail("Sidebar still has close X", new Error(`found ${xs.length}`));

  // Consultations history
  try {
    await waitClick(driver, By.xpath("//a[contains(.,'Consultations')]"), 10000);
  } catch {
    await driver.get(`${FE}/patient-dashboard/consultation-history`);
  }
  await driver.wait(until.urlContains("consultation-history"), 20000);
  await pause(1500);
  await shot(driver, "patient-consultation-history");
  const body = await driver.findElement(By.css("body")).getText();
  if (/Consultation history/i.test(body)) ok("Consultation history page");
  else fail("Consultation history page", new Error(body.slice(0, 200)));

  // Open chat if available
  const chatBtns = await driver.findElements(
    By.xpath("//button[contains(.,'Open chat') or contains(.,'View chat')]"),
  );
  if (chatBtns.length) {
    await chatBtns[0].click();
    await pause(1200);
    await shot(driver, "patient-chat-modal");
    const inputs = await driver.findElements(By.css("input[placeholder*='message'], input[placeholder*='Chat']"));
    if (inputs.length) {
      const ph = await inputs[0].getAttribute("placeholder");
      if (/closed/i.test(ph)) {
        ok("Chat modal (window closed — view only)");
      } else {
        await inputs[0].sendKeys("Selenium local chat test");
        await waitClick(driver, By.xpath("//button[normalize-space(.)='Send']"));
        await pause(1000);
        ok("Patient sent chat message");
      }
    } else {
      ok("Chat modal opened");
    }
    const close = await driver.findElements(By.xpath("//button[normalize-space(.)='Close']"));
    if (close.length) await close[0].click();
  } else {
    ok("History loaded (no chat button yet)");
  }

  // Remaining patient feature pages (smoke)
  await smokePage(driver, "Patient home", `${FE}/patient-dashboard`, /dashboard|Book|Doctor|Consult/i);
  await smokePage(driver, "Patient profile", `${FE}/patient-dashboard/profile`, /Profile|Personal|Email|Phone/i);
  await smokePage(driver, "Patient subscriptions", `${FE}/patient-dashboard/subscription`, /Subscription|Plan|Premium|Free/i);
  await shot(driver, "patient-subscriptions");
  await smokePage(driver, "Patient notes", `${FE}/patient-dashboard/patient-notes`, /Note|Consultation|Empty|No notes/i);
  await smokePage(
    driver,
    "Patient investigations",
    `${FE}/patient-dashboard/patient-investigations`,
    /Investigation|Ready to send|Sent|Download|Choose lab|No payment/i,
  );
  await smokePage(driver, "Patient add dependent", `${FE}/patient-dashboard/add-dependent`, /Dependent|Add|Family|Child/i);
  await smokePage(driver, "Patient period tracker", `${FE}/patient-dashboard/period-tracker`, /Period|Cycle|Tracker|Log/i);
  await smokePage(driver, "Patient weight loss", `${FE}/patient-dashboard/weight-loss`, /Weight|Loss|Program|BMI/i);
  await smokePage(driver, "Patient contact us", `${FE}/patient-dashboard/contact-us`, /Contact|Message|Support|Email/i);
}

async function runDoctor(driver) {
  console.log("\n── DOCTOR ──");
  await driver.manage().deleteAllCookies();
  await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
  await driver.manage().window().setRect({ width: 1280, height: 860, x: 40, y: 40 });

  await loginMedfair(driver, DOCTOR_EMAIL, PASSWORD, "doctor-dashboard");
  await shot(driver, "doctor-dashboard");
  ok("Doctor login");

  await driver.get(`${FE}/doctor-dashboard/chat`);
  await pause(2000);
  await shot(driver, "doctor-chat-inbox");
  const chatBody = await driver.findElement(By.css("body")).getText();
  if (/Patient chats|open chats|No open chats|Open chat/i.test(chatBody)) {
    ok("Doctor Chat menu page");
  } else {
    fail("Doctor Chat menu page", new Error(chatBody.slice(0, 250)));
  }

  const openChat = await driver.findElements(By.xpath("//button[contains(.,'Open chat')]"));
  if (openChat.length) {
    await openChat[0].click();
    await pause(1200);
    await shot(driver, "doctor-chat-modal");
    const inputs = await driver.findElements(
      By.css("input[placeholder*='Reply'], input[placeholder*='message'], input[placeholder*='Chat']"),
    );
    if (inputs.length) {
      const ph = await inputs[0].getAttribute("placeholder");
      if (!/closed/i.test(ph)) {
        await inputs[0].sendKeys("Selenium doctor reply");
        await waitClick(driver, By.xpath("//button[normalize-space(.)='Send']"));
        await pause(1000);
        ok("Doctor replied in chat");
      } else {
        ok("Doctor opened chat (window closed)");
      }
    } else {
      ok("Doctor opened chat modal");
    }
    const close = await driver.findElements(By.xpath("//button[normalize-space(.)='Close']"));
    if (close.length) await close[0].click();
  } else {
    ok("Doctor Chat inbox (no open thread yet — expected if no recent consult)");
  }

  await smokePage(driver, "Doctor home", `${FE}/doctor-dashboard`, /dashboard|Patient|Call|Availability|Online/i);
  await smokePage(driver, "Doctor view profile", `${FE}/doctor-dashboard/view-profile`, /Profile|Specialty|Doctor|About/i);
  await smokePage(driver, "Doctor edit profile", `${FE}/doctor-dashboard/edit-profile`, /Edit|Profile|Save|Bio|Specialty/i);
  await smokePage(driver, "Doctor notes", `${FE}/doctor-dashboard/notes`, /Note|Patient|Search|Consultation/i);
  await smokePage(driver, "Doctor finances", `${FE}/doctor-dashboard/finances`, /Finance|Earning|Balance|Wallet|Withdraw/i);
  await shot(driver, "doctor-finances");
  await smokePage(driver, "Doctor contact us", `${FE}/doctor-dashboard/contact-us`, /Contact|Message|Support|Email/i);
}

async function runPartner(driver) {
  console.log("\n── PARTNER ADMIN ──");
  await driver.manage().deleteAllCookies();
  try {
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
  } catch {
    /* ignore if no page yet */
  }
  await driver.manage().window().setRect({ width: 1280, height: 860, x: 40, y: 40 });

  await driver.get(`${PARTNERS}/auth/login`);
  await pause(1500);
  await driver.wait(until.elementLocated(By.css("#email")), 30000);
  await typeInto(driver, By.css("#email"), ORG_EMAIL);
  await typeInto(driver, By.css("#password"), PASSWORD);
  await shot(driver, "partner-login-filled");
  const submit = await driver.findElements(By.css("button[type='submit']"));
  if (submit.length) await submit[0].click();
  else await waitClick(driver, By.xpath("//button[contains(.,'Sign in')]"));

  const deadline = Date.now() + 90000;
  let landed = false;
  while (Date.now() < deadline) {
    const url = await driver.getCurrentUrl();
    if (url.includes("/dashboard") || url.includes("change-password")) {
      landed = true;
      break;
    }
    const errEls = await driver.findElements(
      By.xpath("//*[contains(.,'Incorrect') or contains(.,'Login failed')]"),
    );
    if (errEls.length) {
      const msg = await errEls[0].getText();
      throw new Error(`Partner login rejected: ${msg}`);
    }
    await pause(500);
  }
  if (!landed) {
    const url = await driver.getCurrentUrl();
    const body = await driver.findElement(By.css("body")).getText();
    await shot(driver, "partner-login-stuck");
    throw new Error(`Partner login did not navigate. url=${url}\n${body.slice(0, 400)}`);
  }
  await pause(1500);
  await shot(driver, "partner-dashboard");
  ok("Partner admin login");

  await driver.get(`${PARTNERS}/dashboard/settings`);
  await driver.wait(
    until.elementLocated(By.css("#inviteAdminFullName, #adminFullName, #currentPassword")),
    30000,
  );
  await pause(1500);
  await shot(driver, "partner-settings");

  // Wait until admins section finished loading
  const settingsDeadline = Date.now() + 30000;
  let settingsReady = false;
  while (Date.now() < settingsDeadline) {
    const t = await driver.findElement(By.css("body")).getText();
    if (/Organization admins|Add admin|Invite admin|Super admin/i.test(t)) {
      settingsReady = true;
      break;
    }
    await pause(500);
  }
  if (!settingsReady) {
    const t = await driver.findElement(By.css("body")).getText();
    await shot(driver, "partner-settings-fail");
    fail("Partner settings", new Error(`Unexpected page:\n${t.slice(0, 400)}`));
  } else {
    ok("Partner settings / admins page");
  }

  // ── Add admin ─────────────────────────────────────────────────────
  const stamp = `${Date.now()}`.slice(-8);
  const newAdminEmail = `e2e.admin.${stamp}@medfair-test.local`;
  const newAdminName = `E2E Admin ${stamp}`;
  const newAdminPass = "TempPass123!";

  const addForm = await driver.findElements(By.css("#inviteAdminFullName"));
  if (!addForm.length) {
    fail("Add admin form", new Error("Invite form missing — user may not be superAdmin in UI state"));
  } else {
    await typeInto(driver, By.css("#inviteAdminFullName"), newAdminName);
    await typeInto(driver, By.css("#inviteAdminEmail"), newAdminEmail);
    await typeInto(driver, By.css("#inviteAdminPassword"), newAdminPass);
    // Verify fields actually hold values before submit
    const vName = await driver.findElement(By.css("#inviteAdminFullName")).getAttribute("value");
    const vEmail = await driver.findElement(By.css("#inviteAdminEmail")).getAttribute("value");
    if (vName !== newAdminName || vEmail !== newAdminEmail) {
      fail(
        "Add admin form fill",
        new Error(`Fields not set (name='${vName}' email='${vEmail}')`),
      );
      return;
    }
    // Capture network-ish result via performance or just wait for list
    await waitClick(driver, By.xpath("//button[contains(.,'Invite admin')]"));
    // Wait for list refresh / toast
    let invited = false;
    for (let i = 0; i < 20; i++) {
      await pause(500);
      const t = await driver.findElement(By.css("body")).getText();
      if (t.includes(newAdminEmail) || t.includes(newAdminName)) {
        invited = true;
        break;
      }
      if (/Could not add|already exists/i.test(t)) {
        fail("Added another admin", new Error(t.slice(0, 300)));
        invited = false;
        break;
      }
    }
    await shot(driver, "partner-admin-invited");
    if (invited) {
      ok("Added another admin", newAdminEmail);
    } else {
      await driver.navigate().refresh();
      await pause(2500);
      const refreshed = await driver.findElement(By.css("body")).getText();
      if (refreshed.includes(newAdminEmail)) ok("Added another admin", newAdminEmail);
      else {
        fail("Added another admin", new Error(`Invite not visible:\n${refreshed.slice(0, 400)}`));
        return; // don't claim delete success if invite failed
      }
    }

    // ── Delete that admin ─────────────────────────────────────────────
    await driver.executeScript("window.confirm = () => true;");
    const removeBtns = await driver.findElements(
      By.xpath(
        `//li[.//*[contains(text(),'${newAdminEmail}')]]//button[contains(.,'Remove')]`,
      ),
    );
    if (!removeBtns.length) {
      fail("Delete admin", new Error("No Remove button for invited admin"));
      return;
    }
    await removeBtns[0].click();
    let deleted = false;
    for (let i = 0; i < 16; i++) {
      await pause(500);
      const t = await driver.findElement(By.css("body")).getText();
      if (!t.includes(newAdminEmail)) {
        deleted = true;
        break;
      }
    }
    await shot(driver, "partner-admin-deleted");
    if (deleted) ok("Deleted invited admin", newAdminEmail);
    else fail("Deleted invited admin", new Error("Email still listed after Remove"));
  }

  // ── Force password change for a freshly invited admin ─────────────
  {
    const stamp2 = `${Date.now()}`.slice(-8);
    const forceEmail = `e2e.force.${stamp2}@medfair-test.local`;
    const forceName = `Force PW ${stamp2}`;
    const forcePass = "TempPass123!";
    const newPass = "ChangedPass123!";

    const inviteFields = await driver.findElements(By.css("#inviteAdminFullName"));
    if (inviteFields.length) {
      await typeInto(driver, By.css("#inviteAdminFullName"), forceName);
      await typeInto(driver, By.css("#inviteAdminEmail"), forceEmail);
      await typeInto(driver, By.css("#inviteAdminPassword"), forcePass);
      await waitClick(driver, By.xpath("//button[contains(.,'Invite admin')]"));
      let invited = false;
      for (let i = 0; i < 20; i++) {
        await pause(500);
        const t = await driver.findElement(By.css("body")).getText();
        if (t.includes(forceEmail)) {
          invited = true;
          break;
        }
      }
      if (!invited) {
        fail("Invite for force-password test", new Error("Invite not listed"));
      } else {
        ok("Invited admin for force-password test", forceEmail);

        // Log out via UI if possible, else clear storage
        await driver.manage().deleteAllCookies();
        await driver.get(`${PARTNERS}/auth/login`);
        await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
        await pause(800);
        await driver.get(`${PARTNERS}/auth/login`);
        await typeInto(driver, By.css("#email"), forceEmail);
        await typeInto(driver, By.css("#password"), forcePass);
        const submit2 = await driver.findElements(By.css("button[type='submit']"));
        if (submit2.length) await submit2[0].click();
        else await waitClick(driver, By.xpath("//button[contains(.,'Sign in')]"));

        const forceDeadline = Date.now() + 60000;
        let onChangePage = false;
        while (Date.now() < forceDeadline) {
          const url = await driver.getCurrentUrl();
          if (url.includes("/auth/change-password")) {
            onChangePage = true;
            break;
          }
          await pause(500);
        }
        await shot(driver, "partner-forced-change-password");
        if (!onChangePage) {
          fail(
            "Forced password change redirect",
            new Error(`Expected /auth/change-password, got ${await driver.getCurrentUrl()}`),
          );
        } else {
          ok("New admin forced to change password");
          await typeInto(driver, By.css("#current"), forcePass);
          await typeInto(driver, By.css("#new"), newPass);
          await typeInto(driver, By.css("#confirm"), newPass);
          await waitClick(driver, By.xpath("//button[@type='submit' or contains(.,'Update') or contains(.,'Save') or contains(.,'Change')]"));
          const dashDeadline = Date.now() + 60000;
          let onDash = false;
          while (Date.now() < dashDeadline) {
            const url = await driver.getCurrentUrl();
            if (url.includes("/dashboard") && !url.includes("change-password")) {
              onDash = true;
              break;
            }
            await pause(500);
          }
          await shot(driver, "partner-after-password-change");
          if (onDash) ok("Password changed; reached dashboard");
          else fail("After password change", new Error(await driver.getCurrentUrl()));
        }

        // Cleanup: login as super admin and delete force admin
        await driver.manage().deleteAllCookies();
        await driver.get(`${PARTNERS}/auth/login`);
        await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
        await pause(500);
        await typeInto(driver, By.css("#email"), ORG_EMAIL);
        await typeInto(driver, By.css("#password"), PASSWORD);
        const submit3 = await driver.findElements(By.css("button[type='submit']"));
        if (submit3.length) await submit3[0].click();
        else await waitClick(driver, By.xpath("//button[contains(.,'Sign in')]"));
        await driver.wait(async () => (await driver.getCurrentUrl()).includes("/dashboard"), 60000);
        await driver.get(`${PARTNERS}/dashboard/settings`);
        await pause(2000);
        await driver.executeScript("window.confirm = () => true;");
        const rm = await driver.findElements(
          By.xpath(`//li[.//*[contains(text(),'${forceEmail}')]]//button[contains(.,'Remove')]`),
        );
        if (rm.length) {
          await rm[0].click();
          await pause(1500);
          ok("Cleaned up force-password test admin");
        }
      }
    }
  }

  await smokePage(
    driver,
    "Partner reports",
    `${PARTNERS}/dashboard/reports`,
    /Excel|Export|Download|Report|consultation/i,
    { settleMs: 2000 },
  );
  await shot(driver, "partner-reports");
  await smokePage(driver, "Partner home", `${PARTNERS}/dashboard`, /Dashboard|Overview|Welcome|Consultation|Stat/i, {
    settleMs: 2000,
  });
  await smokePage(driver, "Partner wallet", `${PARTNERS}/dashboard/wallet`, /Wallet|Balance|Transaction|Credit/i, {
    settleMs: 2000,
  });
  await smokePage(driver, "Partner users", `${PARTNERS}/dashboard/users`, /User|Patient|Staff|Member|Employee/i, {
    settleMs: 2000,
  });
  await smokePage(driver, "Partner profile", `${PARTNERS}/dashboard/profile`, /Profile|Organisation|Organization|Email/i, {
    settleMs: 2000,
  });
  await smokePage(
    driver,
    "Partner investigations",
    `${PARTNERS}/dashboard/investigations`,
    /Investigation|Lab|Order|Test|Patient/i,
    { settleMs: 2000 },
  );
  await smokePage(
    driver,
    "Partner medications",
    `${PARTNERS}/dashboard/medications`,
    /Medication|Pharmacy|Prescription|Drug|Order/i,
    { settleMs: 2000 },
  );
}

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log(" Selenium headed UI test (LOCAL DB)");
  console.log("══════════════════════════════════════════════════");
  console.log(`FE       ${FE}`);
  console.log(`PARTNERS ${PARTNERS}`);
  console.log(`API      ${API}`);
  console.log(`ChromeDriver ${chromedriver.path}\n`);

  // Health
  const health = await fetch(`${API}/api/v1/registration/partner-organizations`);
  if (!health.ok) throw new Error(`Backend not reachable at ${API}`);
  ok("Backend up (local)");

  seedOpenChatCall();

  const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);
  const options = new chrome.Options();
  // Headed — show UI. Do NOT add --headless
  options.addArguments(
    "--disable-gpu",
    "--window-size=1280,860",
    "--disable-notifications",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--remote-allow-origins=*",
  );
  // Don't wait forever for every network idle / long asset
  options.setPageLoadStrategy("eager");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build();

  try {
    await driver.manage().setTimeouts({ implicit: 0, pageLoad: 60000, script: 30000 });
    const only = (process.env.ONLY || "").toLowerCase();
    if (only === "partner") {
      await runPartner(driver);
    } else if (only === "doctor") {
      await runDoctor(driver);
    } else if (only === "patient") {
      await runPatient(driver);
    } else {
      await runPatient(driver);
      await runDoctor(driver);
      await runPartner(driver);
    }
  } catch (err) {
    fail("Fatal", err);
    try {
      await shot(driver, "fatal");
    } catch {
      /* ignore */
    }
  } finally {
    console.log("\nLeaving browser open 8s so you can see the last screen…");
    await pause(8000);
    await driver.quit().catch(() => {});
  }

  console.log("\n══════════════════════════════════════════════════");
  console.log(` Done: ${passed} passed, ${failed} failed`);
  console.log(` Screenshots: ${SHOTS}`);
  console.log("══════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
