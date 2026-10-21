# -*- coding: utf-8 -*-
"""Arrete la liste des hommes FORCES, et mesure le prix de chacun au fur et a mesure.
   Deux criteres (CLAUDE.md, 1992-93) :
     (1) une PEPITE (potentiel >= 75, 22 ans au plus) entre si la perte de note est <= 8 ;
     (2) un homme que LE JEU CONNAIT DEJA entre si sa note depasse de >= 4 celle de l'homme
         qu'il sort — et, pour ne pas refaire l'effectif a la note plutot qu'au temps de jeu,
         seulement s'il a REELLEMENT joue (90 minutes au moins)."""
import json, collections
exec(open('notes4.py').read().split('EFF={}')[0].replace("json.dump",'#json.dump'))
FORCES={}; JOURNAL=[]
for code in PLATEAU:
    places=NB[code]; elite=code in ELITE
    L=[h for h in TOUS[code] if h['sid'] not in INNOM]
    mx=max([h['poids'] for h in L] or [0]) or 1
    for h in L: h['part']=h['poids']/mx; h['n'],h['pot'],h['src']=note_de(h,h['poids']/mx,elite)
    L.sort(key=lambda h:(-h['poids'],-h['matchs']))
    forces=[]
    for tour in range(12):
        dedans=[h for h in L if h in forces][:places]
        dedans=forces+[h for h in L if h not in forces][:places-len(forces)]
        dehors=[h for h in L if h not in dedans]
        if not dehors: break
        # l'homme qu'on sortirait : la plus petite note parmi les non-forces de l'effectif
        sortables=sorted([h for h in dedans if h not in forces], key=lambda h:h['n'])
        if not sortables: break
        pire=sortables[0]
        best=None
        for h in dehors:
            age=AN-h['nais']
            pepite = h['pot']>=75 and age<=22 and (pire['n']-h['n'])<=8
            connu   = ANC.get((h['nom_jeu'],h['nais'])) and h['n']>=pire['n']+4 and h['poids']>=90
            if not (pepite or connu): continue
            cle=(0 if pepite else 1, -h['pot'] if pepite else -h['n'])
            if best is None or cle<best[0]: best=(cle,h,pepite)
        if best is None: break
        _,h,pepite=best
        forces.append(h)
        JOURNAL.append((code,h['nom_jeu'],AN-h['nais'],h['poste'],h['n'],h['pot'],h['poids'],
                        'pepite' if pepite else 'deja au jeu',pire['nom_jeu'],pire['n'],pire['n']-h['n']))
    for h in forces: FORCES[h['sid']]=code
print('%d hommes forces'%len(FORCES))
print('%-4s %-21s %-3s %s %-6s %-6s %-13s %-20s %s'%('club','nom','age','p','note','min','motif','sort','prix'))
for r in JOURNAL:
    print('%-4s %-21s %2d  %s %2d/%2d %5d  %-13s %-20s %+d'%(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[10]))
json.dump(sorted(FORCES), open('forces.json','w'))
