# -*- coding: utf-8 -*-
"""Les hommes FORCES, et le prix de chacun mesure contre L'HOMME QU'IL SORT REELLEMENT :
   le dernier de l'effectif trie aux minutes (en 1992-93, « Beckham a coute Lee Martin (71) et
   Gary Neville Neil Webb (75) »), et non le plus faible a la note.
     (1) PEPITE : potentiel >= 75, 22 ans au plus, au moins une minute jouee (jurisprudence
         Fowler/Lloris : zero minute, on n'y est pas), perte de note <= 8 ;
     (2) HOMME QUE LE JEU CONNAIT DEJA : sa note depasse de >= 4 celle de l'homme qu'il sort."""
import json, collections
exec(open('notes4.py').read().split('EFF={}')[0].replace("json.dump",'#json.dump'))
FORCES={}; JOURNAL=[]; REFUS=[]
for code in PLATEAU:
    places=NB[code]; elite=code in ELITE
    L=[h for h in TOUS[code] if h['sid'] not in INNOM]
    mx=max([h['poids'] for h in L] or [0]) or 1
    for h in L: h['n'],h['pot'],h['src']=note_de(h,h['poids']/mx,elite)
    L.sort(key=lambda h:(-h['poids'],-h['matchs']))
    base=L[:places]; hors=L[places:]
    cand=[]
    for h in hors:
        age=AN-h['nais']
        if h['pot']>=75 and age<=22 and h['poids']>0: cand.append((0,-h['pot'],h))
        elif ANC.get((h['nom_jeu'],h['nais'])): cand.append((1,-h['n'],h))
    cand.sort(key=lambda t:(t[0],t[1]))
    k=0
    for g,_,h in cand:
        sort=base[places-1-k]                     # le dernier de l'effectif trie aux minutes
        prix=sort['n']-h['n']
        ok = (prix<=8) if g==0 else (prix<=-4)
        if not ok:
            REFUS.append((code,h['nom_jeu'],AN-h['nais'],h['n'],h['pot'],h['poids'],
                          'pepite' if g==0 else 'deja au jeu',sort['nom_jeu'],sort['n'],prix)); continue
        FORCES[h['sid']]=code; k+=1
        JOURNAL.append((code,h['nom_jeu'],AN-h['nais'],h['poste'],h['n'],h['pot'],h['poids'],
                        'pepite' if g==0 else 'deja au jeu',sort['nom_jeu'],sort['n'],prix))
print('%d hommes forces, %d refus mesures'%(len(FORCES),len(REFUS)))
print('--- FORCES ---')
print('%-4s %-20s %-3s %-2s %-6s %-5s %-12s %-20s %s'%('club','nom','age','p','note','min','motif','sort','prix'))
for r in JOURNAL:
    print('%-4s %-20s %2d  %s  %2d/%2d %5d  %-12s %-20s %2d %+d'%(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10]))
print('--- REFUS (les plus chers, 14 premiers) ---')
for r in sorted(REFUS,key=lambda x:-x[9])[:14]:
    print('%-4s %-20s %2d  %2d/%2d %5d  %-12s aurait sorti %-18s %2d  (%+d)'%(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9]))
json.dump(sorted(FORCES), open('forces.json','w'))
