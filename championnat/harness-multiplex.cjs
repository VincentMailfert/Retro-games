/* Harnais du MULTIPLEX DE FIN DE JOURNÉE — MULTIPLEX 95 (v1.17)
   Le coup de sifflet ne laisse plus tomber les neuf autres scores en vrac : il déroule deux cartes,
   tous les stades puis le classement, et c'est là qu'on voit ce qu'on a gagné ou perdu comme places.
   Ce harnais garde ce qui pourrait casser en silence :
     A) la carte se construit à chaque journée, et elle est complète
     B) les mouvements disent vrai : le rang d'AVANT est bien celui d'avant le coup d'envoi
     C) la carte est FIGÉE : la J38 remet les compteurs à zéro juste après, elle n'en sait rien
     D) le rendu des deux cartes : rien d'indéfini, rien de non échappé, les bons boutons
     E) l'enchaînement carte 1 → carte 2 → suite, et le repli quand la carte manque
     F) le poids dans la sauvegarde, et la migration d'une carrière d'avant
     G) trois saisons d'affilée sans une exception ni un rang hors bornes
   Usage : node harness-multiplex.cjs                                                             */
const fs=require("fs"), path=require("path");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const script=html.slice(html.indexOf("<script>")+8, html.lastIndexOf("</scr"+"ipt>"));
function makeStub(){ let s; const fn=function(){return s;};
  s=new Proxy(fn,{get(_t,p){if(p===Symbol.toPrimitive)return()=>"";if(p==="length")return 0;if(p==="forEach"||p==="map")return()=>[];return s;},
    set(){return true;},apply(){return s;},has(){return true;},construct(){return s;}}); return s; }
/* un vrai nœud d'accueil pour les cartes : il retient ce qu'on lui écrit et rend des boutons cliquables */
function noeud(){
  const n={_h:"",style:{},boutons:{},vus:[],getBoundingClientRect:()=>({top:250})}; // la carte est posée 250 px plus bas que le haut du fil
  Object.defineProperty(n,"innerHTML",{get(){return n._h;},set(v){ n._h=String(v); n.boutons={}; if(n._h) n.vus.push(n._h); }});
  n.querySelector=sel=>{ const id=sel.replace("#","");
    if(n._h.indexOf('id="'+id+'"')<0) return null;   // le bouton n'existe que s'il est écrit dans la carte
    if(!n.boutons[id]) n.boutons[id]={onclick:null,focus(){}};
    return n.boutons[id]; };
  n.clic=id=>{ const b=n.boutons[id]; if(!b||!b.onclick) throw new Error("pas de bouton "+id); b.onclick(); };
  return n;
}
/* le téléscripteur, avec ce qu'il faut pour que mpxVise ait prise : une position et un scroll */
const TICKER={scrollTop:0, getBoundingClientRect:()=>({top:0})}, generic=makeStub();
global.document=new Proxy(function(){},{
  get(_t,p){ if(p==="getElementById") return id=>(id==="ticker"?TICKER:generic); if(p==="querySelectorAll") return ()=>[];
    if(p===Symbol.toPrimitive) return ()=>""; return generic; },
  set(){return true;}, apply(){return generic;}, has(){return true;}, construct(){return generic;},
});
const ls={_m:{},getItem(k){return this._m[k]??null;},setItem(k,v){this._m[k]=String(v);},removeItem(k){delete this._m[k];},get length(){return Object.keys(this._m).length;},key(i){return Object.keys(this._m)[i]??null;}};
global.window={__TEST__:true,addEventListener(){},removeEventListener(){},localStorage:ls,location:{href:""},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage=ls; global.navigator={userAgent:"h"};
global.getComputedStyle=()=>makeStub();
global.requestAnimationFrame=cb=>setTimeout(cb,0); global.cancelAnimationFrame=id=>clearTimeout(id);

const api=new Function(script+"\n;return {nouvellePartie,jouerJournee,intersaison,classement,clubById,bilanJournee,mpxStades,mpxTable,mpxUne,rendMultiplex,migre,esc,ordinal,CLUBS,RIVAL,getG:function(){return G;},setG:function(x){G=x;}};")();

let F=0; const ok=(c,m)=>{ console.log((c?"  ✓ ":"  ✗ ")+m); if(!c)F++; };
const rangs=()=>{ const r={}; api.classement().forEach((c,i)=>{ r[c.id]=i+1; }); return r; };

/* ===== A) la carte se construit, et elle est complète ===== */
console.log("A) La carte de fin de journée existe et ne perd personne");
api.nouvellePartie("LEN");
let G=api.getG();
api.jouerJournee();
let M=G.multiplex;
ok(!!M, "G.multiplex est posé dès la première journée");
ok(M.j===1, "la carte porte le numéro de la journée JOUÉE (1), pas celui de la suivante : "+M.j);
ok(M.m.length===G.clubs.length/2, "les dix affiches de la journée sont là : "+M.m.length);
ok(M.m.filter(x=>x.mien).length===1, "une seule est la vôtre");
ok(M.tab.length===G.clubs.length, "le tableau porte les vingt clubs : "+M.tab.length);
ok(M.moi===G.monClub && M.div===G.div, "la carte sait de quel club et de quelle division elle parle");
ok(M.tab.every(t=>t.nom && Number.isFinite(t.pts) && t.r>=1 && t.r<=M.tab.length), "chaque ligne a un nom, des points et un rang valide");
{ const ids=new Set(M.tab.map(t=>t.id));
  ok(M.m.every(x=>ids.has(x.h)&&ids.has(x.a)), "les vingt clubs des dix affiches sont tous au tableau"); }

/* ===== B) les mouvements disent vrai ===== */
console.log("\nB) Le rang d'AVANT est celui d'avant le coup d'envoi, pas un autre");
let ecarts=0, bouges=0;
for(let k=0;k<12;k++){
  const avant=rangs();                 // le classement tel qu'il est AVANT la journée
  api.jouerJournee();
  const M2=G.multiplex, apres=rangs();
  for(const t of M2.tab){
    if(t.av!==avant[t.id]) ecarts++;
    if(t.r!==apres[t.id]) ecarts++;
    if(t.av!==t.r) bouges++;
  }
  const somme=M2.tab.reduce((s,t)=>s+((t.av||t.r)-t.r),0);
  if(somme!==0) ecarts++;              // une place gagnée est une place perdue ailleurs
}
ok(ecarts===0, "sur douze journées, aucun rang (avant ou après) ne diverge du classement réel");
ok(bouges>0, "et le tableau a bel et bien bougé ("+bouges+" changements de place relevés)");

/* ===== C) la carte est figée : l'intersaison ne la réécrit pas ===== */
console.log("\nC) La carte de la J38 survit à la remise à zéro de l'intersaison");
while(G.journee<38) api.jouerJournee();
const M38=JSON.parse(JSON.stringify(G.multiplex));
ok(M38.j===38, "la dernière carte est bien celle de la 38e journée : "+M38.j);
ok(M38.tab.some(t=>t.pts>0), "elle porte des points de fin de saison, pas un classement vide");
const ptsChamp=M38.tab[0].pts;
api.intersaison();
ok(G.multiplex.tab[0].pts===ptsChamp, "après l'intersaison, la carte dit toujours "+ptsChamp+" pts au champion");
ok(api.clubById(M38.tab[0].id).pts===0, "alors que le club, lui, est bien reparti de zéro");

/* ===== D) le rendu des deux cartes ===== */
console.log("\nD) Les deux cartes se rendent, et rien n'y traîne");
api.nouvellePartie("LEN"); G=api.getG();
for(let k=0;k<8;k++) api.jouerJournee();
M=G.multiplex;
const h1=api.mpxStades(M), h2=api.mpxTable(M);
const propre=h=>!/undefined|NaN|\[object|\$\{/.test(h);
ok(propre(h1)&&propre(h2), "aucun « undefined », « NaN » ni gabarit non résolu dans les deux cartes");
ok((h1.match(/class="mpxL"/g)||[]).length===M.m.length-1, "la carte 1 montre les NEUF autres stades, pas le vôtre : "+((h1.match(/class="mpxL"/g)||[]).length));
ok(/id="bMpxNext"/.test(h1)&&/Le classement/.test(h1), "la carte 1 mène à la carte 2");
ok(/id="bMpxNext"/.test(h2)&&/Prochaine journée/.test(h2), "la carte 2 porte le bouton de sortie");
{ const lignes=(h2.match(/<tr /g)||[]).length + (h2.match(/<tr>/g)||[]).length;
  ok(lignes>=5 && lignes<=13, "la carte 2 tient en une poignée de lignes ("+lignes+"), pas les vingt du classement"); }
ok(/class="me"/.test(h2), "votre club est surligné dans le tableau");
{ const T=M.tab, moi=T.find(t=>t.id===M.moi);
  const attend=t=>{ const d=(t.av||t.r)-t.r; return d>0?"▲"+d:(d<0?"▼"+(-d):null); };
  const fl=attend(moi);
  ok(!fl || h2.indexOf(fl)>=0, "la flèche de votre club ("+(fl||"aucune")+") figure bien sur la carte");
  ok(T.filter(t=>t.r<=3).every(t=>h2.indexOf(api.esc(t.nom))>=0), "le podium est toujours montré, où qu'on soit");
  const voisins=T.filter(t=>Math.abs(t.r-moi.r)<=1);
  ok(voisins.every(t=>h2.indexOf(api.esc(t.nom))>=0), "et vos voisins immédiats de tableau aussi"); }
{ // un nom bricolé ne doit pas ouvrir de balise : la carte est du HTML écrit à la main
  const faux=JSON.parse(JSON.stringify(M));
  faux.tab[0].nom='<img src=x onerror="pan()">'; faux.m[0].hn=faux.tab[0].nom; faux.m[0].mien=false;
  faux.enjeu='1<b>er</b>';
  const a=api.mpxStades(faux), b=api.mpxTable(faux);
  ok(a.indexOf("<img")<0 && b.indexOf("<img")<0 && /&lt;img/.test(a+b), "un nom de club bricolé ressort échappé dans les deux cartes"); }
{ // la une : elle ne ment pas sur le vainqueur, et elle reste courte
  let vues=0, fautes=0;
  for(let k=0;k<40;k++){
    api.jouerJournee(); const Mk=G.multiplex, u=api.mpxUne(Mk);
    if(u){ vues++;
      if((u.match(/<p>/g)||[]).length>2) fautes++;
      if(/prend la tête/.test(u) && Mk.tab[0].av===1) fautes++;      // on n'annonce un nouveau leader que s'il l'est devenu
      if(!/prend la tête/.test(u) && Mk.tab[0].av>1) fautes++; }     // et on ne le tait jamais quand il l'est
    else if(Mk.tab[0].av>1) fautes++;
    if(G.journee>=38){ api.intersaison(); G=api.getG(); }
  }
  ok(vues>0 && fautes===0, "la une reste à deux lignes et n'annonce un nouveau leader qu'à bon escient ("+vues+" unes lues)"); }

/* ===== E) l'enchaînement des cartes ===== */
console.log("\nE) Carte 1 → carte 2 → la suite, et jamais de cul-de-sac");
api.nouvellePartie("LEN"); G=api.getG(); api.jouerJournee();
let suites=0; const N=noeud();
api.rendMultiplex(N,1,()=>suites++);
ok(/TOUS LES STADES/.test(N.innerHTML), "le premier rendu, c'est la carte des stades");
ok(TICKER.scrollTop>=250, "la carte est amenée sous les yeux dès le coup de sifflet, feuille de match ou pas");
N.clic("bMpxNext");
ok(suites===0 && /LE CLASSEMENT/.test(N.innerHTML), "le bouton ne sort pas de la journée : il ouvre le classement");
ok(TICKER.scrollTop>=250, "le téléscripteur défile jusqu'à la carte au lieu de la laisser sous la ligne de flottaison");
N.clic("bMpxNext");
ok(suites===1, "le second bouton, lui, passe à la journée suivante");
{ // une carrière d'avant la v1.17, ou une reprise en cours de match : la carte manque, la sortie reste
  const garde=G.multiplex; G.multiplex=null;
  const N2=noeud(); let s2=0;
  api.rendMultiplex(N2,1,()=>s2++);
  ok(/id="bMpxNext"/.test(N2.innerHTML) && /Prochaine journée/.test(N2.innerHTML), "sans carte, le bouton de sortie est quand même là");
  N2.clic("bMpxNext");
  ok(s2===1, "et il mène directement à la journée suivante");
  api.rendMultiplex(null,1,()=>s2++);
  ok(s2===1, "un nœud d'accueil absent ne lève pas d'exception");
  G.multiplex=garde;
  const N3={_h:"",style:{},querySelector:()=>null};   // un nœud sans géométrie (navigateur avare, test)
  Object.defineProperty(N3,"innerHTML",{get(){return N3._h;},set(v){N3._h=String(v);}});
  let leve=false; try{ api.rendMultiplex(N3,1,()=>{}); }catch(e){ leve=true; }
  ok(!leve && /TOUS LES STADES/.test(N3._h), "un nœud sans getBoundingClientRect se rend quand même, sans défilement"); }

/* ===== F) le poids, et la carrière d'avant ===== */
console.log("\nF) Ce que la carte coûte à la sauvegarde, et ce qu'elle fait d'une vieille partie");
{ const poids=JSON.stringify(G.multiplex).length + JSON.stringify(G.rangAv).length;
  ok(poids<4096, "carte + instantané des rangs pèsent "+poids+" octets (sous les 4 Ko)");
  const tout=JSON.stringify(G).length;
  ok(poids/tout<0.02, "soit "+(100*poids/tout).toFixed(2)+" % de la sauvegarde"); }
{ const vieux=JSON.parse(JSON.stringify(G));
  delete vieux.multiplex; delete vieux.rangAv;   // une carrière d'avant le multiplex
  api.setG(vieux); api.migre();
  const g2=api.getG();
  ok(g2.multiplex===null && g2.rangAv===null, "la migration pose les deux champs à vide sans rien inventer");
  api.jouerJournee();
  ok(!!api.getG().multiplex, "et la première journée jouée depuis cette carrière produit bien une carte"); }

/* ===== G) trois saisons d'affilée ===== */
console.log("\nG) Trois saisons de suite, sans exception ni rang aberrant");
api.nouvellePartie("STE"); G=api.getG();
let cartes=0, aberrants=0;
try{
  for(let s=0;s<3;s++){
    while(G.journee<38){
      api.jouerJournee();
      const Mk=G.multiplex; cartes++;
      if(!Mk || Mk.j<1 || Mk.j>38) aberrants++;
      else if(Mk.tab.some(t=>t.r<1||t.r>Mk.tab.length||t.av<1||t.av>Mk.tab.length)) aberrants++;
      else { api.mpxStades(Mk); api.mpxTable(Mk); }   // le rendu passe sur chacune des cartes
    }
    api.intersaison();
    if(api.getG().vire) api.nouvellePartie("STE");    // limogé : on reprend ailleurs, le harnais continue
    G=api.getG();
  }
  ok(true, cartes+" cartes construites ET rendues sans lever d'exception");
}catch(e){ ok(false, "exception en cours de carrière : "+e.message); }
ok(aberrants===0, "aucun rang hors bornes sur l'ensemble des cartes");

console.log(F?("\n❌ HARNAIS MULTIPLEX : "+F+" ÉCHEC(S)"):"\n✅ HARNAIS MULTIPLEX : TOUT EST VERT");
process.exit(F?1:0);
