/* ELYRA — logique de l'appli. Contenus : content.js · Sons : sons.js */
{
/* ============ CONFIGURATION ============ */
const CHAT_URL="https://claude.ai/artifact/DQzS1B9ompRWMjSAXfYHuy";
const APP_VERSION="1.1.0";
const C=window.ELYRA_CONTENT, SND=window.ElyraSons;

/* ============ OUTILS ============ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad=n=>String(n).padStart(2,'0');
const dkey=(t=Date.now())=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const dstart=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
const DAY=864e5;
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const mmss=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+pad(s%60)};
const fmtD=t=>new Date(t).toLocaleDateString('fr-BE',{weekday:'short',day:'numeric',month:'short'});
const fmtDT=t=>fmtD(t)+' · '+new Date(t).toLocaleTimeString('fr-BE',{hour:'2-digit',minute:'2-digit'});
const fmtKey=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'})};
const doy=()=>Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/DAY);
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2800)}
function ask(title,text,okLabel,cb){$('#dlgT').textContent=title;$('#dlgP').textContent=text;$('#dlgOk').textContent=okLabel||'Oui';$('#dlg').classList.add('on');
  $('#dlgOk').onclick=()=>{$('#dlg').classList.remove('on');cb()};$('#dlgNo').onclick=()=>$('#dlg').classList.remove('on');$('#dlgNo').focus()}
const haptic=ms=>{try{navigator.vibrate&&navigator.vibrate(ms||12)}catch(e){}};
/* accords au féminin / masculin : « prêt{e} », « {doux|douce} » */
const G=t=>{const f=ST.prof.genre==='f';return String(t).replace(/\{([^|}]*)\|([^}]*)\}/g,(m,a,b)=>f?b:a).replace(/\{e\}/g,f?'e':'')};

/* ============ CONTENUS ============ */
const MOODS=C.moods, PRESETS=C.presets, MEDS=C.meds, STORIES=C.stories, SOSF=C.sosf, PROGS=C.progs, FICHES=C.fiches;
const EX={};
for(const k in PRESETS)EX['br:'+k]=PRESETS[k].n;MEDS.forEach(m=>EX['med:'+m.k]=m.t);STORIES.forEach(s=>EX['story:'+s.k]=s.t);
for(const k in SOSF)EX['sos:'+k]=SOSF[k].n;C.sounds.forEach(s=>EX['snd:'+s[0]]=s[1]);FICHES.forEach(f=>EX['fiche:'+f.k]='Lire : '+f.t);
Object.assign(EX,{journal:'Ouvrir mon journal',kit:'Ouvrir mon kit',progres:'Ouvrir mes progrès',sommeil:'Ouvrir Sommeil',videtete:'Ouvrir le vide-tête',pensee:'Démêler une pensée',
  'chat:comprend':'En parler avec ELYRA','chat:accompagne':'En parler avec ELYRA','chat:encourage':'En parler avec ELYRA','chat:ecoute':'En parler avec ELYRA'});
const findSess=k=>MEDS.find(m=>m.k===k)||STORIES.find(s=>s.k===k);
const isStory=k=>STORIES.some(s=>s.k===k);
function catOf(ex){const [k,v]=ex.split(':');if(k==='br')return'breath';if(k==='snd')return'son';if(k==='story')return'histoire';if(k==='sos')return'sos';if(k==='med'){const m=MEDS.find(x=>x.k===v);return m?m.c:'stress'}return'quotidien'}
const covHTML=(cat,cls='')=>`<span class="cov ${cls}" data-c="${esc(cat)}" aria-hidden="true"><svg><use href="#g-${esc(cat)}"/></svg></span>`;

/* ============ DONNÉES (sur le téléphone) ============ */
const KEY='elyra.v1';
const defP=()=>({name:'',genre:'',vmode:'elyra',rate:1,vname:'',brVoice:false,size:'m',theme:'auto',anticip:true,kit:{phr:[],con:[],notes:'',tech:[]},favs:[],goals:[],prog:{id:null,done:{}},
  routine:{items:C.routine.slice(),checks:{}},up:[],resume:null,onb:false,lastBackup:null,medCat:'tout',sndVol:{}});
const ST={prof:defP(),items:[]};
let storageOK=true;
function merge(base,o){const r=Object.assign(base,o);r.kit=Object.assign(defP().kit,o.kit||{});r.prog=Object.assign({id:null,done:{}},o.prog||{});
  r.routine=Object.assign({items:C.routine.slice(),checks:{}},o.routine||{});for(const k of ['favs','goals','up'])if(!Array.isArray(r[k]))r[k]=[];
  if(!r.sndVol||typeof r.sndVol!=='object')r.sndVol={};return r}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return;const o=JSON.parse(raw);ST.items=Array.isArray(o.items)?o.items.filter(x=>x&&x.t&&x.kind):[];ST.prof=merge(defP(),o.prof||{})}catch(e){storageOK=false}}
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,250)}
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify({v:1,prof:ST.prof,items:ST.items.slice(0,6000)}));storageOK=true}catch(e){storageOK=false;toast("Impossible d'enregistrer sur ce téléphone.")}}
function addItem(e){e.id='e'+uid();e.t=e.t||Date.now();ST.items.unshift(e);ST.items.sort((a,b)=>b.t-a.t);save();renderAll()}
function delItem(id){ST.items=ST.items.filter(x=>x.id!==id);save();renderAll()}
const setP=fn=>{fn(ST.prof);save();renderAll()};

/* ============ VOIX ============ */
const VO={idx:null,el:null,tts:null};
const CapTTS=()=>{try{return window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.TextToSpeech||null}catch(e){return null}};
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
let voices=[];
function loadVoices(){try{if(window.speechSynthesis){voices=speechSynthesis.getVoices().filter(v=>/^fr/i.test(v.lang));renderVoiceSel()}}catch(e){}}
try{if(window.speechSynthesis){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}}catch(e){}
async function loadVoiceIdx(){try{const r=await fetch('voix/index.json',{cache:'no-cache'});if(r.ok){const j=await r.json();if(j&&j.items){VO.idx=j.items;renderEspace();renderMeds();renderStories();renderHome()}}}catch(e){}}
const clip=t=>VO.idx&&VO.idx[t];
const est=t=>String(t).split(/\s+/).length/2.3+1;
let sessVoice=true;
function audioEl(){if(!VO.el){const el=new Audio();el.preload='auto';el.addEventListener('play',()=>SND.duck(true));el.addEventListener('ended',()=>SND.duck(false));el.addEventListener('pause',()=>SND.duck(false));VO.el=el}return VO.el}
function ttsSpeak(t,rate){const cap=CapTTS();
  if(cap){try{cap.stop().catch(()=>{});cap.speak({text:t,lang:'fr-FR',rate:.9*rate,pitch:1,volume:1,category:'playback'}).catch(()=>{})}catch(e){}return}
  try{const ss=window.speechSynthesis;if(!ss)return;ss.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=.86*rate;u.pitch=.98;
    const v=voices.find(v=>v.name===ST.prof.vname)||voices.find(v=>/(premium|enhanced|améliorée|neural|natural)/i.test(v.name))||voices.find(v=>/fr[-_](BE|FR)/i.test(v.lang))||voices[0];if(v)u.voice=v;ss.speak(u)}catch(e){}}
function speak(t,force){stopVoice();const P=ST.prof;if(!force&&(P.vmode==='off'||!sessVoice))return 0;const rate=+P.rate||1;
  const c=P.vmode!=='tel'?clip(t):null;
  if(c){const el=audioEl();el.src='voix/'+c[0];el.playbackRate=rate;try{el.preservesPitch=true}catch(e){}el.play().catch(()=>{});return c[1]/rate}
  ttsSpeak(t,rate);return est(t)/rate}
function stopVoice(){if(VO.el){try{VO.el.pause()}catch(e){}}const cap=CapTTS();if(cap){try{cap.stop().catch(()=>{})}catch(e){}}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}SND.duck(false)}

/* ============ NAVIGATION ============ */
const VIEWS=['accueil','elyra','calme','journal','pensee','moi','parcours','sommeil','progres','kit','espace','comprendre'];
const TABOF={parcours:'moi',sommeil:'moi',progres:'moi',kit:'moi',espace:'moi',comprendre:'moi',pensee:'journal'};
const TABS=[['accueil','Accueil','<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>'],['elyra','ELYRA','<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'],
 ['calme','Calme','<circle cx="12" cy="12" r="8"/><path d="M8 13c1.5-2 2.5-2 4 0s2.5 2 4 0"/>'],['journal','Journal','<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/>'],['moi','Moi','<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>']];
$('#nav').innerHTML=TABS.map(([k,n,p])=>`<a href="#${k}" data-k="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>${n}</a>`).join('');
const cur=()=>{const v=(location.hash||'#accueil').slice(1);return VIEWS.includes(v)?v:'accueil'};
function route(){const v=cur();$$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));const tab=TABOF[v]||v;
  $$('#nav a').forEach(a=>{const on=a.dataset.k===tab;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(v!=='calme'&&brMain&&brMain.on)brMain.stop(false);
  if(v==='accueil')renderHome();window.scrollTo(0,0)}
addEventListener('hashchange',route);
document.addEventListener('click',e=>{const b=e.target.closest('[data-back]');if(b){location.hash=b.dataset.back;return}
  const x=e.target.closest('[data-ex]');if(x){e.preventDefault();doEx(x.dataset.ex)}
  const f=e.target.closest('[data-fav]');if(f){toggleFav(f.dataset.fav)}});

/* ============ CONVERSATION (lien) ============ */
const chatHref=mode=>CHAT_URL.replace(/#.*$/,'')+'#'+mode;
function linkChat(a,mode){a.href=chatHref(mode);a.target='_blank';a.rel='noopener'}
function openChat(mode){const a=document.createElement('a');linkChat(a,mode);document.body.appendChild(a);a.click();a.remove()}
async function copyThen(text){try{await navigator.clipboard.writeText(text);toast('Message copié : colle-le dans la conversation.')}catch(e){}}

/* ============ ACTIONS ============ */
function doEx(id){if(!id)return;const [k,v]=id.split(':');
  if(k==='br'&&PRESETS[v]){location.hash='calme';calTab('respirer');selP(v);selD(PRESETS[v].d);startBr()}
  else if(k==='med'||k==='story'){openPlayer(v)}
  else if(k==='sos'&&SOSF[v]){openSOS();sosFlow(v)}
  else if(k==='snd'){location.hash='calme';calTab('sons');SND.on(v,ST.prof.sndVol[v])}
  else if(k==='fiche'){openFiche(v)}
  else if(k==='chat'){openChat(v)}
  else if(k==='videtete'){location.hash='sommeil';setTimeout(()=>{$('#vtCard').scrollIntoView({behavior:'smooth'});$('#vtTxt').focus()},80)}
  else if(VIEWS.includes(k))location.hash=k}
function toggleFav(id){setP(p=>{p.favs=p.favs.includes(id)?p.favs.filter(x=>x!==id):[...p.favs,id]});selP(pk);syncPlFav();haptic()}

/* ============ ACCUEIL ============ */
const chipsMood=(sel,curv)=>{$(sel).innerHTML=MOODS.map(([v,n])=>`<button type="button" data-v="${v}" aria-pressed="${curv===v}"><span class="dot m${v}"></span>${n}</button>`).join('')};
let qMood=null;chipsMood('#moodQuick');
$('#moodQuick').onclick=e=>{const b=e.target.closest('button');if(!b)return;qMood=+b.dataset.v;chipsMood('#moodQuick',qMood);$('#qStressBox').hidden=false;$('#qMsg').textContent='';$('#sugg').hidden=true;haptic()};
$('#qStress').oninput=e=>$('#qsv').textContent=e.target.value;
const SUG={1:["Tu es à plat. Un moment de douceur envers toi ?",'med:douceur'],2:["Ça tire. Un moment pour lâcher la pression ?",'med:pression'],
 3:["Une pause de 3 minutes pour remettre les compteurs à zéro ?",'med:pause'],4:["Joli moment pour un scan corporel et ancrer ce calme.",'med:scan'],5:["Profite ! Un moment de gratitude pour savourer.",'med:gratitude']};
let sugAct=null;
$('#qSave').onclick=()=>{if(!qMood)return;const s=+$('#qStress').value;addItem({kind:'humeur',mood:qMood,stress:s});$('#qMsg').textContent="C'est noté.";
  let sg=SUG[qMood];if(s>=8)sg=["Ton stress est haut. Le mode SOS peut t'aider tout de suite, une étape à la fois.",'sos'];
  $('#suggTxt').textContent=sg[0];sugAct=sg[1];$('#sugg').hidden=false;qMood=null;chipsMood('#moodQuick');$('#qStressBox').hidden=true;$('#qStress').value=5;$('#qsv').textContent='5'};
$('#suggGo').onclick=()=>{if(sugAct==='sos')openSOS();else doEx(sugAct)};
$('#quick').onclick=()=>{location.hash='calme';calTab('respirer');selP('coh');selD(1);startBr()};
function slot(){const h=new Date().getHours();return h>=5&&h<11?'matin':h>=11&&h<17?'jour':h>=17&&h<21?'soir':'nuit'}
function homePicks(){const S={matin:['med:matin','br:coh','med:respi','med:minute','med:marche'],jour:['med:pause','med:pression','br:apaise','med:minute','med:marche'],
  soir:['med:soir','med:gratitude','br:vague','med:emotion','story:jardinnuit'],nuit:['med:scandodo','story:phare','br:dodo','med:dodo','story:cabane']}[slot()].slice();
  const recent=ST.items.find(x=>x.mood&&Date.now()-x.t<3*3600e3);if(recent&&recent.mood<=2)S.unshift('med:douceur','med:emotion');
  const f=ST.prof.favs.filter(x=>EX[x]&&!S.includes(x)).slice(0,2);return [...new Set([...S.slice(0,4),...f,...S.slice(4)])].slice(0,7)}
function sessMin(k){const m=findSess(k);if(!m)return 0;return Math.max(1,Math.round(durs(m).reduce((a,b)=>a+b,0)/60))}
function tileHTML(ex){const [k,v]=ex.split(':');const lab=EX[ex];
  const meta=k==='br'?`${PRESETS[v].d} min · respiration`:k==='snd'?'son':k==='story'?`${sessMin(v)} min · histoire`:k==='med'?`${sessMin(v)} min`:'';
  return `<button class="tile" data-ex="${esc(ex)}">${covHTML(catOf(ex))}<b>${esc(lab)}</b><span>${esc(meta)}</span></button>`}
function renderHome(){const h=new Date().getHours();const nm=ST.prof.name?' '+ST.prof.name:'';
  $('#hello').textContent=(h<5?'Bonne nuit':h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir')+nm;
  $('#hero').className='hero t-'+slot();
  $('#homeTiles').innerHTML=homePicks().map(tileHTML).join('');
  const now=Date.now();$('#stMin').textContent=ST.items.filter(x=>x.kind==='pratique'&&now-x.t<7*DAY).reduce((a,x)=>a+(+x.min||0),0);
  $('#stDays').textContent=new Set(ST.items.filter(x=>now-x.t<7*DAY).map(x=>dkey(x.t))).size;
  const lm=ST.items.find(x=>x.mood);$('#stMood').textContent=lm?MOODS[lm.mood-1][1]:'–';
  $('#enc').textContent=G(C.enc[doy()%C.enc.length]);
  const fd=FICHES[doy()%FICHES.length];$('#ficheDayT').textContent=fd.t;$('#ficheDayD').textContent=fd.d;$('#ficheDayGo').onclick=()=>openFiche(fd.k);
  const k=ST.prof.kit;$('#kitHint').textContent=(k.phr.length||k.con.length||k.tech.length)?`${k.phr.length} phrase(s), ${k.con.length} contact(s), ${k.tech.length} technique(s)`:"Tes phrases, tes contacts, ce qui t'aide.";
  const today=dkey();const soon=ST.prof.up.filter(u=>u.date>=today).sort((a,b)=>a.date<b.date?-1:1).filter(u=>{const [y,m,d2]=u.date.split('-').map(Number);return (new Date(y,m-1,d2)-dstart(now))/DAY<=3});
  $('#homeUp').innerHTML=soon.map(u=>`<div class="card" style="background:var(--lavs)"><span class="tag lav">Bientôt · ${esc(u.date===today?"aujourd'hui":fmtKey(u.date))}</span><h3 class="mt">${esc(u.txt)}</h3>
    <p class="sub">Tu veux t'y préparer en douceur ?</p><div class="row mt"><button class="ghost" data-ex="med:avant">Avant un moment important</button><button class="main" data-prep="${esc(u.id)}">Préparer avec ELYRA</button></div></div>`).join('');
  const P=PROGS.find(p=>p.id===ST.prof.prog.id);const box=$('#homeProg');
  if(!P){box.innerHTML=`<span class="tag">Mon parcours</span><h3 class="mt">Choisis un programme</h3><p class="sub">Anxiété, sommeil, ruminations, confiance… ${PROGS.length} programmes courts, à ton rythme.</p><a class="btn ghost mt" href="#parcours">Voir les parcours</a>`}
  else{const done=ST.prof.prog.done[P.id]||[];const i=P.s.findIndex((_,j)=>!done.includes(j));
    if(i<0)box.innerHTML=`<span class="tag">${esc(P.n)}</span><h3 class="mt">Parcours terminé</h3><p class="sub">Bravo pour ce chemin. Tu peux le refaire ou en choisir un autre.</p><a class="btn ghost mt" href="#parcours">Mes parcours</a>`;
    else{const st=P.s[i];box.innerHTML=`<span class="tag">${esc(P.n)} · étape ${i+1}/${P.s.length}</span><h3 class="mt">${esc(st[0])}</h3><p class="sub">${esc(G(st[1]))}</p>
      <div class="row mt">${st[2]?`<button class="main" data-ex="${esc(st[2])}">${esc(EX[st[2]]||'Commencer')}</button>`:''}<button class="ghost" data-stepdone="${esc(P.id)}:${i}">C'est fait</button></div>`}}}
document.addEventListener('click',e=>{const d=e.target.closest('[data-stepdone]');if(d){const [p,i]=d.dataset.stepdone.split(':');toggleStep(p,+i,true);toast('Étape notée. Bravo !');haptic()}
  const pr=e.target.closest('[data-prep]');if(pr){const u=ST.prof.up.find(x=>x.id===pr.dataset.prep);if(u)prepare(u)}});
async function prepare(u){await copyThen(`J'ai bientôt quelque chose qui m'inquiète : ${u.txt} (${fmtKey(u.date)}). Tu peux m'aider à m'y préparer en douceur ?`);openChat('accompagne')}

/* ============ ELYRA (lien) ============ */
function renderElyra(){$('#modes').innerHTML=C.modes.map(([k,n,d])=>`<a class="item" style="text-decoration:none;color:inherit" data-mode="${k}"><span class="go">${covHTML(k==='apaise'?'sos':k==='encourage'?'confiance':k==='comprend'?'visu':k==='accompagne'?'corps':'stress')}<span><h3>${esc(n)}</h3><p>${esc(d)}</p></span></span></a>`).join('');
  $$('#modes a').forEach(a=>linkChat(a,a.dataset.mode));linkChat($('#talkHome'),'ecoute')}

/* ============ RESPIRATION ============ */
const PH_COL={Inspire:'var(--lav)',Expire:'var(--sage)',Retiens:'var(--champ)',Pause:'var(--champ)'};
function Breather(root){
  root.innerHTML=`<div class="stage"><div class="halo"></div><div class="ring"></div><div class="ring2"></div><div class="bub"></div><div class="lbl"><b>On y va ?</b><span></span></div></div><p class="left" aria-live="polite"></p>`;
  const stage=root.querySelector('.stage'),bub=root.querySelector('.bub'),halo=root.querySelector('.halo'),r2=root.querySelector('.ring2'),ph=root.querySelector('.lbl b'),ct=root.querySelector('.lbl span'),left=root.querySelector('.left');
  const o={on:false,k:null,min:0,onState:null};let to,cd,iv,end,i;
  const set=(sc,d)=>{for(const [el,f] of [[bub,1],[halo,1.15],[r2,1.05]]){el.style.transitionDuration=d+'s';el.style.transform=`scale(${sc*f})`}};
  function phase(){if(!o.on)return;if(Date.now()>=end-500)return stop(true);const P=PRESETS[o.k].ph,p=P[i%P.length];ph.textContent=p[0];
    stage.style.setProperty('--ph',PH_COL[p[0]]||'var(--lav)');set(p[2]?1:.42,p[1]);
    if(ST.prof.brVoice&&ST.prof.vmode!=='off')speak(p[0]);else if(p[0]==='Inspire'||p[0]==='Expire')SND.tone(p[2]?330:262,.9,.045);
    haptic(20);let c=p[1];ct.textContent=c;clearInterval(cd);cd=setInterval(()=>{c--;if(c>0)ct.textContent=c},1000);to=setTimeout(()=>{i++;phase()},p[1]*1000)}
  function start(k,min){SND.ctx();if(o.on)stop(false);o.k=k;o.min=min;o.on=true;i=0;end=Date.now()+min*60000;
    iv=setInterval(()=>{const s=Math.max(0,Math.round((end-Date.now())/1000));left.textContent=`Encore ${mmss(s)}`},500);phase();o.onState&&o.onState(true)}
  function stop(done){const was=o.on;o.on=false;clearTimeout(to);clearInterval(cd);clearInterval(iv);set(.42,1.5);ct.textContent='';stage.style.setProperty('--ph','var(--lav)');
    if(done&&was){SND.bell();ph.textContent='Bravo';left.textContent=`${o.min} min de calme en plus.`;addItem({kind:'pratique',ex:'br:'+o.k,label:PRESETS[o.k].n,min:o.min})}
    else{ph.textContent='On y va ?';left.textContent=''}o.onState&&o.onState(false)}
  o.start=start;o.stop=stop;return o}
const brMain=Breather($('#brMain'));
let pk='coh',dur=5;
function selP(k){pk=k;$('#presets').innerHTML=Object.entries(PRESETS).map(([k2,p])=>`<button data-k="${k2}" aria-pressed="${k2===pk}">${esc(p.n)}</button>`).join('');$('#presetInfo').textContent=PRESETS[pk].i;
  const f=ST.prof.favs.includes('br:'+pk);$('#brFav').setAttribute('aria-pressed',f);$('#brFav').textContent=f?'★':'☆'}
function selD(d){dur=d;$('#durs').innerHTML=[1,3,5,10].map(m=>`<button data-d="${m}" aria-pressed="${m===dur}">${m} min</button>`).join('')}
$('#presets').onclick=e=>{const b=e.target.closest('button');if(b&&!brMain.on){selP(b.dataset.k);selD(PRESETS[b.dataset.k].d)}};
$('#durs').onclick=e=>{const b=e.target.closest('button');if(b&&!brMain.on)selD(+b.dataset.d)};
function startBr(){brMain.start(pk,dur)}
brMain.onState=on=>{$('#brBtn').textContent=on?'Arrêter':'Commencer'};
$('#brBtn').onclick=()=>brMain.on?brMain.stop(false):startBr();
$('#brFav').onclick=()=>toggleFav('br:'+pk);
$('#brVoice').onchange=e=>setP(p=>p.brVoice=e.target.checked);
function calTab(t){$$('#calTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));$$('#v-calme .pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+t));if(t!=='respirer'&&brMain.on)brMain.stop(false)}
$('#calTabs').onclick=e=>{const b=e.target.closest('button');if(b)calTab(b.dataset.t)};
selP('coh');selD(5);

/* ============ SÉANCES ============ */
const durs=m=>m.s.map(s=>{const r=+ST.prof.rate||1;const c=ST.prof.vmode==='elyra'?clip(G(s[0])):null;const v=c?c[1]/r:(ST.prof.vmode==='off'?0:est(s[0])/r);return Math.max(s[1],Math.ceil(v+3))});
function itemHTML(m,story){const key=(story?'story:':'med:')+m.k;const f=ST.prof.favs.includes(key);
  return `<div class="item"><button class="go" data-ex="${key}">${covHTML(story?'histoire':m.c)}<span><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p><span class="meta">${sessMin(m.k)} min</span></span></button><button class="star" data-fav="${key}" aria-pressed="${f}" aria-label="Favori : ${esc(m.t)}">${f?'★':'☆'}</button></div>`}
function renderMeds(){const cat=ST.prof.medCat||'tout';
  $('#medCats').innerHTML=C.cats.map(([k,n])=>`<button data-cat="${k}" aria-pressed="${k===cat}">${esc(n)}</button>`).join('');
  $('#meds').innerHTML=MEDS.filter(m=>cat==='tout'||m.c===cat).map(m=>itemHTML(m,false)).join('');
  const r=ST.prof.resume;const rm=r&&findSess(r.k);
  $('#resume').innerHTML=rm?`<div class="card row between">${covHTML(isStory(rm.k)?'histoire':rm.c)}<div style="flex:1"><span class="tag lav">À reprendre</span><h3 class="mt">${esc(rm.t)}</h3></div><button class="main" id="resGo">Reprendre</button></div>`:'';
  if(rm)$('#resGo').onclick=()=>openPlayer(rm.k,r.i)}
$('#medCats').onclick=e=>{const b=e.target.closest('[data-cat]');if(b)setP(p=>p.medCat=b.dataset.cat)};
function renderStories(){$('#stories').innerHTML=STORIES.map(s=>itemHTML(s,true)).join('')}

/* ============ LECTEUR ============ */
const PL={m:null,i:-1,d:[],stepEl:0,el:0,tot:0,iv:null,paused:false,done:false,key:''};
function openPlayer(k,from){const m=findSess(k);if(!m)return;SND.ctx();if(brMain.on)brMain.stop(false);stopVoice();
  const story=isStory(k);PL.key=(story?'story:':'med:')+k;sessVoice=true;
  PL.m=m;PL.d=durs(m);PL.tot=PL.d.reduce((a,b)=>a+b,0);const start=Math.max(0,Math.min(from||0,m.s.length-1));PL.el=PL.d.slice(0,start).reduce((a,b)=>a+b,0);
  PL.done=false;PL.paused=false;const cat=story?'histoire':m.c;
  $('#plCov').outerHTML=covHTML(cat,'big').replace('class="cov big"','class="cov big" id="plCov"');
  const cs=getComputedStyle($('#plCov'));$('#plAura').style.setProperty('--c1',cs.getPropertyValue('--c1'));$('#plAura').style.setProperty('--c2',cs.getPropertyValue('--c2'));
  $('#plT').textContent=m.t;$('#plSub').textContent=m.d;$('#plTag').textContent=story?'Histoire':(C.cats.find(c=>c[0]===m.c)||['',''])[1];
  $('#plTot').textContent=mmss(PL.tot);setPlay(true);syncPlVoice();syncPlFav();syncAmb();
  $('#player').classList.add('on');document.body.style.overflow='hidden';SND.bell();
  clearInterval(PL.iv);PL.iv=setInterval(tick,250);step(start);$('#plPlay').focus()}
function step(i){PL.i=i;PL.stepEl=0;const t=G(PL.m.s[i][0]);const say=$('#plSay');say.classList.add('fade');
  setTimeout(()=>{say.textContent=t;say.classList.remove('fade')},250);speak(t);updBar()}
function tick(){if(PL.paused||PL.done)return;PL.stepEl+=.25;PL.el+=.25;updBar();if(PL.stepEl>=PL.d[PL.i])advance()}
function advance(){if(PL.i+1>=PL.m.s.length)return finish();step(PL.i+1)}
function updBar(){$('#plBar').style.width=Math.min(100,PL.el/PL.tot*100)+'%';$('#plEl').textContent=mmss(PL.el)}
function setPlay(playing){$('#plPlay').innerHTML=`<svg class="icon"><use href="#i-${playing?'pause':'play'}"/></svg>`;$('#plPlay').setAttribute('aria-label',playing?'Pause':'Lecture')}
function finish(){PL.done=true;clearInterval(PL.iv);stopVoice();SND.bell();const t=isStory(PL.m.k)?'Bonne nuit.':"Merci de t'être offert ce moment.";
  $('#plSay').textContent=t;PL.el=PL.tot;updBar();setPlay(false);
  setP(p=>{if(p.resume&&p.resume.k===PL.m.k)p.resume=null});addItem({kind:'pratique',ex:PL.key,label:PL.m.t,min:Math.max(1,Math.round(PL.tot/60))})}
function closePlayer(){clearInterval(PL.iv);stopVoice();$('#player').classList.remove('on');document.body.style.overflow=$('#sos').classList.contains('on')?'hidden':'';
  if(PL.m&&!PL.done&&(PL.i>0||PL.stepEl>=10)&&!PL.m.sos)setP(p=>{p.resume={k:PL.m.k,i:PL.i}})}
$('#plClose').onclick=closePlayer;
$('#plPlay').onclick=()=>{if(PL.done){openPlayer(PL.m.k);return}PL.paused=!PL.paused;setPlay(!PL.paused);
  if(PL.paused){if(VO.el&&!VO.el.paused)VO.el.pause();else stopVoice()}
  else{if(VO.el&&VO.el.src&&VO.el.currentTime>0&&!VO.el.ended&&ST.prof.vmode==='elyra'&&clip(G(PL.m.s[PL.i][0])))VO.el.play().catch(()=>{});else speak(G(PL.m.s[PL.i][0]))}};
$('#plNext').onclick=()=>{if(PL.done)return;PL.el+=PL.d[PL.i]-PL.stepEl;advance()};
$('#plPrev').onclick=()=>{if(PL.done)return;PL.el-=PL.stepEl;if(PL.stepEl<3&&PL.i>0){PL.el-=PL.d[PL.i-1];step(PL.i-1)}else step(PL.i)};
const syncPlVoice=()=>{const on=sessVoice&&ST.prof.vmode!=='off';$('#plVoice').textContent='Voix : '+(on?'oui':'non');$('#plVoice').setAttribute('aria-pressed',on)};
$('#plVoice').onclick=()=>{if(ST.prof.vmode==='off'){toast('Active la voix dans Mon espace.');return}sessVoice=!sessVoice;syncPlVoice();if(!sessVoice)stopVoice();else if(!PL.paused&&!PL.done)speak(G(PL.m.s[PL.i][0]))};
function syncPlFav(){if(!PL.key)return;const f=ST.prof.favs.includes(PL.key);$('#plFav').textContent=(f?'★':'☆')+' Favori';$('#plFav').setAttribute('aria-pressed',f)}
$('#plFav').onclick=()=>toggleFav(PL.key);

/* ============ SONS ============ */
const AMBS=[['none','Sans ambiance'],...C.sounds.map(s=>[s[0],s[1]])];
for(const s of ['#ambB','#ambM']){$(s).innerHTML=AMBS.map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('');$(s).onchange=e=>{SND.only(e.target.value)}}
function syncAmb(){const a=SND.active();for(const s of ['#ambB','#ambM']){const el=$(s);if(el)el.value=a.length===1?a[0]:'none'}}
let sndSess={start:0,names:[]};
SND.onChange(why=>{const a=SND.active();
  if(a.length&&!sndSess.start)sndSess={start:Date.now(),names:a.slice()};else if(a.length)sndSess.names=[...new Set([...sndSess.names,...a])];
  if(!a.length&&sndSess.start){const m=Math.round((Date.now()-sndSess.start)/60000);if(m>=3)addItem({kind:'pratique',ex:'snd:'+sndSess.names[0],label:'Sons : '+sndSess.names.map(n=>EX['snd:'+n]).join(', '),min:m});sndSess={start:0,names:[]}}
  if(why==='timer')toast('Minuterie terminée. Les sons se sont arrêtés.');renderSounds();syncAmb()});
function renderSounds(){const a=SND.active();
  $('#mixes').innerHTML=C.mixes.map(([n,l],i)=>`<button data-mix="${i}" aria-pressed="${l.length===a.length&&l.every(x=>a.includes(x))}">${esc(n)}</button>`).join('');
  $('#sounds').innerHTML=C.sounds.map(([k,n,d])=>{const on=a.includes(k);const v=ST.prof.sndVol[k]!=null?ST.prof.sndVol[k]:.8;
    return `<div class="sndc" aria-current="${on}"><button class="go" data-snd="${k}" aria-pressed="${on}">${covHTML('son')}<span>${esc(n)}<small>${on?'En cours':esc(d)}</small></span></button>${on?`<input type="range" min="0" max="1" step="0.05" value="${v}" data-vol="${k}" aria-label="Volume : ${esc(n)}">`:''}</div>`}).join('');
  $('#sndState').textContent=a.length?`En cours : ${a.map(k=>EX['snd:'+k]).join(', ')}.`:'Aucun son en cours.';$('#sndStop').hidden=!a.length}
$('#sounds').onclick=e=>{const b=e.target.closest('[data-snd]');if(!b)return;const k=b.dataset.snd;const was=SND.active().length;
  if(SND.active().includes(k))SND.off(k);else{SND.on(k,ST.prof.sndVol[k]);if(!was)SND.timer(+$('#sndTimer').value)}haptic()};
$('#sounds').oninput=e=>{const r=e.target.closest('[data-vol]');if(!r)return;SND.vol(r.dataset.vol,+r.value);ST.prof.sndVol[r.dataset.vol]=+r.value;save()};
$('#mixes').onclick=e=>{const b=e.target.closest('[data-mix]');if(!b)return;const l=C.mixes[+b.dataset.mix][1];SND.only(null);setTimeout(()=>{l.forEach(k=>SND.on(k,ST.prof.sndVol[k]));SND.timer(+$('#sndTimer').value)},50)};
$('#sndTimer').onchange=e=>{if(SND.active().length)SND.timer(+e.target.value)};
$('#sndStop').onclick=()=>SND.stopAll();
function renderFavs(){const f=ST.prof.favs.filter(x=>EX[x]);$('#favBox').innerHTML=f.length?`<div class="sect"><h2>Mes favoris</h2></div><div class="tiles">${f.map(tileHTML).join('')}</div>`:''}

/* ============ SOS ============ */
const SOSIT={
 crise:{n:'Je sens une crise arriver',m:"Une vague monte. Elle va atteindre un sommet, puis redescendre. Tu n'as rien à réussir : on y va une petite chose à la fois.",o:['souffle','ground','audio','douce','parler'],a:'vague'},
 controle:{n:"J'ai peur de perdre le contrôle",m:"Cette peur accompagne très souvent les fortes angoisses. Tu peux la laisser être là, sans lui obéir. Commençons par sentir le sol sous tes pieds.",o:['ground','audio','douce','parler'],a:'sosvoix'},
 physique:{n:"J'ai des sensations physiques inquiétantes",m:"Tes sensations comptent, et elles méritent d'être prises au sérieux.",warn:1,o:['ground','souffle','audio','parler'],a:'sosvoix'},
 depasse:{n:'Je me sens {dépassé|dépassée}',m:"Tout semble trop à la fois. On met le reste de côté pour quelques minutes. Juste la prochaine petite chose.",o:['audio','ground','kit','parler'],a:'trop'},
 intense:{n:'Je ressens une angoisse intense',m:"C'est très dur, et tu as bien fait de venir ici. Ça ne restera pas à ce niveau-là. Choisis ce qui te semble le plus facile.",o:['audio','souffle','ground','froid','douce','eft','parler'],a:'vague'},
 parler:{n:"J'ai besoin de parler",m:"Tu as le droit d'avoir besoin de quelqu'un. Tu peux écrire à ELYRA, ou appeler une personne de confiance.",o:['parler','contacts','ground','audio'],a:'sosvoix'}};
const SOSOPT={souffle:['Le soupir qui apaise','Quelques longues expirations',()=>sosFlow('souffle')],douce:['Respiration douce','Facultative, sans forcer',()=>sosBreath()],
 ground:['Ancrage 5-4-3-2-1',"Revenir à ce qui t'entoure",()=>sosFlow('ground')],eft:['Tapotements','Tapoter et se rassurer',()=>sosFlow('eft')],froid:['Le froid qui ramène',"De l'eau fraîche sur les mains",()=>sosFlow('froid')],
 audio:['Écouter une voix calme','Quelques minutes guidées',()=>openPlayer(SOSIT[sosSit].a)],kit:['Mon kit de secours','Tes phrases et tes repères',()=>sosKit()],
 parler:['Parler à ELYRA','Une conversation pour t’apaiser (Internet)',()=>openChat('apaise')],contacts:['Mes contacts de confiance','Appeler quelqu’un',()=>sosKit()]};
const sosBr={b:null};let sosSit=null;
function sosRender(html,back){$('#sosBody').innerHTML=html;$('#sosBack').hidden=!back;const h=$('#sosBody h2');if(h){h.setAttribute('tabindex','-1');h.focus()}}
function openSOS(){if(brMain.on)brMain.stop(false);$('#sos').classList.add('on');document.body.style.overflow='hidden';sosStart();haptic(30)}
function closeSOS(){if(sosBr.b&&sosBr.b.on)sosBr.b.stop(false);stopVoice();$('#sos').classList.remove('on');document.body.style.overflow=''}
function sosStart(){sosSit=null;sosRender(`<h2 id="sosT">Je suis là.</h2><p class="quote mt">Tu as bien fait d'ouvrir ELYRA. On va y aller doucement, une chose à la fois.</p>
  <p class="mt" style="font-weight:600">Qu'est-ce qui se passe pour toi ?</p><div class="sitg">${Object.entries(SOSIT).map(([k,s])=>`<button class="opt" data-sit="${k}"><b>${esc(G(s.n))}</b></button>`).join('')}</div>`,false)}
function sosOptions(){const s=SOSIT[sosSit];const k=ST.prof.kit;
  const pref=s.o.slice().sort((a,b)=>(k.tech.includes('sos:'+b)?1:0)-(k.tech.includes('sos:'+a)?1:0));
  const warn=s.warn?`<div class="warnb"><p style="margin:0"><b>D'abord, ta sécurité.</b> Douleur ou oppression dans la poitrine, difficulté à respirer, faiblesse ou engourdissement d'un côté du corps, malaise, ou sensation nouvelle pour toi : <b>appelle le 112 maintenant</b>. Dans le doute, appeler est toujours une bonne décision. Le médecin de garde (1733) peut aussi te conseiller.</p>
    <a class="btn main mt" href="tel:112" style="background:var(--warm)">Appeler le 112</a></div><p class="mt">Si ces sensations te sont connues et ont déjà été vérifiées par un médecin, tu peux essayer :</p>`:'';
  const phr=k.phr.length?`<p class="mt" style="font-weight:600">Tes phrases</p>${k.phr.slice(0,3).map(p=>`<p class="phr">${esc(p)}</p>`).join('')}`:'';
  sosRender(`<h2 id="sosT">${esc(G(s.n))}</h2><p class="quote mt">${esc(s.m)}</p>${warn}<div class="sitg">${pref.map(o=>`<button class="opt" data-opt="${o}"><b>${esc(SOSOPT[o][0])}</b><span>${esc(SOSOPT[o][1])}</span></button>`).join('')}</div>${phr}
    <button class="ghost mt2" data-sosend="1" style="width:100%">Ça va un peu mieux</button>`,true)}
function sosFlow(key){let i=0;const F=SOSF[key];
  const draw=()=>{const st=F.s[i];sosRender(`<h2 id="sosT">${esc(F.n)}</h2><div class="card"><p class="big">${esc(st[0])}</p><p class="step">${esc(st[1])}</p>
    <div class="row"><button class="ghost" id="fPrev" ${i===0?'disabled':''}>Précédent</button><button class="main" id="fNext">${i===F.s.length-1?'Terminé':'Suivant'}</button></div></div>`,true);
    speak(st[1]);
    $('#fPrev').onclick=()=>{if(i>0){i--;draw()}};$('#fNext').onclick=()=>{if(i<F.s.length-1){i++;draw()}else{stopVoice();addItem({kind:'pratique',ex:'sos:'+key,label:F.n,min:2});sosEnd()}}};
  draw()}
function sosBreath(){sosRender(`<h2 id="sosT">Respiration douce</h2><p class="sub">Facultative. Respire par le nez, sans gonfler fort. Si c'est inconfortable, arrête : respirer normalement, c'est très bien.</p><div id="sosBr"></div>
  <div class="row center"><button class="main" id="sbGo">Commencer</button><button class="ghost" id="sbDone">Continuer</button></div>`,true);
  sosBr.b=Breather($('#sosBr'));sosBr.b.onState=on=>{const b=$('#sbGo');if(b)b.textContent=on?'Arrêter':'Commencer'};
  $('#sbGo').onclick=()=>sosBr.b.on?sosBr.b.stop(false):sosBr.b.start('douce',2);$('#sbDone').onclick=()=>{if(sosBr.b.on)sosBr.b.stop(false);sosSit?sosOptions():sosEnd()}}
function sosKit(){const k=ST.prof.kit;
  const con=k.con.length?k.con.map(c=>`<a class="btn ghost" style="justify-content:space-between;width:100%;margin-top:8px" href="tel:${esc(c.p.replace(/[^\d+]/g,''))}"><span>${esc(c.n)}</span><b>${esc(c.p)}</b></a>`).join(''):`<p class="sub">Tu n'as pas encore de contact de confiance. Tu peux en ajouter dans ton kit.</p>`;
  const phr=(k.phr.length?k.phr:C.kitsug.slice(0,2)).map(p=>`<p class="phr">${esc(p)}</p>`).join('');
  const tech=k.tech.filter(t=>EX[t]).map(t=>`<button data-ex="${esc(t)}">${esc(EX[t])}</button>`).join('');
  sosRender(`<h2 id="sosT">Ton kit de secours</h2>${phr}${tech?`<p class="mt" style="font-weight:600">Ce qui t'aide</p><div class="row chips">${tech}</div>`:''}<p class="mt" style="font-weight:600">Tes contacts</p>${con}${k.notes?`<p class="mt" style="font-weight:600">Tes notes</p><p style="white-space:pre-wrap">${esc(k.notes)}</p>`:''}
   <button class="ghost mt2" data-sosend="1" style="width:100%">Ça va un peu mieux</button>`,true)}
function sosEnd(){sosRender(`<h2 id="sosT">Retour au calme</h2><p class="quote mt">Tu as traversé ce moment. Prends ton temps avant de reprendre.</p>
  <div class="card"><p style="font-weight:600;margin:0">Et maintenant, ton niveau d'angoisse : <span id="seV">5</span>/10</p><input type="range" id="seR" min="0" max="10" value="5" aria-label="Niveau d'angoisse maintenant">
  <button class="main" id="seSave">Noter et fermer</button></div>
  <div class="card"><h3>Si tu veux</h3><p>Bois quelques gorgées d'eau. Bouge doucement, étire-toi.</p><p>Note ce qui t'a aidé dans ton kit de secours, pour la prochaine fois.</p><p>Si ces moments reviennent souvent, en parler à ton médecin peut vraiment aider.</p></div>`,true);
  $('#seR').oninput=e=>$('#seV').textContent=e.target.value;
  $('#seSave').onclick=()=>{addItem({kind:'sos',sit:sosSit||'',stress:+$('#seR').value});closeSOS();toast('Bien joué. Prends soin de toi.')}}
$('#sosOpen').onclick=openSOS;$('#sosX').onclick=closeSOS;
$('#sosBack').onclick=()=>{stopVoice();if(sosBr.b&&sosBr.b.on)sosBr.b.stop(false);sosSit?sosOptions():sosStart()};
$('#sosBody').onclick=e=>{const s=e.target.closest('[data-sit]');if(s){sosSit=s.dataset.sit;sosOptions();return}
  const o=e.target.closest('[data-opt]');if(o){SOSOPT[o.dataset.opt][2]();return}
  if(e.target.closest('[data-sosend]'))sosEnd();
  if(e.target.closest('[data-ex]'))closeSOS()};
const urgHTML=()=>C.urg.map(([n,d])=>`<a href="tel:${n.replace(/\s/g,'')}"><b>${esc(n)}</b><span>${esc(d)}</span></a>`).join('');
$$('[data-urg]').forEach(e=>e.innerHTML=urgHTML());
addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#dlg').classList.contains('on'))$('#dlg').classList.remove('on');else if($('#player').classList.contains('on'))closePlayer();else if($('#sos').classList.contains('on'))closeSOS()});

/* ============ JOURNAL ============ */
let jm=null,jEmo=[],jSit=[],jShow=20,jP=Math.floor(Math.random()*C.prompts.length);
const multi=(sel,list,arr)=>{$(sel).innerHTML=list.map(x=>`<button type="button" data-v="${esc(x)}" aria-pressed="${arr.includes(x)}">${esc(x)}</button>`).join('')};
function resetJ(){jm=null;jEmo=[];jSit=[];chipsMood('#moodJ');multi('#emoJ',C.emos,jEmo);multi('#sitJ',C.sits,jSit);$('#stress').value=5;$('#sv').textContent='5';$('#jNote').value='';$('#jPrompt').textContent=G(C.prompts[jP%C.prompts.length])}
resetJ();
$('#jPromptNext').onclick=()=>{jP++;$('#jPrompt').textContent=G(C.prompts[jP%C.prompts.length])};
$('#moodJ').onclick=e=>{const b=e.target.closest('button');if(b){jm=+b.dataset.v;chipsMood('#moodJ',jm)}};
const toggleIn=(arr,v)=>arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];
$('#emoJ').onclick=e=>{const b=e.target.closest('button');if(!b)return;jEmo=toggleIn(jEmo,b.dataset.v);multi('#emoJ',C.emos,jEmo)};
$('#sitJ').onclick=e=>{const b=e.target.closest('button');if(!b)return;jSit=toggleIn(jSit,b.dataset.v);multi('#sitJ',C.sits,jSit)};
$('#stress').oninput=e=>$('#sv').textContent=e.target.value;
$('#jForm').onsubmit=e=>{e.preventDefault();const note=$('#jNote').value.trim();if(!jm&&!note&&!jEmo.length){$('#jMsg').textContent='Choisis une humeur, une émotion ou écris un mot.';return}
  addItem({kind:'journal',mood:jm,stress:+$('#stress').value,emos:jEmo.slice(),sits:jSit.slice(),note:note.slice(0,3000),q:note?$('#jPrompt').textContent:''});resetJ();$('#jMsg').textContent="C'est noté. Merci de prendre ce temps pour toi."};
const KLAB={journal:'Journal',humeur:'Humeur',videtete:'Vide-tête',sos:'Après un SOS',pensee:'Pensée démêlée'};
function bars(el,days,key){const today=dstart(Date.now());const out=[];
  for(let i=days-1;i>=0;i--){const dd=dstart(today-i*DAY+432e5);const s=ST.items.filter(x=>x[key]!=null&&x[key]!==''&&dstart(x.t)===dd);const v=s.length?avg(s.map(x=>+x[key])):null;
    const max=key==='mood'?5:10;out.push(v==null?'<div class="z" title="pas de note"></div>':`<div style="height:${Math.max(4,v/max*100)}%" title="${key==='mood'?'humeur':'stress'} ${v.toFixed(1)}/${max}"></div>`)}
  el.innerHTML=out.join('')}
function entryBody(x){if(x.kind==='pensee')return `<p><b>Situation :</b> ${esc(x.sit)}</p><p><b>Pensée :</b> ${esc(x.pen)}</p>${x.emos&&x.emos.length?`<p class="sub" style="margin:2px 0 0">${esc(x.emos.join(', '))} · ${+x.i1}/10 → ${+x.i2}/10</p>`:`<p class="sub" style="margin:2px 0 0">${+x.i1}/10 → ${+x.i2}/10</p>`}
  ${x.traps&&x.traps.length?`<p class="sub" style="margin:2px 0 0">${esc(x.traps.join(', '))}</p>`:''}${x.autre?`<p><b>Autre regard :</b> ${esc(x.autre)}</p>`:''}`;
  return `<p>${x.mood?`<span class="dot m${+x.mood}"></span>${esc(MOODS[x.mood-1][1])}`:''}${x.stress!=null?`${x.mood?' · ':''}stress ${+x.stress}/10`:''}</p>
    ${x.emos&&x.emos.length?`<p class="sub" style="margin:2px 0 0">${esc(x.emos.join(', '))}</p>`:''}${x.sits&&x.sits.length?`<p class="sub" style="margin:2px 0 0">${esc(x.sits.join(', '))}</p>`:''}
    ${x.q?`<p class="sub" style="margin:4px 0 0;font-style:italic">${esc(x.q)}</p>`:''}${x.note?`<p style="white-space:pre-wrap">${esc(x.note)}</p>`:''}`}
function renderJournal(){bars($('#chart'),14,'stress');const js=ST.items.filter(x=>KLAB[x.kind]);
  $('#entries').innerHTML=js.length?js.slice(0,jShow).map(x=>`<div class="entry"><div><small>${esc(fmtDT(x.t))} · ${esc(KLAB[x.kind])}</small>${entryBody(x)}</div><button class="del" data-del="${esc(x.id)}" aria-label="Supprimer cette note">Supprimer</button></div>`).join('')
    :'<p class="sub">Pas encore de note. La première est souvent la plus dure, prends ton temps.</p>';
  $('#moreJ').hidden=js.length<=jShow}
$('#moreJ').onclick=()=>{jShow+=30;renderJournal()};
document.addEventListener('click',e=>{const d=e.target.closest('[data-del]');if(d)ask('Supprimer cette note ?','Elle sera effacée de ton téléphone.','Supprimer',()=>delItem(d.dataset.del))});

/* ============ DÉMÊLER UNE PENSÉE ============ */
let tI=0,tEmo=[],tTrap=[];const TN=7;
function tDraw(){$$('#tForm .tstep').forEach((s,i)=>s.classList.toggle('on',i===tI));$('#tDots').innerHTML=Array.from({length:TN},(_,i)=>`<i class="${i<=tI?'on':''}"></i>`).join('');
  $('#tPrev').disabled=tI===0;$('#tNext').textContent=tI===TN-1?'Enregistrer':'Suivant';multi('#tEmo',C.emos.slice(0,9),tEmo);multi('#tTrap',C.pieges,tTrap)}
$('#tEmo').onclick=e=>{const b=e.target.closest('button');if(b){tEmo=toggleIn(tEmo,b.dataset.v);tDraw()}};
$('#tTrap').onclick=e=>{const b=e.target.closest('button');if(b){tTrap=toggleIn(tTrap,b.dataset.v);tDraw()}};
$('#t3').oninput=e=>$('#t3v').textContent=e.target.value;$('#t7').oninput=e=>$('#t7v').textContent=e.target.value;
$('#tPrev').onclick=()=>{if(tI>0){tI--;tDraw()}};
$('#tNext').onclick=()=>{if(tI<TN-1){tI++;tDraw();window.scrollTo(0,0);return}
  const v=id=>$(id).value.trim().slice(0,1000);if(!v('#t1')&&!v('#t2')){toast('Écris au moins la situation ou la pensée.');tI=0;tDraw();return}
  addItem({kind:'pensee',sit:v('#t1'),pen:v('#t2'),emos:tEmo.slice(),i1:+$('#t3').value,traps:tTrap.slice(),pour:v('#t5a'),contre:v('#t5b'),autre:v('#t6'),i2:+$('#t7').value});
  ['#t1','#t2','#t5a','#t5b','#t6'].forEach(i=>$(i).value='');tEmo=[];tTrap=[];tI=0;tDraw();toast('Enregistré dans ton journal. Bravo pour ce travail.');location.hash='journal'};
tDraw();

/* ============ SOMMEIL ============ */
let slQ=null,slW=null;
const QL=[[1,'Très difficile'],[2,'Difficile'],[3,'Moyenne'],[4,'Bonne'],[5,'Très bonne']];
function slChips(){$('#slQ').innerHTML=QL.map(([v,n])=>`<button type="button" data-v="${v}" aria-pressed="${slQ===v}">${n}</button>`).join('');
  $('#slW').innerHTML=['0','1','2','3+'].map((n,v)=>`<button type="button" data-v="${v}" aria-pressed="${slW===v}">${n}</button>`).join('')}
slChips();$('#slDate').value=dkey();
$('#slQ').onclick=e=>{const b=e.target.closest('button');if(b){slQ=+b.dataset.v;slChips()}};
$('#slW').onclick=e=>{const b=e.target.closest('button');if(b){slW=+b.dataset.v;slChips()}};
const durMin=(bed,wake)=>{if(!bed||!wake)return null;const [a,b]=bed.split(':').map(Number),[c,d]=wake.split(':').map(Number);let m=(c*60+d)-(a*60+b);if(m<=0)m+=1440;return m};
$('#slForm').onsubmit=e=>{e.preventDefault();if(!slQ){$('#slMsg').textContent='Choisis la qualité de la nuit.';return}
  const date=$('#slDate').value||dkey();ST.items=ST.items.filter(x=>!(x.kind==='sommeil'&&x.night===date));
  addItem({kind:'sommeil',night:date,bed:$('#slBed').value,wake:$('#slWake').value,q:slQ,w:slW==null?null:slW,note:$('#slNote').value.trim().slice(0,1000)});
  slQ=null;slW=null;slChips();$('#slNote').value='';$('#slMsg').textContent='Nuit enregistrée.'};
function renderSommeil(){$('#nightTiles').innerHTML=['med:scandodo','story:phare','story:cabane','story:jardinnuit','story:train','br:dodo','med:dodo','med:reveil','snd:pluie'].map(tileHTML).join('');
  const R=ST.prof.routine;const today=dkey();const ch=R.checks[today]||[];
  $('#routine').innerHTML=R.items.map((t,i)=>`<div class="sw"><label style="display:flex;gap:12px;align-items:center;flex:1"><input type="checkbox" data-rt="${i}" ${ch.includes(t)?'checked':''}><span>${esc(t)}</span></label><button class="del" data-rtdel="${i}" aria-label="Retirer ${esc(t)}">Retirer</button></div>`).join('')||'<p class="sub">Ajoute un premier geste.</p>';
  const N=ST.items.filter(x=>x.kind==='sommeil').slice(0,7);
  $('#nights').innerHTML=N.length?N.map(x=>{const m=durMin(x.bed,x.wake);return `<div class="entry"><div><small>${esc(fmtKey(x.night))}</small><p>${esc(QL[x.q-1]?QL[x.q-1][1]:'')}${m?` · ${Math.floor(m/60)} h ${pad(m%60)}`:''}${x.w!=null?` · ${x.w===3?'3 réveils ou plus':x.w+' réveil'+(x.w>1?'s':'')}`:''}</p>${x.note?`<p class="sub">${esc(x.note)}</p>`:''}</div><button class="del" data-del="${esc(x.id)}">Supprimer</button></div>`}).join(''):'<p class="sub">Aucune nuit notée pour le moment.</p>'}
$('#routine').onchange=e=>{const c=e.target.closest('[data-rt]');if(!c)return;const t=ST.prof.routine.items[+c.dataset.rt];const today=dkey();
  setP(p=>{let a=p.routine.checks[today]||[];a=c.checked?[...new Set([...a,t])]:a.filter(x=>x!==t);p.routine.checks[today]=a;
    const keys=Object.keys(p.routine.checks).sort();while(keys.length>21)delete p.routine.checks[keys.shift()]})};
$('#routine').onclick=e=>{const d=e.target.closest('[data-rtdel]');if(d)setP(p=>{p.routine.items.splice(+d.dataset.rtdel,1)})};
$('#rtForm').onsubmit=e=>{e.preventDefault();const v=$('#rtNew').value.trim();if(!v)return;setP(p=>{if(!p.routine.items.includes(v))p.routine.items.push(v)});$('#rtNew').value=''};
$('#vtGo').onclick=()=>{const v=$('#vtTxt').value.trim();if(!v){$('#vtMsg').textContent="Écris ce qui tourne, même en vrac.";return}
  addItem({kind:'videtete',note:v.slice(0,3000)});$('#vtTxt').value='';$('#vtMsg').textContent="C'est posé. Ça peut attendre demain."};

/* ============ PARCOURS ============ */
let progOpen=null;
function toggleStep(pid,i,force){const was=(ST.prof.prog.done[pid]||[]).includes(i);setP(p=>{const a=p.prog.done[pid]||[];const on=force===undefined?!was:force;p.prog.done[pid]=on?[...new Set([...a,i])]:a.filter(x=>x!==i)})}
function renderParcours(){const box=$('#progBox');const act=ST.prof.prog.id;
  if(!progOpen){box.innerHTML=`<div class="list">${PROGS.map(P=>{const d=(ST.prof.prog.done[P.id]||[]).length;return `<div class="item" aria-current="${P.id===act}"><button class="go" data-prog="${P.id}"><span class="cov" data-c="corps" aria-hidden="true" style="font:700 .9rem Figtree,sans-serif">${d}/${P.s.length}</span><span><h3>${esc(P.n)}</h3><p>${esc(P.d)}</p>${P.id===act?'<span class="meta" style="color:var(--lavd)">En cours</span>':''}</span></button></div>`}).join('')}</div>`;return}
  const P=PROGS.find(x=>x.id===progOpen);const done=ST.prof.prog.done[P.id]||[];
  box.innerHTML=`<button class="back mt" id="progBack">‹ Tous les parcours</button><div class="card"><h2>${esc(P.n)}</h2><p class="sub">${esc(P.d)}</p>
    <div class="row mt">${P.id===act?`<span class="tag">C'est ton parcours en cours</span><button class="ghost" id="progStop">Mettre en pause</button>`:`<button class="main" id="progPick">Choisir ce parcours</button>`}</div></div>
    <div class="card">${P.s.map((st,i)=>`<div class="stepl ${done.includes(i)?'done':''}"><input type="checkbox" data-step="${i}" ${done.includes(i)?'checked':''} aria-label="Étape ${i+1} faite"><div><h3>${i+1}. ${esc(st[0])}</h3><p>${esc(G(st[1]))}</p>${st[2]?`<button class="ghost mt" data-ex="${esc(st[2])}">${esc(EX[st[2]]||'Ouvrir')}</button>`:''}</div></div>`).join('')}</div>
    <p class="note">Tu peux faire les étapes dans l'ordre que tu veux, et revenir en arrière quand tu veux.</p>`;
  $('#progBack').onclick=()=>{progOpen=null;renderParcours()};
  const pk2=$('#progPick');if(pk2)pk2.onclick=()=>{setP(p=>p.prog.id=P.id);toast('Parcours choisi. Il apparaît sur l’accueil.')};
  const ps=$('#progStop');if(ps)ps.onclick=()=>setP(p=>p.prog.id=null);
  box.querySelectorAll('[data-step]').forEach(c=>c.onchange=()=>toggleStep(P.id,+c.dataset.step,c.checked))}
$('#progBox').addEventListener('click',e=>{const b=e.target.closest('[data-prog]');if(b){progOpen=b.dataset.prog;renderParcours();window.scrollTo(0,0)}});

/* ============ COMPRENDRE ============ */
let ficheOpen=null;
function openFiche(k){ficheOpen=k;location.hash='comprendre';renderComprendre();window.scrollTo(0,0)}
function renderComprendre(){const box=$('#comBox');const f=ficheOpen&&FICHES.find(x=>x.k===ficheOpen);$('#comBack').textContent=f?'‹ Toutes les fiches':'‹ Moi';
  if(!f){box.innerHTML=`<h1>Comprendre</h1><p class="sub">Des fiches simples pour mieux comprendre ce que tu vis. Elles ne remplacent pas l'avis d'un professionnel.</p>
    <div class="list">${FICHES.map(x=>`<div class="item"><button class="go" data-ex="fiche:${x.k}">${covHTML('histoire')}<span><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></span></button></div>`).join('')}</div>`;return}
  box.innerHTML=`<article class="fiche"><span class="tag">Comprendre</span><h1 class="mt">${esc(f.t)}</h1><p class="sub">${esc(f.d)}</p>
    ${f.b.map(x=>Array.isArray(x)?`<div class="blk"><b>${esc(x[0])}</b><p>${esc(G(x[1]))}</p></div>`:`<p>${esc(G(x))}</p>`).join('')}</article>
    <div class="card"><h3>Pour aller plus loin</h3><div class="row mt"><button class="ghost" data-ex="chat:comprend">En parler avec ELYRA</button><button class="ghost" id="ficheNext">Fiche suivante</button></div></div>`;
  $('#ficheNext').onclick=()=>{const i=FICHES.indexOf(f);openFiche(FICHES[(i+1)%FICHES.length].k)}}
$('#comBack').onclick=()=>{if(ficheOpen){ficheOpen=null;renderComprendre()}else location.hash='moi'};

/* ============ PROGRÈS & ANTICIPATION ============ */
function observations(){const out=[];const J=ST.items.filter(x=>x.stress!=null&&(x.kind==='journal'||x.kind==='humeur'));
  const all=avg(J.map(x=>+x.stress));const by={};J.filter(x=>x.sits&&x.sits.length).forEach(x=>x.sits.forEach(s=>{(by[s]=by[s]||[]).push(+x.stress)}));
  const top=Object.entries(by).filter(([,a])=>a.length>=3).map(([s,a])=>[s,avg(a),a.length]).sort((a,b)=>b[1]-a[1])[0];
  if(top&&all!=null&&top[1]>=all+1)out.push([`Quand tu notes « ${top[0]} », ton stress déclaré est en moyenne de ${top[1].toFixed(1)}/10, contre ${all.toFixed(1)}/10 en général. Peut-être une situation à préparer un peu plus ?`,`Basé sur ${top[2]} notes avec cette situation.`]);
  const P=ST.items.filter(x=>x.kind==='pratique'&&x.ex&&EX[x.ex]);const cnt={};P.forEach(x=>cnt[x.ex]=(cnt[x.ex]||0)+1);
  const fav=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  if(fav&&fav[1]>=3)out.push([`Ce que tu pratiques le plus : ${EX[fav[0]]} (${fav[1]} fois).${ST.prof.kit.tech.includes(fav[0])?'':' Tu peux l’ajouter à ton kit de secours.'}`,`Basé sur ${P.length} exercices.`]);
  const S=ST.items.filter(x=>x.kind==='sommeil');const good=[],bad=[];
  S.forEach(n=>{const ms=ST.items.filter(x=>x.mood&&dkey(x.t)===n.night).map(x=>+x.mood);if(!ms.length)return;const m=avg(ms);if(n.q>=4)good.push(m);else if(n.q<=2)bad.push(m)});
  if(good.length>=3&&bad.length>=3){const g=avg(good),b=avg(bad);if(Math.abs(g-b)>=.5)out.push([`Après les nuits que tu notes comme bonnes, ton humeur moyenne est de ${g.toFixed(1)}/5, contre ${b.toFixed(1)}/5 après les nuits difficiles.`,`Basé sur ${good.length+bad.length} nuits.`])}
  const T=ST.items.filter(x=>x.kind==='pensee');if(T.length>=3){const d=avg(T.map(x=>x.i1-x.i2));if(d>=1)out.push([`Quand tu prends le temps de démêler une pensée, l'intensité de ton émotion baisse en moyenne de ${d.toFixed(1)} point(s).`,`Basé sur ${T.length} pensées démêlées.`])}
  const sos=ST.items.filter(x=>x.kind==='sos'&&Date.now()-x.t<30*DAY);if(sos.length>=3)out.push([`Tu as utilisé le SOS ${sos.length} fois ce mois-ci. C'est bien de t'en servir. Si ces moments reviennent souvent, en parler à ton médecin peut vraiment aider.`,'Basé sur ton utilisation du SOS.']);
  return out}
function period(from,to){const I=ST.items.filter(x=>x.t>=from&&x.t<to);return{ex:I.filter(x=>x.kind==='pratique'&&x.min>0).length,min:I.filter(x=>x.kind==='pratique').reduce((a,x)=>a+(+x.min||0),0),
  st:avg(I.filter(x=>x.stress!=null&&x.kind!=='sos').map(x=>+x.stress)),wins:I.filter(x=>x.kind==='victoire').length,days:new Set(I.map(x=>dkey(x.t))).size}}
function summary(c,p,label){if(!c.days)return `<p class="sub">Rien de noté ${label}. Ce n'est pas grave : ELYRA est là quand tu en as besoin.</p>`;const o=[];
  o.push(`Tu as pris soin de toi ${c.days} jour(s) ${label}${c.ex?`, avec ${c.ex} exercice(s) et ${c.min} min de calme`:''}.`);
  if(c.st!=null&&p.st!=null){const d=c.st-p.st;o.push(Math.abs(d)<.5?`Ton stress déclaré est stable (${c.st.toFixed(1)}/10).`:d<0?`Ton stress déclaré a baissé : ${c.st.toFixed(1)}/10 contre ${p.st.toFixed(1)} avant.`:G(`Ton stress déclaré est un peu plus haut (${c.st.toFixed(1)}/10). Une période plus chargée, peut-être : sois {doux|douce} avec toi.`))}
  else if(c.st!=null)o.push(`Stress déclaré moyen : ${c.st.toFixed(1)}/10.`);
  if(c.wins)o.push(`${c.wins} petite(s) victoire(s) notée(s). Bravo.`);return o.map(x=>`<p>${esc(x)}</p>`).join('')}
function renderProgres(){const now=Date.now();const I30=ST.items.filter(x=>now-x.t<30*DAY);
  $('#p30ex').textContent=I30.filter(x=>x.kind==='pratique'&&x.min>0).length;$('#p30min').textContent=I30.filter(x=>x.kind==='pratique').reduce((a,x)=>a+(+x.min||0),0);
  $('#p30days').textContent=new Set(I30.map(x=>dkey(x.t))).size;bars($('#chMood'),30,'mood');bars($('#chStress'),30,'stress');
  const t0=dstart(now)+DAY;$('#week').innerHTML=summary(period(t0-7*DAY,t0),period(t0-14*DAY,t0-7*DAY),'ces 7 derniers jours');
  $('#month').innerHTML=summary(period(t0-30*DAY,t0),period(t0-60*DAY,t0-30*DAY),'ces 30 derniers jours');
  if(ST.prof.anticip){const o=observations();$('#obs').innerHTML=o.length?o.map(([t,b])=>`<div class="obs">${esc(t)}<small>${esc(b)}</small></div>`).join(''):`<p class="obs">Pas encore assez de notes pour remarquer quelque chose. Ça viendra tout seul, sans pression.</p>`}
  else $('#obs').innerHTML='<p class="sub">Les observations sont désactivées (Mon espace).</p>';
  $('#ups').innerHTML=ST.prof.up.slice().sort((a,b)=>a.date<b.date?-1:1).map(u=>`<div class="entry"><div><small>${esc(fmtKey(u.date))}</small><p>${esc(u.txt)}</p><button class="ghost mt" data-prep="${esc(u.id)}">Préparer avec ELYRA</button></div><button class="del" data-updel="${esc(u.id)}">Retirer</button></div>`).join('');
  $('#goals').innerHTML=ST.prof.goals.length?ST.prof.goals.map(g=>`<div class="sw"><label style="display:flex;gap:12px;align-items:center;flex:1"><input type="checkbox" data-goal="${esc(g.id)}" ${g.done?'checked':''}><span style="${g.done?'text-decoration:line-through;color:var(--soft)':''}">${esc(g.txt)}</span></label><button class="del" data-goaldel="${esc(g.id)}">Retirer</button></div>`).join(''):'<p class="sub">Aucun objectif pour le moment. Un tout petit suffit.</p>';
  $('#wins').innerHTML=ST.items.filter(x=>x.kind==='victoire').slice(0,12).map(w=>`<div class="entry"><div><small>${esc(fmtD(w.t))}</small><p>${esc(w.note)}</p></div><button class="del" data-del="${esc(w.id)}">Supprimer</button></div>`).join('')}
$('#upDate').value=dkey(Date.now()+DAY);
$('#upForm').onsubmit=e=>{e.preventDefault();const d=$('#upDate').value,t=$('#upTxt').value.trim();if(!d||!t){toast('Indique une date et une situation.');return}
  setP(p=>{p.up.push({id:'u'+uid(),date:d,txt:t.slice(0,140)});p.up=p.up.filter(u=>u.date>=dkey(Date.now()-7*DAY))});$('#upTxt').value='';toast('Ajouté. Tu le verras sur l’accueil.')};
$('#goalForm').onsubmit=e=>{e.preventDefault();const t=$('#goalTxt').value.trim();if(!t)return;setP(p=>p.goals.push({id:'g'+uid(),txt:t.slice(0,120),done:false}));$('#goalTxt').value=''};
$('#winForm').onsubmit=e=>{e.preventDefault();const t=$('#winTxt').value.trim();if(!t)return;addItem({kind:'victoire',note:t.slice(0,160)});$('#winTxt').value='';toast('Bravo, elle compte !');haptic(25)};
$('#v-progres').addEventListener('change',e=>{const g=e.target.closest('[data-goal]');if(g)setP(p=>{const x=p.goals.find(y=>y.id===g.dataset.goal);if(x)x.done=g.checked})});
$('#v-progres').addEventListener('click',e=>{const g=e.target.closest('[data-goaldel]');if(g)setP(p=>p.goals=p.goals.filter(y=>y.id!==g.dataset.goaldel));
  const u=e.target.closest('[data-updel]');if(u)setP(p=>p.up=p.up.filter(y=>y.id!==u.dataset.updel))});

/* ============ KIT ============ */
function renderKit(){const k=ST.prof.kit;
  $('#kPhr').innerHTML=k.phr.length?k.phr.map((p,i)=>`<div class="entry"><div><p class="quote" style="font-size:1.05rem">${esc(p)}</p></div><button class="del" data-phrdel="${i}">Retirer</button></div>`).join(''):'<p class="sub">Aucune phrase pour le moment.</p>';
  $('#kSug').innerHTML=C.kitsug.filter(s=>!k.phr.includes(s)).map(s=>`<button type="button" data-phradd="${esc(s)}">+ ${esc(s)}</button>`).join('');
  const T=Object.keys(EX).filter(x=>/^(br|sos|snd):/.test(x)||(/^med:/.test(x)&&['sos','stress','corps'].includes(catOf(x))));
  $('#kTech').innerHTML=T.map(x=>`<button type="button" data-tech="${esc(x)}" aria-pressed="${k.tech.includes(x)}">${esc(EX[x])}</button>`).join('');
  $('#kCon').innerHTML=k.con.length?k.con.map((c,i)=>`<div class="entry"><div><p><b>${esc(c.n)}</b></p><a href="tel:${esc(c.p.replace(/[^\d+]/g,''))}">${esc(c.p)}</a></div><button class="del" data-condel="${i}">Retirer</button></div>`).join(''):'<p class="sub">Ajoute une ou deux personnes que tu peux appeler dans un moment difficile.</p>';
  if(document.activeElement!==$('#kNotes'))$('#kNotes').value=k.notes||''}
$('#v-kit').addEventListener('click',e=>{const t=e.target;
  const a=t.closest('[data-phradd]');if(a)setP(p=>p.kit.phr.push(a.dataset.phradd));
  const d=t.closest('[data-phrdel]');if(d)setP(p=>p.kit.phr.splice(+d.dataset.phrdel,1));
  const x=t.closest('[data-tech]');if(x)setP(p=>{p.kit.tech=toggleIn(p.kit.tech,x.dataset.tech)});
  const c=t.closest('[data-condel]');if(c)setP(p=>p.kit.con.splice(+c.dataset.condel,1))});
$('#kPhrF').onsubmit=e=>{e.preventDefault();const v=$('#kPhrI').value.trim();if(!v)return;setP(p=>p.kit.phr.push(v.slice(0,140)));$('#kPhrI').value=''};
$('#kConF').onsubmit=e=>{e.preventDefault();const n=$('#kConN').value.trim(),ph=$('#kConP').value.trim();if(!n||!/\d{3,}/.test(ph.replace(/\s/g,''))){toast('Indique un prénom et un numéro.');return}
  setP(p=>p.kit.con.push({n:n.slice(0,40),p:ph.slice(0,30)}));$('#kConN').value='';$('#kConP').value=''};
let kT;$('#kNotes').oninput=e=>{clearTimeout(kT);kT=setTimeout(()=>{ST.prof.kit.notes=e.target.value.slice(0,3000);save();$('#kNotesMsg').textContent='Enregistré.'},500)};

/* ============ ESPACE PERSO ============ */
const SIZES=[['m','Normal'],['l','Grand'],['xl','Très grand']],THEMES=[['auto','Auto'],['light','Clair'],['dark','Sombre']],GENRES=[['f','Au féminin'],['m','Au masculin']];
const VMODES=[['elyra','Voix ELYRA'],['tel','Voix du téléphone'],['off','Sans voix']],RATES=[['1','Normal'],['0.9','Plus lent']];
const viewerTheme=document.documentElement.getAttribute('data-theme');
function applyPrefs(){const r=document.documentElement;r.dataset.size=ST.prof.size||'m';if(ST.prof.theme==='auto'){if(viewerTheme)r.dataset.theme=viewerTheme;else r.removeAttribute('data-theme')}else r.dataset.theme=ST.prof.theme}
function renderVoiceSel(){const s=$('#pVoiceSel');if(!s)return;$('#pVoiceSelBox').hidden=!!CapTTS()||!voices.length||ST.prof.vmode!=='tel';
  s.innerHTML=`<option value="">Voix par défaut</option>`+voices.map(v=>`<option value="${esc(v.name)}" ${v.name===ST.prof.vname?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}
const chipRow=(sel,list,cur,attr)=>{$(sel).innerHTML=list.map(([k,n])=>`<button data-${attr}="${k}" aria-pressed="${String(cur)===k}">${n}</button>`).join('')};
function renderEspace(){const P=ST.prof;if(document.activeElement!==$('#pName'))$('#pName').value=P.name||'';$('#pAnt').checked=!!P.anticip;$('#brVoice').checked=!!P.brVoice;
  chipRow('#pGenre',GENRES,P.genre,'genre');chipRow('#onbGenre',GENRES,P.genre,'genre');chipRow('#pVoiceMode',VMODES,P.vmode,'vmode');chipRow('#pRate',RATES,String(+P.rate||1),'rate');
  chipRow('#pSize',SIZES,P.size,'size');chipRow('#pTheme',THEMES,P.theme,'theme');
  $('#pVoiceInfo').textContent=P.vmode==='elyra'?(VO.idx?`La voix ELYRA est une voix française naturelle, intégrée à l'appli (${Object.keys(VO.idx).length} phrases enregistrées). Elle fonctionne hors ligne.`:"La voix ELYRA n'est pas encore disponible sur ce téléphone. En attendant, c'est la voix du téléphone qui lit les séances."):P.vmode==='tel'?"Astuce iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Français, puis télécharge une voix « améliorée » ou « premium ».":'Les séances s’affichent sans être lues.';
  $('#pOffline').hidden=isNative||!VO.idx||!('caches' in window);
  renderVoiceSel();$('#lastBackup').textContent=P.lastBackup?`Dernière sauvegarde : ${fmtD(P.lastBackup)}.`:"Pas encore de sauvegarde.";
  $('#persistInfo').textContent=storageOK?'':"Attention : ce navigateur n'autorise pas l'enregistrement. Installe l'appli sur l'écran d'accueil.";
  $('#verInfo').textContent=`ELYRA · version personnelle ${APP_VERSION}. ELYRA ne pose pas de diagnostic et ne remplace pas un professionnel de santé.`}
document.addEventListener('click',e=>{const g=e.target.closest('[data-genre]');if(g)setP(p=>p.genre=g.dataset.genre);
  const v=e.target.closest('[data-vmode]');if(v)setP(p=>p.vmode=v.dataset.vmode);const r=e.target.closest('[data-rate]');if(r)setP(p=>p.rate=+r.dataset.rate);
  const s=e.target.closest('[data-size]');if(s){setP(p=>p.size=s.dataset.size);applyPrefs()}const t=e.target.closest('[data-theme]');if(t){setP(p=>p.theme=t.dataset.theme);applyPrefs()}});
let nT;$('#pName').oninput=e=>{clearTimeout(nT);nT=setTimeout(()=>setP(p=>p.name=e.target.value.trim().slice(0,40)),400)};
$('#pAnt').onchange=e=>setP(p=>p.anticip=e.target.checked);$('#pVoiceSel').onchange=e=>setP(p=>p.vname=e.target.value);
const TEST="Bonjour. Je suis la voix de tes séances. Prends ton temps, tu n'as rien à réussir.";
$('#pVoiceTest').onclick=()=>{SND.ctx();sessVoice=true;speak(TEST,true)};
$('#pOffline').onclick=async()=>{const files=[...new Set(Object.values(VO.idx||{}).map(x=>'voix/'+x[0]))];let done=0,fail=0;const msg=$('#pOfflineMsg');
  const run=async()=>{while(files.length){const f=files.pop();try{const r=await fetch(f);if(!r.ok)fail++}catch(e){fail++}done++;if(done%10===0)msg.textContent=`Téléchargement : ${done} audios…`}};
  msg.textContent='Téléchargement en cours…';await Promise.all([run(),run(),run(),run()]);msg.textContent=fail?`Terminé, mais ${fail} audio(s) n'ont pas pu être gardés. Réessaie avec une meilleure connexion.`:`C'est fait : les ${done} audios sont gardés sur ce téléphone.`};
const backupText=()=>JSON.stringify({app:'ELYRA',version:APP_VERSION,date:new Date().toISOString(),prof:ST.prof,items:ST.items});
$('#expCopy').onclick=async()=>{const t=backupText();try{await navigator.clipboard.writeText(t);setP(p=>p.lastBackup=Date.now());toast('Sauvegarde copiée. Colle-la dans une note ou un e-mail à toi-même.')}
  catch(e){const b=$('#expBox');b.hidden=false;b.value=t;b.select();toast('Sélectionne le texte et copie-le.')}};
$('#expFile').onclick=()=>{try{const blob=new Blob([backupText()],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`elyra-sauvegarde-${dkey()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);setP(p=>p.lastBackup=Date.now())}
  catch(e){toast("Le téléchargement n'est pas possible ici : utilise « Copier ».")}};
function restore(txt){try{const o=JSON.parse(txt);if(!o||o.app!=='ELYRA'||!Array.isArray(o.items))throw 0;
  ask('Restaurer cette sauvegarde ?',`Elle contient ${o.items.length} note(s) et remplacera les données actuelles de ce téléphone.`,'Restaurer',()=>{ST.items=o.items.filter(x=>x&&x.t&&x.kind);ST.prof=merge(defP(),o.prof||{});ST.prof.onb=true;saveNow();applyPrefs();renderAll();$('#impMsg').textContent='Sauvegarde restaurée.';$('#impBox').value=''})}
  catch(e){$('#impMsg').textContent="Ce texte n'est pas une sauvegarde ELYRA valide."}}
$('#impGo').onclick=()=>restore($('#impBox').value.trim());
$('#impFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>restore(String(r.result));r.readAsText(f);e.target.value=''};
$('#wipe').onclick=()=>ask('Effacer toutes tes données ?',"Tes notes, ton kit, tes réglages : tout sera effacé de ce téléphone. C'est définitif. Pense à faire une sauvegarde avant si tu veux les garder.",'Tout effacer',()=>{
  try{localStorage.removeItem(KEY)}catch(e){}SND.stopAll();ST.items=[];ST.prof=defP();applyPrefs();renderAll();location.hash='accueil';$('#onb').classList.add('on')});

/* ============ BIENVENUE ============ */
$('#onbGo').onclick=()=>{setP(p=>{p.name=$('#onbName').value.trim().slice(0,40);if(!p.genre)p.genre='m';p.onb=true});$('#onb').classList.remove('on');SND.ctx()};

/* ============ RENDU GLOBAL ============ */
function renderAll(){for(const f of [renderHome,renderElyra,renderMeds,renderStories,renderSounds,renderFavs,renderJournal,renderSommeil,renderParcours,renderComprendre,renderProgres,renderKit,renderEspace]){try{f()}catch(e){console.error(e)}}}

/* ============ DÉMARRAGE ============ */
load();applyPrefs();renderAll();route();
if(!ST.prof.onb)$('#onb').classList.add('on');
loadVoiceIdx();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if('serviceWorker' in navigator&&location.protocol==='https:'&&!isNative){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cur()==='accueil')renderHome()});
}
