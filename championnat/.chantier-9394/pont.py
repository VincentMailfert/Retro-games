# -*- coding: utf-8 -*-
"""Le pont pour Barnsley et Southend, dont la source n'a RIEN en 1993-94.
   Appartenance a l'effectif 1993/94 : base neilbrown (+ Wikipedia pour Barnsley).
   Naissance, poste, temps de jeu : les pages Transfermarkt de 1992-93 et 1994-95,
   qui ENCADRENT la saison manquante."""
import re, html, json, unicodedata
POSTE={'Torwart':'G','Abwehr':'D','Innenverteidiger':'D','Linker Verteidiger':'D',
 'Rechter Verteidiger':'D','Mittelfeld':'M','Defensives Mittelfeld':'M','Zentrales Mittelfeld':'M',
 'Linkes Mittelfeld':'M','Rechtes Mittelfeld':'M','Offensives Mittelfeld':'M','Sturm':'A',
 'Mittelstürmer':'A','Hängende Spitze':'A','Linksaußen':'A','Rechtsaußen':'A'}
MARQ=('nicht im kader','not in squad',"pas dans l'effectif")
def lire(p):
    b=open(p,'rb').read()
    try: return b.decode('utf-8')
    except UnicodeDecodeError: return b.decode('cp1252','replace')
def lignes(h):
    c=re.search(r'<tbody>(.*)</tbody>', h, re.S)
    return re.split(r'<tr class="(?:odd|even)">', c.group(1) if c else h)[1:]
def cellules(L):
    s=re.sub(r'<table class="inline-table".*?</table>', '<td>@J@</td>', L, flags=re.S)
    return [re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',t))).strip()
            for t in re.findall(r'<td[^>]*>(.*?)</td>', s, re.S)]
def tm(code, an):
    hk=lire('pages2/%s-%d-kader.html'%(code,an)); hp=lire('pages2/%s-%d-leistungsdaten.html'%(code,an))
    out={}
    for L in lignes(hk):
        s=re.search(r'/profil/spieler/(\d+)', L)
        if not s: continue
        sid=s.group(1)
        imb=re.search(r'<table class="inline-table".*?</table>', L, re.S)
        imb=imb.group(0) if imb else ''
        nom=re.search(r'/profil/spieler/\d+">\s*([^<]+?)\s*</a>', imb)
        pos=[p for p in re.findall(r'<td[^>]*>\s*([^<]+?)\s*</td>', re.sub(r'<a .*?</a>','',imb,flags=re.S)) if p in POSTE]
        c=cellules(L); nais=None
        for x in c:
            m=re.match(r'^(\d{2})[./](\d{2})[./](\d{4})\s*\((\d+)\)$', x)
            if m: nais=int(m.group(3)); break
        out[sid]={'sid':sid,'nom_kader':nom.group(1) if nom else None,'nais':nais,
                  'poste':POSTE[pos[0]] if pos else None}
    for L in lignes(hp):
        s=re.search(r'/profil/spieler/(\d+)', L)
        if not s: continue
        sid=s.group(1)
        if sid not in out: out[sid]={'sid':sid,'nais':None,'poste':None,'nom_kader':None}
        noms=re.findall(r'/profil/spieler/\d+">([^<]+)</a>', L)
        c=cellules(L)
        def ent(i):
            if i>=len(c): return 0
            v=re.sub(r'[^\d]','',c[i]); return int(v) if v else 0
        txt=html.unescape(re.sub(r'<[^>]+>',' ',L)).lower()
        out[sid].update({'complet':noms[0].strip() if noms else None,
                         'court':noms[1].strip() if len(noms)>1 else None,
                         'matchs':ent(5),'min':ent(len(c)-1),
                         'hors':any(m in txt for m in MARQ)})
    return out

def sansacc(s):
    return ''.join(c for c in unicodedata.normalize('NFD',s or '') if not unicodedata.combining(c)).lower()
def patro(nom_nb):
    """'REDFEARN Neil' -> ('redfearn','Neil') ; gere 'O'CONNELL Brendan', '(2nd spell)'."""
    n=re.sub(r'\s*\([^)]*\)\s*','',nom_nb).strip()
    mots=n.split()
    maj=[w for w in mots if w.upper()==w and len(w)>1]
    pren=[w for w in mots if w not in maj]
    return sansacc(' '.join(maj)), ' '.join(pren)

NB={'BNS':json.load(open('nb-bns.json')),'SND':json.load(open('nb-snd.json'))}
for code in ('BNS','SND'):
    av, ap = tm(code,1992), tm(code,1994)
    print('=== %s : TM 1992-93 = %d hommes, TM 1994-95 = %d hommes'%(code,len(av),len(ap)))
    par={}
    for src,d in (('92',av),('94',ap)):
        for sid,x in d.items():
            cle=sansacc(re.sub(r'^.*?\s','',x.get('complet') or x.get('nom_kader') or '')) or sid
            par.setdefault(cle,{})[src]=x
    trouves=0; manquants=[]
    for h in NB[code]:
        pat,pren=patro(h['nom'])
        cands=[k for k in par if k==pat or k.endswith(pat) or pat.endswith(k)]
        if cands:
            trouves+=1
            h['tm']={s:{'sid':v['sid'],'nais':v.get('nais'),'poste':v.get('poste'),
                        'min':v.get('min'),'complet':v.get('complet'),'court':v.get('court')}
                     for s,v in par[cands[0]].items()}
        else:
            manquants.append(h['nom'])
    print('   apparies a la source : %d / %d'%(trouves,len(NB[code])))
    print('   a chercher ailleurs  : %s'%manquants)
    json.dump(NB[code], open('pont-%s.json'%code,'w'), ensure_ascii=False, indent=1)
