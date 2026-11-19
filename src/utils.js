export function scoreColor(score) {
  if (score == null) return "#4A5568";
  if (score >= 90) return "#0A7E41";
  if (score >= 70) return "#FF6B00";
  return "#C0002A";
}

export function scoreClass(score) {
  if (score == null) return "muted";
  if (score >= 90) return "pass";
  if (score >= 70) return "warn";
  return "fail";
}

export function scoreLabel(score) {
  if (score == null) return "—";
  if (score >= 90) return "Passing";
  if (score >= 70) return "Needs Work";
  return "Failing";
}

export function splitPipe(str) {
  if (!str) return [];
  return str.split("|").map((s) => s.trim()).filter(Boolean);
}

const PASS_RE = [
  /:\s*PASS\b/i,
  /[—–]\s*compliant/i,
  /\bcompliant on\b/i,
  /no explicit violation/i,
  /aligns\s+\w*\s*well/i,
  /followed correctly/i,
  /within\s+\w+\s+limit/i,
  /meets\s+\w+\s+require/i,
];
const HEDGE_RE = /could be interpreted as|though it effectively|may be interpreted|might be considered|is not necessarily|purely subjective/i;

export function isPassCheck(text) {
  return PASS_RE.some((re) => re.test(text));
}

export function failIssues(pipe) {
  const all = splitPipe(pipe).filter((t) => !HEDGE_RE.test(t));
  // deduplicate: drop shorter if longer covers same ground
  return all.filter((iss, i) => {
    const words = iss.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
    if (words.length < 2) return true;
    return !all.some((other, j) => {
      if (j === i || other.length <= iss.length) return false;
      const matched = words.filter((w) => other.toLowerCase().includes(w));
      return matched.length >= Math.ceil(words.length * 0.55);
    });
  }).filter((t) => !isPassCheck(t));
}

export function shortLabel(text) {
  return text
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/\s+[—–]\s+.*/, "")
    .replace(/:\s*(PASS|FAIL)\b.*/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function krogerUrl(gtin, title) {
  const upc = String(gtin || "").slice(0, 13);
  const slug = (title || "").replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-");
  return upc && slug ? `https://www.kroger.com/p/${slug}/${upc}` : "";
}
