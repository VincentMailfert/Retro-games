# -*- coding: utf-8 -*-
"""Index des joueurs deja cures par le jeu -> ancetres.json"""
import re, json
h=open('/home/user/Retro-games/championnat/index.html', encoding='utf-8').read()
TABLES={'ANG9293':1992,'ANG9192':1991,'ANG9091':1990,'ANG9596':1995}
idx={}
for suf,an in TABLES.items():
    for nom in ('STARS_%s'%suf,'STARS_D2_%s'%suf):
        m=re.search(r'const %s=\{(.*?)\n\};'%nom, h, re.S)
        if not m: print('absent:',nom); continue
        for j in re.finditer(r'\["((?:[^"\\]|\\.)*)","([GDMA])",(\d+),(\d+),(\d+)\]', m.group(1)):
            court,poste,age,note,pot=j.group(1),j.group(2),int(j.group(3)),int(j.group(4)),int(j.group(5))
            nais=an-age
            cle=(court,nais)
            if cle not in idx or abs(an-1993)<abs(idx[cle]['an']-1993):
                idx[cle]={'an':an,'poste':poste,'note':note,'pot':pot,'age':age}
json.dump({'%s|%d'%k:v for k,v in idx.items()}, open('ancetres.json','w'), ensure_ascii=False)
print('ancres anglaises : %d'%len(idx))
par={}
for v in idx.values(): par[v['an']]=par.get(v['an'],0)+1
print('par saison :', dict(sorted(par.items())))
