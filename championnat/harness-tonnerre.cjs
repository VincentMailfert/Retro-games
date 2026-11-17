/* Harnais du COUP DE TONNERRE — MULTIPLEX (v3.02)
   Choix de l'auteur (17/11/2026) : une à deux fois par saison, un gros club arrache une star à un autre, dans tout
   le championnat, avec sa fenêtre. Et chaque joker acheté par un autre club a sa ligne au debrief, qui dit vrai.
     A) le rythme : jamais plus d'un par mercato, une à deux fois par saison en moyenne
     B) l'affaire : une star (top 3 de son club, note et âge bornés), jamais la vôtre, payée par un riche, dans son budget
     C) la fenêtre : posée après le debrief, consommée, elle rend la main
     D) les jokers : deux lignes distinctes selon que le joker figurait ou non dans votre rapport
   Usage : node harness-tonnerre.cjs                                                              */
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
const api=new Function(script+"\n;return {ouvreTonnerre,coupDeTonnerre,TONNERRE,nouvellePartie,jouerJournee,intersaison,clubById,getG:function(){return G;},CLUBS};")();
let ko=0;
const ok=(c,m)=>{ console.log((c?"  ✓ ":"  ✗ ")+m); if(!c) ko++; };
const enVrai=f=>{ window.__TEST__=false; try{ return f(); } finally { window.__TEST__=true; } };

console.log("A et B) dix carrières de deux saisons");
let saisons=0, total=0, parMercatoMax=0, bonnes=0, affaires=0, maxSaison=0;
const T=api.TONNERRE;
for(const club of api.CLUBS.filter((_,i)=>i%2===1)){
  api.nouvellePartie(club.id); let G=api.getG();
  for(let s=0;s<2;s++){
    const parMercato={}; let ceSaison=0;
    for(let k=0;k<38;k++){
      const avant={}; G.clubs.forEach(c=>avant[c.id]=c.budget||0);
      const riches=G.clubs.filter(c=>c.id!==G.monClub && c.joueurs.length<24).sort((a,b)=>(b.budget||0)-(a.budget||0)).slice(0,T.riches).map(c=>c.id);
      G.tonnerre=null; api.jouerJournee(); G=api.getG();
      const t=G.tonnerre; if(!t) continue;
      total++; ceSaison++; affaires++;
      const m=(t.journee<5?"e":"h"); parMercato[m]=(parMercato[m]||0)+1; parMercatoMax=Math.max(parMercatoMax,parMercato[m]);
      const de=api.clubById(t.de), vers=api.clubById(t.vers), j=vers.joueurs.find(x=>x.uid===t.uid);
      const top3=de.joueurs.slice().sort((a,b)=>b.note-a.note)[2];
      const okA = j && j.club===vers.id && !de.joueurs.includes(j) && t.de!==G.monClub && t.vers!==G.monClub
        && t.note>=T.note && t.age<=T.age && (!top3 || top3.note<=t.note) && vers.budget>=0; // le même jour, une vente du marché ordinaire peut avoir garni sa caisse
      // les budgets au centime près se vérifient en C : le même jour, le marché ordinaire (transfertIA) les bouge aussi
      if(okA) bonnes++; else console.log("    affaire douteuse :", t.nom, {j:!!j, top3:top3&&top3.note, prix:t.prix, budgetAvant:avant[t.vers], age:t.age});
    }
    saisons++; maxSaison=Math.max(maxSaison,ceSaison);
    G.vire=null; api.intersaison(); G=api.getG();
  }
}
const moy=total/saisons;
console.log("    "+total+" coups de tonnerre en "+saisons+" saisons, "+moy.toFixed(2)+" par saison");
ok(parMercatoMax<=1, "jamais plus d'un par mercato");
ok(maxSaison<=2, "jamais plus de deux par saison");
ok(moy>=0.8 && moy<=1.8, "une à deux fois par saison en moyenne ("+moy.toFixed(2)+")");
ok(affaires>0 && bonnes===affaires, "chaque affaire respecte les règles ("+bonnes+"/"+affaires+")");

console.log("C) la fenêtre");
api.nouvellePartie(api.CLUBS[0].id); let G=api.getG(); let t=null;
{ const r=G.clubs.filter(c=>c.id!==G.monClub).sort((a,b)=>(b.budget||0)-(a.budget||0))[0]; r.budget+=300e6; } // un riche qui peut tout payer
G.journee=20; G._tonPlan={cle:G.saison+"|h", j:20, fait:false};
const avantB={}; G.clubs.forEach(c=>avantB[c.id]=c.budget||0);
const richesC=G.clubs.filter(c=>c.id!==G.monClub && c.joueurs.length<24).sort((a,b)=>(b.budget||0)-(a.budget||0)).slice(0,T.riches).map(c=>c.id);
t=api.coupDeTonnerre();
ok(!!t, "on peut provoquer un coup de tonnerre au mercato d'hiver");
ok(t && richesC.includes(t.vers), "l'acheteur est l'un des plus riches");
ok(t && api.clubById(t.vers).budget===avantB[t.vers]-t.prix && api.clubById(t.de).budget===avantB[t.de]+Math.round(t.prix*0.9), "l'acheteur paie le prix, le vendeur encaisse 90 %");
G.tonnerre=t; let suite=0;
enVrai(()=>api.ouvreTonnerre(()=>suite++));
ok(/COUP DE TONNERRE/.test(FICHE.innerHTML) && FICHE.innerHTML.includes(api.clubById(t.vers).nom) && FICHE.innerHTML.includes(api.clubById(t.de).nom), "elle nomme les deux clubs");
ok(!/—/.test(FICHE.innerHTML), "aucun tiret long");
ok(G.tonnerre===null && suite===0 && FICHE.style.display==="flex", "consommée, affichée, la chaîne attend");
FICHE.clic("bTonOk");
ok(suite===1 && window._penEnCours===false, "« Continuer » rend la main");
FICHE.innerHTML="";
enVrai(()=>api.ouvreTonnerre(()=>suite++));
ok(FICHE.innerHTML==="" && suite===2, "rien à annoncer : la chaîne passe");
ok(/ouvreDebrief\(\(\)=>ouvreTonnerre\(\(\)=>ouvreMarche\(/.test(html), "elle s'ouvre juste après le debrief");
G._tonPlan={cle:G.saison+"|h", j:20, fait:true}; G.journee=21;
ok(api.coupDeTonnerre()===null, "le mercato a déjà eu le sien : plus rien");

console.log("D) les jokers achetés par les autres");
ok(/if\(pickR\)\{[\s\S]{0,400}il figurait dans votre rapport[\s\S]{0,200}\} else \{[\s\S]{0,300}un joker que votre recruteur surveillait/.test(html),
  "« il figurait dans votre rapport » seulement s'il y figurait, une autre ligne sinon");

console.log(ko?`\n❌ ${ko} échec(s)`:"\n✅ COUP DE TONNERRE ET JOKERS : TOUT EST VERT");
process.exit(ko?1:0);
