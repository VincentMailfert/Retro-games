# -*- coding: utf-8 -*-
"""Assemble les effectifs 1993-94 de Barnsley et Southend, que la source a perdus.
   APPARTENANCE : au club le 14 aout 1993 (historique de transferts TM), corroboree par la
     base neilbrown (et par Wikipedia pour Barnsley).
   NAISSANCE / POSTE : Transfermarkt (fiche du joueur, ou pages des saisons ENCADRANTES
     1992-93 et 1994-95, que la source sert normalement).
   ORDRE : matchs par saison au club (base neilbrown), un chiffre documente, les minutes des
     saisons encadrantes tranchant les egalites. La source n'a AUCUNE minute de 1993-94 pour
     ces deux clubs, et on ne l'invente pas : on classe sur du chiffre attesté."""
import json, re, collections
NBPOS={'G':'G','GK':'G','D':'D','FB':'D','CD':'D','WH':'M','M':'M','W':'A','F':'A','IF':'A','CF':'A'}
PROF=json.load(open('profils.json'))
# naissances et postes releves a la main sur les fiches TM (deux sources quand elles existent)
APPOINT={  # sid -> (naissance, poste) pour les hommes que les pages encadrantes ne donnent pas
 '117188':(1956,'D'),  # Viv Anderson, ne a Nottingham — concorde avec son age dans le jeu en 1992-93
 '226554':(1962,'A'),  # Ian Bryson, Kilmarnock, Linksaussen
 '1014488':(1968,'D'), # Charlie Bishop, Abwehr
 '49698':(1975,'M'),   # Martin Bullock
 '14624':(1971,'A'),   # Jason Lee, Mittelstuermer
 '10410':(1971,'A'),   # Tommy Mooney
 '901428':(1967,'M'),  # Derek Payne, ne le 26/04/1967 a Edgware (TM + Wikipedia)
 '977845':(1970,'D'),  # Adam Locke
 '994566':(1966,'M'),  # Steve Tilson
 '994567':(1969,'M'),  # Andy Ansah
 '176810':(1965,'M'),  # Keith Jones
}
# hommes que Transfermarkt ne sait pas dater, ecartes plutot que devines (regle 90/91) :
#   Chris Jackson (Barnsley, deja indatable en 1992-93), Gary Jones et David Howell (Southend)
INDATABLES={'1015260'}
EXCLUS_IDENTITE={'JONES Gary','HOWELL David'}
# presents au coup d'envoi bien que TM n'enregistre aucun transfert : la base neilbrown couvre
# la saison ET une seconde source les place au club (Wikipedia pour Barnsley, Wikipedia pour Payne)
SANS_TRANSFERT={'BISHOP Charlie','BULLOCK Martin','ANSAH Andy','LOCKE Adam',
                'TILSON Steve (1st spell)','PAYNE Derek'}

def saisons(sais):
    m=re.match(r'^([OI]?\d{2})(?:\s*-\s*([OI]?\d{2}))?$', sais.replace(' ',''))
    def an(t):
        if t[0] in 'OI': return (2000 if t[0]=='O' else 2010)+int(t[1:])
        n=int(t); return 1900+n if n>=40 else 2000+n
    a=an(m.group(1)); b=an(m.group(2)) if m.group(2) else a+1
    return max(1,b-a)

OUT={}
for code,nomclub in (('BNS','Barnsley'),('SND','Southend United')):
    L=json.load(open('pont-%s.json'%code))
    hommes=[]
    for h in L:
        nom=h['nom']
        if nom in EXCLUS_IDENTITE: continue
        sid=h.get('sid')
        if sid in INDATABLES: continue
        present=h['present'] or nom in SANS_TRANSFERT
        if not present: continue
        nais=h.get('nais'); poste=None
        if h.get('tm'):
            for v in h['tm'].values():
                nais=nais or v.get('nais'); poste=poste or v.get('poste')
        if sid in APPOINT:
            nais=nais or APPOINT[sid][0]; poste=poste or APPOINT[sid][1]
        if sid in PROF and PROF[sid].get('poste'): poste=poste or PROF[sid]['poste']
        poste=poste or NBPOS.get(h['pos'])
        if not nais or not poste:
            print('  !! %s : naissance=%s poste=%s -> ecarte'%(nom,nais,poste)); continue
        # minutes des saisons encadrantes, quand la source les a
        mins=[v['min'] for v in (h.get('tm') or {}).values() if v.get('min')]
        apps=int(re.sub(r'\D','',h['apps']) or 0)
        hommes.append({'nom_nb':nom,'sid':sid,'nais':nais,'poste':poste,
                       'apps':apps,'sais':h['sais'],'nsais':saisons(h['sais']),
                       'parsaison':apps/saisons(h['sais']),
                       'minenc':max(mins) if mins else 0,
                       'complet':h.get('complet')})
    hommes.sort(key=lambda x:(-x['parsaison'],-x['minenc']))
    print('=== %s : %d hommes au coup d envoi du 14 aout 1993 (18 places)'%(nomclub,len(hommes)))
    for i,x in enumerate(hommes):
        print('  %2d %-24s %s %4d  %-8s %5.1f matchs/saison  (enc. %4d min) %s'%(
            i+1,x['complet'] or x['nom_nb'],x['poste'],x['nais'],x['sais'],x['parsaison'],x['minenc'],
            '<-- retenu' if i<18 else ''))
    OUT[code]=hommes
json.dump(OUT, open('ponts-effectifs.json','w'), ensure_ascii=False, indent=1)
