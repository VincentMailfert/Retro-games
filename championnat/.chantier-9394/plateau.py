# -*- coding: utf-8 -*-
"""Arrete le plateau 1993-94 : test de remplissage au cas le plus genereux,
marqueur « pas dans l'effectif » honore (regle 97/98)."""
import json, collections
B=json.load(open('brut.json'))
# classements reels verifies (Wikipedia : 1993-94 FA Premier League / 1993-94 Football League)
ELITE22=['MUN','BLB','NEW','ARS','LEE','WIM','SHW','LIV','QPR','AVL','COV','NOR','WHU','CHE',
         'TOT','MCI','EVE','SOU','IPS','SHU','OLD','SWI']
DESS24=['CPL','FOR','MIW','LEI','TRM','DER','NTC','WOL','MID','STK','CHL','SUN','BSC','BOL',
        'SND','GRI','POR','BNS','WAT','LUT','WBA','BIR','OXF','PET']
# releges de l'echelon en 1992-93, dans l'ordre du classement (candidats au repechage)
REPECHABLES=['BTF','CAM','BSR']

def hommes(code):
    d=B[code]; out=[]
    for sid,k in d['kader'].items():
        if not k['nais'] or not k['poste']: continue
        p=d['perf'].get(sid,{})
        if p.get('hors'): continue          # la source dit qu'il n'y etait pas
        out.append({'sid':sid,'club':code,'poste':k['poste'],'nais':k['nais'],'seit':k['seit'],
                    'min':p.get('min',0),'matchs':p.get('matchs',0),
                    'complet':(p.get('complet') or k['nom'] or '').strip()})
    return out

def code_seit(s):
    if not s: return 1
    j,m,a=(int(x) for x in s.split('.'))
    if (a,m,j) < (1993,8,15): return 2      # la avant le coup d'envoi
    if (a,m,j) <= (1994,6,30): return 0     # arrive EN COURS de saison
    return 1                                 # date posterieure : muette

def dedup(codes):
    T={c:hommes(c) for c in codes}
    mx={c:max([x['min'] for x in T[c]] or [0]) for c in codes}
    par=collections.defaultdict(list)
    for c in codes:
        for hm in T[c]: par[hm['sid']].append(hm)
    garde={}
    for sid,v in par.items():
        if len(v)<2: continue
        v2=sorted(v, key=lambda x:(-code_seit(x['seit']),
                   -(x['min']/mx[x['club']] if mx[x['club']] else 0), -x['min']))
        garde[sid]=v2[0]['club']
    return {c:[h for h in T[c] if h['sid'] not in garde or garde[h['sid']]==c] for c in codes}

# --- l'elite : 22 clubs reels, 20 places
print('=== ELITE : 22 clubs reels, 20 places (20 hommes chacun) ===')
for c in ELITE22:
    T=dedup([x for x in ELITE22 if x==c]+[c])  # cas le plus genereux : le club seul
    n=len(hommes(c))
    print('  %-4s rang %2d  hommes=%2d  %s'%(c,ELITE22.index(c)+1,n,'remplit' if n>=20 else 'NE REMPLIT PAS'))
ELITE=[c for c in ELITE22 if len(hommes(c))>=20][:20]
print('  -> retenus : %d  | ecartes : %s'%(len(ELITE),[c for c in ELITE22 if c not in ELITE]))

# --- l'echelon du dessous : test au cas le plus genereux, elite retenue + le club seul
print('=== DESSOUS : 24 clubs reels, 18 hommes par effectif, 20 places ===')
remplit=[]
for c in DESS24:
    T=dedup(ELITE+[c]); n=len(T[c])
    ok=n>=18
    if ok: remplit.append(c)
    print('  %-4s rang %2d  hommes=%2d  %s'%(c,DESS24.index(c)+1,n,'remplit' if ok else 'NE REMPLIT PAS'))
print('  -> remplissables : %d/%d'%(len(remplit),len(DESS24)))
print('=== REPECHABLES (releges de 1992-93) ===')
for c in REPECHABLES:
    T=dedup(ELITE+[c]); print('  %-4s hommes=%2d  %s'%(c,len(T[c]),'remplit' if len(T[c])>=18 else 'NE REMPLIT PAS'))
