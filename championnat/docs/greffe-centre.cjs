// Greffe le catalogue et le moteur de rendu du prototype (docs/prototype-centre.html) dans index.html, enfermés dans CENTRE3D.
// Usage, depuis championnat/ : node docs/greffe-centre.cjs .
// Rejouable : si le prototype évolue, on relance le script. Ne jamais retoucher le bloc CENTRE3D à la main.
const fs=require('fs'), path=require('path');
const dir=process.argv[2]||'.';
const proto=fs.readFileSync(path.join(dir,'docs/prototype-centre.html'),'utf8').replace(/\r\n/g,'\n');
const A='/* ===== CENTRE3D : DÉBUT', B='/* ===== CENTRE3D : FIN ===== */';
const a=proto.indexOf(A), b=proto.indexOf(B);
if(a<0||b<0||b<a) throw new Error('marqueurs CENTRE3D du prototype introuvables');
let code=proto.slice(proto.indexOf('\n',a)+1, b).trimEnd();
const remplace=(av,ap,min)=>{ const n=code.split(av).length-1; if(n<(min||1)) throw new Error('motif absent ('+n+'x) : '+av); code=code.split(av).join(ap); };
// 1) .vapeur, .eclat et .clign existent déjà pour le stade avec d'autres réglages : le centre a les siens, préfixés
remplace('class="vapeur','class="cVapeur');
remplace('class="eclat"','class="cEclat"');
remplace('class="clign"','class="cClign"',3);
// 2) les dégradés du stade peuvent s'appeler cHalo (vueVille, préfixe par défaut) : ceux du centre prennent « ct »
for(const n of ['Halo','Aube','Or','Brume','Eau']){ remplace('id="c'+n+'"','id="ct'+n+'"'); remplace('url(#c'+n+')','url(#ct'+n+')'); }
// garde-fous : aucun tiret long ne doit entrer dans le jeu, et le bloc ne doit pas lire une variable du prototype hors bloc
if(code.includes('—')) throw new Error('tiret long dans le bloc du prototype');
const ind=code.split('\n').map(l=>l?'  '+l:l).join('\n');
const DEB='/* ---- CENTRE3D : DÉBUT (v1.53) ----', FIN='/* ---- CENTRE3D : FIN ---- */';
const bloc=`${DEB}
   Catalogue (FAMS, PALIERS, CHATEAU), calculs et moteur de dessin du campus, repris TELS QUELS du prototype validé
   par l'auteur (championnat/docs/prototype-centre.html), enfermés dans CENTRE3D pour que leurs noms courts (T, P, PI,
   bx, rnd, clamp…) ne croisent pas ceux du jeu. Deux retouches, faites par le script : les classes animées qui existent
   déjà pour le stade sont préfixées (cVapeur, cEclat, cClign), et les dégradés prennent le préfixe « ct ».
   Le bloc lit REDUIT (prefers-reduced-motion), défini par le jeu.
   Pour le régénérer depuis le prototype : node docs/greffe-centre.cjs . (depuis championnat/). */
const CENTRE3D=(()=>{
${ind}
  return {scene, FAMS, FAM, PALIERS, SOUS_PALIER, CHATEAU, points, palier, nivMax, chateauOuvert, nomNiveau, effets};
})();
${FIN}
`;
const f=path.join(dir,'index.html');
let h=fs.readFileSync(f,'utf8');
const crlf=h.includes('\r\n'), out=crlf?bloc.replace(/\n/g,'\r\n'):bloc, nl=crlf?'\r\n':'\n';
const i0=h.indexOf(DEB.slice(0,DEB.indexOf(' (v')));
if(i0>=0){ const i1=h.indexOf(FIN,i0); if(i1<0) throw new Error('fin de bloc CENTRE3D introuvable');
  h=h.slice(0,i0)+out+h.slice(i1+FIN.length+nl.length); console.log('bloc CENTRE3D remplacé'); }
else { const ancre='/* ---- fin de la maquette ---- */'+nl; const j=h.indexOf(ancre); if(j<0) throw new Error('ancre (fin du bloc STADE3D) introuvable');
  h=h.slice(0,j+ancre.length)+out+h.slice(j+ancre.length); console.log('bloc CENTRE3D inséré'); }
fs.writeFileSync(f,h);
