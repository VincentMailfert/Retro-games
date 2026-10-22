# -*- coding: utf-8 -*-
"""Les PEPITES, mecaniquement (critere 1), et la liste des candidats au critere 2 a trancher
   a la main. Le prix se mesure contre L'HOMME QU'ON SORT : le dernier de l'effectif trie aux
   minutes (en 1992-93, « Beckham a coute Lee Martin (71) »)."""
import json, collections
exec(open('notes4.py').read().split('EFF={}')[0].replace("json.dump",'#json.dump'))
PEP=[]; CAND2=[]
for code in PLATEAU:
    places=NB[code]; elite=code in ELITE
    L=[h for h in TOUS[code] if h['sid'] not in INNOM]
    mx=max([h['poids'] for h in L] or [0]) or 1
    for h in L: h['n'],h['pot'],h['src']=note_de(h,h['poids']/mx,elite)
    L.sort(key=lambda h:(-h['poids'],-h['matchs']))
    base=L[:places]; hors=L[places:]
    k=0
    # critere 1 : les pepites, du plus haut potentiel au plus bas
    for h in sorted([h for h in hors if h['pot']>=75 and AN-h['nais']<=22 and h['poids']>0],
                    key=lambda h:-h['pot']):
        sort=base[places-1-k]; prix=sort['n']-h['n']
        if prix<=8:
            PEP.append((code,h['sid'],h['nom_jeu'],AN-h['nais'],h['poste'],h['n'],h['pot'],
                        h['poids'],sort['nom_jeu'],sort['n'],prix)); k+=1
        else:
            PEP.append((code,None,h['nom_jeu'],AN-h['nais'],h['poste'],h['n'],h['pot'],
                        h['poids'],sort['nom_jeu'],sort['n'],prix))
    # critere 2 : hommes que le jeu connait deja, qui ont REELLEMENT joue — a trancher a la main
    for h in hors:
        if h['pot']>=75 and AN-h['nais']<=22 and h['poids']>0: continue
        if not ANC.get((h['nom_jeu'],h['nais'])) or h['poids']<180: continue
        sort=base[places-1-k]; prix=sort['n']-h['n']
        if prix<=-6: CAND2.append((code,h['sid'],h['nom_jeu'],AN-h['nais'],h['poste'],h['n'],
                                   h['pot'],h['poids'],sort['nom_jeu'],sort['n'],prix))
print('=== CRITERE 1 : les pepites (retenues et refusees) ===')
for r in PEP:
    print('  %-4s %-20s %2d ans %s %2d/%2d %5d min | sort %-18s %2d  prix %+d  %s'%(
        r[0],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],'RETENUE' if r[1] else 'REFUSEE'))
print('=== CRITERE 2 : candidats (jeu les connait deja, 180 min au moins, ecart >= 6) ===')
for r in sorted(CAND2,key=lambda x:x[10]):
    print('  %-4s %-20s %2d ans %s %2d/%2d %5d min | sortirait %-18s %2d  (%+d)'%(
        r[0],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10]))
json.dump([r[1] for r in PEP if r[1]], open('forces-pepites.json','w'))
json.dump({r[1]:r[2] for r in CAND2}, open('cand2.json','w'), ensure_ascii=False)
