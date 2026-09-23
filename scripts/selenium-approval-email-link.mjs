/**
 * Click the approval-email "Review request" link and confirm it opens
 * the partner admin login page.
 */
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LOGIN_URL = "https://partneradmin.medfairtechnologies.com/auth/login";
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

const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <p>Someone asked to join your organization on MedFair.</p>
  <p>
    <a id="review-request" href="${LOGIN_URL}"
       style="display:inline-block;background:#020E7C;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;">
      Review request
    </a>
  </p>
</body>
</html>`;

const tmp = path.join(os.tmpdir(), "medfair-approval-email.html");
fs.writeFileSync(tmp, html, "utf8");

const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);
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

const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .setChromeService(serviceBuilder)
  .build();

try {
  console.log(`
══════════════════════════════════════════════════
 Selenium — Approval email link
══════════════════════════════════════════════════
Email button URL: ${LOGIN_URL}
`);

  const src = fs.readFileSync(
    "C:/Users/DELL/Documents/MEDFAIR DOC/Backend/userManagement/src/main/java/org/momedicbackend/organizations/services/OrganizationService.java",
    "utf8",
  );
  if (src.includes(LOGIN_URL)) ok("Backend email uses partner admin login URL");
  else fail("Backend email uses partner admin login URL", new Error("URL not found in OrganizationService"));

  await driver.get("file:///" + tmp.replace(/\\/g, "/"));
  await driver.wait(until.elementLocated(By.css("#review-request")), 10000);
  const href = await driver.findElement(By.css("#review-request")).getAttribute("href");
  if (href === LOGIN_URL) ok("Email button href is partner login");
  else fail("Email button href is partner login", new Error(href));

  await driver.findElement(By.css("#review-request")).click();
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes("partneradmin.medfairtechnologies.com");
  }, 30000);

  const url = await driver.getCurrentUrl();
  if (url.startsWith(LOGIN_URL) || url.includes("/auth/login")) {
    ok("Click lands on partner admin login", url);
  } else {
    fail("Click lands on partner admin login", new Error(url));
  }

  await driver.wait(
    until.elementLocated(By.css("input[name='email'], #email, input[type='email']")),
    20000,
  );
  ok("Partner login form is visible");

  const shot = path.join(SHOTS, "approval-email-partner-login.png");
  fs.writeFileSync(shot, Buffer.from(await driver.takeScreenshot(), "base64"));
  console.log(`Screenshot: ${shot}`);
} catch (err) {
  fail("Fatal", err);
  try {
    const shot = path.join(SHOTS, "approval-email-fatal.png");
    fs.writeFileSync(shot, Buffer.from(await driver.takeScreenshot(), "base64"));
  } catch {
    /* ignore */
  }
} finally {
  await driver.quit();
}

console.log(`
══════════════════════════════════════════════════
 Done: ${passed} passed, ${failed} failed
══════════════════════════════════════════════════
`);
process.exit(failed ? 1 : 0);
