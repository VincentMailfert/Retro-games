// Fabrique docs/prototype-stade-direct.html : le modèle (docs/modele-stade-direct.html) + le moteur STADEPIX recopié
// depuis docs/prototype-stade-pixel.html, qui reste la seule source du moteur.
// Usage, depuis championnat/ : node docs/construit-stade-direct.cjs .
const fs=require('fs'), path=require('path');
const dir=process.argv[2]||'.';
const proto=fs.readFileSync(path.join(dir,'docs/prototype-stade-pixel.html'),'utf8').replace(/\r\n/g,'\n');
const A='const STADEPIX=(()=>{', B='return {rendre, etape, GW, GH};\n})();';
const a=proto.indexOf(A), b=proto.indexOf(B);
if(a<0||b<0||b<a) throw new Error('bornes STADEPIX du prototype introuvables');
// le moteur s'appuie sur quelques constantes posées juste avant lui dans le prototype (hasard, palette, saisons)
const debut=proto.lastIndexOf('<script>',a)+'<script>'.length;
const moteur=proto.slice(debut,b+B.length);
const modele=fs.readFileSync(path.join(dir,'docs/modele-stade-direct.html'),'utf8');
if(!modele.includes('/*__MOTEUR__*/')) throw new Error('emplacement du moteur introuvable dans le modèle');
fs.writeFileSync(path.join(dir,'docs/prototype-stade-direct.html'),modele.replace('/*__MOTEUR__*/',()=>moteur));
console.log('prototype-stade-direct.html fabriqué');
