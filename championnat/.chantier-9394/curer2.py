# -*- coding: utf-8 -*-
"""Curation ANG 1993-94, deuxieme temps : le plateau est ARRETE (journal du 20/10) et les deux
   clubs que la source a perdus entrent par leur effectif RECONSTITUE (ponts-effectifs.json).
   Ecart assume, borne a ces deux clubs : faute de la moindre minute de 1993-94 chez la source,
   leur poids dans l'effectif est le nombre de MATCHS PAR SAISON AU CLUB (base neilbrown), un
   chiffre documente, les minutes des saisons encadrantes tranchant les egalites."""
import json, collections
AN=1993
B=json.load(open('brut.json'))
PONTS=json.load(open('ponts-effectifs.json'))

# --- le plateau arrete : 22 clubs d'elite moins les deux derniers, 24 du dessous moins quatre
ELITE22=['MUN','BLB','NEW','ARS','LEE','WIM','SHW','LIV','QPR','AVL','COV','NOR','WHU','CHE',
         'TOT','MCI','EVE','SOU','IPS','SHU','OLD','SWI']
DESS24=['CPL','FOR','MIW','LEI','TRM','DER','NTC','WOL','MID','STK','CHL','SUN','BSC','BOL',
        'SND','GRI','POR','BNS','WAT','LUT','WBA','BIR','OXF','PET']
ECARTES_E=['OLD','SWI']                      # 21e et 22e
ECARTES_D=['TRM','MID','OXF','PET']          # trois ne remplissent pas, Peterborough ferme la marche
ELITE=[c for c in ELITE22 if c not in ECARTES_E]
DESSOUS=[c for c in DESS24 if c not in ECARTES_D]
assert len(ELITE)==20 and len(DESSOUS)==20
PLATEAU=ELITE+DESSOUS
PONTES=[c for c in PLATEAU if c in PONTS]
# les hommes des effectifs reconstitues sont prouves au club par la DATE EXACTE de transfert :
# ils gagnent tout arbitrage de doublon contre la source (Angell a Southend, pas Everton ;
# Jason Lee a Southend, pas Nottingham Forest)
BANNIS={h['sid'] for c in PONTES for h in PONTS[c]}

def brut_hommes(code):
    d=B[code]; out=[]
    for sid,k in d['kader'].items():
        if sid in BANNIS: continue
        if not k['nais'] or not k['poste']: continue
        p=d['perf'].get(sid,{})
        if p.get('hors'): continue           # « nicht im Kader » : il n'y etait pas (regle 97/98)
        complet=(p.get('complet') or k['nom'] or '').strip()
        if not complet: continue
        out.append({'sid':sid,'club':code,'poste':k['poste'],'nais':k['nais'],'seit':k['seit'],
                    'min':p.get('min',0),'matchs':p.get('matchs',0),'poids':p.get('min',0),
                    'complet':complet,'court_tm':(p.get('court') or '').strip(),'pont':False})
    return out

def pont_hommes(code):
    out=[]
    for h in PONTS[code]:
        out.append({'sid':h['sid'],'club':code,'poste':h['poste'],'nais':h['nais'],'seit':None,
                    'min':0,'matchs':h['apps'],'poids':h['parsaison'],
                    'complet':h['complet'] or h['nom_nb'],'court_tm':'','pont':True})
    return out

def code_seit(s):
    if not s: return 1
    j,m,a=(int(x) for x in s.replace('/','.').split('.'))
    if (a,m,j) < (1993,8,15): return 2
    if (a,m,j) <= (1994,6,30): return 0
    return 1

def dedup(codes):
    T={c:(pont_hommes(c) if c in PONTS else brut_hommes(c)) for c in codes}
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

TOUS=dedup(PLATEAU)
print('ELITE   : %s'%' '.join(ELITE))
print('  ecartes : %s'%' '.join('%s(%de)'%(c,ELITE22.index(c)+1) for c in ECARTES_E))
print('DESSOUS : %s'%' '.join(DESSOUS))
print('  ecartes : %s'%' '.join('%s(%de)'%(c,DESS24.index(c)+1) for c in ECARTES_D))
manque=0
for c in PLATEAU:
    n=len(TOUS[c]); need=20 if c in ELITE else 18
    pos=collections.Counter(h['poste'] for h in TOUS[c])
    if n<need:
        manque+=1; print('  !! %s : %d hommes pour %d places'%(c,n,need))
    for p,mini in (('G',2),('D',5),('M',5),('A',4)):
        if pos[p]<mini: print('  !! %s : %d %s pour %d exiges'%(c,pos[p],p,mini))
print('clubs en manque : %d'%manque)
print('hommes disponibles : %d'%sum(len(v) for v in TOUS.values()))

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
           'ecartes_dessous':ECARTES_D,'repeches':[],'dess24':DESS24,'elite22':ELITE22,
           'pontes':PONTES}, open('plateau.json','w'))
json.dump({c:TOUS[c] for c in PLATEAU}, open('hommes.json','w'), ensure_ascii=False)
