// Greffe le moteur pixel art du campus (docs/prototype-centre-pixel.html) dans index.html, sous le nom CAMPUSPIX.
// Usage, depuis championnat/ : node docs/greffe-campus-pixel.cjs .
// Rejouable : si le prototype évolue, on relance le script. Ne jamais retoucher le bloc CAMPUSPIX à la main.
// Le modèle du campus (familles, coûts, effets, paliers) reste dans CENTRE3D : CAMPUSPIX ne fait que dessiner.
const fs=require('fs'), path=require('path');
const dir=process.argv[2]||'.';
const proto=fs.readFileSync(path.join(dir,'docs/prototype-centre-pixel.html'),'utf8').replace(/\r\n/g,'\n');
const A='const CAMPUSPIX=(()=>{', B='return {rendre,peindre,cadre};\n})();';
const a=proto.indexOf(A), b=proto.indexOf(B);
if(a<0||b<0||b<a) throw new Error('bornes CAMPUSPIX du prototype introuvables');
const code=proto.slice(a,b+B.length);
if(code.includes('—')) throw new Error('tiret long dans le bloc du prototype');
const DEB='/* ---- CAMPUSPIX : DÉBUT (v2.79) ----', FIN='/* ---- CAMPUSPIX : FIN ---- */';
const bloc=`${DEB}
   Le centre d'entraînement en vrai pixel art, frère de STADEPIX : palette fermée, contours à l'encre, aucun filtre.
   Moteur repris TEL QUEL du prototype validé par l'auteur (championnat/docs/prototype-centre-pixel.html).
   CAMPUSPIX.rendre(ctx, R, image, E) peint un canvas ; R = etatCampus() + {chantier:{id,n}}, E = la finesse
   (CAMPUSPIX.cadre(E) donne la taille du canevas), image = quatre par seconde.
   Pour le régénérer depuis le prototype : node docs/greffe-campus-pixel.cjs . (depuis championnat/). */
${code}
${FIN}
`;
const f=path.join(dir,'index.html');
let h=fs.readFileSync(f,'utf8');
const crlf=h.includes('\r\n'), out=crlf?bloc.replace(/\n/g,'\r\n'):bloc, nl=crlf?'\r\n':'\n';
const i0=h.indexOf(DEB.slice(0,DEB.indexOf(' (v')));
if(i0>=0){ const i1=h.indexOf(FIN,i0); if(i1<0) throw new Error('fin de bloc CAMPUSPIX introuvable');
  h=h.slice(0,i0)+out+h.slice(i1+FIN.length+nl.length); console.log('bloc CAMPUSPIX remplacé'); }
else { const ancre='/* ---- CENTRE3D : DÉBUT'; const j=h.indexOf(ancre); if(j<0) throw new Error('ancre introuvable');
  h=h.slice(0,j)+out+h.slice(j); console.log('bloc CAMPUSPIX inséré'); }
fs.writeFileSync(f,h);
