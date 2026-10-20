# -*- coding: utf-8 -*-
"""Lecture des 92 pages Transfermarkt de la saison 1993-94 -> brut.json"""
import re, html, json

POSTE={'Torwart':'G',
 'Abwehr':'D','Innenverteidiger':'D','Linker Verteidiger':'D','Rechter Verteidiger':'D',
 'Mittelfeld':'M','Defensives Mittelfeld':'M','Zentrales Mittelfeld':'M',
 'Linkes Mittelfeld':'M','Rechtes Mittelfeld':'M','Offensives Mittelfeld':'M',
 'Sturm':'A','Mittelstürmer':'A','Hängende Spitze':'A','Linksaußen':'A','Rechtsaußen':'A'}

def lire(p):
    b=open(p,'rb').read()
    try: return b.decode('utf-8')
    except UnicodeDecodeError: return b.decode('cp1252','replace')

def lignes(h):
    c=re.search(r'<tbody>(.*)</tbody>', h, re.S)
    return re.split(r'<tr class="(?:odd|even)">', c.group(1) if c else h)[1:]

def cellules(L):
    s=re.sub(r'<table class="inline-table".*?</table>', '<td>@J@</td>', L, flags=re.S)
    return [re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',t))).strip()
            for t in re.findall(r'<td[^>]*>(.*?)</td>', s, re.S)]

def imbrique(L):
    m=re.search(r'<table class="inline-table".*?</table>', L, re.S)
    return m.group(0) if m else ''

CLUBS=[l.split() for l in open('clubs9394.txt')]
data={}; souci=[]
for div,code,vid,slug in CLUBS:
    k={}
    for L in lignes(lire('pages/%s-kader.html'%code)):
        sid=re.search(r'/profil/spieler/(\d+)', L)
        if not sid: continue
        sid=sid.group(1)
        imb=imbrique(L)
        nom=re.search(r'/profil/spieler/\d+">\s*([^<]+?)\s*</a>', imb)
        pos=re.findall(r'<td[^>]*>\s*([^<]+?)\s*</td>', re.sub(r'<a .*?</a>','',imb, flags=re.S))
        c=cellules(L)
        # c : [#, @J@, 'JJ.MM.AAAA (age)', nat, verein, taille, pied, im team seit, zuvor, marktwert]
        nais=None; age_tm=None
        for x in c:
            m=re.match(r'^(\d{2})\.(\d{2})\.(\d{4})\s*\((\d+)\)$', x)
            if m: nais=int(m.group(3)); age_tm=int(m.group(4)); break
        seit=None
        for x in c[3:]:
            if re.match(r'^\d{2}\.\d{2}\.\d{4}$', x): seit=x; break
        libpos=[p for p in pos if p in POSTE]
        k[sid]={'nom':nom.group(1) if nom else None,'nais':nais,'age_tm':age_tm,
                'poste':POSTE[libpos[0]] if libpos else None,
                'libpos':libpos[0] if libpos else None,'seit':seit}
        if nais is None or not libpos: souci.append((code,sid,nom.group(1) if nom else '?','naissance' if nais is None else 'poste'))
    p={}
    for L in lignes(lire('pages/%s-leistungsdaten.html'%code)):
        sid=re.search(r'/profil/spieler/(\d+)', L)
        if not sid: continue
        sid=sid.group(1)
        noms=re.findall(r'/profil/spieler/\d+">([^<]+)</a>', L)
        c=cellules(L)
        def ent(i):
            if i>=len(c): return 0
            v=re.sub(r"[^\d]",'',c[i])
            return int(v) if v else 0
        p[sid]={'complet':noms[0].strip() if noms else None,
                'court':noms[1].strip() if len(noms)>1 else None,
                'kader':ent(4),'matchs':ent(5),'min':ent(len(c)-1)}
    data[code]={'div':div,'vid':vid,'kader':k,'perf':p}

json.dump(data, open('brut.json','w'), ensure_ascii=False, indent=0)
print('clubs : %d'%len(data))
print('hommes releves : %d'%sum(len(d['kader']) for d in data.values()))
print('soucis (%d) :'%len(souci))
for s in souci[:20]: print('  ',s)
