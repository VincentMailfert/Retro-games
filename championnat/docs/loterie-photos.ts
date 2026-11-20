// La loterie Multiplex : les photos des joueurs, déposées depuis multiplex.club/loterie (13/11/2026).
// Bucket privé « loterie-photos » : a-preparer.json (les jours à venir, envoyés par le PC chaque midi)
// et jour-NNN/photo-<horodatage>.<ext> (les photos déposées). Le PC les rapatrie avant de fabriquer la vidéo.
// Protégée par un code : seules les empreintes SHA-256 sont ici (le code de la page, le secret du PC).
// Depuis le 20/11/2026 : un joueur introuvable se retire de la page (action « ecarte »). Les joueurs suivants
// avancent d'un jour, leurs photos avec eux, et la réserve (les deux tirages après la semaine) comble le trou.
// Le retrait est noté dans ecartes.json ; le PC le refait chez lui à midi, puis le marque vu.
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
const PHOTO = /^photo-\d+\.(jpg|png|webp)$/;
const parisJour = (d: Date) => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(d);
const parisHeure = (d: Date) => +new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric", hourCycle: "h23" }).format(d);

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

  const noms = async (j: number) => {
    const { data, error } = await seau.list(dossier(j), { limit: 50, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    return (data || []).map(f => f.name).filter(n => PHOTO.test(n));
  };
  const photos = async (j: number) => {
    const n = await noms(j);
    if (!n.length) return [];
    const { data: s, error: e2 } = await seau.createSignedUrls(n.map(x => `${dossier(j)}/${x}`), 3600);
    if (e2) throw new Error(e2.message);
    return n.map((nom, i) => ({ nom, url: s![i].signedUrl }));
  };
  const litJson = async (f: string, defaut: any) => {
    const { data, error } = await seau.download(f);
    if (error) return defaut;
    try { return JSON.parse(await data.text()); } catch { return defaut; }
  };
  const ecritJson = async (f: string, o: unknown) => {
    const { error } = await seau.upload(f, new Blob([JSON.stringify(o)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
    if (error) throw new Error(error.message);
  };

  try {
    // le PC envoie les jours à venir (jour, date, joueur, club…) et la fin de la semaine (après : la réserve).
    // Il dit aussi quels retraits il a refaits chez lui (vus). Un retrait qu'il n'a pas encore vu : on garde
    // la page telle quelle (elle a déjà avancé), le PC le verra demain.
    if (c.action === "semaine" && Array.isArray(c.jours)) {
      const vus = new Set((Array.isArray(c.vus) ? c.vus : []).map(Number));
      const ecartes = (await litJson("ecartes.json", [])) as any[];
      const reste = ecartes.filter(e => !vus.has(e.id));
      if (reste.length !== ecartes.length) await ecritJson("ecartes.json", reste);
      if (reste.length) return rep({ erreur: `retrait en attente (jour ${reste[0].jour}) : la page n'est pas remplacée` }, 409);
      await ecritJson("a-preparer.json", { maj: new Date().toISOString(), fin: Number.isInteger(c.fin) ? c.fin : null, jours: c.jours.slice(0, 14) });
      return rep({ ok: true });
    }
    // le PC, avant tout : les retraits faits sur la page depuis son dernier passage, dans l'ordre
    if (c.action === "ecartes") return rep({ ecartes: await litJson("ecartes.json", []) });
    // la page : les jours à venir, avec leurs photos déjà déposées
    if (c.action === "etat") {
      const e = await litJson("a-preparer.json", null);
      if (!e) return rep({ maj: null, fin: null, jours: [] });
      for (const t of e.jours) t.photos = await photos(t.jour);
      return rep(e);
    }
    // la page : « rien trouvé pour ce joueur ». Ses photos partent, les suivants avancent d'un jour avec les leurs.
    if (c.action === "ecarte" && jour) {
      const e = await litJson("a-preparer.json", null);
      const jours = (e?.jours || []).slice().sort((a: any, b: any) => a.jour - b.jour);
      const i = jours.findIndex((t: any) => t.jour === jour);
      if (i < 0) return rep({ erreur: "ce jour n'est plus dans la liste : rechargez la page" }, 404);
      if (c.nom && jours[i].nom !== c.nom) return rep({ erreur: "la liste a changé entre-temps : rechargez la page" }, 409);
      const auj = parisJour(new Date());
      if (jours[i].date < auj || (jours[i].date === auj && parisHeure(new Date()) >= 12))
        return rep({ erreur: "sa vidéo est déjà faite : trop tard pour le retirer" }, 409);
      const anciennes = await noms(jour);
      if (anciennes.length) { const { error } = await seau.remove(anciennes.map(n => `${dossier(jour)}/${n}`)); if (error) throw new Error(error.message); }
      for (let k = i + 1; k < jours.length; k++) {
        const de = jours[k].jour, vers = jours[k - 1].jour;
        for (const n of await noms(de)) {
          const { error } = await seau.move(`${dossier(de)}/${n}`, `${dossier(vers)}/${n}`);
          if (error) throw new Error(error.message);
        }
      }
      const retire = jours[i];
      const suite = jours.map((t: any, k: number) => k < i ? t : k === jours.length - 1 ? null
        : Object.assign({}, jours[k + 1], { jour: t.jour, date: t.date })).filter(Boolean);
      const ecartes = (await litJson("ecartes.json", [])) as any[];
      ecartes.push({ id: Date.now(), jour, nom: retire.nom, quand: new Date().toISOString() });
      await ecritJson("ecartes.json", ecartes);
      await ecritJson("a-preparer.json", Object.assign({}, e, { jours: suite }));
      return rep({ ok: true, retire: retire.nom });
    }
    // le PC, avant de fabriquer la vidéo du jour
    if (c.action === "liste" && jour) return rep({ photos: await photos(jour) });
    if (c.action === "depot" && jour) {
      if ((await noms(jour)).length >= MAX) return rep({ erreur: `déjà ${MAX} photos : retirez-en une d'abord` }, 409);
      const im = await image(c);
      if (!EXT[im.type]) return rep({ erreur: `format non pris (${im.type || "inconnu"}) : essayez une autre image` }, 415);
      if (im.octets.length < 2000) return rep({ erreur: "image trop petite : ouvrez-la en grand avant de la prendre" }, 415);
      if (im.octets.length > 15e6) return rep({ erreur: "image trop lourde (15 Mo au plus)" }, 413);
      const nom = `photo-${Date.now()}.${EXT[im.type]}`;
      const { error } = await seau.upload(`${dossier(jour)}/${nom}`, new Blob([im.octets], { type: im.type }), { contentType: im.type });
      return error ? rep({ erreur: error.message }, 500) : rep({ ok: true, nom });
    }
    if (c.action === "suppr" && jour && PHOTO.test(c.nom || "")) {
      const { error } = await seau.remove([`${dossier(jour)}/${c.nom}`]);
      return error ? rep({ erreur: error.message }, 500) : rep({ ok: true });
    }
    return rep({ erreur: "demande inconnue" }, 400);
  } catch (e) {
    return rep({ erreur: (e as Error).message }, 500);
  }
});
