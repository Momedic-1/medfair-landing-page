/**
 * Selenium + API: partner dropdown + org membership approval.
 *
 * Prereqs:
 *   Backend http://localhost:8081
 *   Landing http://127.0.0.1:5173
 *   Partners http://localhost:3000 (optional UI check)
 *
 *   node scripts/selenium-org-membership.mjs
 */
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FE = (process.env.FE_URL || "http://127.0.0.1:5173").replace(/\/$/, "");
const API = (process.env.API_URL || "http://localhost:8081").replace(/\/$/, "");
const PARTNERS = (process.env.PARTNERS_URL || "http://localhost:3000").replace(
  /\/$/,
);
const PASSWORD = "TestPass123!";

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
    path.join(SHOTS, `org-${String(passed + failed + 1).padStart(2, "0")}-${name}.png`),
    Buffer.from(b64, "base64"),
  );
}

async function json(method, url, { body, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

function stamp() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function patientPayload({ partnerSlug, partnerInvite, suffix }) {
  const id = stamp() + (suffix || "");
  const payload = {
    firstName: "E2E",
    lastName: `Org${suffix || "A"}`,
    emailAddress: `e2e.org.${id}@medfair-test.local`,
    phoneNumber: `+23480${String(id).slice(-9).padStart(9, "0")}`,
    gender: "Male",
    password: PASSWORD,
    confirmedPassword: PASSWORD,
    medicalSpecialization: "string",
    nameOfHospital: "string",
    howDidYouHearAboutUs: "NEWSPAPER",
    userRole: "PATIENT",
  };
  if (partnerSlug) payload.partnerSlug = partnerSlug;
  if (partnerInvite) payload.partnerInvite = true;
  return payload;
}

async function run() {
  console.log(`
══════════════════════════════════════════════════
 Selenium — Org membership (pending + invite)
══════════════════════════════════════════════════
FE        ${FE}
API       ${API}
PARTNERS  ${PARTNERS}
`);

  const health = await fetch(`${API}/api/v1/registration/partner-organizations`).catch(
    () => null,
  );
  if (!health) {
    console.error("Backend not reachable on", API);
    process.exit(1);
  }
  ok("Backend up");

  const partnersRes = await json(
    "GET",
    `${API}/api/v1/registration/partner-organizations`,
  );
  const partners = Array.isArray(partnersRes.data) ? partnersRes.data : [];
  const hasMedfair = partners.some((p) => {
    const slug = String(p.slug || "").toLowerCase();
    const name = String(p.name || "").toLowerCase();
    return slug === "medfair" || name === "medfair" || name === "medfair direct";
  });
  if (!hasMedfair) ok("API partner list excludes MedFair");
  else fail("API partner list excludes MedFair", new Error("MedFair still listed"));

  const orgSlug = `e2e-org-${stamp()}`;
  const adminEmail = `e2e.admin.${stamp()}@medfair-test.local`;
  const created = await json("POST", `${API}/api/organization/register`, {
    body: {
      organizationName: `E2E Hospital ${stamp()}`,
      organizationEmail: adminEmail,
      organizationPhone: "+2348011112222",
      slug: orgSlug,
      adminFullName: "E2E Admin",
      adminEmail,
      adminPassword: PASSWORD,
    },
  });
  if (!created.ok) {
    fail("Create test organization", new Error(JSON.stringify(created.data)));
    process.exit(1);
  }
  const orgId = created.data.organizationId;
  ok("Create test organization", `id=${orgId} slug=${orgSlug}`);

  const login1 = await json("POST", `${API}/api/organization/login`, {
    body: { email: adminEmail, password: PASSWORD },
  });
  if (!login1.ok) {
    fail("Org admin login", new Error(JSON.stringify(login1.data)));
    process.exit(1);
  }
  let adminToken = login1.data.token;
  await json("POST", `${API}/api/organization/change-password`, {
    token: adminToken,
    body: {
      currentPassword: PASSWORD,
      newPassword: PASSWORD,
      confirmPassword: PASSWORD,
    },
  });
  const login2 = await json("POST", `${API}/api/organization/login`, {
    body: { email: adminEmail, password: PASSWORD },
  });
  adminToken = login2.data.token || adminToken;
  ok("Org admin login");

  const pendingPatient = patientPayload({ partnerSlug: orgSlug, suffix: "P" });
  const pendingReg = await json(
    "POST",
    `${API}/api/v1/registration/patients-registrations`,
    { body: pendingPatient },
  );
  if (!(pendingReg.status === 201 || pendingReg.status === 200)) {
    fail("Dropdown signup stays pending", new Error(JSON.stringify(pendingReg.data)));
  } else {
    ok("Dropdown signup accepted");
  }

  const invitePatient = patientPayload({
    partnerSlug: orgSlug,
    partnerInvite: true,
    suffix: "I",
  });
  const inviteReg = await json(
    "POST",
    `${API}/api/v1/registration/patients-registrations`,
    { body: invitePatient },
  );
  if (!(inviteReg.status === 201 || inviteReg.status === 200)) {
    fail("Invite signup auto-approves", new Error(JSON.stringify(inviteReg.data)));
  } else {
    ok("Invite signup accepted");
  }

  const rejectPatient = patientPayload({ partnerSlug: orgSlug, suffix: "R" });
  const rejectReg = await json(
    "POST",
    `${API}/api/v1/registration/patients-registrations`,
    { body: rejectPatient },
  );
  if (!(rejectReg.status === 201 || rejectReg.status === 200)) {
    fail("Second pending signup", new Error(JSON.stringify(rejectReg.data)));
  } else {
    ok("Second pending signup accepted");
  }

  const pendingList = await json(
    "GET",
    `${API}/api/organization/${orgId}/pending-members`,
    { token: adminToken },
  );
  const pendingRows = Array.isArray(pendingList.data) ? pendingList.data : [];
  const pendingRow = pendingRows.find((r) => r.email === pendingPatient.emailAddress);
  const rejectRow = pendingRows.find((r) => r.email === rejectPatient.emailAddress);
  const inviteInPending = pendingRows.some(
    (r) => r.email === invitePatient.emailAddress,
  );
  if (pendingRow) ok("Dropdown signup appears in pending", pendingRow.email);
  else fail("Dropdown signup appears in pending", new Error("not found"));
  if (rejectRow) ok("Reject candidate appears in pending");
  else fail("Reject candidate appears in pending", new Error("not found"));
  if (!inviteInPending) ok("Invite signup is not pending");
  else fail("Invite signup is not pending", new Error("invite still in pending"));

  const membersBefore = await json(
    "GET",
    `${API}/api/organization/organization/${orgId}/users?page=0&size=50`,
    { token: adminToken },
  );
  const memberEmails = (membersBefore.data?.content || []).map((u) => u.email);
  if (memberEmails.includes(invitePatient.emailAddress)) {
    ok("Invite signup is already a member");
  } else {
    fail("Invite signup is already a member", new Error("invite missing from users"));
  }
  if (!memberEmails.includes(pendingPatient.emailAddress)) {
    ok("Pending signup is not a member yet");
  } else {
    fail("Pending signup is not a member yet", new Error("pending already a member"));
  }

  if (pendingRow) {
    const approved = await json(
      "POST",
      `${API}/api/organization/${orgId}/pending-members/${pendingRow.userId}/approve`,
      { token: adminToken },
    );
    if (approved.ok) ok("Approve pending member");
    else fail("Approve pending member", new Error(JSON.stringify(approved.data)));
  }
  if (rejectRow) {
    const rejected = await json(
      "POST",
      `${API}/api/organization/${orgId}/pending-members/${rejectRow.userId}/reject`,
      { token: adminToken },
    );
    if (rejected.ok) ok("Reject pending member");
    else fail("Reject pending member", new Error(JSON.stringify(rejected.data)));
  }

  const after = await json(
    "GET",
    `${API}/api/organization/${orgId}/pending-members`,
    { token: adminToken },
  );
  const afterEmails = (Array.isArray(after.data) ? after.data : []).map((r) => r.email);
  if (!afterEmails.includes(pendingPatient.emailAddress)) ok("Approved row left pending");
  else fail("Approved row left pending", new Error("still pending"));
  if (!afterEmails.includes(rejectPatient.emailAddress)) ok("Rejected row left pending");
  else fail("Rejected row left pending", new Error("still pending"));

  const membersAfter = await json(
    "GET",
    `${API}/api/organization/organization/${orgId}/users?page=0&size=50`,
    { token: adminToken },
  );
  const afterMemberEmails = (membersAfter.data?.content || []).map((u) => u.email);
  if (afterMemberEmails.includes(pendingPatient.emailAddress)) {
    ok("Approved patient is now a member");
  } else {
    fail("Approved patient is now a member", new Error("missing from users"));
  }
  if (!afterMemberEmails.includes(rejectPatient.emailAddress)) {
    ok("Rejected patient is not a member");
  } else {
    fail("Rejected patient is not a member", new Error("rejected still a member"));
  }

  const visiblePatient = patientPayload({ partnerSlug: orgSlug, suffix: "V" });
  const visibleReg = await json(
    "POST",
    `${API}/api/v1/registration/patients-registrations`,
    { body: visiblePatient },
  );
  if (visibleReg.status === 201 || visibleReg.status === 200) {
    ok("Visible pending signup created", visiblePatient.emailAddress);
  } else {
    fail("Visible pending signup created", new Error(JSON.stringify(visibleReg.data)));
  }

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
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 60000, script: 30000 });

  try {
    await driver.get(`${FE}/patient_signup`);
    await driver.wait(until.elementLocated(By.css("#partnerSlug")), 30000);
    await pause(800);
    const select = await driver.findElement(By.css("#partnerSlug"));
    const selectedText = await select
      .findElement(By.css("option:checked"))
      .getText();
    if (/^no partner$/i.test(selectedText.trim())) ok("Signup default is No partner");
    else fail("Signup default is No partner", new Error(selectedText));

    const optionTexts = await driver.executeScript(
      `return Array.from(document.querySelectorAll("#partnerSlug option")).map((o) => o.textContent.trim());`,
    );
    const medfairOption = optionTexts.some((t) => /^medfair(\s+direct)?$/i.test(t));
    if (!medfairOption) ok("Signup dropdown has no MedFair option");
    else fail("Signup dropdown has no MedFair option", new Error(optionTexts.join(", ")));
    await shot(driver, "signup-dropdown");

    await driver.get(`${FE}/patient_signup?partner=${encodeURIComponent(orgSlug)}`);
    await driver.wait(until.elementLocated(By.css("#partnerSlug")), 30000);
    await pause(800);
    const locked = await driver.findElement(By.css("#partnerSlug"));
    const lockedVal = await locked.getAttribute("value");
    const lockedDisabled = await locked.getAttribute("disabled");
    if (lockedVal === orgSlug && lockedDisabled) ok("Invite link locks partner");
    else fail("Invite link locks partner", new Error(`value=${lockedVal} disabled=${lockedDisabled}`));
    await shot(driver, "invite-locked");

    try {
      await driver.get(`${PARTNERS}/auth/login`);
      await driver.wait(
        until.elementLocated(By.css("input[name='email'], #email")),
        20000,
      );
      const emailEl = await driver.findElement(
        By.css("input[name='email'], #email"),
      );
      await emailEl.sendKeys(adminEmail);
      const passEl = await driver.findElement(
        By.css("input[name='password'], #password"),
      );
      await passEl.sendKeys(PASSWORD);
      const submit = await driver.findElements(By.css("button[type='submit']"));
      if (submit.length) await submit[0].click();
      await pause(3000);
      await driver.get(`${PARTNERS}/dashboard/users`);
      await driver.wait(
        until.elementLocated(By.xpath("//button[contains(.,'Pending')]")),
        20000,
      );
      const pendingTab = await driver.findElement(
        By.xpath("//button[contains(.,'Pending')]"),
      );
      await pendingTab.click();
      await driver.wait(
        until.elementLocated(
          By.xpath(`//*[contains(.,'${visiblePatient.emailAddress}')]`),
        ),
        20000,
      );
      await pause(800);
      await shot(driver, "partners-pending-user");
      const bodyText = await driver.findElement(By.css("body")).getText();
      if (bodyText.includes(visiblePatient.emailAddress)) {
        ok("Pending user visible on Partners tab", visiblePatient.emailAddress);
      } else {
        fail(
          "Pending user visible on Partners tab",
          new Error("email not on page"),
        );
      }
    } catch (err) {
      fail("Partners Pending tab opens", err);
    }
  } catch (err) {
    fail("Fatal UI", err);
    try {
      await shot(driver, "fatal");
    } catch {
      /* ignore */
    }
  } finally {
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
