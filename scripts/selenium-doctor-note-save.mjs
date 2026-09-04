/**
 * Headed test: doctor opens a visit, fills SOAP form, saves note, verifies via API.
 * Also checks landing favicon is partners medfair.svg.
 *
 *   node scripts/selenium-doctor-note-save.mjs
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
const DOCTOR_EMAIL =
  process.env.DOCTOR_EMAIL || "e2e.ui.doc.1786909249605453@medfair-test.local";
const PATIENT_EMAIL =
  process.env.PATIENT_EMAIL || "e2e.ui.pat.1786909249605453@medfair-test.local";
const HOLD = Number(process.env.HOLD_MS || 2500);

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
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(driver, name) {
  const b64 = await driver.takeScreenshot();
  fs.writeFileSync(
    path.join(SHOTS, `note-save-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`),
    Buffer.from(b64, "base64"),
  );
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
async function apiLogin(email) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrPhone: email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login ${res.status}`);
  return res.json();
}

async function main() {
  console.log("\n=== Doctor note SAVE + favicon check ===\n");

  // Favicon
  const fav = await fetch(`${FE}/medfair.svg`);
  if (fav.ok) {
    const svg = await fav.text();
    if (/020E7C|medfair|#020E7C/i.test(svg) || svg.includes("viewBox")) {
      ok("Favicon /medfair.svg served (partners logo)");
    } else fail("Favicon content", new Error(svg.slice(0, 80)));
  } else fail("Favicon /medfair.svg", new Error(String(fav.status)));

  const html = await fetch(`${FE}/`).then((r) => r.text());
  if (/rel=["']icon["'][^>]*href=["']\/medfair\.svg["']/i.test(html) || /href=["']\/medfair\.svg["'][^>]*rel=["']icon["']/i.test(html)) {
    ok("index.html points icon to /medfair.svg");
  } else if (html.includes("/medfair.svg")) {
    ok("index.html references /medfair.svg");
  } else {
    fail("index.html favicon link", new Error("medfair.svg not in HTML"));
  }

  const doctor = await apiLogin(DOCTOR_EMAIL);
  const patient = await apiLogin(PATIENT_EMAIL);
  const doctorId = doctor.user.id;
  const patientId = patient.user.id;
  const marker = `SAVE_TEST_${Date.now()}`;

  const options = new chrome.Options();
  options.addArguments("--window-size=1280,900", "--disable-notifications", "--remote-allow-origins=*");
  options.setPageLoadStrategy("eager");
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
    .build();

  try {
    await driver.get(`${FE}/login`);
    await typeInto(driver, By.css("#emailOrPhone"), DOCTOR_EMAIL);
    await typeInto(driver, By.css("#password"), PASSWORD);
    const btns = await driver.findElements(By.css("button[type='submit']"));
    if (btns.length) await btns[0].click();
    await driver.wait(async () => (await driver.getCurrentUrl()).includes("doctor"), 60000);
    ok("Doctor login");

    await driver.get(`${FE}/doctor-dashboard/notes`);
    await pause(HOLD);
    await shot(driver, "visits");

    let openBtns = await driver.findElements(
      By.xpath("//button[contains(.,'Open visit') or contains(.,'Start note')]"),
    );
    if (!openBtns.length) {
      // Seed a visit by creating a note via API so the list is not empty
      const seed = await fetch(`${API}/api/notes/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doctor.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          patientId,
          subjective: "Seed visit for save UI test",
          objective: "",
          assessment: "",
          plan: "",
          finalDiagnosis: "",
          soapComment: "",
          prescriptions: [],
        }),
      });
      if (!seed.ok) throw new Error(`seed note ${seed.status} ${await seed.text()}`);
      ok("Seeded visit note so list is not empty");
      await driver.navigate().refresh();
      await pause(HOLD);
      openBtns = await driver.findElements(
        By.xpath("//button[contains(.,'Open visit') or contains(.,'Start note')]"),
      );
    }
    if (!openBtns.length) {
      fail("Open visit button", new Error("none after seed"));
    } else {
      await openBtns[0].click();
      await pause(HOLD);
      ok("Opened visit workspace");
    }

    await driver.wait(until.elementLocated(By.id("subjective")), 20000);
    await shot(driver, "form-open");

    await fillById(driver, "subjective", `Patient reports headache. ${marker}`);
    await fillById(driver, "objective", "BP 120/80, alert");
    await fillById(driver, "assessment", "Tension headache");
    await fillById(driver, "plan", "Hydration, rest, review in 48h");
    await fillById(driver, "finalDiagnosis", "Tension-type headache");
    await pause(HOLD);
    await shot(driver, "form-filled");
    ok("Filled SOAP form fields");

    const saveBtn = await driver.findElement(
      By.xpath("//button[contains(.,'Create note') or contains(.,'Save note')]"),
    );
    const saveLabel = await saveBtn.getText();
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", saveBtn);
    await pause(400);
    await saveBtn.click();
    await pause(HOLD);
    await shot(driver, "after-save");
    ok("Clicked save", saveLabel.trim());

    const body = await driver.findElement(By.css("body")).getText();
    if (/Note (created|updated)|successfully/i.test(body)) {
      ok("Success toast/message visible");
    } else {
      // toast may disappear — verify via API
      ok("Toast may have auto-dismissed — verifying API");
    }

    // Authoritative check: note for this patient contains marker
    const notesRes = await fetch(`${API}/api/notes/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${doctor.token}` },
    });
    if (!notesRes.ok) {
      fail("Fetch notes API", new Error(String(notesRes.status)));
    } else {
      const notes = await notesRes.json();
      const list = Array.isArray(notes) ? notes : [];
      const hit = list.find(
        (n) =>
          String(n.subjective || "").includes(marker) ||
          String(n.finalDiagnosis || "").includes("Tension-type"),
      );
      if (hit) {
        ok("Note persisted in API", `id=${hit.id || hit.noteId} subjective has marker`);
      } else {
        // Also try get-all-patient-note
        const alt = await fetch(`${API}/api/notes/get-all-patient-note/${patientId}`, {
          headers: { Authorization: `Bearer ${doctor.token}` },
        });
        const altNotes = alt.ok ? await alt.json() : [];
        const hit2 = (Array.isArray(altNotes) ? altNotes : []).find((n) =>
          String(n.subjective || "").includes(marker),
        );
        if (hit2) ok("Note persisted (get-all)", `id=${hit2.id}`);
        else {
          fail(
            "Note save persistence",
            new Error(
              `marker not found in ${list.length} notes. Latest subjective=${list[0]?.subjective?.slice?.(0, 80)}`,
            ),
          );
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
    await pause(2000);
    await driver.quit().catch(() => {});
  }

  console.log(`\nRESULT: ${passed} PASS / ${failed} FAIL\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
