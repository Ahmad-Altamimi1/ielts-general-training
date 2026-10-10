import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/* ===================================================================== *
 * The logo slot.
 *
 * A logo is not content and it is not code: it is a file the school owns
 * and will want to change without being asked for a pull request. So the
 * app does not name one. It reads `public/brand/` at build time and uses
 * whatever is there — one file beside the title, two files and the title
 * sits between them, none and the title stands alone.
 *
 * Nothing here runs in the browser. The directory is read while the pages
 * are being generated, so the result is baked into the static HTML.
 * ===================================================================== */

const BRAND_DIR = join(process.cwd(), "public", "brand");

/** Shown left to right. A file named `logo-1.png` comes before `logo-2.png`
 *  because the list is sorted, which is also how you reorder them. */
const LOGO_FILE = /^logo[\w.-]*\.(svg|png|jpe?g|webp|gif)$/i;

export type BrandLogo = {
  /** Served path, e.g. `/brand/logo.png`. */
  src: string;
  width: number;
  height: number;
  /** The file's own name, used as alternative text when it is the only
   *  thing we know about the image. */
  name: string;
  /** SVG. Next's image optimiser refuses one by default, and there is
   *  nothing to gain by resizing a vector, so it is served as it is. */
  vector: boolean;
};

/**
 * The intrinsic size of an image, read from its own header.
 *
 * `next/image` needs the real dimensions to reserve space before the file
 * loads, and guessing them would stretch somebody's logo. Each format
 * below states its size in the first few bytes, so no decoding is needed.
 */
function measure(bytes: Buffer, file: string): { width: number; height: number } {
  // PNG: IHDR is always the first chunk, width and height at byte 16.
  if (bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  // GIF: little-endian width and height at byte 6.
  if (bytes.length > 10 && bytes.toString("ascii", 0, 3) === "GIF") {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  }

  // WebP: three sub-formats, each storing its size in a different place.
  if (bytes.length > 30 && bytes.toString("ascii", 8, 12) === "WEBP") {
    const chunk = bytes.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        width: 1 + bytes.readUIntLE(24, 3),
        height: 1 + bytes.readUIntLE(27, 3),
      };
    }
    if (chunk === "VP8 ") {
      return {
        width: bytes.readUInt16LE(26) & 0x3fff,
        height: bytes.readUInt16LE(28) & 0x3fff,
      };
    }
    if (chunk === "VP8L") {
      const bits = bytes.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  // JPEG: walk the markers to the start-of-frame, which carries the size.
  if (bytes.length > 4 && bytes.readUInt16BE(0) === 0xffd8) {
    let at = 2;
    while (at + 9 < bytes.length) {
      if (bytes[at] !== 0xff) break;
      const marker = bytes[at + 1];
      const length = bytes.readUInt16BE(at + 2);
      // Every SOF marker except the four that are not frames at all.
      const isFrame =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isFrame) {
        return {
          height: bytes.readUInt16BE(at + 5),
          width: bytes.readUInt16BE(at + 7),
        };
      }
      at += 2 + length;
    }
  }

  // SVG: width and height if given, otherwise the viewBox.
  if (/\.svg$/i.test(file)) {
    const text = bytes.toString("utf8", 0, 2048);
    const box = /viewBox\s*=\s*["']\s*[\d.-]+[ ,]+[\d.-]+[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(text);
    const w = /\bwidth\s*=\s*["']([\d.]+)/.exec(text);
    const h = /\bheight\s*=\s*["']([\d.]+)/.exec(text);
    if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
    if (box) return { width: Math.round(+box[1]), height: Math.round(+box[2]) };
  }

  throw new Error(
    `public/brand/${file}: cannot read this image's size.\n` +
      "  Use a PNG, JPEG, WebP, GIF, or an SVG that declares width and height or a viewBox.",
  );
}

/**
 * The logos in `public/brand/`, in file-name order.
 *
 * An empty or missing directory is the normal state of a fresh checkout,
 * not an error: the app renders its wordmark on its own.
 *
 * `dir` exists so the reader can be tested against a scratch directory.
 * Nothing in the app passes it — writing test fixtures into the live
 * folder would put a real logo at the mercy of a test run, and did once.
 */
export function brandLogos(dir: string = BRAND_DIR): BrandLogo[] {
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }

  return files
    .filter((file) => LOGO_FILE.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const bytes = readFileSync(join(dir, file));
      return {
        src: `/brand/${file}`,
        name: file.replace(/\.\w+$/, "").replace(/[-_]+/g, " "),
        vector: /\.svg$/i.test(file),
        ...measure(bytes, file),
      };
    });
}
