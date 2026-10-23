// Avant de livrer : un même homme doit porter le même nom dans toutes les tables du jeu.
// Liste les paires « X. Y. Nom » / « Prénom Nom » ↔ « X. Nom » nés à un an près, pour relecture :
// des jumeaux (Wallace, Holdsworth) ou deux hommes distincts restent ; un même homme se corrige.
// Usage : node releves/outils/controle-graphies.cjs
const fs = require("fs"), path = require("path");
const h = fs.readFileSync(path.join(__dirname, "..", "..", "championnat", "index.html"), "utf8");
const tabs = {};
for (const m of h.matchAll(/const (STARS[A-Z0-9_]*)=\{([\s\S]*?)\n\};/g)) {
  const k = /(\d{2})(\d{2})$/.exec(m[1]); const an = k ? ((+k[1] < 50 ? 2000 : 1900) + +k[1]) : 1995;
  for (const x of m[2].matchAll(/\["([^"]+)","([GDMA])",(\d+),/g)) (tabs[x[1]] = tabs[x[1]] || []).push({ t: m[1], by: an - +x[3], po: x[2] });
}
const strip = s => s.replace(/æ/g, "ae").replace(/[øØ]/g, "o").replace(/[ðđ]/g, "d").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
for (const [n, l] of Object.entries(tabs)) {
  const m = /^([A-ZÀ-Þ])\. ([A-ZÀ-Þ]\. )+(.+)$/.exec(n) || /^([A-ZÀ-Þ])[a-zà-ÿ'-]+ (?:\S+ )?(\S+)$/.exec(n);
  if (!m) continue;
  const court = strip(m[1] + ". " + m[m.length - 1]);
  for (const [g, lg] of Object.entries(tabs)) if (g !== n && strip(g) === court && lg.some(x => l.some(e => Math.abs(x.by - e.by) <= 1)))
    console.log(`${n} (${[...new Set(l.map(e => e.t))].join(",")}) ←→ ${g} (${[...new Set(lg.map(e => e.t))].join(",")})`);
}
