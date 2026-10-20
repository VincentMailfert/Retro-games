# -*- coding: utf-8 -*-
"""Curation de la saison anglaise 1993-94 : plateau, hommes, noms.
   Methode : CLAUDE.md, « Saison de depart au choix » + les quatre saisons anglaises."""
import json, collections
AN=1993
B=json.load(open('brut.json'))

# ------------------------------------------------- les classements reels verifies
# Wikipedia : « 1993-94 FA Premier League » et « 1993-94 Football League »
ELITE22=['MUN','BLB','NEW','ARS','LEE','WIM','SHW','LIV','QPR','AVL','COV','NOR','WHU','CHE',
         'TOT','MCI','EVE','SOU','IPS','SHU','OLD','SWI']
DESS24=['CPL','FOR','MIW','LEI','TRM','DER','NTC','WOL','MID','STK','CHL','SUN','BSC','BOL',
        'SND','GRI','POR','BNS','WAT','LUT','WBA','BIR','OXF','PET']
# le vivier de repechage, par ordre de merite : d'abord les releges de l'echelon en 1992-93
# (22e, 23e, 24e), puis le meilleur de l'echelon INFERIEUR a n'etre pas monte (Port Vale,
# 3e de la troisieme division 1992-93, battu en finale des barrages), puis Swansea (5e).
REPECHAGE=['BTF','CAM','BSR','PTV','SWA']
PLACES_E, PLACES_D = 20, 18

def brut_hommes(code):
    d=B[code]; out=[]
    for sid,k in d['kader'].items():
        if not k['nais'] or not k['poste']: continue   # jamais de naissance devinee
        p=d['perf'].get(sid,{})
        if p.get('hors'): continue      # « pas dans l'effectif cette saison » : regle 97/98
        complet=(p.get('complet') or k['nom'] or '').strip()
        if not complet: continue
        out.append({'sid':sid,'club':code,'poste':k['poste'],'nais':k['nais'],'seit':k['seit'],
                    'min':p.get('min',0),'matchs':p.get('matchs',0),
                    'complet':complet,'court_tm':(p.get('court') or '').strip()})
    return out

def code_seit(s):
    """2 = la avant le coup d'envoi ; 0 = arrive EN COURS ; 1 = date posterieure, muette."""
    if not s: return 1
    j,m,a=(int(x) for x in s.replace('/','.').split('.'))
    if (a,m,j) < (1993,8,15): return 2
    if (a,m,j) <= (1994,6,30): return 0
    return 1

def dedup(codes, bannis=frozenset()):
    T={c:[h for h in brut_hommes(c) if h['sid'] not in bannis] for c in codes}
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

def arrete_plateau(bannis=frozenset()):
    """L'elite d'abord (les 22 remplissent, les deux derniers s'effacent), puis l'echelon du
       dessous : on garde les clubs qui remplissent SUR LE PLATEAU REELLEMENT ASSEMBLE, et on
       complete par le vivier de repechage. Converge par iteration."""
    elite=[c for c in ELITE22 if len(brut_hommes(c))>=PLACES_E][:PLACES_E]
    candidats=DESS24+REPECHAGE
    retenus=[c for c in candidats if len(brut_hommes(c))>=PLACES_D][:20]
    for _ in range(30):
        T=dedup(elite+retenus, bannis)
        courts=[c for c in retenus if len(T[c])<PLACES_D]
        if not courts: break
        for c in courts: candidats.remove(c)
        retenus=[c for c in candidats if c in DESS24 or True]
        retenus=[c for c in candidats if len(brut_hommes(c))>=PLACES_D][:20]
    return elite, retenus

ELITE,DESSOUS=arrete_plateau()
assert len(ELITE)==20 and len(DESSOUS)==20, 'plateau %d+%d'%(len(ELITE),len(DESSOUS))
ECARTES_E=[c for c in ELITE22 if c not in ELITE]
ECARTES_D=[c for c in DESS24 if c not in DESSOUS]
REPECHES=[c for c in DESSOUS if c not in DESS24]
PLATEAU=ELITE+DESSOUS
print('ELITE   (%d) : %s'%(len(ELITE),' '.join(ELITE)))
print('  ecartes : %s'%' '.join(ECARTES_E))
print('DESSOUS (%d) : %s'%(len(DESSOUS),' '.join(DESSOUS)))
print('  ecartes  : %s'%' '.join('%s(%de)'%(c,DESS24.index(c)+1) for c in ECARTES_D))
print('  repeches : %s'%' '.join(REPECHES))
TOUS=dedup(PLATEAU)
for c in PLATEAU:
    n=len(TOUS[c]); need=PLACES_E if c in ELITE else PLACES_D
    if n<need: print('  !! %s : %d hommes pour %d places'%(c,n,need))
print('hommes disponibles sur le plateau : %d'%sum(len(v) for v in TOUS.values()))

# ------------------------------------------------------------------- LES NOMS
def initiales(complet):
    mots=complet.split()
    if len(mots)<2: return ''
    p=mots[0]
    if '-' in p: return '.-'.join(x[0] for x in p.split('-') if x)+'.'
    return p[0]+'.'
def patronyme(court, complet):
    if court and '. ' in court: return court.split('. ',1)[1]
    if court and court.startswith('.'): return court.lstrip('. ')
    mots=complet.split()
    return ' '.join(mots[1:]) if len(mots)>1 else complet
for code in PLATEAU:
    for hm in TOUS[code]:
        hm['ini']=initiales(hm['complet'])
        hm['pat']=patronyme(hm['court_tm'], hm['complet'])
        hm['prenom']=hm['complet'].split()[0] if hm['complet'] else ''
        hm['mono']=len(hm['complet'].split())==1
        hm['court']=hm['complet'] if hm['mono'] else (hm['ini']+' '+hm['pat'])
        hm['plein']=hm['complet'] if hm['mono'] else (hm['prenom']+' '+hm['pat'])
json.dump({'elite':ELITE,'dessous':DESSOUS,'ecartes_elite':ECARTES_E,
           'ecartes_dessous':ECARTES_D,'repeches':REPECHES,
           'dess24':DESS24,'elite22':ELITE22,'repechage':REPECHAGE}, open('plateau.json','w'))
json.dump({c:TOUS[c] for c in PLATEAU}, open('hommes.json','w'), ensure_ascii=False)
