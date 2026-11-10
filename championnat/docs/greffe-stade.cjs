// Greffe le moteur de rendu du prototype (docs/prototype-stade.html) dans index.html, enfermé dans STADE3D.
// Usage, depuis championnat/ : node docs/greffe-stade.cjs .
const fs=require('fs'), path=require('path');
const dir=process.argv[2];
const proto=fs.readFileSync(path.join(dir,'docs/prototype-stade.html'),'utf8').replace(/\r\n/g,'\n');
const a=proto.indexOf('const D=5, L=105'), b=proto.indexOf('/* ============================================================\n   PUPITRE');
if(a<0||b<0) throw new Error('bornes du prototype introuvables');
let code=proto.slice(a,b).trimEnd();
const patch=(av,ap)=>{ const n=code.split(av).length-1; if(n!==1) throw new Error('patch '+n+'x : '+av.slice(0,80)); code=code.replace(av,()=>ap); };
// 1) le cyan est banni de l'interface : le ruban LED passe au blanc cassé
code=code.split('#28d7ff').join('#f2f5fa');
// 2) le gabarit de la prochaine tribune peut s'afficher seul, cliquable (R.cible = info-bulle déjà échappée)
patch("  if(R.chantier>0.01){\n    const n=rows[ns], k=Math.floor(n+1e-6), dejaMonte=n-k>0.002;\n    let o=`<g opacity=\"${f1(R.chantier)}\">`;",
      "  if(R.chantier>0.01||R.cible){\n    const n=rows[ns], k=Math.floor(n+1e-6), dejaMonte=n-k>0.002;\n    let o=R.chantier>0.01?`<g opacity=\"${f1(R.chantier)}\">`:`<g class=\"stTrib\" data-id=\"tribune\" style=\"cursor:pointer\"><title>${R.cible}</title>`;");
// 3) la grue n'apparaît que pendant un chantier
patch("    const out=[[L/2,-n0*D-13]", "    if(R.chantier>0.01){\n    const out=[[L/2,-n0*D-13]");
patch("      <circle class=\"clign\" cx=\"${f1(haut[0])}\" cy=\"${f1(haut[1]-3)}\" r=\"2.4\" fill=\"#ff4a3a\"/>`;\n    s+=o+'</g>';",
      "      <circle class=\"clign\" cx=\"${f1(haut[0])}\" cy=\"${f1(haut[1]-3)}\" r=\"2.4\" fill=\"#ff4a3a\"/>`;\n    }\n    s+=o+'</g>';");
// 4) garde-fou : sous 5 000 places, le côté suivant ne devient pas négatif
patch("function coteSuivante(capT){ return Math.floor((capT-5000)/3500+1e-6)%4; }","function coteSuivante(capT){ return Math.max(0,Math.floor((capT-5000)/3500+1e-6))%4; }");
const ind=code.split('\n').map(l=>l?'  '+l:l).join('\n');
const bloc=`/* ---- LE STADE EN MAQUETTE (v1.36) ----
   Moteur de rendu repris TEL QUEL du prototype validé par l'auteur (championnat/docs/prototype-stade.html),
   enfermé dans STADE3D pour que ses noms courts (L, W, P, D, COTES, FMT…) ne croisent pas ceux du jeu.
   Quatre retouches seulement : le cyan du ruban LED devient blanc (le cyan est banni de l'interface), le gabarit
   de la prochaine tribune peut s'afficher seul et cliquable (R.cible), la grue n'apparaît que pendant un chantier, et le côté suivant reste positif sous 5 000 places.
   Pour le régénérer depuis le prototype : node docs/greffe-stade.cjs . (depuis championnat/). */
const STADE3D=(()=>{
${ind}
  return {vueMaquette, vueVille, capTribunes, coteSuivante};
})(); /* ---- fin de la maquette ---- */
`;
const f=path.join(dir,'index.html');
let h=fs.readFileSync(f,'utf8');
const crlf=h.includes('\r\n'), out=crlf?bloc.replace(/\n/g,'\r\n'):bloc;
const DEB='/* ---- LE STADE EN MAQUETTE (v1.36) ----', FIN='/* ---- fin de la maquette ---- */'+(crlf?'\r\n':'\n');
const i0=h.indexOf(DEB);
if(i0>=0){ const i1=h.indexOf(FIN,i0)+FIN.length; if(i1<FIN.length) throw new Error('fin de bloc introuvable'); h=h.slice(0,i0)+out+h.slice(i1); console.log('bloc STADE3D remplacé'); }
else { const ancre='/* ---- Visuel du stade : étapes de développement ---- */'; const j=h.indexOf(ancre); if(j<0) throw new Error('ancre introuvable'); h=h.slice(0,j)+out+h.slice(j); console.log('bloc STADE3D inséré'); }
fs.writeFileSync(f,h);
