/* ELYRA — moteur de sons d'ambiance.
   Tout est généré en direct par le téléphone (Web Audio) : aucun fichier à télécharger,
   le son ne se répète jamais exactement, et tout fonctionne hors ligne.
   API : ElyraSons.ctx(), .on(k), .off(k), .toggle(k), .vol(k,v), .only(k), .stopAll(),
         .active(), .duck(bool), .timer(min), .onChange(cb), .tone(f,dur,vol), .bell() */
(function(){
const R=Math.random, rr=(a,b)=>a+R()*(b-a);
const S={ac:null,master:null,duckG:null,rev:null,buf:{},layers:{},iv:null,cbs:[],timerT:null,fadeT:null};

function ctx(){
  try{
    if(!S.ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;S.ac=new AC()}
    if(S.ac.state==='suspended')S.ac.resume();
  }catch(e){return null}
  if(!S.master)build();
  return S.ac;
}
function build(){
  const a=S.ac;
  S.master=a.createGain();S.master.gain.value=.9;
  S.duckG=a.createGain();S.duckG.gain.value=1;
  const comp=a.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;
  S.master.connect(S.duckG).connect(comp).connect(a.destination);
  S.rev=a.createConvolver();S.rev.buffer=impulse(a,3.4);const rg=a.createGain();rg.gain.value=.9;S.rev.connect(rg).connect(S.master);
  S.buf.white=noise(a,'white');S.buf.pink=noise(a,'pink');S.buf.brown=noise(a,'brown');
}
function noise(a,kind){
  const sec=8,len=Math.floor(a.sampleRate*sec),fade=Math.floor(a.sampleRate*.5),buf=a.createBuffer(2,len,a.sampleRate);
  for(let c=0;c<2;c++){
    const tmp=new Float32Array(len+fade);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0;
    for(let i=0;i<tmp.length;i++){const w=R()*2-1;
      if(kind==='white')tmp[i]=w*.5;
      else if(kind==='pink'){b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;tmp[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}
      else{last=(last+.02*w)/1.02;tmp[i]=last*3.5}}
    const d=buf.getChannelData(c);
    for(let i=0;i<len;i++)d[i]=tmp[i];
    for(let i=0;i<fade;i++){const g=i/fade;d[i]=tmp[i]*g+tmp[len+i]*(1-g)}
  }
  return buf;
}
function impulse(a,sec){
  const len=Math.floor(a.sampleRate*sec),b=a.createBuffer(2,len,a.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(R()*2-1)*Math.pow(1-i/len,3.2)}
  return b;
}
/* petits outils */
const A=()=>S.ac;
function src(buf){const s=A().createBufferSource();s.buffer=buf;s.loop=true;s.start(0,R()*7);return s}
function bq(type,f,q){const b=A().createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;return b}
function gn(v){const g=A().createGain();g.gain.value=v;return g}
function pan(p){const a=A();if(a.createStereoPanner){const n=a.createStereoPanner();n.pan.value=p;return n}return gn(1)}
function osc(type,f){const o=A().createOscillator();o.type=type;o.frequency.value=f;return o}
function burst(out,t,{f=3000,q=4,dur=.03,vol=.05,p=0,type='bandpass',buf='white'}){
  const a=A(),s=a.createBufferSource();s.buffer=S.buf[buf];const fl=bq(type,f,q),g=a.createGain(),pn=pan(p);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl).connect(g).connect(pn).connect(out);s.start(t,R()*7,dur+.05);
}

/* les ambiances : chacune reçoit (sortie, envoi réverbération) et renvoie {nodes, tick} */
const SND={
 pluie(o){const s=src(S.buf.pink),hp=bq('highpass',450),lp=bq('lowpass',7000),g=gn(.32);s.connect(hp).connect(lp).connect(g).connect(o);
  const r=src(S.buf.brown),rl=bq('lowpass',160),rg=gn(.22);r.connect(rl).connect(rg).connect(o);
  let n=0,big=0;return{nodes:[s,r],tick(t){
   while(n<t+.3){if(n<t)n=t;burst(o,n,{f:rr(1800,7000),q:rr(3,9),dur:rr(.015,.05),vol:rr(.015,.07),p:rr(-.85,.85)});n+=rr(.012,.07)}
   while(big<t+.3){if(big<t)big=t;burst(o,big,{f:rr(600,1400),q:2,dur:rr(.05,.09),vol:rr(.03,.06),p:rr(-.6,.6)});big+=rr(.4,1.6)}}}},
 vagues(o,w){const W=[-.55,.55].map((p,i)=>{const s=src(S.buf.brown),s2=src(S.buf.pink),f=bq('lowpass',380),g=gn(.06),pn=pan(p),g2=gn(.35);
   s.connect(f);s2.connect(g2).connect(f);f.connect(g).connect(pn).connect(o);g.connect(w);return{s,s2,f,g,next:A().currentTime+i*3.8}});
  return{nodes:W.flatMap(x=>[x.s,x.s2]),tick(t){for(const x of W){if(x.next<t+.6){const T=Math.max(x.next,t),up=rr(2,3.4),dn=rr(4,6.5),pk=rr(.45,.85);
   x.g.gain.setValueAtTime(.06,T);x.g.gain.linearRampToValueAtTime(pk,T+up);x.g.gain.exponentialRampToValueAtTime(.06,T+up+dn);
   x.f.frequency.setValueAtTime(360,T);x.f.frequency.linearRampToValueAtTime(rr(1300,2400),T+up);x.f.frequency.exponentialRampToValueAtTime(380,T+up+dn);
   x.next=T+up+dn+rr(.2,2)}}}}},
 vent(o){const s=src(S.buf.pink),f=bq('bandpass',500,.9),g=gn(.4),s2=src(S.buf.brown),l2=bq('lowpass',260),g2=gn(.3);
  s.connect(f).connect(g).connect(o);s2.connect(l2).connect(g2).connect(o);let n=0;
  return{nodes:[s,s2],tick(t){if(n<t+.3){const T=Math.max(n,t),d=rr(2,5);f.frequency.setTargetAtTime(rr(240,1100),T,d/3);f.Q.setTargetAtTime(rr(.5,1.7),T,d/3);g.gain.setTargetAtTime(rr(.15,.75),T,d/3);n=T+d}}}},
 foret(o,w){const s=src(S.buf.pink),f=bq('bandpass',2600,.6),g=gn(.05),s2=src(S.buf.brown),l2=bq('lowpass',300),g2=gn(.12);
  s.connect(f).connect(g).connect(o);s2.connect(l2).connect(g2).connect(o);let n=0,lf=0;
  return{nodes:[s,s2],tick(t){
   if(lf<t+.3){const T=Math.max(lf,t);g.gain.setTargetAtTime(rr(.02,.09),T,1.2);lf=T+rr(1.5,4)}
   if(n<t+.3){const T=Math.max(n,t);bird(o,w,T);n=T+rr(1.2,6)}}}},
 ruisseau(o){const s=src(S.buf.white),bands=[700,1300,2300,3600,5200].map(fq=>{const b=bq('bandpass',fq,rr(2,5)),g=gn(.1);s.connect(b).connect(g).connect(o);return{b,g}});
  const bed=src(S.buf.pink),bl=bq('lowpass',900),bg=gn(.22);bed.connect(bl).connect(bg).connect(o);let n=0;
  return{nodes:[s,bed],tick(t){while(n<t+.25){if(n<t)n=t;const x=bands[Math.floor(R()*bands.length)];x.g.gain.setTargetAtTime(rr(.02,.3),n,.03);x.b.frequency.setTargetAtTime(x.b.frequency.value*rr(.9,1.1),n,.05);n+=rr(.03,.09)}}}},
 feu(o,w){const s=src(S.buf.brown),l=bq('lowpass',520),g=gn(.5);s.connect(l).connect(g).connect(o);let n=0,m=0;
  return{nodes:[s],tick(t){
   if(m<t+.3){const T=Math.max(m,t);g.gain.setTargetAtTime(rr(.3,.65),T,.6);l.frequency.setTargetAtTime(rr(380,700),T,.8);m=T+rr(.8,2)}
   while(n<t+.3){if(n<t)n=t;const k=R();
     if(k<.82)burst(o,n,{type:'highpass',f:rr(1200,3500),q:.7,dur:rr(.002,.008),vol:rr(.04,.22),p:rr(-.5,.5)});
     else burst(w,n,{f:rr(250,600),q:1.5,dur:rr(.02,.05),vol:rr(.08,.2),p:rr(-.4,.4)});
     n+=R()<.25?rr(.01,.05):rr(.06,.5)}}}},
 nuit(o){const s=src(S.buf.brown),l=bq('lowpass',300),g=gn(.12);s.connect(l).connect(g).connect(o);
  const C=[[4300,-.6],[4700,.5],[3900,.1]].map(([f,p])=>({f,p,next:A().currentTime+R()*2,rate:rr(.55,1.2)}));
  return{nodes:[s],tick(t){for(const c of C){if(c.next<t+.4){const T=Math.max(c.next,t);cricket(o,T,c.f,c.p);c.next=T+c.rate*rr(.85,1.15)+(R()<.08?rr(2,5):0)}}}}},
 bol(o,w){let n=0;return{nodes:[],tick(t){if(n<t+.4){const T=Math.max(n,t)+.05;bowl(o,w,T);n=T+rr(9,15)}}}},
 musique(o,w){const prog=[[130.81,196,329.63,587.33],[110,164.81,261.63,392],[87.31,130.81,220,329.63],[98,146.83,246.94,329.63]];
  const scale=[523.25,587.33,659.25,783.99,880,1046.5];let n=0,i=0,m=0;
  return{nodes:[],tick(t){
   if(n<t+.5){const T=Math.max(n,t);chord(o,w,T,prog[i%prog.length],13);i++;n=T+10}
   if(m<t+.4){const T=Math.max(m,t)+rr(1,2);note(w,T,scale[Math.floor(R()*scale.length)]);m=T+rr(2.5,6)}}}},
 brun(o){const s=src(S.buf.brown),l=bq('lowpass',480),g=gn(.6);s.connect(l).connect(g).connect(o);return{nodes:[s],tick(){}}},
 /* — nouvelles ambiances — */
 orage(o,w){const s=src(S.buf.pink),hp=bq('highpass',600),lp=bq('lowpass',5200),g=gn(.45);s.connect(hp).connect(lp).connect(g).connect(o);
  const r=src(S.buf.brown),rl=bq('lowpass',120),rg=gn(0);r.connect(rl).connect(rg);rg.connect(o);rg.connect(w);let n=0,th=A().currentTime+rr(4,10);
  return{nodes:[s,r],tick(t){
   while(n<t+.3){if(n<t)n=t;burst(o,n,{f:rr(1500,5000),q:rr(2,6),dur:rr(.02,.05),vol:rr(.01,.04),p:rr(-.9,.9)});n+=rr(.02,.09)}
   if(th<t+.5){const T=Math.max(th,t),up=rr(1.2,2.6),dn=rr(5,9),pk=rr(.55,1.1);rg.gain.setValueAtTime(.0001,T);rg.gain.exponentialRampToValueAtTime(pk,T+up);
     rg.gain.exponentialRampToValueAtTime(.0001,T+up+dn);rl.frequency.setValueAtTime(rr(70,110),T);rl.frequency.linearRampToValueAtTime(rr(140,220),T+up);rl.frequency.linearRampToValueAtTime(80,T+up+dn);th=T+up+dn+rr(14,34)}}}},
 cascade(o){const s=src(S.buf.white),b=bq('bandpass',1400,.35),g=gn(.28),s2=src(S.buf.pink),l2=bq('lowpass',700),g2=gn(.4),s3=src(S.buf.brown),l3=bq('lowpass',180),g3=gn(.3);
  s.connect(b).connect(g).connect(o);s2.connect(l2).connect(g2).connect(o);s3.connect(l3).connect(g3).connect(o);let n=0;
  return{nodes:[s,s2,s3],tick(t){if(n<t+.3){const T=Math.max(n,t);b.frequency.setTargetAtTime(rr(1000,2000),T,1.5);g.gain.setTargetAtTime(rr(.2,.34),T,1.2);n=T+rr(1.5,3)}}}},
 carillon(o,w){const s=src(S.buf.pink),f=bq('bandpass',420,.8),g=gn(.08);s.connect(f).connect(g).connect(o);
  const sc=[523.25,587.33,659.25,783.99,880,1046.5,1174.66];let n=0,gust=0,busy=.3;
  return{nodes:[s],tick(t){
   if(gust<t+.3){const T=Math.max(gust,t);busy=rr(.15,.9);g.gain.setTargetAtTime(.04+busy*.08,T,1);gust=T+rr(3,8)}
   while(n<t+.3){if(n<t)n=t;if(R()<busy)chime(o,w,n,sc[Math.floor(R()*sc.length)],rr(-.7,.7));n+=rr(.25,1.4)/Math.max(.3,busy)}}}},
 matin(o,w){const s=src(S.buf.pink),f=bq('bandpass',3000,.5),g=gn(.035);s.connect(f).connect(g).connect(o);let n=0,m=0;
  return{nodes:[s],tick(t){
   if(n<t+.3){const T=Math.max(n,t);bird(o,w,T);n=T+rr(.5,2.4)}
   if(m<t+.3){const T=Math.max(m,t);warble(o,w,T);m=T+rr(3,9)}}}},
 harpe(o,w){const sc=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99];const roots=[130.81,110,146.83,98];let n=0,i=0,ph=0;
  return{nodes:[],tick(t){if(n<t+.5){const T=Math.max(n,t)+.05,r=roots[i%roots.length];pluck(o,w,T,r,.14,5);
    const base=Math.floor(R()*3),len=4+Math.floor(R()*3);for(let k=0;k<len;k++)pluck(o,w,T+.45+k*rr(.38,.55),sc[(base+k*2+ph)%sc.length],.1,3.2);ph=(ph+1)%3;i++;n=T+rr(6,8)}}}},
 nappe(o,w){const g=gn(0),lp=bq('lowpass',520,.7);lp.connect(g);g.connect(o);g.connect(w);const a=A(),t0=a.currentTime;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.09,t0+6);
  const O=[[110,-4],[110,4],[164.81,-3],[164.81,3],[220,0],[55,0]].map(([f,d],i)=>{const os=osc(i===5?'sine':'triangle',f);os.detune.value=d;const og=gn(i===5?.9:.5);os.connect(og).connect(lp);os.start(t0);return os});
  let n=0;return{nodes:O,tick(t){if(n<t+.3){const T=Math.max(n,t),d=rr(6,12);lp.frequency.setTargetAtTime(rr(320,900),T,d/2);n=T+d}}}},
 ronron(o){const s=src(S.buf.brown),l=bq('lowpass',260,1.2),am=gn(0),g=gn(.9);s.connect(l).connect(am).connect(g).connect(o);
  const lfo=osc('sine',24),lg=gn(.5);lfo.connect(lg).connect(am.gain);lfo.start();let n=0;
  return{nodes:[s,lfo],tick(t){if(n<t+.3){const T=Math.max(n,t),inn=rr(1.4,1.9),out=rr(1.6,2.2);
    g.gain.setValueAtTime(.35,T);g.gain.linearRampToValueAtTime(.9,T+inn*.5);g.gain.linearRampToValueAtTime(.55,T+inn);g.gain.linearRampToValueAtTime(.85,T+inn+out*.5);g.gain.linearRampToValueAtTime(.35,T+inn+out);
    lfo.frequency.setValueAtTime(rr(22,26),T);lfo.frequency.linearRampToValueAtTime(rr(20,24),T+inn);n=T+inn+out+rr(.1,.4)}}}},
 cigales(o){const s=src(S.buf.white),b=bq('bandpass',5200,3),am=gn(0),g=gn(.5);s.connect(b).connect(am).connect(g).connect(o);
  const lfo=osc('square',rr(42,52)),lg=gn(.5);lfo.connect(lg).connect(am.gain);lfo.start();
  const s2=src(S.buf.pink),l2=bq('lowpass',400),g2=gn(.1);s2.connect(l2).connect(g2).connect(o);let n=0;
  return{nodes:[s,lfo,s2],tick(t){if(n<t+.3){const T=Math.max(n,t),d=rr(4,9);g.gain.setTargetAtTime(R()<.2?.05:rr(.25,.6),T,1.4);b.frequency.setTargetAtTime(rr(4600,6000),T,2);n=T+d}}}},
 rose(o){const s=src(S.buf.pink),l=bq('lowpass',3500),g=gn(.5);s.connect(l).connect(g).connect(o);return{nodes:[s],tick(){}}},
 /* — musiques douces (générées en direct, jamais tout à fait pareilles) — */
 piano(o,w){const P=[[[130.81,196],[329.63,392,493.88,587.33,659.25]],[[110,164.81],[261.63,329.63,392,523.25,587.33]],[[87.31,130.81],[261.63,329.63,440,523.25,659.25]],[[98,146.83],[293.66,392,493.88,587.33,783.99]]];
  let n=0,i=0;return{nodes:[],tick(t){if(n<t+.5){const T=Math.max(n,t)+.05,[lo,hi]=P[i%P.length],bar=rr(7.5,9);
   pno(o,w,T,lo[0],.1,-.2);pno(o,w,T+.05,lo[1],.06,-.1);let tt=T+rr(.8,1.2);
   while(tt<T+bar-1){pno(o,w,tt,hi[Math.floor(R()*hi.length)],rr(.035,.06),rr(-.3,.4));tt+=R()<.3?rr(.35,.5):rr(.9,1.6)}
   i++;n=T+bar}}}},
 kalimba(o,w){const sc=[392,440,523.25,587.33,659.25,783.99,880,1046.5];let n=0,mot=null,rep=0;
  return{nodes:[],tick(t){if(n<t+.5){const T=Math.max(n,t)+.05;
   if(!mot||rep>=2){let x=2+Math.floor(R()*3);mot=[];for(let j=0;j<5+Math.floor(R()*3);j++){mot.push(x);x=Math.max(0,Math.min(sc.length-1,x+[-2,-1,1,2,0][Math.floor(R()*5)]))}rep=0}
   const st=rr(.3,.38);mot.forEach((x,j)=>{const v=rep&&R()<.2?Math.min(sc.length-1,x+1):x;kal(o,w,T+j*st,sc[v],rr(.05,.075),rr(-.4,.4))});
   if(rep===0)kal(o,w,T,[196,220,261.63][Math.floor(R()*3)],.06,0,2.6);
   rep++;n=T+mot.length*st+rr(.8,2.6)}}}},
 handpan(o,w){const sc=[146.83,220,233.08,261.63,293.66,329.63,349.23,392,440];let n=0,step=0,ix=4,rest=0;
  return{nodes:[],tick(t){while(n<t+.5){const T=Math.max(n,t),beat=.46;
   if(rest>0){rest--}else if(step%8===0)hpan(o,w,T,sc[0],.09,0);
   else if(R()<.55){ix=Math.max(1,Math.min(sc.length-1,ix+[-2,-1,1,2][Math.floor(R()*4)]));hpan(o,w,T,sc[ix],rr(.045,.07),ix%2?-.35:.35)}
   step++;if(step%16===0&&R()<.35)rest=8;n=T+beat}}}},
 flute(o,w){const a=A(),t0=a.currentTime,lp=bq('lowpass',420,.6),dg=gn(0);lp.connect(dg);dg.connect(o);dg.connect(w);dg.gain.setValueAtTime(0,t0);dg.gain.linearRampToValueAtTime(.07,t0+6);
  const D=[[73.42,-3],[73.42,3],[110,0],[146.83,-2]].map(([f,d],i)=>{const os=osc(i===3?'triangle':'sine',f);os.detune.value=d;const g=gn(i===3?.25:.6);os.connect(g).connect(lp);os.start(t0);return os});
  const sc=[587.33,698.46,783.99,880,1046.5,1174.66];let n=t0+3,ix=2;
  return{nodes:D,tick(t){if(n<t+.5){let T=Math.max(n,t)+.05;const k=3+Math.floor(R()*3);
   for(let j=0;j<k;j++){ix=Math.max(0,Math.min(sc.length-1,ix+[-1,-1,1,1,2,-2][Math.floor(R()*6)]));const len=j===k-1?rr(2.4,3.4):rr(.9,1.8);flt(o,w,T,sc[ix],len,.06,rr(-.2,.2));T+=len+rr(.05,.25)}
   n=T+rr(5,9)}}}},
 berceuse(o,w){const F4=349.23,G4=392,A4=440,Bb4=466.16,C5=523.25,D5=587.33,E4=329.63;
  const M=[[A4,2],[C5,1],[Bb4,1],[A4,1],[G4,1],[A4,2],[F4,1],[G4,3],[A4,2],[C5,1],[D5,1],[C5,1],[A4,1],[G4,1],[A4,1],[G4,1],[F4,3],
   [C5,2],[D5,1],[C5,1],[A4,1],[F4,1],[Bb4,2],[A4,1],[G4,3],[A4,2],[C5,1],[Bb4,1],[A4,1],[G4,1],[G4,2],[E4,1],[F4,3]];
  const CH={F:[174.61,220,261.63],C:[130.81,196,329.63],B:[116.54,174.61,293.66]},BARS='FCFCFBCFFFBCFBCF';
  let n=0,i=0,beat=0;return{nodes:[],tick(t){while(n<t+.5){const T=Math.max(n,t)+.05,bt=.62;
   if(i===0&&beat===0)n=T;const [f,d]=M[i];if(beat%3===0){const c=CH[BARS[(beat/3)%16]];chord(o,w,T,c,bt*3+.4,.03)}
   kal(o,w,T,f,rr(.055,.07),rr(-.15,.15),2.4);kal(o,w,T,f*2,.012,0,1.2);
   beat+=d;i++;n=T+d*bt;if(i>=M.length){i=0;beat=0;n+=rr(2.5,4)}}}}},
 guitare(o,w){const CH=[[82.41,123.47,164.81,196,246.94,329.63],[130.81,164.81,196,261.63,329.63,392],[98,123.47,146.83,196,246.94,392],[146.83,220,293.66,369.99,440,293.66]];
  const PAT=[0,3,4,5,4,3];let n=0,c=0,j=0,bar=0;return{nodes:[],tick(t){while(n<t+.5){const T=Math.max(n,t)+.03,ch=CH[c%CH.length],x=PAT[j];
   gtr(o,w,T,ch[x===0?0:Math.min(ch.length-1,x)],x===0?.16:rr(.08,.11),x===0?-.15:rr(-.3,.3));if(x===0&&R()<.4)gtr(o,w,T+.02,ch[2],.07,.1);
   j++;n=T+.43+rr(-.015,.03);if(j>=PAT.length){j=0;bar++;if(bar%2===0)c++;if(bar%8===0)n+=rr(.6,1.4)}}}}}
};
const BASE={pluie:1.25,vagues:1,vent:1.1,foret:2.3,ruisseau:1.5,feu:.72,nuit:2.2,bol:2.6,musique:.7,brun:.7,orage:1.6,cascade:.9,carillon:3.2,matin:9,harpe:4,nappe:1,ronron:2.2,cigales:3.3,rose:.85,piano:5,kalimba:4.4,handpan:3,flute:1.1,berceuse:2.5,guitare:2.5};
const WET={foret:.35,bol:.7,musique:.6,vagues:.12,feu:.2,nuit:.25,orage:.25,carillon:.75,matin:.35,harpe:.7,nappe:.6,piano:.45,kalimba:.5,handpan:.55,flute:.55,berceuse:.5,guitare:.35};

function bird(o,w,t){const a=A(),p=rr(-.8,.8),f0=rr(2200,4400),n=1+Math.floor(R()*5),kind=Math.floor(R()*3);let T=t;
  for(let i=0;i<n;i++){const d=rr(.05,.14),os=osc('sine',f0),g=gn(0),pn=pan(p);
    if(kind===0){os.frequency.setValueAtTime(f0,T);os.frequency.exponentialRampToValueAtTime(f0*rr(1.2,1.6),T+d)}
    else if(kind===1){os.frequency.setValueAtTime(f0*1.4,T);os.frequency.exponentialRampToValueAtTime(f0*.8,T+d)}
    else{os.frequency.setValueAtTime(f0,T);os.frequency.linearRampToValueAtTime(f0*1.3,T+d/2);os.frequency.linearRampToValueAtTime(f0,T+d)}
    const v=rr(.012,.035);g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+.01);g.gain.exponentialRampToValueAtTime(.0001,T+d);
    os.connect(g).connect(pn);pn.connect(o);pn.connect(w);os.start(T);os.stop(T+d+.05);T+=d+rr(.03,.12)}}
function cricket(o,t,f,p){const os=osc('sine',f),g=gn(0),pn=pan(p);os.connect(g).connect(pn).connect(o);let T=t;
  for(let i=0;i<3;i++){g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.018,T+.004);g.gain.linearRampToValueAtTime(0,T+.018);T+=.032}
  os.start(t);os.stop(T+.05)}
function bowl(o,w,t){const f0=[196,174.61,220,164.81][Math.floor(R()*4)],P=[[1,.13,11],[2.71,.07,7.5],[5.15,.035,4.5],[8.47,.016,3]];
  for(const [r,v,d] of P){for(const det of [-.35,.35]){const os=osc('sine',f0*r+det),g=gn(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    os.connect(g);g.connect(o);g.connect(w);os.start(t);os.stop(t+d+.1)}}}
function chord(o,w,t,notes,len,lv){lv=lv||.05;const at=Math.min(4,len/3);const lp=bq('lowpass',1100,.4),g=gn(0);lp.connect(g);g.connect(o);g.connect(w);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lv,t+at);g.gain.setValueAtTime(lv,t+len-at);g.gain.linearRampToValueAtTime(0,t+len);
  for(const f of notes){for(const det of [-2.5,2.5]){const os=osc('triangle',f);os.detune.value=det;os.connect(lp);os.start(t);os.stop(t+len+.1)}}}
function note(w,t,f){const os=osc('sine',f),g=gn(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+3.2);
  os.connect(g).connect(w);os.start(t);os.stop(t+3.3)}

function chime(o,w,t,f,p){const pn=pan(p);pn.connect(o);pn.connect(w);for(const [r,v,d] of [[1,.05,2.6],[2.76,.022,1.4],[5.4,.01,.7]]){const os=osc('sine',f*r),g=gn(0);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g).connect(pn);os.start(t);os.stop(t+d+.05)}}
function warble(o,w,t){const a=A(),p=rr(-.7,.7),f0=rr(1800,2800),n=6+Math.floor(R()*8);let T=t;const pn=pan(p);pn.connect(o);pn.connect(w);
  for(let i=0;i<n;i++){const d=rr(.04,.08),os=osc('sine',f0*rr(.9,1.25)),g=gn(0);os.frequency.linearRampToValueAtTime(f0*rr(.95,1.4),T+d);
    g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(rr(.01,.025),T+.008);g.gain.exponentialRampToValueAtTime(.0001,T+d);os.connect(g).connect(pn);os.start(T);os.stop(T+d+.03);T+=d+rr(.01,.05)}}
function pluck(o,w,t,f,v,d){const lp=bq('lowpass',f*4,.5),g=gn(0);lp.connect(g);g.connect(o);g.connect(w);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);lp.frequency.setValueAtTime(f*6,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+d*.6);
  for(const [m,a] of [[1,1],[2,.35],[3,.12]]){const os=osc('triangle',f*m),og=gn(a);os.connect(og).connect(lp);os.start(t);os.stop(t+d+.05)}}

/* — instruments pour les musiques — */
function pno(o,w,t,f,v,p){const pn=pan(p||0);pn.connect(o);pn.connect(w);const lp=bq('lowpass',Math.min(4200,f*5),.5);lp.connect(pn);const d=Math.max(2.4,7-f/140);
  for(const [m,a,dd] of [[1,1,1],[2.003,.38,.6],[3.008,.13,.4],[4.02,.05,.25]]){const os=osc('sine',f*m),g=gn(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+.008);
    g.gain.exponentialRampToValueAtTime(v*a*.35,t+.3*dd);g.gain.exponentialRampToValueAtTime(.0001,t+d*dd);os.connect(g).connect(lp);os.start(t);os.stop(t+d*dd+.05)}}
function kal(o,w,t,f,v,p,d){const pn=pan(p||0);pn.connect(o);pn.connect(w);d=d||1.8;
  for(const [m,a,dd] of [[1,1,1],[3.0,.06,.35],[5.4,.16,.12]]){const os=osc('sine',f*m),g=gn(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+.003);
    g.gain.exponentialRampToValueAtTime(.0001,t+d*dd);os.connect(g).connect(pn);os.start(t);os.stop(t+d*dd+.05)}}
function hpan(o,w,t,f,v,p){const pn=pan(p||0);pn.connect(o);pn.connect(w);
  for(const [m,a,dd,det] of [[1,1,4.2,-.6],[1,.7,4,.6],[2,.42,2.6,0],[3,.14,1.3,0]]){const os=osc('sine',f*m+det),g=gn(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+.018);
    g.gain.exponentialRampToValueAtTime(.0001,t+dd);os.connect(g).connect(pn);os.start(t);os.stop(t+dd+.05)}}
function flt(o,w,t,f,len,v,p){const a=A(),pn=pan(p||0);pn.connect(o);pn.connect(w);const g=gn(0);g.connect(pn);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.28);g.gain.setValueAtTime(v*.92,t+len);g.gain.linearRampToValueAtTime(0,t+len+.45);
  const os=osc('sine',f),o2=osc('triangle',f*2),g2=gn(.07);os.connect(g);o2.connect(g2).connect(g);
  const vib=osc('sine',rr(4.6,5.4)),vg=gn(0);vib.connect(vg);vg.connect(os.frequency);vg.connect(o2.detune);vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.006,t+Math.min(.9,len));
  const b=a.createBufferSource();b.buffer=S.buf.white;b.loop=true;const bf=bq('bandpass',f*2,1.2),bg=gn(.05);b.connect(bf).connect(bg).connect(g);
  for(const n of [os,o2,vib])n.start(t);b.start(t,R()*6);for(const n of [os,o2,vib,b])n.stop(t+len+.55)}
const KS={};
function ksBuf(f){const a=A(),sr=a.sampleRate,k=Math.round(f);if(KS[k])return KS[k];const N=Math.max(2,Math.round(sr/f)),len=Math.floor(sr*3.2),buf=a.createBuffer(1,len,sr),y=buf.getChannelData(0);
  let prev=0;for(let i=0;i<N;i++){const r=R()*2-1;prev=prev*.5+r*.5;y[i]=prev}
  const damp=.9965+Math.min(.003,f/90000);for(let i=N;i<len;i++)y[i]=damp*.5*(y[i-N]+y[i-N+1]);
  let mx=0;for(let i=0;i<len;i++)mx=Math.max(mx,Math.abs(y[i]));if(mx)for(let i=0;i<len;i++)y[i]/=mx;return KS[k]=buf}
function gtr(o,w,t,f,v,p){const a=A(),b=a.createBufferSource();b.buffer=ksBuf(f);const lp=bq('lowpass',2600,.4),g=gn(v),pn=pan(p||0);
  b.connect(lp).connect(g).connect(pn);pn.connect(o);pn.connect(w);b.start(t);b.stop(t+3.2)}

/* couches */
function on(k,vol){if(!SND[k]||S.layers[k])return;if(!ctx())return;const a=S.ac;
  const g=a.createGain(),w=a.createGain();const v=vol==null?.8:vol;
  g.gain.setValueAtTime(0,a.currentTime);g.gain.linearRampToValueAtTime(v*(BASE[k]||1),a.currentTime+1.8);g.connect(S.master);
  w.gain.value=WET[k]||0;w.connect(S.rev);
  const out=a.createGain();out.connect(g);const wet=a.createGain();wet.connect(w);
  let L;try{L=SND[k](out,wet)}catch(e){return}
  S.layers[k]={k,g,w,out,wet,vol:v,nodes:L.nodes,tick:L.tick,start:Date.now()};
  if(!S.iv)S.iv=setInterval(loop,100);loop();changed()}
function off(k){const L=S.layers[k];if(!L)return;delete S.layers[k];const a=S.ac,t=a.currentTime;
  try{L.g.gain.cancelScheduledValues(t);L.g.gain.setValueAtTime(L.g.gain.value,t);L.g.gain.linearRampToValueAtTime(0,t+1.4)}catch(e){}
  setTimeout(()=>{for(const n of L.nodes){try{n.stop()}catch(e){}}try{L.g.disconnect();L.w.disconnect()}catch(e){}},1600);
  if(!Object.keys(S.layers).length){clearInterval(S.iv);S.iv=null;clearTimeout(S.timerT);clearTimeout(S.fadeT)}changed()}
function loop(){const t=S.ac.currentTime;for(const k in S.layers){try{S.layers[k].tick(t)}catch(e){}}}
function vol(k,v){const L=S.layers[k];if(!L)return;L.vol=v;L.g.gain.setTargetAtTime(v*(BASE[k]||1),S.ac.currentTime,.15)}
function stopAll(){for(const k of Object.keys(S.layers))off(k)}
function only(k){for(const x of Object.keys(S.layers))if(x!==k)off(x);if(k&&k!=='none')on(k)}
function duck(d){if(!S.duckG)return;S.duckG.gain.setTargetAtTime(d?.5:1,S.ac.currentTime,.4)}
function timer(min){clearTimeout(S.timerT);clearTimeout(S.fadeT);if(S.master)S.master.gain.setTargetAtTime(.9,S.ac.currentTime,.2);if(!min)return;
  S.timerT=setTimeout(()=>{if(!S.ac)return;S.master.gain.setTargetAtTime(0,S.ac.currentTime,6);S.fadeT=setTimeout(()=>{stopAll();S.master.gain.setTargetAtTime(.9,S.ac.currentTime,.1);S.cbs.forEach(f=>f('timer'))},25000)},Math.max(0,min*60000-25000))}
function changed(){S.cbs.forEach(f=>{try{f()}catch(e){}})}
function tone(f,dur,v){if(!ctx())return;try{const a=S.ac,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;
  g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(v,a.currentTime+.05);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);
  o.connect(g);g.connect(S.duckG);const s=a.createGain();s.gain.value=.3;g.connect(s).connect(S.rev);o.start();o.stop(a.currentTime+dur+.05)}catch(e){}}
function bell(){if(!ctx())return;const t=S.ac.currentTime+.02;const g=S.ac.createGain();g.gain.value=.9;g.connect(S.duckG);bowl(g,S.rev,t)}

window.ElyraSons={ctx,on,off,toggle:k=>S.layers[k]?off(k):on(k),vol,only,stopAll,duck,timer,tone,bell,
  active:()=>Object.keys(S.layers),volOf:k=>S.layers[k]?S.layers[k].vol:.8,startOf:k=>S.layers[k]?S.layers[k].start:0,onChange:f=>S.cbs.push(f),kinds:Object.keys(SND)};
})();
