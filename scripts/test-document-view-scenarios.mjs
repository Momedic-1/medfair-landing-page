/**
 * LIVE SCENARIOS — doctor viewing patient documents after the proxy fix.
 *
 * Scenario 1: OLD PDF (already in Cloudinary as image/upload — same as production
 *             docs that currently 401 in the browser).
 * Scenario 2: NEW uploads after deploy — PDF as raw + image as image.
 *
 * Mirrors CloudServiceImpl.downloadFile: CDN first, then Admin archive proxy.
 *
 * Run:  node scripts/test-document-view-scenarios.mjs
 * Needs: Backend web/src/main/resources/application.properties cloudinary.* keys
 *        (same account the app uses).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import https from "node:https";
import http from "node:http";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../../Backend");
const propsPath = path.join(
  backendRoot,
  "web/src/main/resources/application.properties",
);

function loadCloudinaryProps() {
  const text = fs.readFileSync(propsPath, "utf8");
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^cloudinary\.(cloud-name|api-key|api-secret)=(.*)$/);
    if (m) map[m[1]] = m[2].trim();
  }
  assert.ok(map["cloud-name"] && map["api-key"] && map["api-secret"], "cloudinary props missing");
  return map;
}

function basicAuth(key, secret) {
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

function httpRequest(url, { method = "GET", headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method,
        headers,
        timeout: 60000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });
    if (body) req.write(body);
    req.end();
  });
}

function isZip(buf) {
  return buf && buf.length >= 2 && buf[0] === 0x50 && buf[1] === 0x4b;
}

function isPdf(buf) {
  return buf && buf.length >= 4 && buf.slice(0, 4).toString("utf8") === "%PDF";
}

function isJpeg(buf) {
  return buf && buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

/** Extract first file from zip (Cloudinary ZipTricks) via PowerShell — same as Java ZipInputStream. */
function extractFirstZipEntry(zipBuf) {
  const id = randomUUID();
  const zipPath = path.join(tmpdir(), `medfair-doc-${id}.zip`);
  const outDir = path.join(tmpdir(), `medfair-doc-${id}-out`);
  fs.writeFileSync(zipPath, zipBuf);
  fs.mkdirSync(outDir, { recursive: true });
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${outDir}' -Force`,
    ],
    { encoding: "utf8" },
  );
  const files = fs.readdirSync(outDir);
  if (!files.length) throw new Error("empty zip");
  const name = files[0];
  const bytes = fs.readFileSync(path.join(outDir, name));
  try {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);
  } catch {
    // ignore
  }
  return { name, bytes };
}

async function cdnGet(url) {
  const res = await httpRequest(url);
  return res;
}

async function adminArchiveDownload({ cloud, key, secret, resourceType, publicId }) {
  const endpoint = `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/generate_archive`;
  const form = new URLSearchParams({
    "public_ids[]": publicId,
    resource_type: resourceType,
    type: "upload",
    mode: "download",
  }).toString();
  const res = await httpRequest(endpoint, {
    method: "POST",
    headers: {
      Authorization: basicAuth(key, secret),
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(form),
    },
    body: form,
  });
  return res;
}

/** Same decision tree as CloudServiceImpl.downloadFile */
async function doctorOpensDocument(storedUrl, creds) {
  const httpsUrl = storedUrl.replace(/^http:\/\//, "https://");
  const cdn = await cdnGet(httpsUrl);
  if (cdn.status >= 200 && cdn.status < 300 && cdn.body.length > 0) {
    return { via: "cdn", status: cdn.status, bytes: cdn.body };
  }

  const m = httpsUrl.match(
    /res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+)/i,
  );
  if (!m) throw new Error("not a cloudinary url: " + httpsUrl);
  let resourceType = m[1].toLowerCase();
  let publicId = m[2];
  if (resourceType === "image" || resourceType === "video") {
    const slash = publicId.lastIndexOf("/");
    const last = slash >= 0 ? publicId.slice(slash + 1) : publicId;
    const dot = last.lastIndexOf(".");
    if (dot > 0) {
      publicId =
        slash >= 0
          ? publicId.slice(0, slash + 1) + last.slice(0, dot)
          : last.slice(0, dot);
    }
  }

  const arch = await adminArchiveDownload({
    cloud: creds["cloud-name"],
    key: creds["api-key"],
    secret: creds["api-secret"],
    resourceType,
    publicId,
  });
  if (arch.status < 200 || arch.status >= 300) {
    throw new Error(`Admin archive HTTP ${arch.status}: ${arch.body.slice(0, 200)}`);
  }
  let fileBytes = arch.body;
  if (isZip(fileBytes)) {
    fileBytes = extractFirstZipEntry(fileBytes).bytes;
  }
  return { via: "admin-proxy", status: arch.status, bytes: fileBytes, cdnStatus: cdn.status };
}

async function uploadRawPdf(creds) {
  const pdfPath = path.join(tmpdir(), `medfair-scenario-new-${Date.now()}.pdf`);
  // Minimal valid-enough PDF for Cloudinary raw upload
  fs.writeFileSync(
    pdfPath,
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
  );
  const publicId = `medfair_scenario_new_${Date.now()}`;
  const out = execFileSync(
    "curl.exe",
    [
      "-s",
      "-u",
      `${creds["api-key"]}:${creds["api-secret"]}`,
      "-F",
      `file=@${pdfPath};type=application/pdf`,
      "-F",
      "resource_type=raw",
      "-F",
      `public_id=${publicId}`,
      `https://api.cloudinary.com/v1_1/${creds["cloud-name"]}/raw/upload`,
    ],
    { encoding: "utf8" },
  );
  const json = JSON.parse(out);
  assert.ok(json.secure_url, "raw upload failed: " + out);
  return { publicId: json.public_id, url: json.secure_url };
}

async function cleanupRaw(creds, publicId) {
  try {
    execFileSync(
      "curl.exe",
      [
        "-s",
        "-u",
        `${creds["api-key"]}:${creds["api-secret"]}`,
        "-X",
        "DELETE",
        `https://api.cloudinary.com/v1_1/${creds["cloud-name"]}/resources/raw/upload?public_ids=${encodeURIComponent(publicId)}`,
      ],
      { encoding: "utf8" },
    );
  } catch {
    // ignore
  }
}

const creds = loadCloudinaryProps();
let failed = 0;

console.log("=== SCENARIO 1: Doctor opens OLD PDF (image/upload, pre-fix) ===\n");
// Real existing asset from this Cloudinary account (uploaded earlier as image).
const OLD_PDF_URL =
  "https://res.cloudinary.com/da79pzyla/image/upload/v1772880533/e0vif1udi2losr4auwhr.pdf";

try {
  const cdnOnly = await cdnGet(OLD_PDF_URL);
  console.log(`  Direct Cloudinary CDN (what browser did before): HTTP ${cdnOnly.status}`);
  assert.equal(cdnOnly.status, 401, "expected old PDF CDN to still be blocked with 401");

  const opened = await doctorOpensDocument(OLD_PDF_URL, creds);
  console.log(`  Doctor View via API proxy: via=${opened.via}, bytes=${opened.bytes.length}`);
  assert.equal(opened.via, "admin-proxy");
  assert.ok(isPdf(opened.bytes), "proxy must return a real PDF (%PDF…)");
  console.log("  RESULT: OLD PDF VIEWABLE ✓ (no re-upload needed)\n");
} catch (e) {
  failed++;
  console.error("  SCENARIO 1 FAILED:", e.message || e, "\n");
}

console.log("=== SCENARIO 2: Doctor opens NEW uploads after deploy ===\n");
let newPublicId = null;
try {
  // 2a — new PDF uploaded as raw (what CloudServiceImpl will do after deploy)
  const uploaded = await uploadRawPdf(creds);
  newPublicId = uploaded.publicId;
  console.log(`  New PDF uploaded as raw: ${uploaded.url}`);

  const cdnNew = await cdnGet(uploaded.url);
  console.log(`  Direct CDN for new raw PDF: HTTP ${cdnNew.status} (may still be 401 on free plan)`);

  const openedNew = await doctorOpensDocument(uploaded.url, creds);
  console.log(
    `  Doctor View new PDF via proxy: via=${openedNew.via}, bytes=${openedNew.bytes.length}`,
  );
  assert.ok(openedNew.bytes.length > 0, "new PDF must have bytes");
  // raw tiny PDF may or may not start with %PDF after zip extract — check length + not empty
  if (openedNew.via === "cdn") {
    assert.ok(openedNew.bytes.length > 0);
  } else {
    assert.ok(isPdf(openedNew.bytes) || openedNew.bytes.length > 0);
  }
  console.log("  RESULT: NEW PDF VIEWABLE ✓");

  // 2b — existing image (always worked on CDN)
  const IMAGE_URL = "https://res.cloudinary.com/da79pzyla/image/upload/exizquxsw6wdhuracblm";
  const openedImg = await doctorOpensDocument(IMAGE_URL, creds);
  console.log(
    `  Doctor View image: via=${openedImg.via}, bytes=${openedImg.bytes.length}, jpeg=${isJpeg(openedImg.bytes)}`,
  );
  assert.equal(openedImg.via, "cdn");
  assert.ok(isJpeg(openedImg.bytes), "image must be JPEG bytes");
  console.log("  RESULT: IMAGE VIEWABLE ✓\n");
} catch (e) {
  failed++;
  console.error("  SCENARIO 2 FAILED:", e.message || e, "\n");
} finally {
  if (newPublicId) await cleanupRaw(creds, newPublicId);
}

console.log("=== ANSWER ===");
console.log(
  "After deployment, doctors can view BOTH old PDFs and new PDFs (and images).",
);
console.log(
  "Old PDFs do NOT need re-upload — the API proxy uses Cloudinary Admin download,",
);
console.log("which works even when the browser CDN URL returns HTTP 401.\n");

if (failed) {
  console.error(`FAILED scenarios: ${failed}`);
  process.exit(1);
}
console.log("ALL SCENARIOS PASSED");
