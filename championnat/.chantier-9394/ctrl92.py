# -*- coding: utf-8 -*-
"""Controle : ma methode rend-elle les effectifs REELLEMENT LIVRES en 1992-93 ?"""
import re, html, json
h=open('/home/user/Retro-games/championnat/index.html',encoding='utf-8').read()
def table(nom):
    t=re.search(r'const %s=\{(.*?)\n\};'%nom, h, re.S).group(1)
    out={}
    morceaux=re.split(r'\n\s*([A-Z]{3}):', t)
    for i in range(1,len(morceaux),2):
        code=morceaux[i]
        out[code]=[x.group(1) for x in re.finditer(r'\["((?:[^"\\]|\\.)*)"', morceaux[i+1])]
    return out
LIV=table('STARS_ANG9293'); LIV.update(table('STARS_D2_ANG9293'))
MARQ=('nicht im kader','not in squad','not in the squad',"pas dans l'effectif")
def lire(p):
    b=open(p,'rb').read()
    try: return b.decode('utf-8')
    except UnicodeDecodeError: return b.decode('cp1252','replace')
def lignes(x):
    c=re.search(r'<tbody>(.*)</tbody>', x, re.S)
    return re.split(r'<tr class="(?:odd|even)">', c.group(1) if c else x)[1:]
for code in ['CHL','LUT','NTC','WAT']:
    hp=lire('ctrl92/%s-leistungsdaten.html'%code)
    hors=[]
    for L in lignes(hp):
        s=re.search(r'/profil/spieler/(\d+)', L)
        if not s: continue
        nn=re.findall(r'/profil/spieler/\d+">([^<]+)</a>', L)
        court=nn[1].strip() if len(nn)>1 else (nn[0].strip() if nn else '?')
        plein=nn[0].strip() if nn else '?'
        if any(x in html.unescape(re.sub(r'<[^>]+>',' ',L)).lower() for x in MARQ):
            hors.append((court,plein))
    livre=set(LIV.get(code,[]))
    dedans=[c for c,p in hors if c in livre or p in livre]
    print('%s : livre=%2d hommes | marques hors=%2d %s | dont LIVRES=%d %s'%(
        code,len(livre),len(hors),[c for c,_ in hors],len(dedans),dedans))
