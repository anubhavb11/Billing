// Checks docs/wiki (and AGENTS.md) the way docs/wiki/conventions.md describes:
// links and anchors resolve, every page is reachable from index.md, frontmatter is
// present, decision records are consistent, code paths exist, and nothing looks secret.
//
//   npm run wiki:lint      # exits 1 on errors; warnings are printed but don't fail

import fs from "node:fs";
import path from "node:path";

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const wiki = path.join(repo, "docs/wiki");
const errors = [];
const warnings = [];
const rel = (f) => path.relative(repo, f);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith(".md") ? [p] : [];
  });
}

const pages = walk(wiki);
const files = [...pages, path.join(repo, "AGENTS.md")].filter((f) => fs.existsSync(f));
const text = new Map(files.map((f) => [f, fs.readFileSync(f, "utf8")]));

// Frontmatter as a flat map of "key: value" lines (lists keep their "- item" lines).
function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {};
  let key = null;
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      fm[key] = kv[2].replace(/\s+#.*$/, "");
    } else if (key && /^\s+- /.test(line)) {
      fm[key] = [...(Array.isArray(fm[key]) ? fm[key] : []), line.replace(/^\s+- /, "").replace(/^"|"$/g, "")];
    }
  }
  return fm;
}
const list = (v) => (Array.isArray(v) ? v : String(v ?? "").replace(/^\[|\]$/g, "").split(",").map((s) => s.trim()).filter(Boolean));

// Markdown with fenced and inline code removed, so examples aren't checked as links.
const prose = (src) => src.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

// GitHub-style heading anchors.
const slug = (h) =>
  h.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\- _]/gu, "").replace(/ /g, "-");
function anchors(src) {
  const seen = new Map();
  const out = new Set();
  for (const m of prose(src).matchAll(/^#{1,6} (.+)$/gm)) {
    const base = slug(m[1].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_]/g, ""));
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n ? `${base}-${n}` : base);
  }
  return out;
}

// 1. Links and anchors.
const linksFrom = new Map();
for (const [file, src] of text) {
  const targets = [];
  for (const m of prose(src).matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [p, hash] = href.split("#");
    const target = p ? path.resolve(path.dirname(file), decodeURI(p)) : file;
    if (!fs.existsSync(target)) {
      errors.push(`${rel(file)}: broken link ${href}`);
      continue;
    }
    if (target.endsWith(".md")) targets.push(target);
    if (hash && target.endsWith(".md")) {
      const src2 = text.get(target) ?? fs.readFileSync(target, "utf8");
      if (!anchors(src2).has(decodeURI(hash))) errors.push(`${rel(file)}: missing anchor ${href}`);
    }
  }
  linksFrom.set(file, targets);
}

// 2. Every wiki page is reachable from index.md.
const index = path.join(wiki, "index.md");
const reached = new Set([index]);
const queue = [index];
while (queue.length) {
  for (const t of linksFrom.get(queue.shift()) ?? []) {
    if (!reached.has(t) && text.has(t)) {
      reached.add(t);
      queue.push(t);
    }
  }
}
for (const p of pages) if (!reached.has(p)) errors.push(`${rel(p)}: not reachable from index.md`);

// 3. Frontmatter, decisions, code paths, staleness.
const today = new Date();
const decisions = new Map();
for (const p of pages) {
  const fm = frontmatter(text.get(p));
  if (!fm) {
    errors.push(`${rel(p)}: no frontmatter`);
    continue;
  }
  for (const k of ["type", "title"]) if (!fm[k]) errors.push(`${rel(p)}: frontmatter has no ${k}`);
  if (fm["last-verified"]) {
    const days = (today - new Date(fm["last-verified"])) / 86400000;
    if (days > 90) warnings.push(`${rel(p)}: last verified ${Math.round(days)} days ago`);
  }
  if (fm.type === "decision" && !path.basename(p).startsWith("_")) {
    const id = path.basename(p).slice(0, 4);
    if (fm.id !== id) errors.push(`${rel(p)}: id ${fm.id} doesn't match the file name`);
    for (const k of ["status", "date", "decision-makers"]) if (!fm[k]) errors.push(`${rel(p)}: decision has no ${k}`);
    decisions.set(id, { file: p, fm });
    for (const c of list(fm.code)) {
      const cp = c.split(" (")[0].trim();
      if (cp && !fs.existsSync(path.join(repo, cp))) errors.push(`${rel(p)}: code path not found: ${cp}`);
    }
  }
}
for (const [id, { file, fm }] of decisions) {
  for (const k of ["supersedes", "superseded-by", "related"]) {
    for (const other of list(fm[k])) if (!decisions.has(other)) errors.push(`${rel(file)}: ${k} ${other} doesn't exist`);
  }
  for (const old of list(fm.supersedes)) {
    const o = decisions.get(old);
    if (o && !list(o.fm["superseded-by"]).includes(id)) warnings.push(`${rel(o.file)}: superseded by ${id}, but superseded-by doesn't say so`);
  }
  if (/superseded/.test(fm.status) && !list(fm["superseded-by"]).length) errors.push(`${rel(file)}: status says superseded but superseded-by is empty`);
}

// 4. Nothing that looks like a secret (the repo is public).
const SECRETS = [
  [/postgres(?:ql)?:\/\/[^\s:@/]+:[^\s@/]+@/i, "database URL with a password"],
  [/\bSHOP_PIN\s*=\s*\d{3,}/, "SHOP_PIN value"],
  [/\bnpg_[A-Za-z0-9]{8,}/, "Neon password"],
  [/\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/, "GitHub token"],
  [/\bnfp_[A-Za-z0-9]{20,}/, "Netlify token"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
];
for (const [file, src] of text) {
  for (const [re, what] of SECRETS) if (re.test(src)) errors.push(`${rel(file)}: looks like a ${what}`);
}

for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`error: ${e}`);
console.log(`${pages.length} wiki pages, ${decisions.size} decisions: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
