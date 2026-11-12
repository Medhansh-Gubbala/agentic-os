import fs from "fs";
import path from "path";

export const VAULT_ROOT =
  process.env.VAULT_ROOT ?? path.join(process.cwd(), "vault");

export type Venture = {
  slug: string;
  seeded: boolean;
  northStar: {
    raw: string;
    frontmatter: Record<string, string>;
    title: string;
    whatThisIs: string;
    currentFocus: string;
  } | null;
  decisions: { date: string; text: string }[];
  memory: {
    raw: string;
    lastEntryDate: string | null;
    updatedAt: string; // file mtime, ISO
  } | null;
};

// ponytail: whole-venture cache keyed on max mtime of the three files; the
// vault is small (dozens of files) so a stat sweep per request is cheap even on /mnt/c
const cache = new Map<string, { stamp: string; venture: Venture }>();

function readIfExists(p: string): { text: string; mtime: number } | null {
  try {
    const st = fs.statSync(p);
    return { text: fs.readFileSync(p, "utf8"), mtime: st.mtimeMs };
  } catch {
    return null;
  }
}

export function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { frontmatter: {}, body: raw };
  const frontmatter: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) frontmatter[kv[1]] = kv[2].trim();
  }
  return { frontmatter, body: raw.slice(m[0].length) };
}

function section(body: string, heading: string): string {
  const re = new RegExp(`^##\\s+${heading}\\s*$`, "im");
  const m = re.exec(body);
  if (!m) return "";
  const rest = body.slice(m.index + m[0].length);
  const next = rest.search(/^##\s+/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

const DATED_LINE = /^-\s+(\d{4}-\d{2}-\d{2})\s*[—-]\s*(.*)$/;

function loadVenture(slug: string): Venture {
  const dir = path.join(VAULT_ROOT, slug);
  const ns = readIfExists(path.join(dir, "North Star.md"));
  const dec = readIfExists(path.join(dir, "Decisions.md"));
  const mem = readIfExists(path.join(dir, "Memory", "MEMORY.md"));

  const stamp = [ns?.mtime, dec?.mtime, mem?.mtime].join(":");
  const hit = cache.get(slug);
  if (hit && hit.stamp === stamp) return hit.venture;

  let northStar: Venture["northStar"] = null;
  if (ns) {
    const { frontmatter, body } = parseFrontmatter(ns.text);
    const title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? slug;
    northStar = {
      raw: ns.text,
      frontmatter,
      title,
      whatThisIs: section(body, "What this is"),
      currentFocus: section(body, "Current focus"),
    };
  }

  const decisions: Venture["decisions"] = [];
  if (dec) {
    for (const line of parseFrontmatter(dec.text).body.split(/\r?\n/)) {
      const m = line.match(DATED_LINE);
      if (m) decisions.push({ date: m[1], text: m[2] });
    }
  }

  let memory: Venture["memory"] = null;
  if (mem) {
    const dates = [...mem.text.matchAll(/^##\s+(\d{4}-\d{2}-\d{2})/gm)].map(
      (m) => m[1],
    );
    memory = {
      raw: mem.text,
      lastEntryDate: dates.length ? dates.sort().at(-1)! : null,
      updatedAt: new Date(mem.mtime).toISOString(),
    };
  }

  const venture: Venture = {
    slug,
    seeded: northStar !== null,
    northStar,
    decisions,
    memory,
  };
  cache.set(slug, { stamp, venture });
  return venture;
}

export function listVentures(): Venture[] {
  return fs
    .readdirSync(VAULT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => loadVenture(d.name));
}

/** Writes a NEW file under <venture>/Notes/ — never overwrites (vault is append-only-new-files).
 * Returns the absolute path written. */
export function writeVentureNote(ventureSlug: string, title: string, markdown: string): string {
  const notesDir = path.join(VAULT_ROOT, ventureSlug, "Notes");
  fs.mkdirSync(notesDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const kebab =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "note";

  const content = `# ${title}\n\n- ${date} — drafted in Command Center\n\n${markdown}\n`;

  for (let n = 0; ; n++) {
    const filename = `${date}-${kebab}${n === 0 ? "" : `-${n + 1}`}.md`;
    const filePath = path.join(notesDir, filename);
    try {
      fs.writeFileSync(filePath, content, { flag: "wx" }); // fails if file exists
      return filePath;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
    }
  }
}

export function getVenture(slug: string): Venture | null {
  if (
    slug.includes("/") ||
    slug.includes("\\") ||
    slug.includes("..") ||
    slug.startsWith("_")
  )
    return null;
  try {
    if (!fs.statSync(path.join(VAULT_ROOT, slug)).isDirectory()) return null;
  } catch {
    return null;
  }
  return loadVenture(slug);
}
