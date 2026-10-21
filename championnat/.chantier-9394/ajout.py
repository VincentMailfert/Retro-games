# -*- coding: utf-8 -*-
"""Parse les clubs ajoutes (clubs-extra.txt) et les fond dans brut.json."""
import re, html, json
POSTE={
 # allemand
 'Torwart':'G','Abwehr':'D','Innenverteidiger':'D','Linker Verteidiger':'D','Rechter Verteidiger':'D',
 'Mittelfeld':'M','Defensives Mittelfeld':'M','Zentrales Mittelfeld':'M','Linkes Mittelfeld':'M',
 'Rechtes Mittelfeld':'M','Offensives Mittelfeld':'M',
 'Sturm':'A','Mittelstürmer':'A','Hängende Spitze':'A','Linksaußen':'A','Rechtsaußen':'A',
 # anglais
 'Goalkeeper':'G','Defender':'D','Defence':'D','Centre-Back':'D','Left-Back':'D','Right-Back':'D',
 'Sweeper':'D','Midfield':'M','Defensive Midfield':'M','Central Midfield':'M','Left Midfield':'M',
 'Right Midfield':'M','Attacking Midfield':'M','Attack':'A','Centre-Forward':'A','Second Striker':'A',
 'Left Winger':'A','Right Winger':'A',
 # francais (libelles precis ET generiques)
 'Gardien':'G','Gardien de but':'G','Défense':'D','Défenseur central':'D','Arrière gauche':'D',
 'Arrière droit':'D','Libéro':'D','Milieu':'M','Milieu défensif':'M','Milieu central':'M',
 'Milieu gauche':'M','Milieu droit':'M','Milieu offensif':'M','Attaque':'A','Avant-centre':'A',
 'Deuxième attaquant':'A','Ailier gauche':'A','Ailier droit':'A'}
MARQ=('nicht im kader','not in squad','not in the squad',"pas dans l'effectif")
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
B=json.load(open('brut.json'))
for l in open('clubs-extra.txt'):
    div,code,vid,slug=l.split()
    k={}
    for L in lignes(lire('pages/%s-kader.html'%code)):
        sid=re.search(r'/profil/spieler/(\d+)', L)
        if not sid: continue
        sid=sid.group(1); imb=imbrique(L)
        nom=re.search(r'/profil/spieler/\d+">\s*([^<]+?)\s*</a>', imb)
        pos=re.findall(r'<td[^>]*>\s*([^<]+?)\s*</td>', re.sub(r'<a .*?</a>','',imb, flags=re.S))
        c=cellules(L)
        nais=None
        for x in c:
            m=re.match(r'^(\d{2})[./](\d{2})[./](\d{4})\s*\((\d+)\)$', x)
            if m: nais=int(m.group(3)); break
        seit=None
        for x in c[3:]:
            if re.match(r'^\d{2}[./]\d{2}[./]\d{4}$', x): seit=x.replace('/','.'); break
        libpos=[p for p in pos if p in POSTE]
        k[sid]={'nom':nom.group(1) if nom else None,'nais':nais,
                'poste':POSTE[libpos[0]] if libpos else None,
                'libpos':libpos[0] if libpos else None,'seit':seit}
    p={}
    for L in lignes(lire('pages/%s-leistungsdaten.html'%code)):
        sid=re.search(r'/profil/spieler/(\d+)', L)
        if not sid: continue
        sid=sid.group(1)
        noms=re.findall(r'/profil/spieler/\d+">([^<]+)</a>', L)
        c=cellules(L)
        def ent(i):
            if i>=len(c): return 0
            v=re.sub(r"[^\d]",'',c[i]); return int(v) if v else 0
        txt=html.unescape(re.sub(r'<[^>]+>',' ',L)).lower()
        p[sid]={'complet':noms[0].strip() if noms else None,
                'court':noms[1].strip() if len(noms)>1 else None,
                'kader':ent(4),'matchs':ent(5),'min':ent(len(c)-1),
                'hors':any(m in txt for m in MARQ)}
    for sid in k: p.setdefault(sid,{}).setdefault('hors',False)
    B[code]={'div':div,'vid':vid,'kader':k,'perf':p}
    net=sum(1 for sid,x in k.items() if x['nais'] and x['poste'] and not p.get(sid,{}).get('hors'))
    print('%s : lignes=%d  exploitables (date+poste, hors effectif ecartes)=%d'%(code,len(k),net))
json.dump(B, open('brut.json','w'), ensure_ascii=False, indent=0)
