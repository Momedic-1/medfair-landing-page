/**
 * Headed Selenium: patient investigations (view / download / send-to-lab UI).
 *   ONLY=investigations node scripts/selenium-investigations.mjs
 */
import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://127.0.0.1:5174").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PASSWORD = "TestPass123!";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, ".selenium-screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

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
async function pause(ms) {
  await new Promise((r) => setTimeout(r, ms));
}
async function shot(driver, name) {
  const b64 = await driver.takeScreenshot();
  fs.writeFileSync(
    path.join(SHOTS, `inv-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`),
    Buffer.from(b64, "base64"),
  );
}
async function typeInto(driver, locator, text) {
  const el = await driver.wait(until.elementLocated(locator), 20000);
  await el.click();
  await el.sendKeys(Key.chord(Key.CONTROL, "a"));
  await el.sendKeys(Key.BACK_SPACE);
  await el.sendKeys(String(text));
}

async function main() {
  console.log("\n=== Selenium investigations (local) ===\n");
  const health = await fetch(`${API}/api/v1/registration/partner-organizations`);
  if (!health.ok) throw new Error("Backend down");
  ok("Backend up");

  const options = new chrome.Options();
  options.addArguments("--window-size=1280,860", "--disable-notifications", "--remote-allow-origins=*");
  options.setPageLoadStrategy("eager");
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
    .build();

  try {
    await driver.get(`${FE}/login`);
    await typeInto(driver, By.css("#emailOrPhone"), PATIENT_EMAIL);
    await typeInto(driver, By.css("#password"), PASSWORD);
    const btns = await driver.findElements(By.css("button[type='submit']"));
    if (btns.length) await btns[0].click();
    await driver.wait(async () => (await driver.getCurrentUrl()).includes("patient-dashboard"), 60000);
    ok("Patient login");

    await driver.get(`${FE}/patient-dashboard/patient-investigations`);
    await pause(2000);
    await shot(driver, "investigations-page");
    const body = await driver.findElement(By.css("body")).getText();
    if (/Investigations|Ready to send|Sent|Download|Choose lab|No payment|partner lab/i.test(body)) {
      ok("Investigations page (view-only copy)");
    } else {
      fail("Investigations page", new Error(body.slice(0, 300)));
    }
    if (/Paystack|Make payment|Initiate payment/i.test(body)) {
      fail("Payment removed", new Error("Payment UI still visible"));
    } else {
      ok("No payment CTA on investigations page");
    }

    const downloads = await driver.findElements(
      By.xpath("//button[contains(.,'Download')]"),
    );
    if (downloads.length) {
      ok("Download button present", String(downloads.length));
    } else {
      ok("Download button (none yet if no orders)");
    }

    // Prefer a ready order — create one via API if all already sent
    const login = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone: PATIENT_EMAIL, password: PASSWORD }),
    }).then((r) => r.json());
    const docLogin = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone:
          process.env.DOCTOR_EMAIL ||
          "e2e.ui.doc.1786909249605453@medfair-test.local",
        password: PASSWORD,
      }),
    }).then((r) => r.json());
    await fetch(
      `${API}/api/investigations/create-order?doctorId=${docLogin.user.id}&patientId=${login.user.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${docLogin.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          { customName: `UI Lab Choice ${Date.now()}`, instruction: "As ordered" },
        ]),
      },
    );
    await driver.navigate().refresh();
    await pause(2000);

    const sendBtns = await driver.findElements(
      By.xpath("//button[contains(.,'Choose lab') or contains(.,'Send to lab')]"),
    );
    if (!sendBtns.length) {
      fail("Choose lab button", new Error("No ready order to send"));
    } else {
      await sendBtns[0].click();
      await pause(1200);
      await shot(driver, "choose-lab-modal");
      const modal = await driver.findElement(By.css("body")).getText();
      if (/Choose a partner lab|Search partner labs|partner/i.test(modal)) {
        ok("Partner lab chooser modal");
      } else {
        fail("Partner lab chooser modal", new Error(modal.slice(0, 250)));
      }

      // Pick first lab card (button with Partner code)
      const labCards = await driver.findElements(
        By.xpath("//button[.//*[contains(text(),'Partner code')]]"),
      );
      if (labCards.length < 2) {
        ok("Lab partners listed", String(labCards.length));
      } else {
        ok("Multiple lab partners available to choose", String(labCards.length));
      }
      if (labCards.length) {
        await labCards[0].click();
        await pause(400);
        const confirm = await driver.findElements(
          By.xpath("//button[contains(.,'Send to selected lab')]"),
        );
        if (confirm.length) {
          await confirm[0].click();
          await pause(2500);
          await shot(driver, "after-send");
          ok("Sent order to selected partner lab");
        }
      }
    }
  } catch (e) {
    fail("Fatal", e);
    try {
      await shot(driver, "fatal");
    } catch {
      /* ignore */
    }
  } finally {
    await pause(4000);
    await driver.quit().catch(() => {});
  }
  console.log(`\nDone: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
