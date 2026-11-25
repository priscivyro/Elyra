/* ELYRA — illustrations originales, dessinées en SVG par le téléphone (aucune image à télécharger).
   ElyraArt.scene(cat, key) → <svg> ; ElyraArt.eft(point) → schéma des points EFT. */
(function(){
let uid=0;
const PAL={
 stress:   {s1:'#e6dcf2',s2:'#f8efe4',h1:'#b7cbb2',h2:'#86a68d',a:'#f0c987',d:'#6f8f78',n:0},
 sos:      {s1:'#f6d6c6',s2:'#fbf0e6',h1:'#e0b4a0',h2:'#bf8873',a:'#f7e2b0',d:'#9c6a58',n:0},
 sommeil:  {s1:'#2f2b58',s2:'#6c64a6',h1:'#4a4380',h2:'#2c2850',a:'#f3e7c4',d:'#211e3d',n:1},
 histoire: {s1:'#3a3468',s2:'#a493d3',h1:'#5a5196',h2:'#353062',a:'#f6e9c8',d:'#252146',n:1},
 corps:    {s1:'#dfecd6',s2:'#f8f1e5',h1:'#a9c6a1',h2:'#739a75',a:'#f2d6a0',d:'#5c7f5f',n:0},
 visu:     {s1:'#d3e5ea',s2:'#fbf0df',h1:'#b4cec6',h2:'#86a99f',a:'#f1c77e',d:'#6a8d84',n:0},
 confiance:{s1:'#f4e2bf',s2:'#fbf4e7',h1:'#d8bb8b',h2:'#ae8c5c',a:'#d3acd0',d:'#8c6d45',n:0},
 quotidien:{s1:'#f5e7cf',s2:'#fdf8ef',h1:'#c6d6ae',h2:'#97ad7b',a:'#eebf7a',d:'#7b9160',n:0},
 eft:      {s1:'#ecdcef',s2:'#fbf1e9',h1:'#cdb0cd',h2:'#a184a9',a:'#f2cf96',d:'#7e6588',n:0},
 musique:  {s1:'#e9daf0',s2:'#f8efe2',h1:'#cbb79a',h2:'#a08867',a:'#f0c987',d:'#806b50',n:0},
 son:      {s1:'#d5e6e4',s2:'#f6efe4',h1:'#a9c4c0',h2:'#7fa29c',a:'#f1d39a',d:'#62847e',n:0}
};
const MOT={minute:'soleil',pause:'nuage',respi:'feuille',emotion:'mer',pression:'galets',colere:'pluie',avant:'porte',scan:'feuille',muscle:'galets',etire:'arbre',
 place:'bol',marche:'arbre',jardin:'arbre',plage:'mer',foret:'arbre',montagne:'montagne',force:'montagne',douceur:'main',proches:'soleil',matin:'soleil',soir:'bougie',
 gratitude:'soleil',nuages:'nuage',scandodo:'lune',dodo:'lune',reveil:'etoiles',sosvoix:'porte',vague:'mer',trop:'galets',examen:'porte',rdvmed:'plume',attente:'plume',
 route:'montgolfiere',apresconflit:'pluie',tristesse:'pluie',deuil:'bougie',solitude:'etoiles',culpabilite:'plume',sante:'feuille',douleur:'bol',epuise:'nuage',travail:'galets',
 retour:'porte',estime:'montagne',non:'porte',echec:'arbre',penseeslit:'lune',relax:'etoiles',tisane:'tasse',libre:'bol',
 phare:'phare',cabane:'bougie',jardinnuit:'etoiles',train:'lune',barque:'barque',bibliotheque:'livre',montgolfiere:'montgolfiere',plagehiver:'mer',jardinzen:'galets',
 boulangerie:'bougie',refuge:'etoiles',serre:'feuille'};
const LIST=['soleil','nuage','feuille','mer','montagne','arbre','galets','plume','bol','porte'];
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function rng(seed){let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%10000)/10000}}
const f=n=>Math.round(n*10)/10;

function hills(p,r,y1=76,y2=92){const a=f(y1+r()*6-3),b=f(y2+r()*5-2);
 return `<path d="M0 ${a} C22 ${a-11} 44 ${a-6} 62 ${a+1} C80 ${a+7} 100 ${a-7} 120 ${a-9} V120 H0Z" fill="${p.h1}"/>
 <path d="M0 ${b} C24 ${b-8} 42 ${b-4} 60 ${b+2} C80 ${b+8} 100 ${b-5} 120 ${b-2} V120 H0Z" fill="${p.h2}"/>
 <path d="M0 ${b} C24 ${b-8} 42 ${b-4} 60 ${b+2} C80 ${b+8} 100 ${b-5} 120 ${b-2}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.2"/>`}
function sun(p,x,y,r){return `<g class="a-sun"><circle class="a-halo" cx="${x}" cy="${y}" r="${r*2}" fill="${p.a}" opacity=".22"/><circle cx="${x}" cy="${y}" r="${r}" fill="${p.a}"/></g>`}
function moon(p,x,y,r){return `<circle class="a-halo" cx="${x}" cy="${y}" r="${r*2.2}" fill="${p.a}" opacity=".12"/><path d="M${x} ${y-r} A${r} ${r} 0 1 0 ${x} ${y+r} A${f(r*.78)} ${r} 0 1 1 ${x} ${y-r}Z" fill="${p.a}"/>`}
function stars(p,r,n,ymax=60){let s='';for(let i=0;i<n;i++){const x=f(6+r()*108),y=f(5+r()*ymax),z=f(.5+r()*1.1);s+=`<circle class="a-tw" style="animation-delay:-${f(r()*5)}s" cx="${x}" cy="${y}" r="${z}" fill="#fff" opacity="${f(.5+r()*.5)}"/>`}return s}
function cloud(x,y,k,col='#fdf8f1'){return `<g class="a-drift"><g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="8" rx="30" ry="9" fill="#000" opacity=".05"/>
 <path d="M-28 6 C-34 6 -34 -6 -24 -6 C-24 -16 -10 -20 -4 -12 C0 -22 18 -22 20 -8 C30 -10 34 4 26 6Z" fill="${col}"/>
 <path d="M-28 6 C-20 2 10 4 26 6" fill="none" stroke="#000" stroke-opacity=".06" stroke-width="3"/></g></g>`}

const M={
 soleil(p,r){return sun(p,f(35+r()*50),f(40+r()*8),f(11+r()*4))+hills(p,r)},
 nuage(p,r){const x=f(40+r()*40);return sun(p,x+12,40,12)+cloud(x,46,1+r()*.2)+hills(p,r,80,95)},
 feuille(p,r){return sun(p,f(28+r()*10),30,9)+hills(p,r,86,100)+
  `<g class="a-sway"><g transform="rotate(${f(-8+r()*16)} 60 62)"><path d="M28 96 C28 58 58 30 96 24 C94 62 70 92 28 96Z" fill="${p.h2}"/><path d="M28 96 C28 58 58 30 96 24 C80 50 58 74 28 96Z" fill="#fff" opacity=".12"/>
  <path d="M30 94 C50 74 70 52 92 28" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>
  ${[0,1,2,3].map(i=>{const t=.25+i*.17,x=30+62*t,y=94-66*t;return `<path d="M${f(x)} ${f(y)} q${f(10-i)} ${f(2)} ${f(16-i*2)} ${f(-4)}M${f(x)} ${f(y)} q${f(-2)} ${f(-9+i)} ${f(-6)} ${f(-15+i*2)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`}).join('')}</g></g>`},
 mer(p,r){const x=f(40+r()*40);return `<circle cx="${x}" cy="66" r="26" fill="${p.a}" opacity=".18"/><path d="M${x-15} 66 A15 15 0 0 1 ${x+15} 66Z" fill="${p.a}"/>
  <rect y="66" width="120" height="54" fill="${p.h1}"/>${[0,1,2,3].map(i=>`<path class="a-wave" style="animation-delay:-${i*1.3}s" d="M-12 ${72+i*12} C8 ${68+i*12} 28 ${76+i*12} 48 ${72+i*12} S88 ${68+i*12} 108 ${72+i*12} S128 ${76+i*12} 132 ${72+i*12} V120 H-12Z" fill="${p.h2}" opacity="${f(.35+i*.18)}"/>`).join('')}
  ${[0,1,2,3,4].map(i=>`<rect class="a-shim" style="animation-delay:-${i*.7}s" x="${f(x-9+i%2*4-i)}" y="${70+i*5}" width="${f(18-i*3)}" height="1.6" rx=".8" fill="${p.a}" opacity=".75"/>`).join('')}`},
 montagne(p,r){const o=f(r()*14-7);return sun(p,f(84+o/2),32,9)+`<path d="M-4 84 L${30+o} 34 L${52+o} 62 L${70+o} 44 L124 86Z" fill="${p.h1}"/>
  <path d="M${30+o} 34 L${24+o} 43 L${29+o} 41 L${33+o} 45 L${37+o} 40Z" fill="#fff" opacity=".85"/><path d="M${70+o} 44 L${65+o} 51 L${70+o} 49 L${74+o} 52Z" fill="#fff" opacity=".85"/>
  <path d="M${30+o} 34 L${52+o} 62 L${44+o} 84 L${36+o} 84Z" fill="#000" opacity=".06"/><rect class="a-mist" x="-20" y="70" width="160" height="10" rx="5" fill="${p.s2}" opacity=".55"/>`+hills(p,r,92,102)},
 arbre(p,r){const x=f(50+r()*24);return sun(p,f(24+r()*10),34,10)+hills(p,r,82,98)+`<rect x="${x-2}" y="58" width="4" height="26" rx="2" fill="${p.d}"/>
  <g class="a-tree"><circle cx="${x}" cy="50" r="17" fill="${p.h2}"/><circle cx="${x-10}" cy="58" r="11" fill="${p.h2}"/><circle cx="${x+11}" cy="57" r="12" fill="${p.h2}"/>
  <circle cx="${x-5}" cy="44" r="9" fill="#fff" opacity=".12"/></g>`},
 galets(p,r){return sun(p,f(80+r()*14),30,10)+hills(p,r,84,100)+`<ellipse cx="60" cy="98" rx="30" ry="4" fill="#000" opacity=".1"/>
  <ellipse cx="60" cy="88" rx="26" ry="10" fill="#9a8f84"/><ellipse cx="60" cy="72" rx="19" ry="8" fill="#b9ada0"/><ellipse cx="61" cy="59" rx="13" ry="6.5" fill="#cfc4b6"/><ellipse cx="60" cy="49" rx="8" ry="4.5" fill="#e2d9cc"/>
  <path d="M38 86 q22 -8 44 0M45 70 q15 -6 30 0M51 57 q10 -4 20 0" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>`},
 plume(p,r){const a=f(-30+r()*20);return sun(p,30,32,9)+hills(p,r,88,102)+`<g class="a-feather"><g transform="rotate(${a} 64 58)"><path d="M64 22 C80 38 82 70 64 96 C48 70 48 38 64 22Z" fill="#fbf5ec"/>
  <path d="M64 22 C80 38 82 70 64 96 C70 70 70 40 64 22Z" fill="${p.a}" opacity=".35"/><path d="M64 26 V104" stroke="${p.d}" stroke-width="1.2"/>
  ${[0,1,2,3,4,5].map(i=>`<path d="M64 ${34+i*10} l${-9+i%2} -4M64 ${34+i*10} l${9-i%2} -4" stroke="${p.d}" stroke-opacity=".35" stroke-width=".8"/>`).join('')}</g></g>`},
 bol(p,r){return `<rect y="78" width="120" height="42" fill="${p.h1}"/><rect y="78" width="120" height="3" fill="#fff" opacity=".2"/>`+sun(p,f(86+r()*10),28,9)+
  `<ellipse cx="60" cy="98" rx="36" ry="5" fill="#000" opacity=".1"/><path d="M24 70 C26 98 94 98 96 70Z" fill="#f4ead9"/><path d="M60 70 C76 70 94 72 96 70 C94 98 70 98 60 96Z" fill="#000" opacity=".06"/>
  <ellipse cx="60" cy="70" rx="36" ry="9" fill="#efe3cf"/><ellipse cx="60" cy="70" rx="31" ry="7" fill="${p.h2}"/>
  ${[0,1,2].map(i=>`<ellipse class="a-ring" style="animation-delay:-${i*2}s" cx="60" cy="70" rx="24" ry="5.3" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".8"/>`).join('')}<circle cx="60" cy="70" r="2.6" fill="${p.a}"/>`},
 porte(p,r){return `<rect width="120" height="120" fill="${p.h1}" opacity=".55"/><path class="a-halo" d="M40 104 V58 A20 20 0 0 1 80 58 V104Z" fill="${p.a}" opacity=".35"/>
  <path d="M44 104 V60 A16 16 0 0 1 76 60 V104Z" fill="#fff8ea"/><path d="M44 104 L76 104 L110 120 L10 120Z" fill="${p.a}" opacity=".4"/>
  <path d="M60 46 V104" stroke="${p.h1}" stroke-opacity=".5"/><rect y="104" width="120" height="16" fill="${p.h2}" opacity=".6"/>`},
 lune(p,r){return stars(p,r,16)+moon(p,f(78+r()*14),f(30+r()*8),11)+hills(p,r,84,98)},
 etoiles(p,r){return stars(p,r,34,80)+`<circle cx="${f(20+r()*80)}" cy="${f(18+r()*20)}" r="1.8" fill="#fff"/>`+hills(p,r,90,102)},
 pluie(p,r){let s='';for(let i=0;i<22;i++){const x=f(r()*120),y=f(40+r()*60);s+=`<path class="a-rain" style="animation-delay:-${f(r()*1.2)}s" d="M${x} ${y} l-2 6" stroke="#fff" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"/>`}
  return hills(p,r,86,100)+s+cloud(60,34,1.25,'#f4eee8')},
 bougie(p,r){return `<rect width="120" height="120" fill="${p.d}" opacity=".35"/><circle class="a-halo" cx="60" cy="44" r="34" fill="${p.a}" opacity=".18"/><circle class="a-halo" cx="60" cy="44" r="18" fill="${p.a}" opacity=".25"/>
  <rect y="92" width="120" height="28" fill="${p.h2}"/><ellipse cx="60" cy="94" rx="22" ry="4" fill="#000" opacity=".12"/>
  <rect x="49" y="56" width="22" height="38" rx="3" fill="#fbf3e4"/><rect x="62" y="56" width="9" height="38" rx="3" fill="#000" opacity=".06"/>
  <g class="a-flame"><path d="M60 32 C66 40 65 48 60 50 C55 48 54 40 60 32Z" fill="${p.a}"/><path d="M60 38 C62 43 62 47 60 48 C58 47 58 43 60 38Z" fill="#fff" opacity=".8"/></g><path d="M60 50 v6" stroke="#5b4b3a" stroke-width="1"/>`},
 tasse(p,r){return sun(p,90,26,8)+`<rect y="84" width="120" height="36" fill="${p.h1}"/><ellipse cx="58" cy="94" rx="34" ry="7" fill="#efe4d2"/><ellipse cx="58" cy="93" rx="24" ry="4" fill="#000" opacity=".08"/>
  <path d="M36 60 H80 V78 C80 90 36 90 36 78Z" fill="#fbf4e8"/><path d="M80 64 C92 64 92 80 78 80" fill="none" stroke="#fbf4e8" stroke-width="4"/>
  <ellipse cx="58" cy="60" rx="22" ry="4" fill="${p.d}" opacity=".55"/><path d="M60 60 H80 V78 C80 86 70 88 60 88Z" fill="#000" opacity=".05"/>
  ${[48,58,68].map((x,i)=>`<path class="a-steam" style="animation-delay:-${i*1.1}s" d="M${x} 52 c-4 -6 4 -10 0 -16 c-3 -5 2 -8 1 -12" fill="none" stroke="#fff" stroke-opacity="${.5-i*.08}" stroke-width="2" stroke-linecap="round"/>`).join('')}`},
 main(p,r){return `<circle class="a-halo" cx="60" cy="58" r="40" fill="${p.a}" opacity=".22"/><circle class="a-halo" cx="60" cy="58" r="26" fill="${p.a}" opacity=".25"/>`+hills(p,r,96,106)+
  `<g fill="#eac4a6"><rect x="44" y="56" width="32" height="36" rx="14"/><rect x="44" y="30" width="7" height="34" rx="3.5"/><rect x="52.5" y="25" width="7" height="38" rx="3.5"/>
  <rect x="61" y="27" width="7" height="36" rx="3.5"/><rect x="69.5" y="33" width="6.5" height="30" rx="3.2"/><rect x="31" y="58" width="7" height="24" rx="3.5" transform="rotate(-38 34 70)"/>
  <rect x="50" y="88" width="20" height="24" rx="4"/></g><path d="M72 60 C78 70 78 82 72 92" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="5"/>`},
 barque(p,r){return stars(p,r,10,40)+moon(p,84,26,8)+`<rect y="66" width="120" height="54" fill="${p.h1}"/>${[0,1,2,3].map(i=>`<rect class="a-shim" style="animation-delay:-${i*.6}s" x="${78-i*2}" y="${72+i*6}" width="${12+i*3}" height="1.4" rx=".7" fill="${p.a}" opacity=".6"/>`).join('')}
  <path d="M0 66 C30 58 50 62 70 66Z" fill="${p.h2}"/><g class="a-bob"><path d="M26 84 H66 L60 92 H32Z" fill="#7a5a43"/><path d="M26 84 H66" stroke="#c9a37f" stroke-width="1.2"/><path d="M46 84 V70" stroke="#c9a37f" stroke-width="1"/></g>
  <path d="M20 94 C40 96 60 92 80 95" fill="none" stroke="#fff" stroke-opacity=".25"/>`},
 montgolfiere(p,r){return sun(p,24,30,8)+cloud(92,40,.6)+hills(p,r,88,100)+`<g class="a-float"><path d="M60 18 C82 18 88 44 66 66 H54 C32 44 38 18 60 18Z" fill="${p.a}"/>
  <path d="M60 18 C68 18 72 44 63 66 H57 C48 44 52 18 60 18Z" fill="#fff" opacity=".4"/><path d="M60 18 C82 18 88 44 66 66 H62 C78 44 74 22 60 18Z" fill="#000" opacity=".08"/>
  <path d="M55 66 L56 74 M65 66 L64 74" stroke="${p.d}" stroke-width=".8"/><rect x="55" y="74" width="10" height="7" rx="1.5" fill="#8c6a4d"/></g>`},
 phare(p,r){return stars(p,r,10,40)+`<path class="a-beam" d="M60 34 L124 16 V48Z" fill="${p.a}" opacity=".35"/><rect y="80" width="120" height="40" fill="${p.h1}"/>${[0,1,2].map(i=>`<path d="M0 ${88+i*10} C30 ${84+i*10} 60 ${92+i*10} 120 ${86+i*10} V120 H0Z" fill="${p.h2}" opacity="${.4+i*.2}"/>`).join('')}
  <path d="M30 84 C40 76 70 76 80 84Z" fill="#6b5d55"/><path d="M53 80 L55 38 H65 L67 80Z" fill="#f7efe4"/><path d="M54.6 48 H65.4 L65.9 58 H54.1Z M53.6 68 H66.4 L66.8 76 H53.2Z" fill="#c9776a"/>
  <rect x="54" y="30" width="12" height="8" rx="1" fill="${p.a}"/><path d="M52 30 L60 22 L68 30Z" fill="#c9776a"/>`},
 livre(p,r){let s='';for(let i=0;i<16;i++){const x=f(r()*120),y=f(r()*50);s+=`<path class="a-rain" style="animation-delay:-${f(r()*1.2)}s" d="M${x} ${y} l-2 6" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`}
  return `<rect width="120" height="120" fill="${p.d}" opacity=".3"/>`+s+`<circle cx="60" cy="70" r="34" fill="${p.a}" opacity=".2"/><rect y="94" width="120" height="26" fill="${p.h2}"/>
  <path d="M60 64 C48 58 32 58 22 62 V94 C32 90 48 90 60 96Z" fill="#fbf4e7"/><path d="M60 64 C72 58 88 58 98 62 V94 C88 90 72 90 60 96Z" fill="#f3e8d6"/>
  ${[0,1,2,3].map(i=>`<path d="M28 ${70+i*5} C38 ${67+i*5} 48 ${67+i*5} 55 ${71+i*5}M65 ${71+i*5} C72 ${67+i*5} 82 ${67+i*5} 92 ${70+i*5}" fill="none" stroke="${p.d}" stroke-opacity=".25" stroke-width=".8"/>`).join('')}`}
};

function scene(cat,key){const p=PAL[cat]||PAL.stress;const h=hash(key||cat),r=rng(h);const mot=MOT[key]||(cat==='eft'?'main':LIST[h%LIST.length]);const id='a'+(++uid);
 const body=(M[mot]||M.soleil)(p,r);
 return `<svg class="art" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.s1}"/><stop offset="1" stop-color="${p.s2}"/></linearGradient></defs>
 <rect width="120" height="120" fill="url(#${id})"/>${body}</svg>`}

/* ---- schéma EFT (dessin original) ---- */
const PTS={MK:[27,58],ST:[124,42],DS:[132,80],CO:[160,92],SO:[142,104],SN:[124,115],ME:[124,131],CL:[138,186],SB:[188,218]};
function eft(active){const pt=(k)=>{const [x,y]=PTS[k];const on=k===active;
  return `<g class="ep${on?' on':''}" data-pt="${k}">${on?`<circle cx="${x}" cy="${y}" r="10" class="halo"/>`:''}<circle cx="${x}" cy="${y}" r="${on?5:3.6}"/></g>`};
 return `<svg class="eftd" viewBox="0 0 240 250" role="img" aria-label="Schéma des points de tapotement">
 <g class="line"><path d="M54 250 C58 200 84 182 108 172 M140 172 C164 182 190 200 194 250"/><path d="M110 146 L108 172 M138 146 L140 172"/>
 <ellipse cx="124" cy="94" rx="42" ry="53"/><path d="M84 82 C80 46 104 34 126 36 C150 36 170 52 164 86 C158 66 140 58 122 62 C104 60 92 68 84 82Z" class="hair"/>
 <path d="M104 80 q8 -4 15 -1 M129 79 q7 -3 15 1"/><path d="M106 92 q6 4 12 0 M130 92 q6 4 12 0"/><path d="M124 96 v12 q-3 2 -5 1"/><path d="M114 124 q10 6 20 0"/>
 <path d="M96 184 q14 -6 24 -2 M128 182 q12 -4 24 2"/><path d="M180 196 C186 206 190 216 190 228"/>
 <g transform="translate(8 8)"><rect x="0" y="0" width="64" height="88" rx="16" class="box"/><path d="M18 78 V46 C18 40 14 34 14 28 V18 C14 14 20 14 20 18 V30 M20 26 V12 C20 8 26 8 26 12 V28 M26 24 V10 C26 6 32 6 32 10 V28 M32 26 V14 C32 10 38 10 38 14 V40 C42 34 48 34 48 38 C44 48 40 56 36 62 V78"/></g></g>
 ${Object.keys(PTS).map(pt).join('')}</svg>`}

window.ElyraArt={scene,eft,points:PTS};
})();
