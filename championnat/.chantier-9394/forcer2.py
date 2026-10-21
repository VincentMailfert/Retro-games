# -*- coding: utf-8 -*-
"""Arrete la liste des hommes FORCES, et mesure le prix de chacun.
   Deux criteres (CLAUDE.md, 1992-93), et le second se juge UNE SEULE FOIS contre l'effectif
   trie aux minutes : le forcage en cascade refait l'effectif a la note et non au temps de jeu
   (eprouve : il sortait David White de Manchester City, douzieme aux minutes).
     (1) une PEPITE (potentiel >= 75, 22 ans au plus) entre si la perte de note est <= 8 ;
     (2) un homme que LE JEU CONNAIT DEJA entre si sa note depasse de >= 4 celle du plus faible
         de l'effectif, s'il a REELLEMENT joue (90 minutes au moins), et deux par club au plus."""
import json, collections
exec(open('notes4.py').read().split('EFF={}')[0].replace("json.dump",'#json.dump'))
FORCES={}; JOURNAL=[]
for code in PLATEAU:
    places=NB[code]; elite=code in ELITE
    L=[h for h in TOUS[code] if h['sid'] not in INNOM]
    mx=max([h['poids'] for h in L] or [0]) or 1
    for h in L: h['n'],h['pot'],h['src']=note_de(h,h['poids']/mx,elite)
    L.sort(key=lambda h:(-h['poids'],-h['matchs']))
    base=L[:places]; hors=L[places:]
    if not hors: continue
    pire=min(base, key=lambda h:h['n'])          # l'homme que le forcage sortirait
    cand=[]
    for h in hors:
        age=AN-h['nais']
        if h['pot']>=75 and age<=22 and (pire['n']-h['n'])<=8: cand.append((0,-h['pot'],h))
        elif ANC.get((h['nom_jeu'],h['nais'])) and h['n']>=pire['n']+4 and h['poids']>=90:
            cand.append((1,-h['n'],h))
    cand.sort(key=lambda t:(t[0],t[1]))
    pep=[t for t in cand if t[0]==0]
    con=[t for t in cand if t[0]==1][:2]         # deux par club au plus
    # les sortants : les plus faibles de l'effectif, autant que d'entrants
    pris=pep+con
    sortants=sorted(base, key=lambda h:h['n'])[:len(pris)]
    for (g,_,h),s in zip(pris,sortants):
        FORCES[h['sid']]=code
        JOURNAL.append((code,h['nom_jeu'],AN-h['nais'],h['poste'],h['n'],h['pot'],h['poids'],
                        'pepite' if g==0 else 'deja au jeu',s['nom_jeu'],s['n'],s['n']-h['n']))
print('%d hommes forces'%len(FORCES))
print('%-4s %-20s %-3s %-2s %-6s %-5s %-12s %-20s %s'%('club','nom','age','p','note','min','motif','sort','prix'))
for r in JOURNAL:
    print('%-4s %-20s %2d  %s  %2d/%2d %5d  %-12s %-20s %+d'%(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[10]))
json.dump(sorted(FORCES), open('forces.json','w'))
