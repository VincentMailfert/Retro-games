# -*- coding: utf-8 -*-
"""Curation de la saison anglaise 1993-94 — plateau, noms, notes."""
import re, json, unicodedata
AN=1993
INDEX='/home/user/Retro-games/championnat/index.html'

# ---------------------------------------------------------------- le plateau
ELITE=["MUN","BLB","NEW","ARS","LEE","WIM","SHW","LIV","QPR","AVL",
       "COV","NOR","WHU","CHE","TOT","MCI","EVE","SOU","IPS","SHU"]
DESSOUS=["CPL","FOR","MIW","LEI","TRM","DER","NTC","WOL","STK","CHL",
         "SUN","BSC","BOL","POR","WAT","LUT","WBA","BIR","BTF","CAM"]
# rang reel 1993-94 de chaque club, toutes divisions confondues (classements verifies)
RANG={c:i+1 for i,c in enumerate(ELITE)}
RANG.update({c:i+1 for i,c in enumerate(DESSOUS)})
PLATEAU=set(ELITE)|set(DESSOUS)

brut=json.load(open('brut.json'))
anc={}
for k,v in json.load(open('ancetres.json')).items():
    nom,nais=k.rsplit('|',1); anc[(nom,int(nais))]=v

h=open(INDEX, encoding='utf-8').read()
PRENOMS=dict(re.findall(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"',
             re.search(r'const PRENOMS_VRAIS=\{(.*?)\n\};', h, re.S).group(1)))

# ------------------------------------------------------- noms courts et longs
PARTICULES={'van','von','de','del','della','da','di','le','la','den','der','ten','ter','mc','o'}
def initiales(complet):
    """Recompose les initiales depuis le nom complet (regle 99/00)."""
    mots=complet.split()
    if len(mots)<2: return ''
    p=mots[0]
    if '-' in p:   # prenom compose : J.-J.
        return '.-'.join(x[0] for x in p.split('-') if x)+'.'
    return p[0]+'.'
def patronyme(court, complet):
    """Patronyme tel que Transfermarkt le delimite, repris sur le nom court."""
    if court and '. ' in court: return court.split('. ',1)[1]
    if court and court.startswith('.'): return court.lstrip('. ')
    mots=complet.split()
    return ' '.join(mots[1:]) if len(mots)>1 else complet
def prenom(complet):
    return complet.split()[0] if complet else ''

# ------------------------------------------------------- hommes de la source
def hommes_du_club(code):
    c=brut[code]; out=[]
    for sid,k in c['kader'].items():
        if not k['nais'] or not k['poste']: continue
        p=c['perf'].get(sid,{})
        complet=(p.get('complet') or k['nom'] or '').strip()
        court=(p.get('court') or '').strip()
        if not complet: continue
        pat=patronyme(court, complet)
        ini=initiales(complet)
        out.append({'sid':sid,'club':code,'complet':complet,'pat':pat,'ini':ini,
                    'court':(ini+' '+pat).strip() if ini else complet,
                    'poste':k['poste'],'nais':k['nais'],'seit':k['seit'],
                    'min':p.get('min',0),'matchs':p.get('matchs',0),'kader':p.get('kader',0),
                    'prenom':prenom(complet)})
    return out

TOUS={c:hommes_du_club(c) for c in PLATEAU}

# ------------------------------------------------- doublons : « Im Team seit »
def code_seit(s):
    """2 = arrive avant le coup d'envoi ; 0 = arrive EN COURS de saison ; 1 = date posterieure (muette)."""
    if not s: return 1
    j,m,a=(int(x) for x in s.split('.'))
    d=(a,m,j)
    if d < (1993,8,15): return 2
    if d <= (1994,6,30): return 0
    return 1
def part(hm):
    """Minutes rapportees a la couverture du club (regle ANG 1991-92)."""
    mx=max([x['min'] for x in TOUS[hm['club']]] or [0])
    return hm['min']/mx if mx else 0.0

par_sid={}
for code,L in TOUS.items():
    for hm in L: par_sid.setdefault(hm['sid'],[]).append(hm)
doublons={s:v for s,v in par_sid.items() if len(v)>1}

garde={}
for sid,v in doublons.items():
    v2=sorted(v, key=lambda x:(-code_seit(x['seit']), -part(x), -x['min']))
    garde[sid]=v2[0]['club']
for code in TOUS:
    TOUS[code]=[hm for hm in TOUS[code] if hm['sid'] not in garde or garde[hm['sid']]==code]

print('doublons (hommes listes dans 2 clubs ou plus du plateau) : %d'%len(doublons))
print('hommes restants : %d'%sum(len(v) for v in TOUS.values()))
json.dump({c:[{k:v for k,v in hm.items()} for hm in L] for c,L in TOUS.items()},
          open('hommes.json','w'), ensure_ascii=False)
