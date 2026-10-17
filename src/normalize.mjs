// Text matching shared by the app (suggestion chips) and the server (grouping
// customers). Same idea as address tools like libpostal: clean the text the same
// way every time, then allow a small typo.
//
//   "A-135, Madhu Vihar Ln no.8"  ->  a 135 madhu vihar lane 8
//   "A135 madhu vihar"            ->  a 135 madhu vihar

// Same text however it was typed: case, extra spaces and Unicode forms ignored.
export const norm = (s) =>
  String(s ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// Words in an address that don't help tell places apart.
const FILLER = new Set(['h', 'no', 'hno', 'house', 'flat', 'plot', 'number', 'num']);

// Common short forms, written out in full.
const SHORT = {
  ln: 'lane',
  rd: 'road',
  st: 'street',
  ngr: 'nagar',
  nagr: 'nagar',
  apt: 'apartment',
  apts: 'apartments',
  sec: 'sector',
  sect: 'sector',
  blk: 'block',
  ph: 'phase',
  extn: 'extension',
  ext: 'extension',
  mkt: 'market',
  clny: 'colony',
  opp: 'opposite',
  nr: 'near',
};

// Words of any text: punctuation becomes a space, and letters and numbers that
// are stuck together are split ("A135" -> "a 135", "12B" -> "12 b").
export const words = (s) =>
  norm(s)
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .replace(/(\p{N})(?=[\p{L}\p{M}])/gu, '$1 ')
    .replace(/([\p{L}\p{M}])(?=\p{N})/gu, '$1 ')
    .split(' ')
    .filter(Boolean);

export const addressWords = (s) =>
  words(s)
    .map((w) => SHORT[w] ?? w)
    .filter((w) => !FILLER.has(w));

// One key per address, so "A-135 Madhu Vihar" and "A135 madhu vihar" are the same place.
export const addressKey = (s) => addressWords(s).join(' ');

// A customer is known by their phone, else their address (written the same way
// however it was typed: "A-135" = "A135"), else their name.
export function customerKey({ phone, address, name }) {
  const p = String(phone ?? '').replace(/\D/g, '').slice(-10);
  if (p.length >= 6) return `p:${p}`;
  if (addressKey(address)) return `a:${addressKey(address)}`;
  if (norm(name)) return `n:${norm(name)}`;
  return null;
}

// Number of single-letter edits between two words, stopping early once over `max`.
export function editDistance(a, b, max) {
  const x = Array.from(a);
  const y = Array.from(b);
  if (Math.abs(x.length - y.length) > max) return max + 1;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i += 1) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= y.length; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[y.length];
}

// A typed word matches a word if it starts it, or (3+ letters) is one letter off
// from it or from its start; long words may be two letters off.
function wordMatches(typed, word) {
  if (word.startsWith(typed)) return true;
  const len = Array.from(typed).length;
  if (len < 3) return false;
  const max = len >= 7 ? 2 : 1;
  const start = Array.from(word).slice(0, len).join('');
  return editDistance(typed, start, max) <= max || editDistance(typed, word, max) <= max;
}

// How well what he typed matches a text: 4 = the text starts with it (spaces and
// punctuation ignored), 3 = every typed word starts a word of it (any order),
// 2 = the same with small typos, 0 = no match.
export function matchScore(typed, text, toWords = words) {
  const q = toWords(typed);
  const t = toWords(text);
  if (!q.length || !t.length) return 0;
  if (t.join('').startsWith(q.join(''))) return 4;
  if (q.every((w) => t.some((tw) => tw.startsWith(w)))) return 3;
  if (q.every((w) => t.some((tw) => wordMatches(w, tw)))) return 2;
  return 0;
}
