# -*- coding: utf-8 -*-
"""Relit les 49 pages de temps de jeu pour en extraire le marqueur
« pas dans l'effectif cette saison » (toutes langues) -> brut.json enrichi."""
import re, html, json, collections

MARQUEURS=('nicht im kader','not in squad','not in the squad',
           "pas dans l'effectif",'no estuvo en','non in rosa')

def lire(p):
    b=open(p,'rb').read()
    try: return b.decode('utf-8')
    except UnicodeDecodeError: return b.decode('cp1252','replace')

def lignes(h):
    c=re.search(r'<tbody>(.*)</tbody>', h, re.S)
    return re.split(r'<tr class="(?:odd|even)">', c.group(1) if c else h)[1:]

B=json.load(open('brut.json'))
CLUBS=[l.split() for l in open('clubs9394.txt')]
langues=collections.Counter(); horsKader=collections.Counter(); total=0
for div,code,vid,slug in CLUBS:
    h=lire('pages/%s-leistungsdaten.html'%code)
    t=re.search(r'<title>(.*?)</title>', h, re.S)
    for L in lignes(h):
        sid=re.search(r'/profil/spieler/(\d+)', L)
        if not sid: continue
        sid=sid.group(1)
        txt=html.unescape(re.sub(r'<[^>]+>',' ',L)).lower()
        hors=any(m in txt for m in MARQUEURS)
        total+=1
        p=B[code]['perf'].setdefault(sid,{})
        p['hors']=bool(hors)
        if hors:
            horsKader[code]+=1
            for m in MARQUEURS:
                if m in txt: langues[m]+=1; break
# tout homme de la page d'effectif qu'aucune ligne de temps de jeu ne couvre : inconnu
for code in B:
    for sid in B[code]['kader']:
        B[code]['perf'].setdefault(sid,{}).setdefault('hors',False)
json.dump(B, open('brut.json','w'), ensure_ascii=False, indent=0)
print('lignes de temps de jeu relues : %d'%total)
print('hommes marques HORS EFFECTIF : %d'%sum(horsKader.values()))
print('libelles rencontres :', dict(langues))
print('par club :', dict(sorted(horsKader.items(), key=lambda x:-x[1])))
