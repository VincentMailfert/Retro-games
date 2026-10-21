# -*- coding: utf-8 -*-
"""Les pepites que le tri aux minutes ecarte, et le PRIX de chacune (l'homme qu'elle sort).
   Deux criteres (CLAUDE.md) : une pepite (potentiel >= 75) entre si la perte de note est <= 8 ;
   un homme que le jeu connait deja entre si sa note depasse de >= 4 celle de l'homme qu'il sort."""
import json, collections, subprocess, sys
exec(open('notes4.py').read().split('EFF={}')[0].replace("json.dump",'#json.dump'))
print('--- hommes hors effectif, par club : pepites (<=22 ans) et hommes deja au jeu ---')
for code in PLATEAU:
    places=NB[code]
    L=[h for h in TOUS[code] if h['sid'] not in INNOM]
    mx=max([h['poids'] for h in L] or [0]) or 1
    for h in L: h['part']=h['poids']/mx
    L.sort(key=lambda h:(-h['poids'],-h['matchs']))
    dedans=L[:places]; dehors=L[places:]
    if not dehors: continue
    # le dernier qu'on peut sortir : la plus petite note parmi ceux dans l'effectif
    notes_dedans=sorted(((note_de(h,h['part'],code in ELITE)[0],h) for h in dedans), key=lambda t:t[0])
    pire=notes_dedans[0]
    for h in dehors:
        n,pot,src=note_de(h,h['part'],code in ELITE)
        age=AN-h['nais']
        anc=ANC.get((h['nom_jeu'],h['nais']))
        interesse = (pot>=75 and age<=22) or (anc and n>=pire[0]+4)
        if not interesse: continue
        print('  %-4s %-21s %2d ans %s %2d/%2d %-9s min=%-5d | sortirait %-20s %2d  (perte %+d)'%(
            code,h['nom_jeu'],age,h['poste'],n,pot,src,h['poids'],pire[1]['nom_jeu'],pire[0],pire[0]-n))
