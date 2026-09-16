/* Harnais des FENÊTRES MAISON — MULTIPLEX 95 (v1.05)
   Le jeu n'ouvre plus une seule boîte du navigateur : alert/confirm/prompt ont été remplacés par
   message() / confirme() / saisie(), qui vivent dans le calque #msgbox. Ce harnais monte un vrai
   petit nœud DOM pour ce calque (les autres restent des stubs) et vérifie, sur le chemin RÉEL :
     A) la fenêtre s'ouvre, se lit, et le bouton la referme
     B) rien de ce qui vient du joueur ou d'un fichier ne peut ouvrir une balise
     C) une confirmation ne dit « oui » que si on clique « oui » — Échap vaut un refus
     D) le nom de carrière saisi est rangé tel quel mais ressort échappé
     E) un fichier importé est désamorcé à l'entrée (assainit)
     F) le journal des messages, que lisent les autres harnais, reste borné
     G) Échap dépile le message avant #fiche, et ne perce jamais une fenêtre verrouillée
   Usage : node harness-modales.cjs                                                              */
const fs=require("fs"), path=require("path");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const script=html.slice(html.indexOf("<script>")+8, html.lastIndexOf("</scr"+"ipt>"));
function makeStub(){ let s; const fn=function(){return s;};
  s=new Proxy(fn,{get(_t,p){if(p===Symbol.toPrimitive)return()=>"";if(p==="length")return 0;return s;},set(){return true;},apply(){return s;},has(){return true;},construct(){return s;}}); return s; }
/* un vrai petit nœud pour #msgbox : il retient ce qu'on lui écrit et rend des boutons cliquables */
function noeud(){
  const n={_h:"",style:{display:"none"},onclick:null,vus:[],boutons:{},champ:null};
  Object.defineProperty(n,"innerHTML",{get(){return n._h;},set(v){ n._h=String(v); n.boutons={}; n.champ=null; if(n._h) n.vus.push(n._h); }});
  n.querySelector=sel=>{ const id=sel.replace("#","");
    if(id==="bMsgIn"){ if(!n.champ) n.champ={value:n.reponse||"",focus(){},select(){},onkeydown:null}; return n.champ; }
    if(!n.boutons[id]) n.boutons[id]={onclick:null,focus(){}};
    return n.boutons[id]; };
  n.clic=id=>{ const b=n.boutons[id]; if(!b||!b.onclick) throw new Error("pas de bouton "+id); b.onclick(); };
  return n;
}
const MSGBOX=noeud(), FICHE=noeud(), generic=makeStub();
global.document=new Proxy(function(){},{
  get(_t,p){ if(p==="getElementById") return id=>(id==="msgbox"?MSGBOX:(id==="fiche"?FICHE:generic)); if(p===Symbol.toPrimitive) return ()=>""; return generic; },
  set(){return true;}, apply(){return generic;}, has(){return true;}, construct(){return generic;},
});
const ls={_m:{},getItem(k){return this._m[k]??null;},setItem(k,v){this._m[k]=String(v);},removeItem(k){delete this._m[k];},get length(){return Object.keys(this._m).length;},key(i){return Object.keys(this._m)[i]??null;}};
global.window={__TEST__:true,addEventListener(){},removeEventListener(){},localStorage:ls,location:{href:""},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage=ls; global.navigator={userAgent:"h"};
global.getComputedStyle=()=>makeStub();
global.requestAnimationFrame=cb=>setTimeout(cb,0); global.cancelAnimationFrame=id=>clearTimeout(id);
const api=new Function(script+"\n;return {message,confirme,saisie,fermeMessage,videMessage,fermeFiche,esc,assainit,MSG_JOURNAL,nouvellePartie,renommePartie,supprimePartie,partiesListe,sauvegardeLocale,idxLit,getG:function(){return G;},CLUBS};")();
/* la touche Échap, telle qu'elle est câblée en bas d'index.html : le message d'abord, #fiche ensuite */
const echap=()=>{ if(api.fermeMessage()) return "message"; api.fermeFiche(); return "fiche"; };

let F=0; const ok=(c,m)=>{ console.log((c?"  ✓ ":"  ✗ ")+m); if(!c)F++; };
const reel=fn=>{ window.__TEST__=false; try{ return fn(); } finally{ window.__TEST__=true; } };

console.log("A) La fenêtre de message s'affiche et se referme");
reel(()=>api.message("Trésorerie insuffisante.\n\nAstuce : transvasez du budget.", {titre:"💰 TRÉSORERIE"}));
ok(MSGBOX.style.display==="flex", "le calque #msgbox est affiché");
ok(/💰 TRÉSORERIE/.test(MSGBOX._h) && /Astuce/.test(MSGBOX._h), "le titre et le corps sont écrits");
ok((MSGBOX._h.match(/<p style="margin-top:7px">/g)||[]).length===2, "les deux paragraphes du message sont séparés");
reel(()=>MSGBOX.clic("bMsgOk"));
ok(MSGBOX.style.display==="none" && MSGBOX._h==="", "le bouton referme et vide le calque");

console.log("\nB) Échappement : un nom bricolé ne peut pas ouvrir de balise");
reel(()=>api.message('Le club <img src=x onerror="pan()"> a refusé.'));
ok(MSGBOX._h.indexOf("<img")<0 && /&lt;img/.test(MSGBOX._h), "le chevron est échappé dans le corps du message");
reel(()=>MSGBOX.clic("bMsgOk"));
MSGBOX.reponse="OM \"95\"";
let recu=null;
reel(()=>api.saisie({titre:"Nom", valeur:'<b>gras</b> & "guillemets"', onOk:v=>{recu=v;}}));
ok(MSGBOX._h.indexOf("value=\"&lt;b&gt;")>=0, "la valeur proposée est échappée dans l'attribut value");
ok(MSGBOX._h.indexOf('& "guillemets"')<0 && /&amp;/.test(MSGBOX._h) && /&quot;/.test(MSGBOX._h), "esperluette et guillemets échappés aussi");
reel(()=>MSGBOX.clic("bMsgOk"));
ok(recu==='OM "95"', "la saisie remonte la valeur tapée telle quelle : "+JSON.stringify(recu));

console.log("\nC) La confirmation a deux issues, et c'est « non » par défaut");
let oui=0, non=0;
reel(()=>api.confirme({titre:"Supprimer ?", texte:"C'est définitif.", onOui:()=>oui++, onNon:()=>non++}));
reel(()=>MSGBOX.clic("bMsgNon"));
ok(oui===0 && non===1, "le bouton Annuler déclenche onNon, jamais onOui");
reel(()=>api.confirme({titre:"Supprimer ?", texte:"C'est définitif.", onOui:()=>oui++, onNon:()=>non++}));
reel(()=>MSGBOX.clic("bMsgOui"));
ok(oui===1 && non===1, "le bouton Confirmer déclenche onOui");
reel(()=>api.confirme({titre:"Supprimer ?", texte:"x", onOui:()=>oui++, onNon:()=>non++}));
ok(reel(()=>api.fermeMessage())===true && non===2, "Échap (fermeMessage) vaut un refus, pas un accord");
ok(reel(()=>api.fermeMessage())===false, "sans fenêtre ouverte, Échap laisse la main à #fiche");

console.log("\nD) Le nom de carrière saisi ressort échappé sur l'accueil");
api.nouvellePartie(api.CLUBS[0].id);
reel(()=>api.sauvegardeLocale(true));
const pid=api.idxLit()[0].id;
window._saisie='<script>alert(1)</scr'+'ipt>';
api.renommePartie(pid);
window._saisie=null;
const nom=api.partiesListe()[0].nom;
ok(nom.indexOf("<script")>=0, "le nom est rangé tel quel dans l'index : "+JSON.stringify(nom));
ok(api.esc(nom).indexOf("<")<0, "et esc() le neutralise à l'affichage : "+api.esc(nom));

console.log("\nE) Un fichier importé est désamorcé à l'entrée");
const sale={monClub:"PSG", clubs:[{id:"PSG", nom:'PSG <img src=x onerror=1>', joueurs:[{nom:"Z <b>Z</b>", histoire:"né <i>ici</i>"}]}], news:["<script>x</scr"+"ipt>"]};
api.assainit(sale);
ok(sale.clubs[0].nom==="PSG img src=x onerror=1", "nom de club nettoyé : "+sale.clubs[0].nom);
ok(sale.clubs[0].joueurs[0].nom.indexOf("<")<0 && sale.clubs[0].joueurs[0].histoire.indexOf("<")<0, "les joueurs en profondeur aussi");
ok(sale.news[0].indexOf("<")<0, "les dépêches aussi");

console.log("\nF) Le journal des messages reste borné");
api.MSG_JOURNAL.length=0;
for(let i=0;i<40;i++) api.message("msg "+i);
ok(api.MSG_JOURNAL.length===20 && api.MSG_JOURNAL[19]==="msg 39", "20 messages au maximum, les plus récents");

console.log("\nG) Échap : il dépile, mais il ne perce pas un verrou");
FICHE.innerHTML="<div>une fenêtre ordinaire</div>"; FICHE.style.display="flex";
window._penEnCours=false;
ok(echap()==="fiche" && FICHE.style.display==="none", "sans verrou, Échap referme #fiche comme avant");

FICHE.innerHTML="<div>un penalty à la 90e</div>"; FICHE.style.display="flex";
window._penEnCours=true;
echap();
ok(FICHE.style.display==="flex", "VERROU POSÉ : Échap ne ferme plus rien (incident, conf de presse, tour de coupe, penalty)");

// un message peut se poser PAR-DESSUS une fenêtre verrouillée : Échap le retire, lui seul
reel(()=>api.message("Trésorerie insuffisante."));
ok(FICHE.style.display==="flex" && MSGBOX.style.display==="flex", "le message se pose sans effacer la fenêtre du dessous");
ok(reel(()=>echap())==="message" && MSGBOX.style.display==="none" && FICHE.style.display==="flex",
  "Échap retire le message et laisse la fenêtre verrouillée en place");
window._penEnCours=false;

console.log(F?"\n❌ "+F+" test(s) en échec":"\n✅ FENÊTRES MAISON : TOUT EST VERT");
process.exit(F?1:0);
