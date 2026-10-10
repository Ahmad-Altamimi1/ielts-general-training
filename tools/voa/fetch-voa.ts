/**
 * Fetches a VOA Learning English report: its audio and its transcript.
 *
 *   npx tsx tools/voa/fetch-voa.ts <article-url> [slug]
 *
 * VOA Learning English texts, MP3s, photos and videos are in the public
 * domain and may be reprinted for educational and commercial purposes with
 * credit to learningenglish.voanews.com. Material from news agencies —
 * AP, Reuters, AFP — is copyrighted and is not covered by that, so anything
 * fetched here is checked before it is used.
 *
 * The credit and the source URL are written alongside the transcript so
 * that provenance travels with the content and cannot be lost.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const CREDIT = "Voice of America Learning English (public domain)";
const CREDIT_URL = "https://learningenglish.voanews.com";

const AUDIO_DIR = join(process.cwd(), "public", "audio", "voa");
const DATA_DIR = join(process.cwd(), "content", "voa");

export type VoaSource = {
  slug: string;
  title: string;
  /** The page the transcript and audio came from. */
  sourceUrl: string;
  /** Where the mp3 was fetched from, for re-checking later. */
  originalAudioUrl: string;
  /** Path the app serves the audio from. */
  audio: string;
  credit: string;
  creditUrl: string;
  fetchedAt: string;
  paragraphs: string[];
};

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * How far the article body runs, counted from an opening tag.
 *
 * The body contains nested divs — embedded players, image frames — so it
 * cannot be closed by searching for the next `</div>`. Without this the
 * scan runs past the article into the share buttons and the site menu,
 * and those arrive as transcript lines.
 */
function closingDivAt(html: string, from: number): number {
  const tags = /<div\b|<\/div>/g;
  tags.lastIndex = from;

  let depth = 0;
  for (let m = tags.exec(html); m !== null; m = tags.exec(html)) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return m.index - from;
  }
  return html.length - from;
}

/**
 * The report itself: the paragraphs that are actually read aloud.
 *
 * The article body opens at `class="wsw"` but contains nested divs, so it
 * cannot be closed by matching `</div>`. It is bounded instead by the
 * glossary VOA prints after every report — "Words in This Story" — and
 * the page furniture that follows it.
 */
function transcriptFrom(html: string): string[] {
  const attribute = html.indexOf('class="wsw"');
  if (attribute === -1) return [];

  // Count from the `<div` that carries the attribute, not from the
  // attribute itself, or the first nested div closes the scan early.
  const start = html.lastIndexOf("<div", attribute);
  if (start === -1) return [];

  let body = html.slice(start, start + closingDivAt(html, start));
  const glossary = body.search(/Words in This Story/i);
  if (glossary !== -1) body = body.slice(0, glossary);

  // Page furniture and the course boilerplate VOA appends to every
  // lesson. None of it is spoken on the recording.
  const FURNITURE =
    /^(Share|Print|Follow us|See comments|Embed|No media source currently available|The URL has been copied|Download the VOA|Send us an email|Now it's your turn|Be sure to download|Write to us|See the Lesson Plan|See how well you understand|Start the Quiz|_)/i;
  // The embedded player lists its download options as list items.
  const DOWNLOAD_OPTION = /^\d+\s*kbps\b/i;

  // Paragraphs and list items together, in document order. VOA sets a
  // good deal of each report as a bulleted list — the four parts of an
  // email, the ways to practise a word — and taking only <p> silently
  // drops it, leaving a transcript that is missing what the recording
  // actually says.
  return [...body.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/g)]
    .map((m) => textOf(m[2]))
    .filter((t) => t.length > 0)
    .filter((t) => !FURNITURE.test(t))
    .filter((t) => !DOWNLOAD_OPTION.test(t))
    .filter((t) => !/^_{3,}/.test(t));
}

function audioUrlFrom(html: string): string | null {
  const urls = [...html.matchAll(/https:\/\/[^"'\s&]+?\.mp3/g)].map(
    (m) => m[0],
  );
  if (urls.length === 0) return null;
  // The plain file rather than _hq: a listening exercise does not need
  // 128 kbps, and the smaller file loads faster on a phone.
  return urls.find((u) => !u.includes("_hq")) ?? urls[0];
}

/**
 * VOA's public-domain grant does not cover material from the news
 * agencies, and a good deal of Learning English is adapted from them —
 * the report names the agency in its last line, and sometimes in a quote
 * part-way through. Anything that mentions one is refused rather than
 * saved, because the mistake is invisible once the file is in the repo.
 */
const AGENCY =
  /\b(Agence[- ]France[- ]Presse|Agence France Presse|AFP|Associated Press|\bAP\b|Reuters)\b/;

function agencyCreditIn(paragraphs: string[]): string | null {
  for (const paragraph of paragraphs) {
    const hit = AGENCY.exec(paragraph);
    if (hit) return `${hit[1]} — "${paragraph.slice(0, 120)}…"`;
  }
  return null;
}

function titleFrom(html: string): string {
  const raw =
    /<meta property="og:title" content="([^"]+)"/.exec(html)?.[1] ??
    /<title>([^<]+)<\/title>/.exec(html)?.[1] ??
    "Untitled";
  return textOf(raw).replace(/\s*\|\s*VOA Learning English\s*$/i, "");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function main(): Promise<void> {
  const [url, slugArg] = process.argv.slice(2);
  if (!url) {
    console.error("usage: tsx tools/voa/fetch-voa.ts <article-url> [slug]");
    process.exit(1);
  }

  const page = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!page.ok) {
    console.error(`${url} returned ${page.status}`);
    process.exit(1);
  }
  const html = await page.text();

  const title = titleFrom(html);
  const slug = slugArg ?? slugify(title);
  const paragraphs = transcriptFrom(html);
  const audioUrl = audioUrlFrom(html);

  if (paragraphs.length === 0) {
    console.error("No transcript found on that page.");
    process.exit(1);
  }
  if (!audioUrl) {
    console.error("No audio found on that page.");
    process.exit(1);
  }

  const agency = agencyCreditIn(paragraphs);
  if (agency) {
    console.error(
      `Refused: this report carries news-agency material, which VOA's public-domain grant excludes.\n  ${agency}\n  Pick a report written by VOA Learning English itself.`,
    );
    process.exit(1);
  }

  mkdirSync(AUDIO_DIR, { recursive: true });
  mkdirSync(DATA_DIR, { recursive: true });

  const audio = await fetch(audioUrl, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!audio.ok) {
    console.error(`audio ${audioUrl} returned ${audio.status}`);
    process.exit(1);
  }
  const bytes = Buffer.from(await audio.arrayBuffer());
  writeFileSync(join(AUDIO_DIR, `${slug}.mp3`), bytes);

  const record: VoaSource = {
    slug,
    title,
    sourceUrl: url,
    originalAudioUrl: audioUrl,
    audio: `/audio/voa/${slug}.mp3`,
    credit: CREDIT,
    creditUrl: CREDIT_URL,
    fetchedAt: new Date().toISOString(),
    paragraphs,
  };
  writeFileSync(
    join(DATA_DIR, `${slug}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );

  const words = paragraphs.join(" ").split(/\s+/).length;
  console.log(`  ${slug}`);
  console.log(`    audio       public/audio/voa/${slug}.mp3  ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);
  console.log(`    transcript  content/voa/${slug}.json  ${paragraphs.length} paragraphs, ${words} words`);
  console.log(`    source      ${url}`);
}

main();
