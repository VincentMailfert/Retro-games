# -*- coding: utf-8 -*-
"""Emet les tables de la saison ANG 1993-94 au format exact d'index.html, et la liste des
   prenoms neufs a ajouter a PRENOMS_VRAIS."""
import json, re, collections
E=json.load(open('effectifs.json')); P=json.load(open('plateau.json'))
ELITE=P['elite']; DESSOUS=P['dessous']
def bloc(code, rows):
    ordre={'G':0,'D':1,'M':2,'A':3}
    rows=sorted(rows, key=lambda r:(ordre[r[1]],-r[3]))
    parts=[]
    for p in 'GDMA':
        L=[r for r in rows if r[1]==p]
        if L: parts.append(','.join('["%s","%s",%d,%d,%d]'%(r[0],r[1],r[2],r[3],r[4]) for r in L))
    return ' %s:[%s]'%(code, (',\n   ').join(parts))
for titre,liste,nom in (('STARS_ANG9394',ELITE,'D1'),('STARS_D2_ANG9394',DESSOUS,'D2')):
    with open('out-%s.js'%titre,'w') as f:
        f.write('const %s={\n'%titre)
        f.write(',\n'.join(bloc(c,E[c]) for c in liste))
        f.write('\n};\n')
with open('out-divisions.js','w') as f:
    f.write('const D1_ANG9394=%s;\n'%json.dumps(ELITE).replace(', ',','))
    f.write('const D2_ANG9394=%s;\n'%json.dumps(DESSOUS).replace(', ',','))
# --- les prenoms : toute forme a initiale NOUVELLE doit entrer dans PRENOMS_VRAIS
s=open('../index.html',encoding='utf-8').read()
m=re.search(r'const PRENOMS_VRAIS\s*=\s*\{(.*?)\n\};', s, re.S)
deja={k:v for k,v in re.findall(r'"([^"]+)"\s*:\s*"([^"]*)"', m.group(1))}
neufs={}; conflits=[]
for c in E:
    for r in E[c]:
        nom_jeu, prenom, complet = r[0], r[6], r[7]
        if ' ' not in nom_jeu: continue          # vrai mononyme : pas de prenom a donner
        if not nom_jeu.startswith(nom_jeu.split()[0]) : pass
        court = '. ' in nom_jeu                  # « B. Lama » : forme a initiale
        if not court: continue                   # ecrit en toutes lettres : pas d'entree
        if nom_jeu in deja:
            if deja[nom_jeu] and prenom and deja[nom_jeu]!=prenom:
                conflits.append((nom_jeu,deja[nom_jeu],prenom,complet))
            continue
        if nom_jeu in neufs and neufs[nom_jeu]!=prenom: neufs[nom_jeu]=''   # deux hommes : vide
        else: neufs[nom_jeu]=prenom
print('prenoms neufs : %d'%len(neufs))
vides=[k for k,v in neufs.items() if not v]
print('dont vides : %d %s'%(len(vides),vides))
print('ecarts de graphie avec la table existante : %d'%len(conflits))
for c in conflits[:20]: print('   %-20s table=%-14s source=%-14s (%s)'%c)
# controle : l'initiale du prenom doit etre celle du nom affiche
mauvais=[(k,v) for k,v in neufs.items() if v and not k.split('.')[0].startswith(v[0])]
print('prenoms dont l initiale ne concorde pas : %d %s'%(len(mauvais),mauvais))
with open('out-prenoms.js','w') as f:
    L=sorted(neufs.items())
    for i in range(0,len(L),4):
        f.write(' '+' '.join('"%s":"%s",'%(k,v) for k,v in L[i:i+4])+'\n')
print('tables emises')
