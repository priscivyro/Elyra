/* ELYRA · la mascotte : une petite goutte de lumière vivante (SVG, aucune dépendance, fonctionne hors ligne).
   ElyraMascotte.create(el,état) → mascotte ; états : repos, ecoute, reflexion, parole, respiration, joie, reconfort, sommeil.
   ElyraMascotte.face(el,opts) → même interface que ElyraFace (state, expr, level, talk, sync, quiet, destroy).
   La bouche suit le vrai niveau du son quand il est connu (level) ; sinon un rythme de syllabes (talk). */
(function(){
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let uid=0;
/* expressions : yeux (ouverts, heureux, fermés), ouverture, regard, sourire, bouche, joues, inclinaison, lumière */
const E={
 sourire:{eyes:'o',open:1,gx:0,gy:0,smile:.8,mouth:.12,w:11,ck:.35,tilt:0,glow:1,n:'Sourire chaleureux'},
 attentive:{eyes:'o',open:1.12,gx:0,gy:0,smile:.25,mouth:0,w:9,ck:.22,tilt:5,glow:1.05,n:'Attentive'},
 reflexion:{eyes:'o',open:.9,gx:4,gy:-4,smile:0,mouth:0,w:6,ck:.15,tilt:-4,glow:1.15,n:'Réflexion'},
 paisible:{eyes:'c',open:1,gx:0,gy:0,smile:.5,mouth:0,w:10,ck:.3,tilt:0,glow:.95,n:'Paisible'},
 fermes:{eyes:'c',open:1,gx:0,gy:0,smile:.15,mouth:0,w:8,ck:.15,tilt:0,glow:.9,n:'Yeux fermés'},
 joie:{eyes:'h',open:1,gx:0,gy:0,smile:1,mouth:.55,w:12,ck:.42,tilt:0,glow:1.25,n:'Joie'},
 curiosite:{eyes:'o',open:1.15,gx:-3,gy:-2,smile:.3,mouth:.35,w:6,ck:.25,tilt:9,glow:1.1,n:'Curiosité'},
 soutien:{eyes:'o',open:.78,gx:0,gy:1.5,smile:.55,mouth:0,w:10,ck:.4,tilt:-5,glow:1,n:'Soutien'},
 endormie:{eyes:'c',open:1,gx:0,gy:0,smile:0,mouth:.15,w:5,ck:.1,tilt:3,glow:.55,n:'Endormie'},
 encourage:{eyes:'o',open:.98,gx:0,gy:-1,smile:.95,mouth:.32,w:11,ck:.36,tilt:3,glow:1.15,n:'Encourageante'}};
/* états animés */
const S={
 repos:{n:'Repos',e:'sourire',halo:'#d8f3ee',cap:'Elle flotte, respire doucement, cligne des yeux et regarde autour d’elle.'},
 ecoute:{n:'Écoute',e:'attentive',halo:'#e4dcfb',cap:'Quand tu parles, elle te regarde, penche la tête, et sa lumière suit ta voix.'},
 reflexion:{n:'Réflexion',e:'reflexion',halo:'#e9e4fb',cap:'Son regard bouge un peu et sa lumière pulse pendant qu’elle prépare sa réponse.'},
 parole:{n:'Parole',e:'sourire',halo:'#dff4f0',cap:'Sa bouche suit la voix. Dans l’appli, elle suivra le vrai son de la voix naturelle ; ici, c’est une imitation.'},
 respiration:{n:'Respiration',e:'paisible',halo:'#dff4f0',cap:'Elle gonfle à l’inspiration et se dégonfle lentement à l’expiration, au rythme de l’exercice.'},
 joie:{n:'Joie',e:'joie',halo:'#fbefd0',cap:'Un petit rebond discret quand tu termines une étape.'},
 reconfort:{n:'Réconfort',e:'soutien',halo:'#fbe1de',cap:'Mouvements ralentis, regard doux, lumière chaude : elle est là, simplement.'},
 sommeil:{n:'Sommeil',e:'endormie',halo:'#d9d6ee',cap:'Yeux fermés, flottement très lent, lumière presque éteinte.'}};

function markup(id){return `<svg viewBox="0 0 240 250" class="masc" role="img" aria-label="ELYRA, une petite goutte de lumière">
<defs>
<radialGradient id="${id}b" cx="40%" cy="32%" r="78%"><stop offset="0" stop-color="#F2FCF9"/><stop offset=".35" stop-color="#B9E8DD"/><stop offset=".7" stop-color="#55C6B8" stop-opacity=".94"/><stop offset="1" stop-color="#8A79E0" stop-opacity=".9"/></radialGradient>
<radialGradient id="${id}h"><stop offset="0" class="hs" stop-color="#7fe0d2" stop-opacity=".55"/><stop offset="1" class="hs" stop-color="#7fe0d2" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}c"><stop offset="0" class="cs" stop-color="#FFFDF2"/><stop offset="1" class="cs" stop-color="#FFFDF2" stop-opacity="0"/></radialGradient>
<filter id="${id}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="${id}s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
</defs>
<ellipse class="sh" cx="120" cy="236" rx="56" ry="7" fill="#292943" opacity=".15"/>
<g class="fl">
<circle class="ha" cx="120" cy="138" r="112" fill="url(#${id}h)"/>
<g class="bd">
<path class="sp" fill="url(#${id}b)"/>
<ellipse class="co" cx="122" cy="150" rx="46" ry="38" fill="url(#${id}c)" filter="url(#${id}f)"/>
<path class="ri" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>
<path class="lo" fill="none" stroke="#7966D9" stroke-opacity=".25" stroke-width="5" filter="url(#${id}s)"/>
<ellipse cx="90" cy="92" rx="19" ry="10" fill="#fff" opacity=".78" transform="rotate(-32 90 92)" filter="url(#${id}s)"/>
<circle cx="76" cy="114" r="3.2" fill="#fff" opacity=".85"/>
<g class="fc">
<ellipse class="ck" cx="86" cy="158" rx="11" ry="6" fill="#F28C83" filter="url(#${id}s)"/><ellipse class="ck" cx="154" cy="158" rx="11" ry="6" fill="#F28C83" filter="url(#${id}s)"/>
<g class="ey" data-x="100"><g class="eo"><ellipse class="ir" cx="100" cy="138" rx="7.2" ry="10" fill="#292943"/><circle class="gl" cx="102.8" cy="133.4" r="2.7" fill="#fff"/><circle class="gl2" cx="97.5" cy="143" r="1.4" fill="#fff" opacity=".8"/></g><path class="ea" fill="none" stroke="#292943" stroke-width="3.2" stroke-linecap="round"/></g>
<g class="ey" data-x="140"><g class="eo"><ellipse class="ir" cx="140" cy="138" rx="7.2" ry="10" fill="#292943"/><circle class="gl" cx="142.8" cy="133.4" r="2.7" fill="#fff"/><circle class="gl2" cx="137.5" cy="143" r="1.4" fill="#fff" opacity=".8"/></g><path class="ea" fill="none" stroke="#292943" stroke-width="3.6" stroke-linecap="round"/></g>
<path class="mo" fill="#7A3550" stroke="#7A3550" stroke-width="1.4" stroke-linejoin="round"/>
</g></g></g>
<g class="fx"></g>
</svg>`}

function bodyPath(t,wob){const N=16,cx=120,cy=144,P=[];
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2-Math.PI/2,s=Math.sin(a),c=Math.cos(a);
  let r=78*(1+.24*Math.pow(Math.max(0,-s),7))*(1+.05*s)*(1+.03*Math.cos(a-.7));
  r*=1+wob*(.022*Math.sin(t*1.3+i*1.9)+.012*Math.sin(t*2.1+i*.7));
  P.push([cx+c*r*1.02,cy+s*r*.97])}
 let d=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
 for(let i=0;i<N;i++){const p0=P[(i-1+N)%N],p1=P[i],p2=P[(i+1)%N],p3=P[(i+2)%N];
  const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
  d+=`C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}
 return d+'Z'}
function mouthPath(o,s,w){const cy=163,y0=cy-s*3.2;return `M${120-w} ${y0}Q120 ${cy+s*2.5-o*2} ${120+w} ${y0}Q120 ${cy+s*5.5+o*13+1.2} ${120-w} ${y0}Z`}
const lerp=(a,b,k)=>a+(b-a)*k;

class Masc{
 constructor(host,state,opt){opt=opt||{};this.id='m'+(++uid);host.innerHTML=markup(this.id);this.svg=host.querySelector('svg');const q=s=>this.svg.querySelector(s),qa=s=>[...this.svg.querySelectorAll(s)];
  Object.assign(this,{sh:q('.sh'),fl:q('.fl'),ha:q('.ha'),bd:q('.bd'),sp:q('.sp'),co:q('.co'),ri:q('.ri'),lo:q('.lo'),fc:q('.fc'),ck:qa('.ck'),eyes:qa('.ey'),mo:q('.mo'),fx:q('.fx'),hs:qa('.hs'),cs:qa('.cs')});
  this.cur={...E[S[state]?S[state].e:'sourire']};this.state=null;this.t0=performance.now();this.blinkAt=0;this.blink=-1;this.gz=[0,0];this.gzT=[0,0];this.gzAt=0;this.squish=0;this.bounce=-9;this.talk=null;this.fxAt=0;this.static=!!opt.static;
  this.set(state);this.svg.addEventListener('click',()=>this.poke());}
 set(st){this.state=st;this.tgt={...E[S[st].e]};this.st0=performance.now();this.fx.innerHTML='';
  if(st==='joie')this.bounce=0;this.talk=st==='parole';if(st!=='parole'){this.seq=null;this.lvl=null}
  const warm=st==='reconfort';this.hs.forEach(s=>s.setAttribute('stop-color',warm?'#F7A99F':st==='ecoute'||st==='reflexion'?'#a99af0':st==='joie'?'#F5C96B':st==='sommeil'?'#7a74c9':'#7fe0d2'));
  this.cs.forEach(s=>s.setAttribute('stop-color',warm?'#FFE2C8':'#FFFDF2'))}
 expr(name){this.tgt={...E[name]}}
 poke(){this.squish=1;if(this.state!=='sommeil'&&this.state!=='respiration'){const prev=this.tgt;this.tgt={...E.joie};clearTimeout(this.pk);this.pk=setTimeout(()=>{this.tgt={...E[S[this.state].e]}},900)}}
 frame(now){const t=(now-this.t0)/1000*(this.state==='reconfort'||this.state==='sommeil'?.55:1),c=this.cur,g=this.tgt,k=.08;
  for(const key in g)if(typeof g[key]==='number')c[key]=lerp(c[key],g[key],k);c.eyes=g.eyes;
  // regard
  if(now>this.gzAt){this.gzAt=now+1200+Math.random()*2600;this.gzT=this.state==='repos'?[(Math.random()-.5)*5,(Math.random()-.5)*3]:this.state==='reflexion'?[2+Math.random()*4,-3-Math.random()*2]:[0,0]}
  this.gz[0]=lerp(this.gz[0],this.gzT[0],.06);this.gz[1]=lerp(this.gz[1],this.gzT[1],.06);
  const gx=c.gx+this.gz[0],gy=c.gy+this.gz[1];
  // clignement
  if(now>this.blinkAt){this.blink=now;this.blinkAt=now+2400+Math.random()*3800}
  const bk=now-this.blink<170?Math.sin((now-this.blink)/170*Math.PI):0;
  // respiration
  let br=Math.sin(t*1.15)*.5+.5;let cue='';
  if(this.state==='respiration'){const cyc=10,ph=((now-this.st0)/1000)%cyc;br=ph<4?(1-Math.cos(ph/4*Math.PI))/2:(1+Math.cos((ph-4)/6*Math.PI))/2;cue=ph<4?'Inspire…':'Expire…';br*=2.4}
  else br*=.5;
  if(this.brT){const k=Math.min(1,(now-this.brT.t0)/(this.brT.d*1000)),e=(1-Math.cos(k*Math.PI))/2;this.extBr=this.brT.from+(this.brT.to-this.brT.from)*e}
  if(this.extBr!=null)br=this.extBr*2.4;
  // parole (imitation)
  let mo=c.mouth;if(this.lvl!=null&&this.state==='parole'){mo=lerp(this._m||0,this.lvl*1.15,.45);this._m=mo}
  else if(this.seq){const k=Math.floor((now-this.seq.start)/this.seq.step);if(k>=0&&k<this.seq.a.length){mo=lerp(this._m||0,this.seq.a[k],.45);this._m=mo}else if(now-this.seq.start>this.seq.dur){this.seq=null;this._m=0}}
  // rebond, écrasement
  let by=0;if(this.bounce>=0){const b=(now-this.st0)/1000;by=-Math.abs(Math.sin(b*5.2))*12*Math.exp(-b*1.6);if(b>3)this.bounce=-9}
  if(this.state==='joie'&&now>this.fxAt){this.fxAt=now+260;this.spark()}
  if(this.state==='sommeil'&&now>this.fxAt){this.fxAt=now+1800;this.zz()}
  this.squish=lerp(this.squish,0,.09);const sq=Math.sin(this.squish*Math.PI)*this.squish;
  const fy=RM?0:Math.sin(t*1.1)*(this.state==='sommeil'?3:5)+by;
  const sx=1+br*.06+sq*.1,sy=1+br*.05-sq*.1;
  this.fl.setAttribute('transform',`translate(0 ${fy.toFixed(2)}) rotate(${(c.tilt+(RM?0:Math.sin(t*.7)*1.2)+(this.talk?Math.sin(t*3)*1.2:0)).toFixed(2)} 120 200)`);
  this.bd.setAttribute('transform',`translate(120 222) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(-120 -222)`);
  this.sh.setAttribute('rx',(56-fy*.9).toFixed(1));this.sh.setAttribute('opacity',(.15-fy*.003).toFixed(3));
  const d=bodyPath(t,RM?0:1);this.sp.setAttribute('d',d);this.ri.setAttribute('d',d);this.lo.setAttribute('d',d);
  const pulse=this.state==='reflexion'?.25*Math.sin(t*4.5):this.state==='ecoute'?.15*Math.sin(t*6):0;
  const gl=c.glow+pulse;this.co.setAttribute('opacity',Math.max(.15,Math.min(1,gl*.85)).toFixed(3));this.ha.setAttribute('opacity',Math.max(.2,Math.min(1,gl*.8)).toFixed(3));
  this.ha.setAttribute('r',(108+br*8+pulse*14).toFixed(1));this.svg.style.opacity=this.state==='sommeil'?.88:1;
  this.ck.forEach(e=>e.setAttribute('opacity',c.ck.toFixed(3)));
  this.eyes.forEach((eg,j)=>{const x=+eg.dataset.x,o=eg.querySelector('.eo'),a=eg.querySelector('.ea');
   if(c.eyes==='o'){o.style.display='';a.style.display='none';const sc=Math.max(.06,c.open*(1-bk*.94));
    o.setAttribute('transform',`translate(${gx.toFixed(2)} ${gy.toFixed(2)}) translate(${x} 138) scale(1 ${sc.toFixed(3)}) translate(${-x} -138)`)}
   else{o.style.display='none';a.style.display='';a.setAttribute('d',c.eyes==='h'?`M${x-9} 141Q${x} 129 ${x+9} 141`:`M${x-9} 137Q${x} 145 ${x+9} 137`)}});
  this.mo.setAttribute('d',mouthPath(Math.max(0,mo),c.smile,c.w));
  return cue}
 spark(){const s=document.createElementNS('http://www.w3.org/2000/svg','circle');const a=Math.random()*Math.PI*2,r=70+Math.random()*30;
  s.setAttribute('cx',120+Math.cos(a)*r);s.setAttribute('cy',130+Math.sin(a)*r*.8);s.setAttribute('r',2+Math.random()*2.5);s.setAttribute('fill',['#F5C96B','#F28C83','#A9DED0','#DCD5E8'][Math.floor(Math.random()*4)]);
  s.style.transition='opacity 1.2s, transform 1.2s';this.fx.appendChild(s);requestAnimationFrame(()=>{s.style.opacity=0;s.style.transform='translateY(-14px)'});setTimeout(()=>s.remove(),1300)}
 zz(){const z=document.createElementNS('http://www.w3.org/2000/svg','text');z.textContent='z';z.setAttribute('x',172);z.setAttribute('y',80);z.setAttribute('fill','#b7a9ff');z.setAttribute('font-size',18);z.setAttribute('font-family','DM Serif Display, serif');
  z.style.transition='opacity 3s, transform 3s';this.fx.appendChild(z);requestAnimationFrame(()=>{z.style.opacity=0;z.style.transform='translate(14px,-40px)'});setTimeout(()=>z.remove(),3100)}
}


const live=new Set();let raf=0;
function loop(now){raf=0;let any=false;for(const m of live){if(m.dead){live.delete(m);continue}if(!m.svg.isConnected){live.delete(m);continue}
  if(m.svg.getClientRects().length===0)continue;any=true;try{m.frame(now)}catch(e){}}
  if(live.size)raf=requestAnimationFrame(loop)}
function track(m){live.add(m);m.frame(performance.now());if(!raf)raf=requestAnimationFrame(loop)}
function create(host,state){const m=new Masc(host,S[state]?state:'repos');track(m);return m}
const MAPS={idle:'repos',listen:'ecoute',think:'reflexion',speak:'parole'};
const MAPE={neutre:'sourire',doux:'sourire',sourire:'sourire',attentif:'attentive',soucieux:'soutien'};
function face(host,opt){opt=opt||{};const wrap=document.createElement('div');wrap.className='fl fl-masc';wrap.dataset.state='idle';host.innerHTML='';host.appendChild(wrap);
  const m=create(wrap,'repos');m.svg.setAttribute('aria-label',opt.label||'ELYRA');
  const lipsFn=window.ElyraLive&&window.ElyraLive.lips;
  return{el:wrap,m,
    state(s){const k=MAPS[s]||s;if(S[k]&&m.state!==k)m.set(k);wrap.dataset.state=s},
    expr(e){const k=E[e]?e:MAPE[e];if(k)m.expr(k)},
    level(v){m.lvl=Math.max(0,Math.min(1,v))},
    talk(text,sec){const a=lipsFn?lipsFn(text):String(text).split('').map(c=>/[aeiouyéèêàâôîû]/i.test(c)?.8:/[ .,]/.test(c)?0:.25);
      m.lvl=null;m.seq={a,start:performance.now(),dur:sec*1000,step:Math.max(45,sec*1000/Math.max(1,a.length))}},
    sync(i,text){if(!m.seq)return;const k=Math.round(i/Math.max(1,text.length)*m.seq.a.length);m.seq.start=performance.now()-k*m.seq.step},
    quiet(){m.seq=null;m.lvl=null},
    destroy(){m.dead=true;live.delete(m)}}}
window.ElyraMascotte={create,face,expressions:E,states:S};
})();
