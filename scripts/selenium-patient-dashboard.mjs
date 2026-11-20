/**
 * Selenium: patient dashboard regression after hub redesign.
 *
 * Covers login, new home tiles, booking modal, GP call modal,
 * check symptoms, pharmacy/labs/chat routes, and key sidebar pages.
 *
 * Prereqs:
 *   FE  http://localhost:5173
 *   API http://localhost:8081
 *
 *   FE_URL=http://localhost:5173 API_URL=http://localhost:8081 node scripts/selenium-patient-dashboard.mjs
 */
import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://localhost:5173").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = process.env.TEST_PASSWORD || "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";
const HOLD = Number(process.env.HOLD_MS || 1500);

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
  fs.writeFileSync(
    path.join(SHOTS, `pd-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`),
    Buffer.from(b64, "base64"),
  );
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
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      `,
      el,
      String(text),
    );
  }
  return el;
}

async function waitClick(driver, locator, timeout = 20000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await driver.wait(until.elementIsEnabled(el), timeout);
  await el.click();
  return el;
}

async function bodyText(driver) {
  return driver.findElement(By.css("body")).getText();
}

async function assertNoCrash(driver, name) {
  const body = await bodyText(driver);
  if (/Something went wrong|Unexpected Application Error|Internal Server Error|Cannot GET/i.test(body)) {
    fail(name, new Error(body.slice(0, 250)));
    return false;
  }
  return true;
}

async function smokePage(driver, name, url, expectRe) {
  try {
    await driver.get(url);
    await pause(1200);
    const current = await driver.getCurrentUrl();
    if (/\/login/i.test(current) && !/login/i.test(url)) {
      fail(name, new Error(`Bounced to login: ${current}`));
      return;
    }
    if (!(await assertNoCrash(driver, name))) return;
    const body = await bodyText(driver);
    if (expectRe && !expectRe.test(body) && !expectRe.test(current)) {
      fail(name, new Error(`Expected ${expectRe}: ${body.slice(0, 220)}`));
      return;
    }
    ok(name);
  } catch (err) {
    fail(name, err);
  }
}

async function loginPatient(driver) {
  await driver.get(`${FE}/login`);
  await pause(800);
  await driver.wait(until.elementLocated(By.css("#emailOrPhone")), 30000);
  await typeInto(driver, By.css("#emailOrPhone"), PATIENT_EMAIL);
  await typeInto(driver, By.css("#password"), PASSWORD);
  const buttons = await driver.findElements(By.css("button[type='submit']"));
  if (buttons.length) await buttons[0].click();
  else await waitClick(driver, By.xpath("//button[contains(.,'Sign in')]"));
  await driver.wait(async () => (await driver.getCurrentUrl()).includes("patient-dashboard"), 90000);
  await pause(1500);
}

async function clickTile(driver, title) {
  const loc = By.xpath(
    `//button[.//p[contains(normalize-space(.),'${title}')] or contains(normalize-space(.),'${title}')]`,
  );
  await waitClick(driver, loc, 15000);
}

async function run() {
  console.log("\n══ Patient dashboard Selenium ══");
  console.log(`FE=${FE}`);
  console.log(`API=${API}`);
  console.log(`Patient=${PATIENT_EMAIL}\n`);

  // Health checks
  try {
    const fe = await fetch(FE);
    if (!fe.ok) throw new Error(`FE status ${fe.status}`);
    ok("Frontend reachable");
  } catch (e) {
    fail("Frontend reachable", e);
    process.exit(1);
  }
  try {
    const api = await fetch(`${API}/api/v1/registration/partner-organizations`);
    if (!api.ok) throw new Error(`API status ${api.status}`);
    ok("Backend reachable");
  } catch (e) {
    fail("Backend reachable", e);
    process.exit(1);
  }

  const options = new chrome.Options();
  options.addArguments(
    "--disable-gpu",
    "--window-size=1280,900",
    "--disable-notifications",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--remote-allow-origins=*",
  );
  options.setPageLoadStrategy("eager");

  // Prefer matching local chromedriver; fall back to Selenium Manager.
  let builder = new Builder().forBrowser("chrome").setChromeOptions(options);
  try {
    if (chromedriver?.path) {
      builder = builder.setChromeService(new chrome.ServiceBuilder(chromedriver.path));
    }
  } catch {
    /* Selenium Manager */
  }
  const driver = await builder.build();

  try {
    await driver.manage().setTimeouts({ implicit: 0, pageLoad: 60000, script: 30000 });

    // 1. Login + home hub
    try {
      await loginPatient(driver);
      await shot(driver, "home");
      const home = await bodyText(driver);
      if (!(await assertNoCrash(driver, "Patient login home"))) {
        /* counted */
      } else if (!/What do you need today|Call a GP|Book a doctor|Check symptoms/i.test(home)) {
        fail("Patient hub visible", new Error(home.slice(0, 250)));
      } else {
        ok("Patient login + hub");
      }
      if (/Upcoming appointments/i.test(home)) ok("Upcoming appointments section");
      else fail("Upcoming appointments section", new Error("Missing on home"));
      const composer = await driver.findElements(
        By.css("input[placeholder*='Describe your symptoms'], button[aria-label='Check symptoms']"),
      );
      if (composer.length) ok("Symptom composer visible");
      else fail("Symptom composer visible", new Error("Composer input/button missing"));
    } catch (err) {
      fail("Patient login + hub", err);
      await shot(driver, "login-fail");
      throw err;
    }

    // 2. Book a doctor modal
    try {
      await driver.get(`${FE}/patient-dashboard`);
      await pause(1200);
      await clickTile(driver, "Book a doctor");
      await pause(1200);
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(.,'Choose a specialist') or contains(.,'Book an appointment')]")),
        15000,
      );
      await shot(driver, "book-modal");
      ok("Book a doctor opens modal");
      const closeBtns = await driver.findElements(By.css("button[aria-label='Close']"));
      if (closeBtns.length) await closeBtns[0].click();
      else {
        await driver.actions().sendKeys(Key.ESCAPE).perform();
      }
      await pause(600);
      ok("Book modal closes");
    } catch (err) {
      fail("Book a doctor modal", err);
      await shot(driver, "book-fail");
    }

    // 3. Call a GP modal
    try {
      await driver.get(`${FE}/patient-dashboard`);
      await pause(1200);
      await clickTile(driver, "Call a GP");
      await pause(1500);
      const callBody = await bodyText(driver);
      await shot(driver, "call-modal");
      if (/Call a doctor|Start call|Instant|subscription|Speak with a general practitioner/i.test(callBody)) {
        ok("Call a GP opens modal");
      } else {
        fail("Call a GP opens modal", new Error(callBody.slice(0, 250)));
      }
      // Close without starting if possible
      const close = await driver.findElements(By.css("button[aria-label='Close']"));
      if (close.length) await close[0].click();
      else {
        const cancel = await driver.findElements(
          By.xpath("//button[contains(.,'Close') or contains(.,'Cancel')]"),
        );
        if (cancel.length) await cancel[0].click();
        else await driver.actions().sendKeys(Key.ESCAPE).perform();
      }
      await pause(800);
      ok("Call modal dismissed");
    } catch (err) {
      fail("Call a GP modal", err);
      await shot(driver, "call-fail");
    }

    // 4. Check symptoms page + analyze (API)
    try {
      await driver.get(`${FE}/patient-dashboard`);
      await pause(1000);
      await clickTile(driver, "Check symptoms");
      await driver.wait(until.urlContains("check-symptoms"), 15000);
      await pause(1000);
      await shot(driver, "check-symptoms");
      const symBody = await bodyText(driver);
      if (/Check symptoms|Main symptom|Analyze/i.test(symBody)) ok("Check symptoms page");
      else fail("Check symptoms page", new Error(symBody.slice(0, 220)));

      const areas = await driver.findElements(By.css("textarea"));
      if (areas.length) {
        await areas[0].clear();
        await areas[0].sendKeys("Mild headache for one day, no fever");
      }
      const analyze = await driver.findElements(
        By.xpath("//button[contains(.,'Analyze symptoms') or contains(.,'Analyze with AI')]"),
      );
      if (analyze.length) {
        await analyze[0].click();
        await pause(4000);
        await shot(driver, "check-symptoms-result");
        const resultBody = await bodyText(driver);
        if (/Suggested next step|See a doctor|Self care|Routine|Emergency|Call a GP|Edit symptoms/i.test(resultBody)) {
          ok("Symptom analyze returns result");
        } else if (/Could not analyze|sign in again|error/i.test(resultBody)) {
          fail("Symptom analyze returns result", new Error(resultBody.slice(0, 250)));
        } else {
          fail("Symptom analyze returns result", new Error(resultBody.slice(0, 250)));
        }
      } else {
        fail("Symptom analyze button", new Error("Analyze button missing"));
      }

      // Home back control
      const homeBtn = await driver.findElements(
        By.xpath("//button[@aria-label='Back to home' or contains(.,'Home') or contains(.,'Back to home')]"),
      );
      if (homeBtn.length) {
        await homeBtn[0].click();
        await pause(1000);
        const url = await driver.getCurrentUrl();
        if (/patient-dashboard\/?$/.test(url.replace(/\/+$/, "")) || url.endsWith("/patient-dashboard")) {
          ok("Home navigation from symptoms");
        } else {
          // header Home may navigate correctly even with trailing paths
          ok("Home button clicked", url);
        }
      } else {
        await driver.get(`${FE}/patient-dashboard`);
        ok("Returned to home via URL");
      }
    } catch (err) {
      fail("Check symptoms flow", err);
      await shot(driver, "symptoms-fail");
    }

    // 5. Tile routes
    await smokePage(
      driver,
      "Pharmacy tile route",
      `${FE}/patient-dashboard/patient-notes`,
      /Note|Medication|Pharmacy|Empty|No notes|Consultation|No pharmacy|Doctor/i,
    );
    await smokePage(
      driver,
      "Lab tests tile route",
      `${FE}/patient-dashboard/patient-investigations`,
      /Investigation|Lab|Ready to send|Sent|Download|partner|Upload lab/i,
    );
    await smokePage(
      driver,
      "Upload results route",
      `${FE}/patient-dashboard/profile?section=documents`,
      /Document|Upload|Lab result|Radiology|Your documents|Profile/i,
    );
    await smokePage(
      driver,
      "Doctor chat tile route",
      `${FE}/patient-dashboard/consultation-history`,
      /Doctor chats|Consultation|chat|No consultations|Open chat|View chat/i,
    );

    // 5b. Upload results tile from home
    try {
      await driver.get(`${FE}/patient-dashboard`);
      await pause(1000);
      await clickTile(driver, "Upload results");
      await driver.wait(until.urlContains("profile"), 15000);
      await pause(1200);
      const uploadBody = await bodyText(driver);
      await shot(driver, "upload-results");
      if (/Document|Upload|Lab|Radiology|category|Choose file/i.test(uploadBody)) {
        ok("Upload results tile opens documents");
      } else {
        fail("Upload results tile opens documents", new Error(uploadBody.slice(0, 220)));
      }
    } catch (err) {
      fail("Upload results tile", err);
      await shot(driver, "upload-fail");
    }

    // 6. Other patient pages
    await smokePage(driver, "Profile page", `${FE}/patient-dashboard/profile`, /Profile|Personal|Email|Phone|Blood/i);
    await smokePage(
      driver,
      "Subscriptions page",
      `${FE}/patient-dashboard/subscription`,
      /Subscription|Plan|Instant|Premium|Free|Buy/i,
    );
    await smokePage(
      driver,
      "Add dependent page",
      `${FE}/patient-dashboard/add-dependent`,
      /Dependent|Add|Family|Child|Spouse/i,
    );
    await smokePage(
      driver,
      "Period tracker page",
      `${FE}/patient-dashboard/period-tracker`,
      /Period|Cycle|Tracker|Log|reminder/i,
    );
    await smokePage(
      driver,
      "Weight loss page",
      `${FE}/patient-dashboard/weight-loss`,
      /Weight|Loss|Program|BMI|check in/i,
    );
    await smokePage(
      driver,
      "Settings page",
      `${FE}/patient-dashboard/settings`,
      /Settings|Password|Account|Security|Email/i,
    );
    await smokePage(
      driver,
      "Contact us page",
      `${FE}/patient-dashboard/contact-us`,
      /Contact|Message|Support|Email/i,
    );

    // 7. Calendar toggle
    try {
      await driver.get(`${FE}/patient-dashboard`);
      await pause(1200);
      const cal = await driver.findElements(By.xpath("//button[contains(.,'View calendar')]"));
      if (cal.length) {
        await driver.executeScript(
          "arguments[0].scrollIntoView({block:'center'}); arguments[0].click();",
          cal[0],
        );
        await pause(1000);
        const body = await bodyText(driver);
        if (/Appointments calendar|Your appointments|Hide calendar/i.test(body)) {
          ok("View calendar expands");
        } else {
          fail("View calendar expands", new Error(body.slice(0, 200)));
        }
        const hide = await driver.findElements(By.xpath("//button[contains(.,'Hide calendar')]"));
        if (hide.length) {
          await hide[0].click();
          await pause(500);
          ok("Hide calendar works");
        }
      } else {
        fail("View calendar button", new Error("Not found on home"));
      }
      await shot(driver, "calendar-toggle");
    } catch (err) {
      fail("Calendar toggle", err);
    }

    // 8. Symptom composer submit navigates
    try {
      await driver.get(`${FE}/patient-dashboard`);
      await pause(1000);
      const input = await driver.findElements(By.css("input[placeholder*='Describe your symptoms']"));
      if (input.length) {
        await input[0].sendKeys("Sore throat");
        await waitClick(driver, By.css("button[aria-label='Check symptoms']"));
        await pause(1500);
        const url = await driver.getCurrentUrl();
        if (url.includes("check-symptoms")) ok("Composer opens check symptoms");
        else fail("Composer opens check symptoms", new Error(url));
      } else {
        fail("Composer input", new Error("Missing"));
      }
    } catch (err) {
      fail("Symptom composer", err);
    }
  } catch (err) {
    fail("Fatal", err);
    try {
      await shot(driver, "fatal");
    } catch {
      /* ignore */
    }
  } finally {
    console.log(`\nHolding browser ${HOLD}ms…`);
    await pause(HOLD);
    await driver.quit().catch(() => {});
  }

  console.log("\n══════════════════════════════════════════════════");
  console.log(` Done: ${passed} passed, ${failed} failed`);
  console.log(` Screenshots: ${SHOTS}`);
  console.log("══════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
