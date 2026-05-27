/**
 * Generates square PWA icons: MedFair symbol on top, "MedFair" wordmark below.
 * Requires: npm install sharp (dev) — or run once with npx sharp
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const symbolPath = join(root, "src/components/Home/assets/Frame 7667.png");
const outDir = join(root, "public/icons");

const sizes = [192, 512];

function buildSvg(size) {
  const pad = Math.round(size * 0.08);
  const iconBox = Math.round(size * 0.42);
  const iconY = pad + Math.round(size * 0.06);
  const textY = iconY + iconBox + Math.round(size * 0.1);
  const fontSize = Math.round(size * 0.11);
  const symbolInset = Math.round(size * 0.22);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <defs>
    <linearGradient id="mf" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <image href="file://${symbolPath.replace(/\\/g, "/")}"
         x="${symbolInset}" y="${iconY}"
         width="${size - symbolInset * 2}" height="${iconBox}"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="${size / 2}" y="${textY + fontSize * 0.35}"
        text-anchor="middle"
        font-family="Segoe UI, system-ui, Arial, sans-serif"
        font-weight="700"
        font-size="${fontSize}"
        fill="url(#mf)">MedFair</text>
</svg>`;
}

async function main() {
  if (!existsSync(symbolPath)) {
    console.error("Symbol not found:", symbolPath);
    process.exit(1);
  }

  const symbol = readFileSync(symbolPath);
  const symbolMeta = await sharp(symbol).metadata();
  const symbolAspect = symbolMeta.width / symbolMeta.height;

  for (const size of sizes) {
    const pad = Math.round(size * 0.1);
    const iconMaxH = Math.round(size * 0.44);
    const iconMaxW = Math.round(size * 0.5);
    let iconW = iconMaxW;
    let iconH = Math.round(iconW / symbolAspect);
    if (iconH > iconMaxH) {
      iconH = iconMaxH;
      iconW = Math.round(iconH * symbolAspect);
    }
    const iconX = Math.round((size - iconW) / 2);
    const iconY = Math.round(size * 0.12);

    const symbolBuf = await sharp(symbol)
      .resize(iconW, iconH, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    const fontSize = Math.round(size * 0.105);
    const textY = iconY + iconH + Math.round(size * 0.08);
    const textSvg = Buffer.from(`
      <svg width="${size}" height="${fontSize + 20}">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2563eb"/>
            <stop offset="100%" stop-color="#7c3aed"/>
          </linearGradient>
        </defs>
        <text x="50%" y="80%" text-anchor="middle"
              font-family="Segoe UI, system-ui, Arial, sans-serif"
              font-weight="700" font-size="${fontSize}" fill="url(#g)">MedFair</text>
      </svg>`);

    const textBuf = await sharp(textSvg).png().toBuffer();
    const textMeta = await sharp(textBuf).metadata();

    const outPath = join(outDir, `icon-${size}-stacked.png`);
    const stackedPath = join(outDir, `icon-${size}.png`);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: symbolBuf, left: iconX, top: iconY },
        {
          input: textBuf,
          left: Math.round((size - textMeta.width) / 2),
          top: textY,
        },
      ])
      .png()
      .toFile(outPath);

    await sharp(outPath).toFile(stackedPath);
    console.log("Wrote", outPath, "and", stackedPath);
  }

  await sharp(join(outDir, "icon-512.png")).toFile(join(root, "public/logo.png"));
  console.log("Updated public/logo.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
