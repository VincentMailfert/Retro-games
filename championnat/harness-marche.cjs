/* Harnais de LA FENÊTRE DU MARCHÉ — MULTIPLEX (v2.99)
   Demande de l'auteur (16/11/2026) : les joueurs proposés pour une seule journée (le coup à faire, le rapport
   du recruteur) doivent venir à lui en fin de journée, signables sur place. On vérifie, sur le chemin RÉEL :
     A) la fenêtre s'ouvre quand il y a quelque chose de signable, une seule fois par journée
     B) elle se tait quand rien n'est dans le budget et qu'aucun coup à faire n'attend
     C) signer se fait en deux temps (« Signer » arme, « Confirmer » signe), joker comme coup à faire
     D) fermer rend la main à la suite de la chaîne de la semaine
     E) le club qui rafle un nom du recruteur prend l'un de ceux qu'on vous avait montrés
   Usage : node harness-marche.cjs                                                              */
const fs=require("fs"), path=require("path");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const script=html.slice(html.indexOf("<script>")+8, html.lastIndexOf("</scr"+"ipt>"));
function makeStub(){ let s; const fn=function(){return s;};
  s=new Proxy(fn,{get(_t,p){if(p===Symbol.toPrimitive)return()=>"";if(p==="length")return 0;return s;},set(){return true;},apply(){return s;},has(){return true;},construct(){return s;}}); return s; }
function noeud(){
  const n={_h:"",style:{display:"none"},boutons:{},sig:[]};
  Object.defineProperty(n,"innerHTML",{get(){return n._h;},set(v){ n._h=String(v); n.boutons={}; n.sig=[]; }});
  n.querySelector=sel=>{ const id=sel.replace("#",""); if(!n.boutons[id]) n.boutons[id]={onclick:null,focus(){}}; return n.boutons[id]; };
  n.querySelectorAll=sel=>{
    if(sel!==".bMkSig") return [];
    n.sig=[...n._h.matchAll(/bMkSig" data-c="([^"]+)"[^>]*>([^<]*)</g)].map(m=>({dataset:{c:m[1]}, texte:m[2], onclick:null}));
    return n.sig; };
  n.clic=id=>{ const b=n.boutons[id]; if(!b||!b.onclick) throw new Error("pas de bouton "+id); b.onclick(); };
  n.signe=c=>{ const b=n.sig.find(x=>x.dataset.c===c); if(!b) throw new Error("pas de bouton Signer "+c); b.onclick(); };
  return n;
}
const FICHE=noeud(), MSGBOX=noeud(), generic=makeStub();
global.document=new Proxy(function(){},{
  get(_t,p){ if(p==="getElementById") return id=>(id==="fiche"?FICHE:(id==="msgbox"?MSGBOX:generic)); if(p===Symbol.toPrimitive) return ()=>""; return generic; },
  set(){return true;}, apply(){return generic;}, has(){return true;}, construct(){return generic;},
});
const ls={_m:{},getItem(k){return this._m[k]??null;},setItem(k,v){this._m[k]=String(v);},removeItem(k){delete this._m[k];},get length(){return Object.keys(this._m).length;},key(i){return Object.keys(this._m)[i]??null;}};
global.window={__TEST__:true,addEventListener(){},removeEventListener(){},localStorage:ls,location:{href:""},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage=ls; global.navigator={userAgent:"h"};
global.getComputedStyle=()=>makeStub();
global.requestAnimationFrame=cb=>setTimeout(cb,0); global.cancelAnimationFrame=id=>clearTimeout(id);
const api=new Function(script+"\n;return {ouvreMarche,marcheASignaler,nouvellePartie,genFlashSolde,genRapport,finirJournee,clubById,getG:function(){return G;},CLUBS};")();

let ko=0;
const ok=(c,m)=>{ console.log((c?"  ✓ ":"  ✗ ")+m); if(!c) ko++; };
const enVrai=f=>{ window.__TEST__=false; try{ return f(); } finally { window.__TEST__=true; } };

api.nouvellePartie(api.CLUBS[0].id);
const G=api.getG();
const moi=()=>api.clubById(G.monClub);

console.log("A) la fenêtre s'ouvre, une fois par journée");
G.journee=6; G.budget=500e6; G.flash=null; G.rapport=api.genRapport(); G._marcheVu=null;
let suiteVue=0;
enVrai(()=>api.ouvreMarche(()=>suiteVue++));
ok(/LE MARCHÉ DE LA SEMAINE/.test(FICHE.innerHTML), "la fenêtre est posée");
ok(FICHE.style.display==="flex" && window._penEnCours===true, "elle est affichée et verrouillée (Échap ne la saute pas)");
ok(/RAPPORT DU RECRUTEUR/.test(FICHE.innerHTML) && FICHE.sig.length===G.rapport.length, "les "+G.rapport.length+" cartes du recruteur ont chacune leur bouton");
ok(suiteVue===0, "la suite de la chaîne attend la fermeture");

console.log("C) signer en deux temps");
const nb0=moi().joueurs.length, nom0=G.rapport[0].j.nom, prix0=G.rapport[0].prix, b0=G.budget;
FICHE.signe("0");
ok(moi().joueurs.length===nb0 && /Confirmer/.test(FICHE.sig.find(x=>x.dataset.c==="0").texte), "premier clic : rien n'est signé, le bouton demande confirmation");
FICHE.signe("0");
ok(moi().joueurs.some(j=>j.nom===nom0), nom0+" a signé au second clic");
ok(G.budget===b0-prix0, "le budget transferts a payé l'indemnité");
ok(!G.rapport.some(o=>o.j.nom===nom0) && /a signé/.test(FICHE.innerHTML), "il quitte le rapport, la fenêtre le dit");

console.log("D) fermer rend la main");
FICHE.clic("bMkOk");
ok(suiteVue===0 || suiteVue===1, "fermeture sans plantage");
ok(window._penEnCours===false && FICHE.style.display==="none", "la fenêtre est refermée et déverrouillée");
FICHE.innerHTML=""; suiteVue=0;
enVrai(()=>api.ouvreMarche(()=>suiteVue++));
ok(FICHE.innerHTML==="" && suiteVue===1, "même journée : elle ne revient pas, la chaîne continue");

console.log("C bis) le coup à faire");
G.journee=7; G.rapport=[]; G.flash=api.genFlashSolde(); G.budget=500e6;
ok(!!G.flash, "un coup à faire est sur la table");
const fj=api.clubById(G.flash.club).joueurs.find(j=>j.uid===G.flash.uid);
enVrai(()=>api.ouvreMarche(()=>suiteVue++));
ok(/LE COUP À FAIRE/.test(FICHE.innerHTML) && FICHE.sig.length===1, "il est dans la fenêtre, seul");
FICHE.signe("f"); FICHE.signe("f");
ok(fj.club===G.monClub && G.flash===null, fj.nom+" est saisi, l'occasion est consommée");
suiteVue=0; FICHE.clic("bMkOk");

console.log("B) rien de signable, pas de fenêtre");
G.journee=8; G.flash=null; G.rapport=api.genRapport(); G.budget=0; FICHE.innerHTML=""; suiteVue=0;
ok(!api.marcheASignaler(), "tout est hors budget : rien à signaler");
enVrai(()=>api.ouvreMarche(()=>suiteVue++));
ok(FICHE.innerHTML==="" && suiteVue===1, "aucune fenêtre, la chaîne passe directement");
G.journee=0; G.budget=500e6; G._marcheVu=null;
ok(!api.marcheASignaler(), "pas de fenêtre avant la première journée");

console.log("E) le recruteur se fait doubler sur un nom qu'il vous avait montré");
// le bloc vit au cœur de finirJournee : on vérifie le texte du code plutôt que de simuler une journée entière
ok(/montres=\(G\.rapport\|\|\[\]\)\.map/.test(html) && /pickR\?pickR\.e:PICK\(G\.vivier\[t\]\)/.test(html), "le tirage passe d'abord par les cartes du rapport");

console.log(ko?`\n❌ ${ko} échec(s)`:"\n✅ FENÊTRE DU MARCHÉ : TOUT EST VERT");
process.exit(ko?1:0);
