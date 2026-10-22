# -*- coding: utf-8 -*-
"""Pour chaque homme de Barnsley et Southend, ou etait-il au COUP D'ENVOI du 14 aout 1993 ?
   Source : l'historique de transferts de Transfermarkt (dates exactes)."""
import re, html, json, os, subprocess, unicodedata, time
COUP=(1993,8,14)
def sansacc(s):
    return ''.join(c for c in unicodedata.normalize('NFD',s or '') if not unicodedata.combining(c)).lower()
def sh(*a):
    return subprocess.run(list(a), capture_output=True, text=True).stdout.strip()
def cherche(nom):
    """Cherche un joueur chez TM -> (sid, nais, nom complet)."""
    f='tr/q-%s.html'%re.sub(r'\W','_',nom)
    if not os.path.exists(f):
        for dom in ('de','co.uk','com'):
            r=subprocess.run(['curl','-s','--compressed','-H',
              'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              '-o',f,'https://www.transfermarkt.%s/schnellsuche/ergebnis/schnellsuche?query=%s'%(dom,nom.replace(' ','+'))],
              capture_output=True,text=True)
            if os.path.exists(f) and os.path.getsize(f)>8000 and 'Human Verification' not in open(f,encoding='utf-8',errors='replace').read():
                break
            time.sleep(1)
    h=open(f,encoding='utf-8',errors='replace').read()
    out=[]
    for L in re.split(r'<tr class="(?:odd|even)">', h)[1:]:
        s=re.search(r'/profil/spieler/(\d+)', L)
        if not s: continue
        noms=re.findall(r'/profil/spieler/\d+">([^<]+)</a>', L)
        d=re.search(r'(\d{2})[./](\d{2})[./](\d{4})', re.sub(r'<[^>]+>',' ',L))
        out.append((s.group(1), int(d.group(3)) if d else None, noms[0].strip() if noms else ''))
    return out
def transferts(sid):
    f='tr/t-%s.json'%sid
    if not os.path.exists(f) or os.path.getsize(f)<10:
        sh('./api.sh','/ceapi/transferHistory/list/%s'%sid,f)
    try: d=json.load(open(f))
    except Exception: return None
    return d.get('transfers') or []
def dt(s):
    m=re.match(r'(\d{2})\.(\d{2})\.(\d{4})',s or '')
    return (int(m.group(3)),int(m.group(2)),int(m.group(1))) if m else None
def club_au_coup(tfs, nomclub):
    """Vrai si le dernier mouvement AVANT le coup d'envoi l'amene a ce club."""
    av=[t for t in tfs if dt(t.get('date')) and dt(t.get('date'))<=COUP]
    if not av: return None
    av.sort(key=lambda t:dt(t['date']))
    dest=(av[-1].get('to') or {}).get('clubName') or ''
    return sansacc(dest)

CLUBS={'BNS':('Barnsley','barnsley'),'SND':('Southend United','southend')}
for code,(nom,motcle) in CLUBS.items():
    L=json.load(open('pont-%s.json'%code))
    print('=== %s (%d hommes au fichier neilbrown) ==='%(nom,len(L)))
    for h in L:
        pat=re.sub(r'\s*\([^)]*\)\s*','',h['nom']).strip()
        mots=pat.split(); maj=[w for w in mots if w.upper()==w and len(w)>1]
        pren=' '.join(w for w in mots if w not in maj)
        complet='%s %s'%(pren,' '.join(w.capitalize() for w in maj))
        sid=None; nais=None
        if h.get('tm'):
            v=list(h['tm'].values())[0]; sid=v['sid']
            nais=next((x['nais'] for x in h['tm'].values() if x.get('nais')),None)
        else:
            for s,n,c in cherche(complet):
                if sansacc(c).endswith(sansacc(' '.join(maj))): sid,nais=s,n; break
        h['sid']=sid; h['nais']=nais; h['complet']=complet
        tfs=transferts(sid) if sid else None
        ou=club_au_coup(tfs,motcle) if tfs else None
        h['au_coup']=ou
        h['present']=bool(ou and motcle in ou)
        print('  %-26s sid=%-8s ne=%-6s au 14/08/1993 : %-22s %s'%(
            h['nom'],sid or '?',nais or '?',ou or '?', 'AU CLUB' if h['present'] else ''))
        time.sleep(0.4)
    json.dump(L, open('pont-%s.json'%code,'w'), ensure_ascii=False, indent=1)
    print('  -> au club au coup d envoi : %d'%sum(1 for h in L if h['present']))
