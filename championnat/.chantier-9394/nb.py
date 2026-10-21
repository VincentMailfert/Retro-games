# -*- coding: utf-8 -*-
"""Lit la base neilbrown (par club) et rend les hommes presents en 1993/94."""
import re, html, sys
def cells(r):
    return [re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',c))).strip()
            for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]
def an(tok):
    """'93'->1993, 'O3'->2003, 'I2'->2012, '99'->1999."""
    tok=tok.strip()
    if not tok: return None
    if tok[0] in 'OI':
        d=tok[1:]
        if not d.isdigit(): return None
        return (2000 if tok[0]=='O' else 2010)+int(d)
    if not tok.isdigit(): return None
    n=int(tok)
    return 1900+n if n>=40 else 2000+n
def lire(f):
    h=open(f,encoding='utf-8',errors='replace').read()
    rows=re.findall(r'<tr.*?</tr>', h, re.S)
    out=[]
    for r in rows:
        c=cells(r)
        if len(c)<7 or not c[0] or c[0]=='NAME' or ':' in c[0]: continue
        nom,pos,sais=c[0],c[1],c[2]
        m=re.match(r'^([OI]?\d{2})(?:\s*-\s*([OI]?\d{2}))?$', sais.replace(' ',''))
        if not m: continue
        a=an(m.group(1)); b=an(m.group(2)) if m.group(2) else None
        if a is None: continue
        debut=a; fin=(b-1) if b else a          # derniere saison de depart
        out.append({'nom':nom,'pos':pos,'sais':sais,'debut':debut,'fin':fin,
                    'source':c[3],'parti':c[4],'apps':c[5],'buts':c[6]})
    return out
for f,nomclub in [(sys.argv[1],sys.argv[2])]:
    L=lire(f)
    dedans=[x for x in L if x['debut']<=1993<=x['fin']]
    print('%s : %d hommes au fichier, %d presents en 1993/94'%(nomclub,len(L),len(dedans)))
    for x in dedans:
        print('   %-26s %-4s %-9s apps=%-4s  <- %s'%(x['nom'],x['pos'],x['sais'],x['apps'],x['source'][:38]))
