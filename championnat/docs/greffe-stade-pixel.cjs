// Greffe le moteur pixel art du stade (docs/prototype-stade-pixel.html) dans index.html, sous le nom STADEPIX.
// Usage, depuis championnat/ : node docs/greffe-stade-pixel.cjs .
// Rejouable : si le prototype évolue, on relance le script. Ne jamais retoucher le bloc STADEPIX à la main.
const fs=require('fs'), path=require('path');
const dir=process.argv[2]||'.';
const proto=fs.readFileSync(path.join(dir,'docs/prototype-stade-pixel.html'),'utf8').replace(/\r\n/g,'\n');
const A='const STADEPIX=(()=>{', B='return {rendre, etape, GW, GH};\n})();';
const a=proto.indexOf(A), b=proto.indexOf(B);
if(a<0||b<0||b<a) throw new Error('bornes STADEPIX du prototype introuvables');
const code=proto.slice(a,b+B.length);
if(code.includes('—')) throw new Error('tiret long dans le bloc du prototype');
const DEB='/* ---- STADEPIX : DÉBUT (v2.63) ----', FIN='/* ---- STADEPIX : FIN ---- */';
const bloc=`${DEB}
   Le stade en vrai pixel art : chaque pixel est posé sur une grille de 320 x 224, palette fermée, aucun filtre.
   Moteur repris TEL QUEL du prototype validé par l'auteur (championnat/docs/prototype-stade-pixel.html).
   STADEPIX.rendre(ctx, R, image) peint un canvas à partir de l'état rendu par etatStade3D et renvoie {zone} :
   la boîte du rang à venir, où le jeu pose son bouton « agrandir ».
   Pour le régénérer depuis le prototype : node docs/greffe-stade-pixel.cjs . (depuis championnat/). */
${code}
${FIN}
`;
const f=path.join(dir,'index.html');
let h=fs.readFileSync(f,'utf8');
const crlf=h.includes('\r\n'), out=crlf?bloc.replace(/\n/g,'\r\n'):bloc, nl=crlf?'\r\n':'\n';
const i0=h.indexOf(DEB.slice(0,DEB.indexOf(' (v')));
if(i0>=0){ const i1=h.indexOf(FIN,i0); if(i1<0) throw new Error('fin de bloc STADEPIX introuvable');
  h=h.slice(0,i0)+out+h.slice(i1+FIN.length+nl.length); console.log('bloc STADEPIX remplacé'); }
else { const ancre='/* ---- LE STADE EN MAQUETTE (v1.36) ----'; const j=h.indexOf(ancre); if(j<0) throw new Error('ancre introuvable');
  h=h.slice(0,j)+out+h.slice(j); console.log('bloc STADEPIX inséré'); }
fs.writeFileSync(f,h);
