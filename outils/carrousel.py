"""Fabrique un carrousel Instagram Multiplex (1080x1350, JPG) aux couleurs du jeu.
Usage : python3 carrousel.py contenu.json dossier_sortie
contenu.json : {"prefixe": "nouveautes-2026-11-26",
  "couverture": {"titre": "...", "sous": "..."},
  "diapos": [{"kick": "NOUVEAU", "titre": "...", "texte": "...", "image": "chemin/facultatif.png"}],
  "fin": {"titre": "...", "texte": "..."}}
Polices : npm pack @fontsource/vt323 @fontsource/archivo-black @fontsource/silkscreen @fontsource/ibm-plex-sans
dans un dossier, passé par la variable FONTS (défaut /tmp/fonts, dossiers décompressés fontsource-<nom>-<version>)."""
import asyncio, json, os, sys, glob, html
from playwright.async_api import async_playwright
from PIL import Image
ICI = os.path.dirname(os.path.abspath(__file__))
F = os.environ.get("FONTS", "/tmp/fonts")
def fonte(motif):
    r = glob.glob(f"{F}/**/{motif}", recursive=True); return r[0] if r else ""
CSS = f"""
@font-face{{font-family:VT;src:url({fonte('vt323-latin-400-normal.woff2')})}}
@font-face{{font-family:Arch;src:url({fonte('archivo-black-latin-400-normal.woff2')})}}
@font-face{{font-family:Silk;src:url({fonte('silkscreen-latin-700-normal.woff2')})}}
@font-face{{font-family:Plex;font-weight:400;src:url({fonte('ibm-plex-sans-latin-400-normal.woff2')})}}
@font-face{{font-family:Plex;font-weight:600;src:url({fonte('ibm-plex-sans-latin-600-normal.woff2')})}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1350px;background:#0b1626;color:#e8eef8;font-family:Plex,sans-serif;position:relative;overflow:hidden}}
.fond{{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,#16304f 0%,#0b1626 65%)}}
.cadre{{position:absolute;inset:36px;border:4px solid #ffd24a;padding:96px 100px 150px;display:flex;flex-direction:column;justify-content:center}}
.kick{{font-family:Silk;color:#ffd24a;font-size:26px;letter-spacing:4px}}
h1{{font-family:Arch;font-size:60px;line-height:1.1;color:#fff;margin-top:22px}}
.txt{{font-size:32px;line-height:1.45;color:#c9d4e4;margin-top:30px}}
.txt b{{color:#ffd24a;font-weight:600}}
.img{{margin-top:44px;max-height:640px;display:flex;align-items:center;justify-content:center}}
.img img{{max-width:100%;max-height:100%;border:3px solid #27466e}}
.logo{{width:560px;margin:10px auto 0}}
.c h1{{text-align:center;font-size:60px;margin-top:80px}} .c .txt{{text-align:center}}
.cta{{margin-top:70px;background:#ffd24a;color:#0b1626;font-family:Arch;font-size:38px;text-align:center;padding:20px}}
.pied{{position:absolute;left:100px;right:100px;bottom:70px;display:flex;justify-content:space-between;font-family:VT;font-size:38px;color:#ffd24a}}
.pied .n{{color:#6f7f98}}
"""
def page(corps, i, n, gauche="multiplex.club"):
    return f"<html><head><style>{CSS}</style></head><body><div class=fond></div><div class=cadre>{corps}<div class=pied><span>{gauche}</span><span class=n>{i}/{n}</span></div></div></body></html>"
e = lambda s: html.escape(s or "").replace("\n", "<br>").replace("**", "\x00")
def gras(s):  # **texte** -> <b>texte</b>
    parts = e(s).split("\x00"); return "".join(p if k % 2 == 0 else f"<b>{p}</b>" for k, p in enumerate(parts))
async def main(src, out):
    c = json.load(open(src)); os.makedirs(out, exist_ok=True)
    logo = open(os.path.join(ICI, "logo.svg")).read()
    pages = []
    cv = c["couverture"]
    pages.append(f"<div class='c'><div class=logo>{logo}</div><h1>{gras(cv['titre'])}</h1><p class=txt>{gras(cv.get('sous',''))}</p></div>")
    for d in c["diapos"]:
        img = f"<div class=img><img src='file://{os.path.abspath(d['image'])}'></div>" if d.get("image") else ""
        pages.append(f"<div class=kick>{e(d.get('kick','NOUVEAU'))}</div><h1>{gras(d['titre'])}</h1><p class=txt>{gras(d.get('texte',''))}</p>{img}")
    fin = c.get("fin") or {"titre": "Gratuit, sans pub,\ndans ton navigateur.", "texte": ""}
    pages.append(f"<div class=kick>À TOI DE JOUER</div><h1>{gras(fin['titre'])}</h1><p class=txt>{gras(fin.get('texte',''))}</p><div class=cta>multiplex.club</div>")
    n = len(pages); fichiers = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1080, "height": 1350})
        for i, corps in enumerate(pages, 1):
            t = os.path.join(out, "_t.html"); open(t, "w").write(page(corps, i, n, "Lien en bio" if i == n else "multiplex.club"))
            await pg.goto("file://" + os.path.abspath(t)); await pg.wait_for_timeout(500)
            png = os.path.join(out, f"{c['prefixe']}-{i}.png"); await pg.screenshot(path=png)
            jpg = png[:-4] + ".jpg"; Image.open(png).convert("RGB").save(jpg, quality=92); os.remove(png); fichiers.append(jpg)
        await b.close()
    os.remove(os.path.join(out, "_t.html")); print("\n".join(fichiers))
asyncio.run(main(sys.argv[1], sys.argv[2]))
