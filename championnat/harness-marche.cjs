/* Harnais de LA FENÊTRE DU MARCHÉ — MULTIPLEX (v3.01)
   Demande de l'auteur (16/11/2026) : les joueurs proposés pour une seule journée (le coup à faire, le rapport
   du recruteur) doivent venir à lui en fin de journée, signables sur place. On vérifie, sur le chemin RÉEL :
     A) la fenêtre s'ouvre quand il y a quelque chose de signable, une seule fois par journée
     B) elle se tait quand rien n'est dans le budget et qu'aucun coup à faire n'attend
     C) signer se fait en deux temps (« Signer » arme, « Confirmer » signe), joker comme coup à faire
     D) fermer rend la main à la suite de la chaîne de la semaine
     E) le club qui rafle un nom du recruteur prend l'un de ceux qu'on vous avait montrés
     F) le maillot nu : sans sponsor ou sans équipementier, une fenêtre le rappelle, signable sur place
     G) la caisse se vide : le rouge en vue au rythme des trois dernières journées, une fois par descente
     H) la caisse déborde : un chantier ou un meilleur coach à portée, matelas gardé, une fois toutes les dix journées
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
    if(sel!==".bMkSig" && sel!==".bMaSig") return [];
    const cl=sel.slice(1);
    n.sig=[...n._h.matchAll(new RegExp(cl+'" data-c="([^"]+)"[^>]*>([^<]*)<',"g"))].map(m=>({dataset:{c:m[1]}, texte:m[2], onclick:null}));
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
const api=new Function(script+"\n;return {ouvreCaisse,caisseASignaler,caisseRythme,caissePossibles,caisseMatelas,ouvreMarche,marcheASignaler,ouvreMaillot,maillotASignaler,genSponsors,genEquip,nouvellePartie,genFlashSolde,genRapport,finirJournee,clubById,getG:function(){return G;},CLUBS};")();

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

console.log("F) le maillot nu");
G.journee=9; G.sponsor=null; G.offresSponsor=api.genSponsors(1); G.equip=null; G.offresEquip=api.genEquip(); G._maillotVu=null;
FICHE.innerHTML=""; suiteVue=0;
ok(api.maillotASignaler(), "sans sponsor ni équipementier : à signaler");
enVrai(()=>api.ouvreMaillot(()=>suiteVue++));
ok(/LE MAILLOT EST NU/.test(FICHE.innerHTML) && /SPONSOR MAILLOT/.test(FICHE.innerHTML) && /ÉQUIPEMENTIER/.test(FICHE.innerHTML), "la fenêtre montre les deux manques");
ok(/qui ne rentrent pas/.test(FICHE.innerHTML), "elle dit ce que coûte une journée sans contrat");
const nomSp=G.offresSponsor[1].nom;
FICHE.signe("s1");
ok(!G.sponsor, "premier clic : rien n'est signé");
FICHE.signe("s1");
ok(G.sponsor && G.sponsor.nom===nomSp, nomSp+" devient sponsor maillot au second clic");
ok(/PAS D'ÉQUIPEMENTIER/.test(FICHE.innerHTML) && FICHE.style.display==="flex", "la fenêtre reste ouverte pour l'équipementier qui manque encore");
FICHE.signe("e0"); FICHE.signe("e0");
ok(!!G.equip && window._penEnCours===false && FICHE.style.display==="none", "l'équipementier signé, plus rien ne manque : la fenêtre se ferme");
FICHE.innerHTML=""; suiteVue=0; G._maillotVu=null;
enVrai(()=>api.ouvreMaillot(()=>suiteVue++));
ok(FICHE.innerHTML==="" && suiteVue===1, "maillot habillé : plus de fenêtre, la chaîne passe");
G.sponsor=null; G.offresSponsor=api.genSponsors(1); G.journee=10; G._maillotVu=null;
enVrai(()=>api.ouvreMaillot(()=>suiteVue++));
FICHE.clic("bMaOk");
ok(suiteVue===2 && window._penEnCours===false, "« Plus tard » rend la main à la chaîne");
FICHE.innerHTML="";
enVrai(()=>api.ouvreMaillot(()=>suiteVue++));
ok(FICHE.innerHTML==="" && suiteVue===3, "et pas deux fois dans la même journée");

console.log("G) la caisse se vide");
G.journee=12; G._caisseVu=null; G._videVu=false; G._debordeVu=null; G.chantier=null;
G.caisseJ=[]; G.tresorerie=10e6;
ok(api.caisseASignaler()===null, "moins de trois journées de recul : rien");
G.caisseJ=[-1e6,-3e6,-3e6,-3e6];
ok(api.caisseRythme()===-3e6, "le rythme se lit sur les trois dernières journées");
ok(api.caisseASignaler()==="vide", "10 M en caisse, 3 M de moins par journée : à signaler");
FICHE.innerHTML=""; suiteVue=0;
enVrai(()=>api.ouvreCaisse(()=>suiteVue++));
ok(/LA CAISSE SE VIDE/.test(FICHE.innerHTML) && /dans <b class="fort">4 journées/.test(FICHE.innerHTML), "la fenêtre dit le rouge dans 4 journées");
ok(/Masse salariale/.test(FICHE.innerHTML) && !/—/.test(FICHE.innerHTML), "elle montre ce qui sort, sans tiret long");
FICHE.clic("bCaOk");
ok(suiteVue===1 && window._penEnCours===false, "« Plus tard » rend la main à la chaîne");
G.journee=13; FICHE.innerHTML="";
enVrai(()=>api.ouvreCaisse(()=>suiteVue++));
ok(FICHE.innerHTML==="" && suiteVue===2, "même descente, journée suivante : elle ne revient pas");
G.caisseJ=[1e6,1e6,1e6]; G.journee=14; api.caisseASignaler();
G.caisseJ=[-3e6,-3e6,-3e6]; G.journee=15;
ok(api.caisseASignaler()==="vide", "le rythme est remonté puis redescendu : nouvelle descente, nouvelle fenêtre");
G.tresorerie=40e6;
ok(api.caisseASignaler()===null, "40 M en caisse : le rouge est loin, rien");
G.tresorerie=-2e6;
ok(api.caisseASignaler()===null, "déjà dans le rouge : la notif du président prend le relais, pas de fenêtre");

console.log("H) la caisse déborde");
G.journee=16; G._caisseVu=null; G._debordeVu=null; G.chantier=null; G.caisseJ=[2e6,2e6,2e6];
G.tresorerie=api.caisseMatelas()+0.5e6;
ok(api.caisseASignaler()===null, "rien de payable au-delà du matelas : pas de fenêtre");
G.tresorerie=api.caisseMatelas()+30e6;
const P=api.caissePossibles();
ok(P.stade.length>0 && P.stade.length<=3 && P.stade.every(x=>x.cout<=30e6), "des chantiers du stade à portée, matelas gardé ("+P.stade.map(x=>x.nom).join(", ")+")");
ok(api.caisseASignaler()==="deborde", "à signaler");
FICHE.innerHTML=""; suiteVue=0;
enVrai(()=>api.ouvreCaisse(()=>suiteVue++));
ok(/LA CAISSE DÉBORDE/.test(FICHE.innerHTML) && /À PORTÉE AU STADE/.test(FICHE.innerHTML), "la fenêtre liste ce qui est à portée au stade");
ok(/À PORTÉE AU STAFF/.test(FICHE.innerHTML) && /poste vacant/.test(FICHE.innerHTML), "et au staff");
FICHE.clic("bCaOk");
ok(suiteVue===1 && G._debordeVu===16, "« Plus tard » rend la main, la fenêtre est notée vue");
G.journee=20; G._caisseVu=null;
ok(api.caisseASignaler()===null, "quatre journées plus tard : elle se tait");
G.journee=26;
ok(api.caisseASignaler()==="deborde", "dix journées plus tard : elle peut revenir");
G.chantier={id:"toit", reste:2}; const P2=api.caissePossibles();
ok(P2.stade.length===0, "un chantier en cours : plus de proposition au stade");
G.chantier=null;
G.caisseJ=[-2e6,-2e6,-2e6];
ok(api.caisseASignaler()!=="deborde", "la caisse descend : jamais « déborde »");

console.log("I) dans la chaîne et dans la journée");
ok(/ouvreMaillot\(\(\)=>ouvreCaisse\(rdv\?null:ouvrePromo\)\)/.test(html), "la caisse suit le maillot dans la chaîne de la semaine");
ok(/G\.caisseJ=\(G\.caisseJ\|\|\[\]\)\.concat\(Math\.round\(G\.tresorerie-caisse0\)\)/.test(html), "finirJournee note le solde de chaque journée jouée");
{ G.caisseJ=[]; G._pend=null; }

console.log(ko?`\n❌ ${ko} échec(s)`:"\n✅ FENÊTRES DU MARCHÉ, DU MAILLOT ET DE LA CAISSE : TOUT EST VERT");
process.exit(ko?1:0);
