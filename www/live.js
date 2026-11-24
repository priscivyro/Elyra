/* ELYRA · visage animé et micro mains libres (aucune dépendance, aucun service payant).
   ElyraFace(el)   : visage dessiné vivant (clignements, regard, respiration, expressions, lèvres)
   ElyraMic(opts)  : écoute le micro, repère quand tu parles et quand tu te tais, rend un fichier WAV 16 kHz
   ElyraLive.wav() : encodeur WAV ; ElyraLive.lips() : rythme des lèvres d'après un texte */
(function(){
const NS='http://www.w3.org/2000/svg';
const RM=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};

/* ---------- le visage ---------- */
const EXPR={neutre:{s:.35,b:0,t:0},doux:{s:.65,b:0,t:0},sourire:{s:1,b:-1.5,t:0},attentif:{s:.4,b:-2.5,t:0},soucieux:{s:.12,b:-1,t:5}};
function ElyraFace(host,opt){opt=opt||{};
  host.innerHTML=`<div class="fl" data-state="idle"><div class="fl-ring"></div><div class="fl-dots" aria-hidden="true"><i></i><i></i><i></i></div>
  <svg viewBox="0 0 240 240" class="fl-svg" role="img" aria-label="${opt.label||'Le visage d’ELYRA'}">
   <defs><clipPath id="flc"><circle cx="120" cy="120" r="118"/></clipPath>
    <radialGradient id="flbg" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#f4effa"/><stop offset="1" stop-color="#e3dbf2"/></radialGradient></defs>
   <g clip-path="url(#flc)"><circle cx="120" cy="120" r="120" fill="url(#flbg)"/>
    <g class="fl-body"></g>
    <g class="fl-head">
     <path d="M120 30C72 30 48 66 50 108C51 130 44 146 46 164C48 182 40 194 46 210C50 220 60 226 72 228L84 196L156 196L168 228C180 226 190 220 194 210C200 194 192 182 194 164C196 146 189 130 190 108C192 66 168 30 120 30Z" fill="#4a3226"/>
     <path d="M106 148h28v54h-28z" fill="#e6c4ab"/>
     <path d="M28 254C34 218 70 198 120 198S206 218 212 254Z" fill="#9db59a"/><path d="M102 199L120 222L138 199" fill="#e6c4ab"/><path d="M100 198L120 224L140 198" fill="none" stroke="#86a383" stroke-width="3" stroke-linejoin="round"/><circle cx="120" cy="211" r="3" fill="#e4d2ae"/>
     <path d="M62 150C56 172 66 186 58 202C54 214 62 226 78 234C82 218 78 204 84 190C88 176 84 164 78 150Z" fill="#4a3226"/><path d="M178 150C184 172 174 186 182 202C186 214 178 226 162 234C158 218 162 204 156 190C152 176 156 164 162 150Z" fill="#4a3226"/>
     <ellipse cx="120" cy="112" rx="49" ry="57" fill="#f3d9c4"/>
     <path d="M66 122C60 84 78 48 108 42C138 36 170 52 174 90C175 102 172 112 168 124C166 104 158 88 142 80C128 90 104 96 84 98C76 104 70 112 66 122Z" fill="#4a3226"/>
     <path d="M92 58C84 68 78 80 74 96M132 46C148 54 160 66 166 84M66 176C62 190 68 200 64 212M174 176C178 190 172 200 176 212" fill="none" stroke="#6b4936" stroke-width="1.6" stroke-linecap="round"/>
     <g class="fl-brows" fill="none" stroke="#4a3226" stroke-width="3.4" stroke-linecap="round"><path class="fl-bl" d="M86 99Q99 90 113 95"/><path class="fl-br" d="M127 95Q141 90 154 99"/></g>
     <g class="fl-eye fl-el"><path d="M86 118Q100 104 114 118Q100 128 86 118Z" fill="#fffdf9"/><g class="fl-pupil"><circle cx="100" cy="117.5" r="6.4" fill="#6b4a3a"/><circle cx="100" cy="117.5" r="3" fill="#24180f"/><circle cx="102.2" cy="115.3" r="1.7" fill="#fff"/></g><path d="M115 117.5Q100 103 85 116.5L81.5 113.5" fill="none" stroke="#3a2820" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M90 122.5Q100 127 110 122.5" fill="none" stroke="#e0b9a4" stroke-width="1.2" stroke-linecap="round"/></g>
     <g class="fl-eye fl-er"><path d="M126 118Q140 104 154 118Q140 128 126 118Z" fill="#fffdf9"/><g class="fl-pupil"><circle cx="140" cy="117.5" r="6.4" fill="#6b4a3a"/><circle cx="140" cy="117.5" r="3" fill="#24180f"/><circle cx="142.2" cy="115.3" r="1.7" fill="#fff"/></g><path d="M125 117.5Q140 103 155 116.5L158.5 113.5" fill="none" stroke="#3a2820" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M130 122.5Q140 127 150 122.5" fill="none" stroke="#e0b9a4" stroke-width="1.2" stroke-linecap="round"/></g>
     <path d="M119 124Q116 135 120 138Q123 139 125 137" fill="none" stroke="#d4a890" stroke-width="2" stroke-linecap="round"/>
     <circle cx="92" cy="138" r="9" fill="#ef9f92" opacity=".36"/><circle cx="148" cy="138" r="9" fill="#ef9f92" opacity=".36"/>
     <g transform="translate(120 153)"><path class="fl-mouth" d="" fill="#c8605f" stroke="#d07a76" stroke-width="2.2" stroke-linejoin="round"/></g>
    </g></g></svg></div>`;
  const root=host.querySelector('.fl'),head=root.querySelector('.fl-head'),body=root.querySelector('.fl-body'),mouth=root.querySelector('.fl-mouth');
  const eyes=[...root.querySelectorAll('.fl-eye')],pup=[...root.querySelectorAll('.fl-pupil')],bl=root.querySelector('.fl-bl'),br=root.querySelector('.fl-br');
  const S={state:'idle',mouth:0,target:0,ex:EXPR.doux,cur:{s:.65,b:0,t:0},blinkAt:0,blink:0,gaze:[0,0],gazeT:[0,0],gazeAt:0,talk:null,raf:0,t0:performance.now(),dead:false};
  const mp=(o,s)=>{const w=15+s*3,cy=-s*3.2,up=-o*2.5+s*1.2,lo=o*13+s*4.2+1.8;return `M${-w} ${cy}Q0 ${up} ${w} ${cy}Q0 ${lo} ${-w} ${cy}Z`};
  function frame(now){if(S.dead)return;if(root.offsetParent===null&&!root.closest('.conv.on')){S.raf=0;setTimeout(()=>{if(!S.dead)S.raf=requestAnimationFrame(frame)},600);return}const t=(now-S.t0)/1000,rm=RM();
    // lèvres
    if(S.talk){const k=Math.min(S.talk.seq.length-1,Math.floor((now-S.talk.start)/S.talk.step));S.target=k>=0&&k<S.talk.seq.length?S.talk.seq[k]:0;if(now-S.talk.start>S.talk.dur)S.talk=null}
    else if(S.state!=='speak')S.target=0;
    S.mouth+=(S.target-S.mouth)*(S.target>S.mouth?.55:.3);
    // expression (glisse doucement)
    for(const k of ['s','b','t'])S.cur[k]+=(S.ex[k]-S.cur[k])*.08;
    mouth.setAttribute('d',mp(Math.max(0,Math.min(1,S.mouth)),S.cur.s));
    bl.setAttribute('transform',`translate(0 ${S.cur.b}) rotate(${S.cur.t} 100 95)`);br.setAttribute('transform',`translate(0 ${S.cur.b}) rotate(${-S.cur.t} 140 95)`);
    // clignements
    if(now>S.blinkAt){S.blink=now;S.blinkAt=now+2200+Math.random()*4200}
    const bk=now-S.blink<160?Math.sin((now-S.blink)/160*Math.PI):0;
    eyes.forEach((e,i)=>e.setAttribute('transform',`translate(0 ${118*bk*.9}) scale(1 ${1-bk*.9})`));
    // regard
    if(now>S.gazeAt){S.gazeAt=now+1400+Math.random()*2600;S.gazeT=S.state==='think'?[2.5,-2.2]:S.state==='listen'?[0,0]:[(Math.random()-.5)*3,(Math.random()-.5)*1.6]}
    S.gaze[0]+=(S.gazeT[0]-S.gaze[0])*.12;S.gaze[1]+=(S.gazeT[1]-S.gaze[1])*.12;pup.forEach(p=>p.setAttribute('transform',`translate(${S.gaze[0]} ${S.gaze[1]})`));
    // tête et respiration
    if(!rm){const tilt=S.state==='listen'?2.2:S.state==='think'?-1.5:0;const r=Math.sin(t*.55)*1.1+tilt+(S.state==='speak'?Math.sin(t*2.1)*.6:0);
      head.setAttribute('transform',`rotate(${r.toFixed(2)} 120 170) translate(0 ${(Math.sin(t*.9)*.8).toFixed(2)})`);body.setAttribute('transform',`translate(0 ${(Math.sin(t*.9)*1.2).toFixed(2)})`)}
    S.raf=requestAnimationFrame(frame)}
  S.raf=requestAnimationFrame(frame);
  return{el:root,
    state(s){S.state=s;root.dataset.state=s;S.gazeAt=0;if(s!=='speak'){S.talk=null}},
    expr(e){S.ex=EXPR[e]||EXPR.doux},
    level(v){S.target=Math.max(0,Math.min(1,v))},
    talk(text,sec){const seq=lips(text);S.talk={seq,start:performance.now(),dur:sec*1000,step:Math.max(45,sec*1000/Math.max(1,seq.length))}},
    sync(charIdx,text){if(!S.talk)return;const seq=S.talk.seq;const k=Math.round(charIdx/Math.max(1,text.length)*seq.length);S.talk.start=performance.now()-k*S.talk.step},
    quiet(){S.talk=null;S.target=0},
    destroy(){S.dead=true;cancelAnimationFrame(S.raf)}}}

/* rythme des lèvres d'après le texte : voyelles ouvertes, consonnes fermées, pauses */
function lips(text){const out=[];const s=String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  for(let i=0;i<s.length;i++){const c=s[i];
    if('a'.includes(c))out.push(.95);else if('eo'.includes(c))out.push(.7);else if('iuy'.includes(c))out.push(.42);
    else if('mbp'.includes(c))out.push(0);else if(/[a-z]/.test(c))out.push(.18);else if(/[.,;:!?…]/.test(c)){out.push(0,0,0)}else out.push(.06)}
  return out}

/* ---------- micro et détection de la parole ---------- */
function ElyraMic(o){o=Object.assign({onStart(){},onEnd(){},onLevel(){},onError(){},minMs:450,silenceMs:950,maxMs:28000,preMs:320,sens:1},o||{});
  const M={ac:null,stream:null,node:null,src:null,on:false,paused:false,speaking:false,buf:[],pre:[],noise:.006,above:0,below:0,startT:0,sr:48000};
  async function start(){if(M.on)return true;
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){o.onError('nomic');return false}
    try{M.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}})}
    catch(e){o.onError(e&&(e.name==='NotAllowedError'||e.name==='SecurityError')?'refus':'nomic');return false}
    const AC=window.AudioContext||window.webkitAudioContext;M.ac=new AC();try{await M.ac.resume()}catch(e){}M.sr=M.ac.sampleRate;
    M.src=M.ac.createMediaStreamSource(M.stream);M.node=M.ac.createScriptProcessor(2048,1,1);
    M.node.onaudioprocess=ev=>{const d=ev.inputBuffer.getChannelData(0);let e=0;for(let i=0;i<d.length;i++)e+=d[i]*d[i];const rms=Math.sqrt(e/d.length);const ms=d.length/M.sr*1000;
      const thr=Math.max(.012,M.noise*3.2)/o.sens;o.onLevel(Math.min(1,rms/(thr*3)));
      if(M.paused){M.noise=M.noise*.995+rms*.005;return}
      const copy=new Float32Array(d);
      if(!M.speaking){M.pre.push(copy);while(M.pre.length*ms>o.preMs)M.pre.shift();
        if(rms>thr){M.above+=ms;if(M.above>=110){M.speaking=true;M.buf=M.pre.slice();M.pre=[];M.below=0;M.startT=performance.now();o.onStart()}}
        else{M.above=0;M.noise=M.noise*.97+rms*.03}}
      else{M.buf.push(copy);if(rms<thr*.7){M.below+=ms}else M.below=0;const dur=performance.now()-M.startT;
        if(M.below>=o.silenceMs||dur>=o.maxMs){M.speaking=false;M.above=0;const b=M.buf;M.buf=[];
          if(dur-M.below>=o.minMs)o.onEnd(wav(merge(b),M.sr));else o.onEnd(null)}}};
    M.src.connect(M.node);M.node.connect(M.ac.destination);M.on=true;return true}
  function stop(){M.on=false;M.speaking=false;M.buf=[];M.pre=[];try{M.node&&M.node.disconnect();M.src&&M.src.disconnect()}catch(e){}try{M.stream&&M.stream.getTracks().forEach(t=>t.stop())}catch(e){}try{M.ac&&M.ac.close()}catch(e){}M.ac=M.stream=M.node=M.src=null}
  return{start,stop,pause(p){M.paused=!!p;if(p){M.speaking=false;M.buf=[];M.above=0}},get on(){return M.on},get speaking(){return M.speaking},set sens(v){o.sens=v}}}
function merge(a){let n=0;for(const x of a)n+=x.length;const r=new Float32Array(n);let i=0;for(const x of a){r.set(x,i);i+=x.length}return r}
/* WAV 16 kHz mono 16 bits : accepté partout */
function wav(f32,sr,to){to=to||16000;let d=f32;if(sr!==to){const k=sr/to,n=Math.floor(f32.length/k);d=new Float32Array(n);for(let i=0;i<n;i++){const a=Math.floor(i*k),b=Math.min(f32.length,Math.floor((i+1)*k));let s=0;for(let j=a;j<b;j++)s+=f32[j];d[i]=s/Math.max(1,b-a)}}
  const buf=new ArrayBuffer(44+d.length*2),v=new DataView(buf);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+d.length*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,to,true);v.setUint32(28,to*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,d.length*2,true);
  for(let i=0;i<d.length;i++){const s=Math.max(-1,Math.min(1,d[i]));v.setInt16(44+i*2,s<0?s*0x8000:s*0x7fff,true)}return new Uint8Array(buf)}

window.ElyraFace=ElyraFace;window.ElyraMic=ElyraMic;window.ElyraLive={wav,lips,merge};
})();
