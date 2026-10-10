import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { brandLogos } from "./brand";

/* ===================================================================== *
 * The logo slot.
 *
 * `brandLogos` reads a folder the school owns and reports the size of
 * whatever it finds, so that the page can reserve the right space before
 * the image arrives. Getting a size wrong stretches somebody's emblem, and
 * nobody would notice in a build log — so each format is read here from a
 * file whose real dimensions are known.
 *
 * The fixtures go in a scratch directory. An earlier version of this file
 * wrote them into `public/brand/` and tidied up after itself, which
 * deleted the school's actual logo on the first run.
 *
 * They are headers only. That is all the code reads, and a header is where
 * a wrong answer would come from.
 * ===================================================================== */

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "brand-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function put(name: string, bytes: Buffer | string): void {
  writeFileSync(join(dir, name), bytes);
}

/** 8-byte signature, then an IHDR chunk whose first two fields are the
 *  width and the height. */
function png(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  bytes.writeUInt32BE(13, 8);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

/** "GIF89a", then the logical screen size, little-endian. */
function gif(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(16);
  bytes.write("GIF89a", 0, "ascii");
  bytes.writeUInt16LE(width, 6);
  bytes.writeUInt16LE(height, 8);
  return bytes;
}

/** A RIFF container holding a lossless VP8L chunk, which packs width and
 *  height into 28 bits after a one-byte signature. */
function webp(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(40);
  bytes.write("RIFF", 0, "ascii");
  bytes.write("WEBP", 8, "ascii");
  bytes.write("VP8L", 12, "ascii");
  bytes[20] = 0x2f;
  bytes.writeUInt32LE((width - 1) | ((height - 1) << 14), 21);
  return bytes;
}

/** Start of image, then a baseline start-of-frame carrying height before
 *  width — the one format that states them the other way round. */
function jpeg(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(32);
  bytes.writeUInt16BE(0xffd8, 0);
  bytes.writeUInt16BE(0xffc0, 2);
  bytes.writeUInt16BE(17, 4);
  bytes[6] = 8;
  bytes.writeUInt16BE(height, 7);
  bytes.writeUInt16BE(width, 9);
  return bytes;
}

describe("the logo slot", () => {
  it("is empty when the folder is, and that is not an error", () => {
    expect(brandLogos(dir)).toEqual([]);
    expect(brandLogos(join(dir, "no-such-folder"))).toEqual([]);
  });

  it("reads the real size out of every format it accepts", () => {
    put("logo.png", png(320, 80));
    expect(brandLogos(dir)).toEqual([
      {
        src: "/brand/logo.png",
        name: "logo",
        vector: false,
        width: 320,
        height: 80,
      },
    ]);

    rmSync(join(dir, "logo.png"));
    put("logo.gif", gif(64, 64));
    expect(brandLogos(dir)[0]).toMatchObject({ width: 64, height: 64 });

    rmSync(join(dir, "logo.gif"));
    put("logo.webp", webp(1200, 300));
    expect(brandLogos(dir)[0]).toMatchObject({ width: 1200, height: 300 });

    rmSync(join(dir, "logo.webp"));
    put("logo.jpg", jpeg(640, 160));
    expect(brandLogos(dir)[0]).toMatchObject({ width: 640, height: 160 });
  });

  it("takes an SVG's declared size, and its viewBox when it has none", () => {
    put("logo.svg", '<svg width="200" height="50" viewBox="0 0 800 200"></svg>');
    expect(brandLogos(dir)[0]).toMatchObject({
      width: 200,
      height: 50,
      vector: true,
    });

    rmSync(join(dir, "logo.svg"));
    put(
      "logo.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200"></svg>',
    );
    expect(brandLogos(dir)[0]).toMatchObject({ width: 800, height: 200 });
  });

  it("orders two logos by file name, which is how they are swapped", () => {
    put("logo-2-school.png", png(100, 100));
    put("logo-1-ministry.png", png(200, 60));

    expect(brandLogos(dir).map((l) => l.src)).toEqual([
      "/brand/logo-1-ministry.png",
      "/brand/logo-2-school.png",
    ]);
  });

  it("ignores files that are not logos", () => {
    put("notes.txt", "not an image");
    put("banner.png", png(10, 10));
    expect(brandLogos(dir)).toEqual([]);
  });

  it("says which file it cannot read, rather than guessing a size", () => {
    put("logo.svg", "<svg>no size anywhere</svg>");
    expect(() => brandLogos(dir)).toThrow(/public\/brand\/logo\.svg/);
  });

  it("reads the folder the app ships with, without complaint", () => {
    expect(() => brandLogos()).not.toThrow();
  });
});
