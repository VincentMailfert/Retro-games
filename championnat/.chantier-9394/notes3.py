# -*- coding: utf-8 -*-
"""Selection des effectifs, noms, notes. Lit hommes.json + plateau.json."""
import json, collections, sys
AN=1993
P=json.load(open('plateau.json')); ELITE=P['elite']; DESSOUS=P['dessous']
PLATEAU=ELITE+DESSOUS
TOUS=json.load(open('hommes.json'))
ANC={}
for k,v in json.load(open('ancetres.json')).items():
    nom,nais=k.rsplit('|',1); ANC[(nom,int(nais))]=v
PRIS={k:set(v) for k,v in json.load(open('noms-pris.json')).items()}
RANG={c:i+1 for i,c in enumerate(ELITE)}
RANG.update({c:i+1 for i,c in enumerate(DESSOUS)})
NB={**{c:20 for c in ELITE}, **{c:18 for c in DESSOUS}}
MINI={'G':2,'D':5,'M':5,'A':4}
FORCES=set(json.load(open('forces.json'))) if __import__('os').path.exists('forces.json') else set()
AJUST=json.load(open('ajust.json')) if __import__('os').path.exists('ajust.json') else {}

# ------------------------------------------------------------------- LES NOMS
def libre(nom, nais):
    """Un nom est libre s'il n'est porte par aucun AUTRE homme du jeu (regle 02/03 :
       un nom court designe le MEME homme d'une saison anglaise a l'autre)."""
    return nom not in PRIS or nais in PRIS[nom]

INNOM=set()      # sid des hommes sans aucun nom libre, ecartes et remplaces
def attribution():
  global attribue
  attribue={}      # nom -> sid
  for code in PLATEAU:
    for hm in TOUS[code]: hm['nom_jeu']=None
  # 1er temps : l'homme que le jeu connait DEJA sous ce nom le reprend
  for code in PLATEAU:
    for hm in TOUS[code]:
        if hm['sid'] in INNOM: continue
        for cand in ([hm['court']] if hm['mono'] else [hm['court'],hm['plein']]):
            if cand in PRIS and hm['nais'] in PRIS[cand] and cand not in attribue:
                hm['nom_jeu']=cand; attribue[cand]=hm['sid']; break
  # 2e temps : les autres, le plus utilise d'abord (convention 99/00)
  reste=[hm for code in PLATEAU for hm in TOUS[code]
         if not hm['nom_jeu'] and hm['sid'] not in INNOM]
  reste.sort(key=lambda h:(-h['poids'],-h['matchs']))
  innommables=[]
  for hm in reste:
    for cand in ([hm['court']] if hm['mono'] else [hm['court'],hm['plein']]):
        if cand not in attribue and libre(cand,hm['nais']):
            hm['nom_jeu']=cand; attribue[cand]=hm['sid']; break
    if not hm['nom_jeu']: innommables.append(hm)
  return innommables

while True:
    innommables=attribution()
    if not innommables: break
    for hm in innommables:
        print('   INNOMMABLE, ECARTE : %s (%s, ne %d, %s) formes prises : %s / %s'%(
            hm['complet'],hm['club'],hm['nais'],hm['poste'],hm['court'],hm['plein']))
        INNOM.add(hm['sid'])
        if len([h for h in TOUS[hm['club']] if h['sid'] not in INNOM]) < (20 if hm['club'] in ELITE else 18):
            raise SystemExit('%s n a plus de quoi remplir : le club doit s effacer'%hm['club'])
print('hommes sans aucun nom libre : 0 apres %d ecart(s)'%len(INNOM))

# ------------------------------------------------------------------ LES NOTES
def pas_vieil(note, age):
    if age<=21: return 2
    if age<=24: return 1
    if age<=29: return 0
    if age<=32: return -1
    return -2
def vieillir(note, age0, d):
    for t in range(d): note+=pas_vieil(note, age0+t)
    return note
def rajeunir(note, age0, d):
    for t in range(d): note-=pas_vieil(note, age0-1-t)
    return note

COURBE={15:-9,16:-9,17:-8,18:-8,19:-7,20:-6,21:-5,22:-4,23:-3,24:-2,25:-1,
        26:0,27:0,28:0,29:0,30:0,31:-1,32:-2,33:-3,34:-4,35:-5,36:-6,37:-7,38:-8,39:-9,40:-9}
def calculee(hm, part, elite):
    base=70 if elite else 67
    r=RANG[hm['club']]
    base+= round((10.5-r)/2.0) if elite else round((10.5-r)/2.5)
    if   part>=0.80: base+=4
    elif part>=0.60: base+=2
    elif part>=0.35: base+=0
    elif part>=0.15: base-=2
    else:            base-=4
    base+=COURBE.get(AN-hm['nais'],-8)
    return max(55,min(88,base))
def potentiel_calc(note, age):
    if age>=26: return min(97,note+1)
    return min(93, note+min(22, round((26-age)*1.7)))

def note_de(hm, part, elite):
    age=AN-hm['nais']
    a=ANC.get((hm['nom_jeu'],hm['nais']))
    calc=calculee(hm,part,elite)
    if a:
        d=AN-a['an']
        if d>0:
            n=vieillir(a['note'],a['age'],d); src='herite%+d'%d
        else:
            n=round((rajeunir(a['note'],a['age'],-d)+calc)/2); src='moyenne%+d'%d
        pot=a['pot']                          # le potentiel se reprend tel quel (regle 91/92)
    else:
        n=calc; pot=potentiel_calc(n,age); src='calcule'
    if hm['nom_jeu'] in AJUST:
        v=AJUST[hm['nom_jeu']]
        if isinstance(v,list): n,pot=v[0],(v[1] if len(v)>1 and v[1] else pot)
        else: n=v
        src+='+ajust'
    n=max(55,min(90,int(n))); pot=max(n,min(97,int(pot)))
    return n,pot,src

# -------------------------------------------------------------- LA SELECTION
def selectionne(code):
    elite=code in ELITE; places=NB[code]
    L=[h for h in TOUS[code] if h['sid'] not in INNOM]
    mx=max([h['poids'] for h in L] or [0]) or 1
    for h in L: h['part']=h['poids']/mx
    L.sort(key=lambda h:(-h['poids'],-h['matchs']))
    choisis=[h for h in L if h['sid'] in FORCES][:places]
    for h in L:
        if len(choisis)>=places: break
        if h not in choisis: choisis.append(h)
    # reparation des postes : on promeut le meilleur du poste manquant, on sort le dernier
    # d'un poste en surnombre, jamais un force
    for _ in range(40):
        pos=collections.Counter(h['poste'] for h in choisis)
        manque=[p for p in 'GDMA' if pos[p]<min(MINI[p],sum(1 for h in L if h['poste']==p))]
        if not manque: break
        p=manque[0]
        cand=[h for h in L if h['poste']==p and h not in choisis]
        if not cand: break
        sur=sorted([h for h in choisis if h['sid'] not in FORCES and pos[h['poste']]>MINI[h['poste']]],
                   key=lambda h:(h['poids'],h['matchs']))
        if not sur: break
        choisis.remove(sur[0]); choisis.append(cand[0])
    return choisis[:places]

EFF={}; src_tot=collections.Counter(); notes_el=[]; notes_de=[]
for code in PLATEAU:
    ch=selectionne(code)
    rows=[]
    for hm in ch:
        n,pot,src=note_de(hm, hm['part'], code in ELITE)
        src_tot[src.split('+')[0]]+=1
        rows.append([hm['nom_jeu'],hm['poste'],AN-hm['nais'],n,pot,hm['sid'],hm['prenom'],hm['complet']])
        (notes_el if code in ELITE else notes_de).append(n)
    ordre={'G':0,'D':1,'M':2,'A':3}
    rows.sort(key=lambda r:(ordre[r[1]],-r[3]))
    EFF[code]=rows
    if len(rows)!=NB[code]: print('  !! %s a %d hommes pour %d places'%(code,len(rows),NB[code]))

import statistics as st
print('hommes retenus : %d (elite %d, dessous %d)'%(sum(len(v) for v in EFF.values()),
      sum(len(EFF[c]) for c in ELITE), sum(len(EFF[c]) for c in DESSOUS)))
print('origine des notes :', dict(src_tot))
print('elite   : moyenne %.1f  mediane %d  min %d  max %d'%(st.mean(notes_el),st.median(notes_el),min(notes_el),max(notes_el)))
print('dessous : moyenne %.1f  mediane %d  min %d  max %d'%(st.mean(notes_de),st.median(notes_de),min(notes_de),max(notes_de)))
json.dump(EFF, open('effectifs.json','w'), ensure_ascii=False)
