// La loterie Multiplex : les photos des joueurs, déposées depuis multiplex.club/loterie (13/11/2026).
// Bucket privé « loterie-photos » : a-preparer.json (les jours à venir, envoyés par le PC chaque midi)
// et jour-NNN/photo-<horodatage>.<ext> (les photos déposées). Le PC les rapatrie avant de fabriquer la vidéo.
// Protégée par un code : seules les empreintes SHA-256 sont ici (le code de la page, le secret du PC).
import { createClient } from "jsr:@supabase/supabase-js@2";

const EMPREINTES = new Set([
  "ccbe264c0ae64e1c3b5e32af17e5720cfcc567bb637efec1de04bf711c97ae46", // la page multiplex.club/loterie
  "e40dac4a08e383514dd7d153ed917581959917cf14ad3fc8df1bd3f69bc93f79", // la fabrique sur le PC (reglages.json)
]);
const SEAU = "loterie-photos", MAX = 3;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-loterie",
  "Access-Control-Allow-Methods": "POST, OPTIONS" };
const rep = (o: unknown, status = 200) => Response.json(o, { status, headers: CORS });
const dossier = (j: number) => `jour-${String(j).padStart(3, "0")}`;

async function empreinte(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// une image reçue : ses octets (base64), une adresse data:, ou un lien (Google Images : le paramètre imgurl)
async function image(c: { data?: string; type?: string; url?: string }) {
  if (c.data) return { type: c.type || "", octets: Uint8Array.from(atob(c.data), ch => ch.charCodeAt(0)) };
  let u = String(c.url || "").trim();
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(u);
  if (m) return { type: m[1], octets: Uint8Array.from(atob(m[2]), ch => ch.charCodeAt(0)) };
  let adr: URL;
  try { adr = new URL(u); } catch { throw new Error("ce lien n'est pas une adresse"); }
  const imgurl = adr.searchParams.get("imgurl") || adr.searchParams.get("mediaurl");
  if (imgurl) { u = imgurl; adr = new URL(u); }
  if (!/^https?:$/.test(adr.protocol)) throw new Error("ce lien n'est pas une adresse web");
  const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
    "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*" }, redirect: "follow" });
  if (!r.ok) throw new Error(`le site refuse l'image (${r.status}) : enregistrez-la puis choisissez le fichier`);
  return { type: (r.headers.get("content-type") || "").split(";")[0].trim(), octets: new Uint8Array(await r.arrayBuffer()) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST" || !EMPREINTES.has(await empreinte(req.headers.get("x-loterie") || "")))
    return rep({ erreur: "code refusé" }, 403);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const seau = sb.storage.from(SEAU);
  let c: any;
  try { c = await req.json(); } catch { return rep({ erreur: "demande illisible" }, 400); }
  const jour = Number.isInteger(c.jour) && c.jour > 0 && c.jour < 10000 ? c.jour : 0;

  const photos = async (j: number) => {
    const { data, error } = await seau.list(dossier(j), { limit: 50, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    const noms = (data || []).map(f => f.name).filter(n => /^photo-\d+\.(jpg|png|webp)$/.test(n));
    if (!noms.length) return [];
    const { data: s, error: e2 } = await seau.createSignedUrls(noms.map(n => `${dossier(j)}/${n}`), 3600);
    if (e2) throw new Error(e2.message);
    return noms.map((nom, i) => ({ nom, url: s![i].signedUrl }));
  };

  try {
    // le PC envoie les jours à venir (jour, date, joueur, club…) : la page les affiche
    if (c.action === "semaine" && Array.isArray(c.jours)) {
      const corps = JSON.stringify({ maj: new Date().toISOString(), jours: c.jours.slice(0, 14) });
      const { error } = await seau.upload("a-preparer.json", new Blob([corps], { type: "application/json" }), { upsert: true, contentType: "application/json" });
      return error ? rep({ erreur: error.message }, 500) : rep({ ok: true });
    }
    // la page : les jours à venir, avec leurs photos déjà déposées
    if (c.action === "etat") {
      const { data, error } = await seau.download("a-preparer.json");
      if (error) return rep({ maj: null, jours: [] });
      const e = JSON.parse(await data.text());
      for (const t of e.jours) t.photos = await photos(t.jour);
      return rep(e);
    }
    // le PC, avant de fabriquer la vidéo du jour
    if (c.action === "liste" && jour) return rep({ photos: await photos(jour) });
    if (c.action === "depot" && jour) {
      if ((await photos(jour)).length >= MAX) return rep({ erreur: `déjà ${MAX} photos : retirez-en une d'abord` }, 409);
      const im = await image(c);
      if (!EXT[im.type]) return rep({ erreur: `format non pris (${im.type || "inconnu"}) : essayez une autre image` }, 415);
      if (im.octets.length < 2000) return rep({ erreur: "image trop petite : ouvrez-la en grand avant de la prendre" }, 415);
      if (im.octets.length > 15e6) return rep({ erreur: "image trop lourde (15 Mo au plus)" }, 413);
      const nom = `photo-${Date.now()}.${EXT[im.type]}`;
      const { error } = await seau.upload(`${dossier(jour)}/${nom}`, new Blob([im.octets], { type: im.type }), { contentType: im.type });
      return error ? rep({ erreur: error.message }, 500) : rep({ ok: true, nom });
    }
    if (c.action === "suppr" && jour && /^photo-\d+\.(jpg|png|webp)$/.test(c.nom || "")) {
      const { error } = await seau.remove([`${dossier(jour)}/${c.nom}`]);
      return error ? rep({ erreur: error.message }, 500) : rep({ ok: true });
    }
    return rep({ erreur: "demande inconnue" }, 400);
  } catch (e) {
    return rep({ erreur: (e as Error).message }, 500);
  }
});
