/* ELYRA — logique de l'appli. Contenus : content.js · Sons : sons.js */
{
/* ============ CONFIGURATION ============ */
const CHAT_URL="https://claude.ai/artifact/DQzS1B9ompRWMjSAXfYHuy";
const APP_VERSION="2.6.1";
const C=window.ELYRA_CONTENT, SND=window.ElyraSons, O=window.ELYRA_OUTILS;

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
/* petites étincelles pour les petites victoires */
const calmMotion=()=>ST.prof.anim==='off'||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function sparkle(x,y,n){if(calmMotion())return;if(x&&x.getBoundingClientRect){const r=x.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2}
  const cols=['#b8a8d9','#9db59a','#e5cf9f','#f0c3ae','#cdc1f1'];n=n||14;
  for(let i=0;i<n;i++){const e=document.createElement('i');e.className='spark';const a=Math.PI*2*i/n+Math.random()*.5,d=40+Math.random()*60;
    e.style.cssText=`left:${x}px;top:${y}px;background:${cols[i%cols.length]};--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${Math.random()*.12}s`;
    document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}}
let lastTap=null;document.addEventListener('pointerdown',e=>{lastTap=[e.clientX,e.clientY]},true);
const haptic=ms=>{try{navigator.vibrate&&navigator.vibrate(ms||12)}catch(e){}};
/* accords au féminin / masculin : « prêt{e} », « {doux|douce} » */
const G=t=>{const f=ST.prof.genre==='f';return String(t).replace(/\{([^|}]*)\|([^}]*)\}/g,(m,a,b)=>f?b:a).replace(/\{e\}/g,f?'e':'')};

/* ============ CONTENUS ============ */
const MOODS=C.moods, PRESETS=C.presets, MEDS=C.meds, STORIES=C.stories, SOSF=C.sosf, PROGS=C.progs, FICHES=C.fiches;
const EX={};
for(const k in PRESETS)EX['br:'+k]=PRESETS[k].n;MEDS.forEach(m=>EX['med:'+m.k]=m.t);STORIES.forEach(s=>EX['story:'+s.k]=s.t);
for(const k in SOSF)EX['sos:'+k]=SOSF[k].n;C.sounds.forEach(s=>EX['snd:'+s[0]]=s[1]);FICHES.forEach(f=>EX['fiche:'+f.k]='Lire : '+f.t);
window.ELYRA_TAG.mods.forEach((m,i)=>EX['tag:'+m.id]=`Module ${i+1} : ${m.n}`);
for(const k in O.tools)EX['outil:'+k]=O.tools[k].n;
PROGS.forEach(P=>EX['prog:'+P.id]=P.n);Object.assign(EX,{'tcc:dialogue':'Examiner une pensée avec ELYRA',pensee:'Démêler une pensée',sosopen:'Ouvrir le SOS',tcc:"Apprivoiser l'anxiété"});
Object.assign(EX,{libre:'Méditation libre','calme:respirer':'Respiration guidée','calme:mediter':'Méditations guidées',expo:"Coach d'exposition",outils:'Ma boîte à outils',corps:'Mon corps',consult:'Préparer une consultation',nuit:'Réveil la nuit',programme:'Ouvrir le programme TAG',journal:'Ouvrir mon journal',kit:'Ouvrir mon kit',progres:'Ouvrir mes progrès',sommeil:'Ouvrir Sommeil',videtete:'Ouvrir le vide-tête',pensee:'Démêler une pensée',
  'chat:comprend':'En parler avec ELYRA','chat:accompagne':'En parler avec ELYRA','chat:encourage':'En parler avec ELYRA','chat:ecoute':'En parler avec ELYRA'});
const findSess=k=>MEDS.find(m=>m.k===k)||STORIES.find(s=>s.k===k);
const isStory=k=>STORIES.some(s=>s.k===k);
function catOf(ex){const [k,v]=ex.split(':');if(k==='outil'&&O.tools[v])return O.tools[v].c;if(k==='br')return'breath';if(k==='snd'){const x=C.sounds.find(y=>y[0]===v);return x&&x[3]==='m'?'musique':'son'}if(k==='story')return'histoire';if(k==='sos')return'sos';if(k==='med'){const m=MEDS.find(x=>x.k===v);return m?m.c:'stress'}return'quotidien'}
const ART=window.ElyraArt;
const PHOTOS=window.ELYRA_PHOTOS||{keys:[],credits:[]},PHK=new Set(PHOTOS.keys);
const usePhoto=key=>key&&PHK.has(key)&&ST.prof.img!=='dessins';
const covHTML=(cat,cls='',key)=>usePhoto(key)?`<span class="cov ${cls} art photo" data-c="${esc(cat)}" aria-hidden="true"><img src="photos/${esc(key)}.webp" alt="" loading="lazy" decoding="async"></span>`:key&&ART?`<span class="cov ${cls} art" data-c="${esc(cat)}" aria-hidden="true">${ART.scene(cat,key)}</span>`:`<span class="cov ${cls}" data-c="${esc(cat)}" aria-hidden="true"><svg><use href="#g-${esc(cat)}"/></svg></span>`;

/* ============ DONNÉES (sur le téléphone) ============ */
const KEY='elyra.v1';
const defP=()=>({name:'',genre:'',vmode:'elyra',rate:1,vname:'',brVoice:false,size:'m',theme:'auto',anticip:true,kit:{phr:[],con:[],notes:'',tech:[]},favs:[],goals:[],prog:{id:null,done:{}},
  routine:{items:C.routine.slice(),checks:{}},up:[],resume:null,onb:false,lastBackup:null,medCat:'tout',medSit:null,long:false,libre:{min:10,every:0},sndVol:{},tag:{cur:null,m:{}},vvoice:'siwis',soucis:[],expo:{but:'',steps:[]},lock:{on:false,h:'',s:''},rem:{},ctxShare:false,consult:''});
const ST={prof:defP(),items:[]};
let storageOK=true;
function merge(base,o){const r=Object.assign(base,o);r.kit=Object.assign(defP().kit,o.kit||{});r.prog=Object.assign({id:null,done:{}},o.prog||{});
  r.routine=Object.assign({items:C.routine.slice(),checks:{}},o.routine||{});for(const k of ['favs','goals','up'])if(!Array.isArray(r[k]))r[k]=[];
  if(!r.sndVol||typeof r.sndVol!=='object')r.sndVol={};if(!r.tag||typeof r.tag!=='object'||!r.tag.m)r.tag={cur:null,m:{}};if(!Array.isArray(r.soucis))r.soucis=[];
  if(!r.expo||!Array.isArray(r.expo.steps))r.expo={but:'',steps:[]};if(!r.lock||typeof r.lock!=='object')r.lock={on:false,h:'',s:''};if(!r.rem||typeof r.rem!=='object')r.rem={};return r}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return;const o=JSON.parse(raw);ST.items=Array.isArray(o.items)?o.items.filter(x=>x&&x.t&&x.kind):[];ST.prof=merge(defP(),o.prof||{})}catch(e){storageOK=false}}
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,250)}
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify({v:1,prof:ST.prof,items:ST.items.slice(0,6000)}));storageOK=true}catch(e){storageOK=false;toast("Impossible d'enregistrer sur ce téléphone.")}}
function addItem(e){e.id='e'+uid();e.t=e.t||Date.now();ST.items.unshift(e);ST.items.sort((a,b)=>b.t-a.t);save();renderAll();return e}
const isPrat=x=>x.kind==='pratique'||x.kind==='outil'||x.kind==='expo';
function delItem(id){ST.items=ST.items.filter(x=>x.id!==id);save();renderAll()}
const setP=fn=>{fn(ST.prof);save();renderAll()};

/* ============ VOIX ============ */
const VO={idx:null,el:null,tts:null};
const CapTTS=()=>{try{return window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.TextToSpeech||null}catch(e){return null}};
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
/* raccourcis Android (appui long sur l'icône) : elyra://sos, elyra://respirer */
try{const AP=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;if(AP){const go=u=>{const m=/elyra:\/\/(\w+)/.exec(u||'');if(m)setTimeout(()=>shortcut(m[1]),300)};
  AP.addListener('appUrlOpen',e=>go(e&&e.url));AP.getLaunchUrl&&AP.getLaunchUrl().then(r=>go(r&&r.url)).catch(()=>{})}}catch(e){}
let voices=[];
function loadVoices(){try{if(window.speechSynthesis){voices=speechSynthesis.getVoices().filter(v=>/^fr/i.test(v.lang));renderVoiceSel()}}catch(e){}}
try{if(window.speechSynthesis){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}}catch(e){}
const VV=()=>ST.prof.vvoice==='tom'?'tom':'siwis';
/* voix du téléphone (Android) : liste des voix françaises installées */
let NV=[];const capOpts=(text,rate)=>{const o={text,lang:'fr-FR',rate,pitch:1,volume:1,category:'playback'};const v=NV.find(x=>x.name===ST.prof.vname);if(v)o.voice=v.i;return o};
function loadNativeVoices(){const cap=CapTTS();if(!cap||!cap.getSupportedVoices)return;cap.getSupportedVoices().then(r=>{NV=(r&&r.voices||[]).map((v,i)=>Object.assign({},v,{i})).filter(v=>/^fr/i.test(v.lang||''));try{renderVoiceSel()}catch(e){}}).catch(()=>{})}
async function loadVoiceIdx(){const v=VV();VO.idx=null;VO.v=v;VO.human=false;for(const d of (v==='tom'?['remy','tom']:['vivienne','siwis'])){try{const r=await fetch(`voix/${d}/index.json`,{cache:'no-cache'});if(r.ok){const j=await r.json();if(j&&j.items&&j.complete!==false&&VV()===v){VO.idx=j.items;VO.v=d;VO.eng=j.engine||'piper';VO.human=d==='remy'||d==='vivienne';break}}}catch(e){}}try{renderEspace();renderMeds();renderStories();renderHome()}catch(e){}}
const clip=t=>VO.idx&&VO.idx[t];
const est=t=>String(t).split(/\s+/).length/2.3+1;
let sessVoice=true;
function audioEl(){if(!VO.el){const el=new Audio();el.preload='auto';el.addEventListener('play',()=>SND.duck(true));el.addEventListener('ended',()=>SND.duck(false));el.addEventListener('pause',()=>SND.duck(false));VO.el=el}return VO.el}
/* Texte pour la voix : « 8h » → « 8 heures », « 8h30 » → « 8 heures 30 », abréviations, émojis. */
function oral(t){return String(t)
  .replace(/\b(\d{1,2})\s?[hH]\s?(\d{2})\b/g,(x,a,b)=>a+(a==='1'?' heure ':' heures ')+(b==='00'?'':b))
  .replace(/\b(\d{1,2})\s?[hH]\b/g,(x,a)=>a+(a==='1'||a==='0'?' heure':' heures'))
  .replace(/\b(\d+)\s?min\b\.?/g,'$1 minutes').replace(/\b(\d+)\s?(?:sec|s)\b/g,'$1 secondes').replace(/\b(\d+)\s?km\b/g,'$1 kilomètres').replace(/\b(\d+)\s?kg\b/g,'$1 kilos')
  .replace(/(\d)\s?%/g,'$1 pour cent').replace(/(\d)\s?€/g,'$1 euros').replace(/\b1er\b/g,'premier').replace(/\b1re\b/g,'première').replace(/\b(\d+)e\b/g,'$1ième')
  .replace(/\bDr\.?\s/g,'docteur ').replace(/\bDre\.?\s/g,'docteure ').replace(/\betc\.?/g,'et cetera').replace(/\bn°\s?/g,'numéro ').replace(/\brdv\b/gi,'rendez-vous').replace(/\s&\s/g,' et ')
  .replace(/[*_#>`~]/g,'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,'').replace(/\s{2,}/g,' ').trim()}
function ttsSpeak(t,rate){t=oral(t);const cap=CapTTS();
  if(cap){try{cap.stop().catch(()=>{});cap.speak(capOpts(t,.9*rate)).catch(()=>{})}catch(e){}return}
  try{const ss=window.speechSynthesis;if(!ss)return;ss.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=.86*rate;u.pitch=.98;
    const v=voices.find(v=>v.name===ST.prof.vname)||voices.find(v=>/(premium|enhanced|améliorée|neural|natural)/i.test(v.name))||voices.find(v=>/fr[-_](BE|FR)/i.test(v.lang))||voices[0];if(v)u.voice=v;ss.speak(u)}catch(e){}}
function speak(t,force){stopVoice();const P=ST.prof;if(!force&&(P.vmode==='off'||!sessVoice))return 0;const rate=+P.rate||1;
  const c=P.vmode!=='tel'?clip(t):null;
  if(c){const el=audioEl();el.src=`voix/${VO.v||VV()}/`+c[0];el.playbackRate=rate;try{el.preservesPitch=true}catch(e){}el.play().catch(()=>{});return c[1]/rate}
  ttsSpeak(t,rate);return est(t)/rate}
function stopVoice(){if(VO.el){try{VO.el.pause()}catch(e){}}const cap=CapTTS();if(cap){try{cap.stop().catch(()=>{})}catch(e){}}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}SND.duck(false)}

/* ============ NAVIGATION ============ */
const VIEWS=['tcc','accueil','elyra','calme','journal','pensee','moi','programme','parcours','sommeil','progres','kit','espace','comprendre','outils','outil','expo','corps','consult'];
const TABOF={tcc:'moi',outils:'moi',outil:'moi',expo:'moi',corps:'moi',consult:'moi',programme:'moi',parcours:'moi',sommeil:'moi',progres:'moi',kit:'moi',espace:'moi',comprendre:'moi',pensee:'journal'};
const TABS=[['accueil','Accueil','<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>'],['elyra','ELYRA','<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'],
 ['calme','Calme','<circle cx="12" cy="12" r="8"/><path d="M8 13c1.5-2 2.5-2 4 0s2.5 2 4 0"/>'],['journal','Journal','<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/>'],['moi','Moi','<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>']];
$('#nav').innerHTML=TABS.map(([k,n,p])=>`<a href="#${k}" data-k="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>${n}</a>`).join('');
const cur=()=>{const v=(location.hash||'#accueil').slice(1);return VIEWS.includes(v)?v:'accueil'};
function shortcut(k){if(k==='sos'){location.replace('#accueil');setTimeout(openSOS,60);return true}if(k==='respirer'){location.replace('#calme');setTimeout(()=>calTab('respirer'),60);return true}return false}
function route(){if(shortcut((location.hash||'').slice(1)))return;const v=cur();$('#rate').classList.remove('on');$$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));enter($('#v-'+v));const tab=TABOF[v]||v;
  $$('#nav a').forEach(a=>{const on=a.dataset.k===tab;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(v!=='calme'&&brMain&&brMain.on)brMain.stop(false);
  if(v==='outil'&&!TR.k){location.replace('#outils');return}if(v!=='outil')toolStop();if(v!=='expo')xpStop();
  if(v==='accueil')renderHome();if(v==='outils')renderOutils();if(v==='espace')renderCvMem();if(v==='consult')renderConsult();window.scrollTo(0,0)}
addEventListener('hashchange',route);
document.addEventListener('click',e=>{const b=e.target.closest('[data-back]');if(b){location.hash=b.dataset.back;return}
  const x=e.target.closest('[data-ex]');if(x){e.preventDefault();doEx(x.dataset.ex)}
  const f=e.target.closest('[data-fav]');if(f){toggleFav(f.dataset.fav)}});

/* ============ CONVERSATION (lien) ============ */
const chatHref=(mode,msg)=>CHAT_URL.replace(/#.*$/,'')+'#'+mode+(ST.prof.ctxShare?'&c='+encodeURIComponent(ctxText()):'')+(msg?'&m='+encodeURIComponent(String(msg).slice(0,600)):'');
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
  else if(k==='tag'){openMod(v)}
  else if(k==='outil'){openTool(v)}
  else if(k==='calme'){location.hash='calme';calTab(v)}
  else if(k==='expo'){openExpo()}
  else if(k==='nuit'){openNuit()}
  else if(k==='libre'){location.hash='calme';calTab('mediter');setTimeout(()=>{const l=$('#libre');if(l)l.scrollIntoView({behavior:'smooth'})},80)}
  else if(k==='programme'){tagOpen=null;location.hash='programme';renderProgramme()}
  else if(k==='chat'){openChat(v)}
  else if(k==='tcc'&&v==='dialogue'){if(VOIX_URL())openConv({mode:'tcc',text:true});else openChat('comprend')}
  else if(k==='sosopen'){openSOS()}
  else if(k==='prog'){progOpen=v;location.hash='parcours';setTimeout(()=>{renderParcours();window.scrollTo(0,0)},30)}
  else if(k==='videtete'){location.hash='sommeil';setTimeout(()=>{$('#vtCard').scrollIntoView({behavior:'smooth'});$('#vtTxt').focus()},80)}
  else if(VIEWS.includes(k))location.hash=k}
function toggleFav(id){if(!ST.prof.favs.includes(id)&&lastTap)sparkle(lastTap[0],lastTap[1],8);setP(p=>{p.favs=p.favs.includes(id)?p.favs.filter(x=>x!==id):[...p.favs,id]});selP(pk);syncPlFav();haptic()}

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
$('#quick').onclick=()=>{const b=bestBreath();location.hash='calme';calTab('respirer');selP(b);selD(1);startBr()};
function slot(){const h=new Date().getHours();return h>=5&&h<11?'matin':h>=11&&h<17?'jour':h>=17&&h<21?'soir':'nuit'}
function homePicks(){const S={matin:['med:matin','br:coh','med:respi','med:minute','med:marche'],jour:['med:pause','med:pression','br:apaise','med:minute','med:marche'],
  soir:['med:soir','med:gratitude','br:vague','med:emotion','story:jardinnuit'],nuit:['med:scandodo','story:phare','br:dodo','med:dodo','story:cabane']}[slot()].slice();
  const recent=ST.items.find(x=>x.mood&&Date.now()-x.t<3*3600e3);if(recent&&recent.mood<=2)S.unshift('med:douceur','med:emotion');
  const f=ST.prof.favs.filter(x=>EX[x]&&!S.includes(x)).slice(0,2);return personalise([...new Set([...S.slice(0,4),...f,...S.slice(4)])]).slice(0,7)}
function sessMin(k){const m=findSess(k);if(!m)return 0;return Math.max(1,Math.round(durs(m).reduce((a,b)=>a+b,0)/60))}
function tileHTML(ex){const [k,v]=ex.split(':');const lab=EX[ex];
  const meta=k==='br'?`${PRESETS[v].d} min · respiration`:k==='snd'?'son':k==='story'?`${sessMin(v)} min · histoire`:k==='med'?`${sessMin(v)} min`:'';
  return `<button class="tile" data-ex="${esc(ex)}">${covHTML(catOf(ex),'',(k==='med'||k==='story')?v:null)}<b>${esc(G(lab))}</b><span>${esc(meta)}</span></button>`}
function renderHome(){const h=new Date().getHours();const nm=ST.prof.name?' '+ST.prof.name:'';
  $('#hello').textContent=(h<5?'Bonne nuit':h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir')+nm;
  $('#hero').className='hero t-'+slot();
  if(window.ElyraMascotte&&!$('#homeMasc .masc')){const hm=ElyraMascotte.create($('#homeMasc'),'repos');hm.svg.setAttribute('aria-label','ELYRA, touche-la pour dire bonjour');
    hm.svg.addEventListener('click',()=>{const l=TAPS();bubble(l[Math.floor(Math.random()*l.length)])});setTimeout(()=>bubble(greet()),700)}
  const wd=new Date().getDay();renderBilan($('#homeBilan'),true);if(!(wd===0||wd===1))$('#homeBilan').innerHTML='';
  $('#homeTiles').innerHTML=homePicks().map(tileHTML).join('');
  const ht=helpTop(1).slice(0,4);$('#homeHelp').innerHTML=ht.length?`<div class="sect"><h2>Ce qui t'aide</h2><a href="#outils">Ma boîte à outils</a></div><div class="tiles">${ht.map(([id])=>tileHTML(id)).join('')}</div>`:'';
  const hr=new Date().getHours();$('#homeNight').innerHTML=hr<5||hr>=23?`<div class="card nightc"><span class="tag lav">La nuit</span><h3 class="mt">${esc(G(hr<5?'Réveillé{e} cette nuit ?':'Pas encore endormi{e} ?'))}</h3><p class="sub">Un écran sombre et calme, pour te reposer sans pression.</p><button class="main mt" data-ex="nuit:1">Ouvrir l'écran de nuit</button></div>`:'';
  const now=Date.now();$('#stMin').textContent=ST.items.filter(x=>isPrat(x)&&now-x.t<7*DAY).reduce((a,x)=>a+(+x.min||0),0);
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
document.addEventListener('click',e=>{const d=e.target.closest('[data-stepdone]');if(d){sparkle(d);const [p,i]=d.dataset.stepdone.split(':');toggleStep(p,+i,true);toast('Étape notée. Bravo !');haptic()}
  const pr=e.target.closest('[data-prep]');if(pr){const u=ST.prof.up.find(x=>x.id===pr.dataset.prep);if(u)prepare(u)}});
async function prepare(u){await copyThen(`J'ai bientôt quelque chose qui m'inquiète : ${u.txt} (${fmtKey(u.date)}). Tu peux m'aider à m'y préparer en douceur ?`);openChat('accompagne')}

/* ============ ELYRA (lien) ============ */
let elyFace=null;
function renderElyra(){if(!elyFace&&window.ElyraFace){elyFace=ElyraFace($('#elyFace'),{photo:faceSrc(),mascot:isMascot()});elyFace.expr('sourire')}$('#elyLiveNote').innerHTML=VOIX_URL()?'':'Pas encore activée : il faut un compte Cloudflare gratuit, une seule fois. <a href="https://github.com/priscivyro/Elyra#activer-la-conversation-%C3%A0-voix-haute" target="_blank" rel="noopener">Voir le guide</a>. En attendant, le bouton ouvre la conversation dans Claude.';$('#modes').innerHTML=C.modes.map(([k,n,d])=>`<a class="item" style="text-decoration:none;color:inherit" data-mode="${k}"><span class="go">${covHTML(k==='apaise'?'sos':k==='nuit'?'sommeil':k==='apprendre'?'histoire':k==='encourage'?'confiance':k==='comprend'?'visu':k==='accompagne'?'corps':'stress')}<span><h3>${esc(n)}</h3><p>${esc(d)}</p></span></span></a>`).join('');
  $$('#modes a').forEach(a=>linkChat(a,a.dataset.mode));linkChat($('#talkHome'),'ecoute')}

/* ============ RESPIRATION ============ */
const PH_COL={Inspire:'var(--lav)',Expire:'var(--sage)',Retiens:'var(--champ)',Pause:'var(--champ)'};
function Breather(root){
  root.innerHTML=`<div class="stage"><div class="halo"></div><div class="ring"></div><div class="ring2"></div><div class="bub"></div><div class="bmasc"></div><div class="lbl"><b>On y va ?</b><span></span></div></div><p class="left" aria-live="polite"></p>`;
  const stage=root.querySelector('.stage'),bub=root.querySelector('.bub'),halo=root.querySelector('.halo'),r2=root.querySelector('.ring2'),ph=root.querySelector('.lbl b'),ct=root.querySelector('.lbl span'),left=root.querySelector('.left');
  const o={on:false,k:null,min:0,onState:null};let to,cd,iv,end,i;
  const MM=window.ElyraMascotte&&ST.prof.img!=='dessins'?ElyraMascotte.create(root.querySelector('.bmasc'),'repos'):null;if(MM)stage.classList.add('wm');
  const set=(sc,d)=>{if(MM){const now=performance.now(),cur=MM.extBr==null?0:MM.extBr;MM.brT={from:cur,to:sc>=.9?1:0,t0:now,d:d};if(MM.state!=='respiration'&&o.on){MM.set('respiration')}}for(const [el,f] of [[bub,1],[halo,1.15],[r2,1.05]]){el.style.transitionDuration=d+'s';el.style.transform=`scale(${sc*f})`}};
  function phase(){if(!o.on)return;if(Date.now()>=end-500)return stop(true);const P=PRESETS[o.k].ph,p=P[i%P.length];ph.textContent=p[0];
    stage.style.setProperty('--ph',PH_COL[p[0]]||'var(--lav)');set(p[2]?1:.42,p[1]);
    if(ST.prof.brVoice&&ST.prof.vmode!=='off')speak(p[0]);else if(p[0]==='Inspire'||p[0]==='Expire')SND.tone(p[2]?330:262,.9,.045);
    haptic(20);let c=p[1];ct.textContent=c;clearInterval(cd);cd=setInterval(()=>{c--;if(c>0)ct.textContent=c},1000);to=setTimeout(()=>{i++;phase()},p[1]*1000)}
  function start(k,min){SND.ctx();if(o.on)stop(false);o.k=k;o.min=min;o.on=true;i=0;end=Date.now()+min*60000;
    iv=setInterval(()=>{const s=Math.max(0,Math.round((end-Date.now())/1000));left.textContent=`Encore ${mmss(s)}`},500);phase();o.onState&&o.onState(true)}
  function stop(done){const was=o.on;o.on=false;clearTimeout(to);clearInterval(cd);clearInterval(iv);set(.42,1.5);ct.textContent='';stage.style.setProperty('--ph','var(--lav)');
    if(done&&was){SND.bell();ph.textContent='Bravo';left.textContent=`${o.min} min de calme en plus.`;askHelp(addItem({kind:'pratique',ex:'br:'+o.k,label:PRESETS[o.k].n,min:o.min}))}
    else{ph.textContent='On y va ?';left.textContent=''}if(MM){MM.brT=null;MM.extBr=null;MM.set(done&&was?'joie':'repos');if(done&&was)setTimeout(()=>{if(!o.on&&MM.state==='joie')MM.set('repos')},3500)}o.onState&&o.onState(false)}
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
function enter(el){if(!el)return;el.classList.add('enter');clearTimeout(el._en);el._en=setTimeout(()=>el.classList.remove('enter'),900)}
function calTab(t){enter($('#p-'+t));$$('#calTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));$$('#v-calme .pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+t));if(t!=='respirer'&&brMain.on)brMain.stop(false)}
$('#calTabs').onclick=e=>{const b=e.target.closest('button');if(b)calTab(b.dataset.t)};
selP('coh');selD(5);

/* ============ SÉANCES ============ */
const lenF=m=>ST.prof.long&&!m.sos?1.9:1;
const durs=m=>m.s.map(s=>{const r=+ST.prof.rate||1;const lf=lenF(m);const c=ST.prof.vmode==='elyra'?clip(G(s[0])):null;const v=c?c[1]/r:(ST.prof.vmode==='off'?0:est(s[0])/r);return Math.max(Math.round(s[1]*lf),Math.ceil(v+3))});
function itemHTML(m,story){const key=(story?'story:':'med:')+m.k;const f=ST.prof.favs.includes(key);
  return `<div class="item"><button class="go" data-ex="${key}">${covHTML(story?'histoire':m.c,'',m.k)}<span><h3>${esc(G(m.t))}</h3><p>${esc(G(m.d))}</p><span class="meta">${sessMin(m.k)} min</span></span></button><button class="star" data-fav="${key}" aria-pressed="${f}" aria-label="Favori : ${esc(G(m.t))}">${f?'★':'☆'}</button></div>`}
function renderMeds(){const cat=ST.prof.medCat||'tout';const sit=(C.situations||[]).find(x=>x[0]===ST.prof.medSit);
  $('#medSits').innerHTML=(C.situations||[]).map(([k,n,l])=>{const m0=findSess(l[0]);return `<button class="sitc" data-sit="${k}" aria-pressed="${!!sit&&sit[0]===k}">${covHTML(m0?m0.c:'stress','',k==='eft'?'eft':l[0])}<b>${esc(G(n))}</b><small>${l.length} séances</small></button>`}).join('');
  const showE=(sit&&sit[0]==='eft')||(!sit&&cat==='eft');$('#eftBox').hidden=!showE;if(showE)renderEftBox();
  $('#medCats').innerHTML=C.cats.map(([k,n])=>`<button data-cat="${k}" aria-pressed="${!sit&&k===cat}">${esc(n)}</button>`).join('');
  $('#medSitT').textContent=sit?G(sit[1]):'';$('#medSitT').hidden=!sit;
  $('#meds').innerHTML=(sit?sit[2].map(findSess).filter(Boolean):MEDS.filter(m=>cat==='tout'||m.c===cat)).map(m=>itemHTML(m,isStory(m.k))).join('');renderLibre();
  const r=ST.prof.resume;const rm=r&&findSess(r.k);
  $('#resume').innerHTML=rm?`<div class="card row between">${covHTML(isStory(rm.k)?'histoire':rm.c,'',rm.k)}<div style="flex:1"><span class="tag lav">À reprendre</span><h3 class="mt">${esc(G(rm.t))}</h3></div><button class="main" id="resGo">Reprendre</button></div>`:'';
  if(rm)$('#resGo').onclick=()=>openPlayer(rm.k,r.i)}
$('#medCats').onclick=e=>{const b=e.target.closest('[data-cat]');if(b)setP(p=>{p.medCat=b.dataset.cat;p.medSit=null})};
$('#medSits').onclick=e=>{const b=e.target.closest('[data-sit]');if(!b)return;const k=b.dataset.sit;setP(p=>p.medSit=p.medSit===k?null:k);haptic()};

/* ============ LA MASCOTTE PARLE (bulle sur l'accueil) ============ */
function greet(){const h=new Date().getHours(),nm=ST.prof.name?', '+ST.prof.name:'',last=ST.items.length?ST.items[0].t:0,gap=last?(Date.now()-last)/DAY:0;
  const today=ST.items.filter(x=>dkey(x.t)===dkey()&&(x.kind==='pratique'||x.kind==='outil'));
  if(gap>=3)return G(`Contente de te revoir${nm}. Aucune pression : on reprend doucement.`);
  if(today.length)return `Bravo pour ton moment de calme aujourd'hui. Ça compte.`;
  return h<6?`Tu es réveillé{e}${nm} ? Je suis là si tu as besoin.`:h<12?`Bonjour${nm}. Comment tu te sens ce matin ?`:h<18?`Coucou${nm}. Une petite pause te ferait du bien ?`:h<22?`Bonsoir${nm}. On souffle un peu avant la nuit ?`:`Il est tard${nm}. Pense à te reposer, ou parle-moi si ça tourne.`}
const TAPS=()=>["Hihi, ça chatouille !","Je suis contente que tu sois là.",G("Tu fais de ton mieux, et c'est déjà beaucoup."),"Une respiration ensemble ? Touche « Un moment ».","Je t'écoute quand tu veux.","Petit pas après petit pas."];
let bubT;function bubble(t){const b=$('#homeBub');if(!b)return;b.textContent=G(t);b.classList.add('on');clearTimeout(bubT);bubT=setTimeout(()=>b.classList.remove('on'),6000)}

/* ============ PISTES DE RÉFLEXION (journal) ============ */
const RQ=[[/anx|peur|stress/i,["Qu'est-ce qui t'aiderait à te sentir un peu plus en sécurité, là maintenant ?","Parmi ce qui t'inquiète, qu'est-ce qui dépend de toi, et qu'est-ce qui n'en dépend pas ?","Qu'est-ce que tu dirais à une amie qui ressent la même peur ?"]],
 [/trist|seul|honte|culpa/i,["De quoi aurais-tu besoin ce soir, même d'une toute petite chose ?","Qui pourrait t'apporter un peu de chaleur cette semaine ?","Qu'est-ce que cette émotion dit de ce qui compte pour toi ?"]],
 [/col|frustr/i,["Qu'est-ce qui a été franchi, ou pas respecté, pour toi ?","De quoi aurais-tu eu besoin dans ce moment-là ?"]],
 [/fatig/i,["Qu'est-ce que tu pourrais lâcher ou reporter pour souffler un peu ?","Qu'est-ce qui te recharge, même un peu ?"]],
 [/joie|soulag|grat|fier|sér/i,["Qu'est-ce qui a rendu ce moment possible ?","Comment pourrais-tu t'offrir un peu plus de ça ?"]]];
const RQG=["Qu'est-ce que tu aimerais te dire, avec douceur, après avoir écrit ça ?","Qu'est-ce qui t'a aidé{e}, même un peu, aujourd'hui ?","Si tu regardais cette journée avec bienveillance, que remarquerais-tu ?","Qu'est-ce qui compte pour toi, derrière ce que tu ressens ?"];
function showReflect(note,emos){const box=$('#jRefl');if(!box)return;const pool=[];emos.forEach(e=>RQ.forEach(([re,l])=>{if(re.test(e))pool.push(...l)}));if(!pool.length)pool.push(...RQG);
  const q=G(pool[Math.floor(Math.random()*pool.length)]),ai=!!(note&&VOIX_URL());
  box.hidden=false;box.innerHTML=`<div class="row" style="gap:12px;align-items:center;flex-wrap:nowrap"><div class="rmasc" id="rMasc"></div><div style="flex:1"><span class="tag lav">Une piste pour toi</span><p class="rq mt" id="rQ">${esc(q)}</p></div></div>
   <div class="row mt"><button class="ghost" id="rAns">Y répondre</button>${ai?'<button class="ghost" id="rAI">Une piste personnalisée</button>':''}<button class="ghost" id="rX">Plus tard</button></div>${ai?'<p class="note">La piste personnalisée envoie ta note au serveur ELYRA, le temps de répondre. Rien n’y est gardé.</p>':''}`;
  const M=window.ElyraMascotte?ElyraMascotte.create($('#rMasc'),'reconfort'):null;
  $('#rAns').onclick=()=>{$('#jPrompt').textContent=$('#rQ').textContent;box.hidden=true;$('#jNote').focus();$('#jForm').scrollIntoView({behavior:'smooth',block:'start'})};
  $('#rX').onclick=()=>{box.hidden=true};
  if(ai)$('#rAI').onclick=async()=>{const b=$('#rAI');b.disabled=true;b.textContent='ELYRA réfléchit…';M&&M.set('reflexion');const ac=new AbortController(),to=setTimeout(()=>ac.abort(),15000);
    try{const r=await fetch(VOIX_URL()+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reflect:note,emos}),signal:ac.signal});const j=await r.json();
      if(!r.ok||!j.text)throw 0;$('#rQ').textContent=j.text;b.remove();M&&M.set(/0800 32 123|112/.test(j.text)?'reconfort':'repos');if(/0800 32 123|112/.test(j.text))box.insertAdjacentHTML('beforeend','<button class="sosb big" id="rSos">Ouvrir le SOS</button>'),$('#rSos').onclick=openSOS}
    catch(e){b.disabled=false;b.textContent='Une piste personnalisée';M&&M.set('reconfort');toast("ELYRA n'a pas pu répondre. Réessaie un peu plus tard.")}finally{clearTimeout(to)}};
  box.scrollIntoView({behavior:'smooth',block:'nearest'})}

/* ============ BILAN DE LA SEMAINE ============ */
function bilan(){const now=Date.now(),wk=ST.items.filter(x=>now-x.t<7*DAY),pw=ST.items.filter(x=>now-x.t>=7*DAY&&now-x.t<14*DAY);
  const pr=wk.filter(x=>x.kind==='pratique'||x.kind==='outil'),min=pr.reduce((a,x)=>a+(+x.min||0),0),jn=wk.filter(x=>x.kind==='journal');
  const md=a=>{const m=a.filter(x=>x.mood).map(x=>x.mood);return m.length?m.reduce((p,c)=>p+c,0)/m.length:null},m1=md(wk),m0=md(pw);
  const days=Math.min(7,new Set(wk.map(x=>dkey(x.t))).size),best=helpTop(1)[0],L=[];
  if(pr.length)L.push(`${pr.length} moment${pr.length>1?'s':''} pour toi, ${min} min de calme`);
  if(jn.length)L.push(`${jn.length} note${jn.length>1?'s':''} dans ton journal`);
  if(days)L.push(G(`Tu es venu{e} ${days} jour${days>1?'s':''} sur 7`));
  if(best)L.push(`Ce qui t'aide le plus en ce moment : ${EX[best[0]]}`);
  let mood='';if(m1!=null&&m0!=null){if(m1>m0+.3)mood="Ton humeur semble un peu plus légère que la semaine dernière.";else if(m1<m0-.3)mood="Cette semaine a peut-être été plus lourde. Prends soin de toi, à ton rythme : tu n'as rien à prouver."}
  const empty=!L.length;
  return{empty,st:empty?'reconfort':'joie',title:empty?'Une semaine tranquille':'Tes petites victoires',L,mood:empty?"Rien de noté cette semaine, et c'est très bien comme ça. ELYRA est là quand tu en as besoin.":mood}}
function renderBilan(box,compact){if(!box)return;const b=bilan();
  if(compact){if(b.empty){box.innerHTML='';return}box.innerHTML=`<a class="card bilanh" href="#progres"><div class="bmini" data-bm></div><div><span class="tag lav">Bilan de la semaine</span><h3 class="mt">${esc(b.title)}</h3><p class="sub">${esc(b.L[0])}${b.L.length>1?' · et plus encore':''}</p></div></a>`}
  else box.innerHTML=`<div class="row" style="gap:12px;align-items:center;flex-wrap:nowrap"><div class="bmini" data-bm></div><div><span class="tag lav">Bilan de la semaine</span><h2 class="mt">${esc(b.title)}</h2></div></div>${b.L.length?`<ul class="vict">${b.L.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${b.mood?`<p class="sub mt">${esc(b.mood)}</p>`:''}`;
  const h=box.querySelector('[data-bm]');if(h&&window.ElyraMascotte)ElyraMascotte.create(h,b.st)}

/* ============ EFT ============ */
const EFTP=Object.fromEntries((C.eftPoints||[]).map(p=>[p[0],p]));
function eftShow(box,pt){if(!box||!ART)return;const p=EFTP[pt];box.innerHTML=ART.eft(pt)+(p?`<p class="eftlab"><b>${esc(p[1])}</b><span>${esc(p[2])}</span></p>`:'')}
let eftSel='MK';
function renderEftBox(){const b=$('#eftBox');const order=['MK','ST','DS','CO','SO','SN','ME','CL','SB'];
  b.innerHTML=`<span class="tag lav">EFT</span><h3 class="mt">Où tapoter ?</h3><p class="sub">Touche un point pour le voir. Tapote toujours doucement, du bout des doigts.</p>
   <div class="eftw" id="eftView"></div><div class="row chips mt" id="eftChips">${order.map((k,i)=>`<button data-pt="${k}" aria-pressed="${k===eftSel}" aria-label="${esc(EFTP[k][1])}">${i?i:'Main'}</button>`).join('')}</div>
   <p class="note" id="eftHow"></p><div class="row mt"><button class="ghost" data-ex="fiche:eft">Lire : l'EFT, concrètement</button><button class="ghost" data-ex="sos:eft">Tapotements express</button></div>`;
  const upd=()=>{eftShow($('#eftView'),eftSel);$('#eftHow').textContent=EFTP[eftSel][3];$$('#eftChips button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.pt===eftSel))};upd();
  b.onclick=e=>{const t=e.target.closest('[data-pt]');if(t){eftSel=t.dataset.pt;upd();haptic()}}}

/* ============ MÉDITATION LIBRE ============ */
const LB={on:false,end:0,start:0,min:10,every:0,iv:null,next:0};
function renderLibre(){const box=$('#libre');if(!box)return;const st=ST.prof.libre||{min:10,every:0};
  if(LB.on){const left=Math.max(0,Math.round((LB.end-Date.now())/1000));
    box.innerHTML=`<div class="row between"><div><span class="tag lav">Méditation libre</span><h3 class="mt">En cours</h3></div><span class="lbt" role="timer" aria-live="off">${mmss(left)}</span></div>
     <p class="sub">${esc(G(`Pas de voix, juste le silence${st.every?' et une cloche de temps en temps':''}. Quand tu t'aperçois que tu es parti{e} ailleurs, reviens simplement à ton souffle.`))}</p>
     <div class="row mt"><button class="ghost" id="lbStop">Terminer</button></div>`;$('#lbStop').onclick=()=>libreEnd(false);return}
  box.innerHTML=`<span class="tag lav">Méditation libre</span><h3 class="mt">Juste un minuteur et des cloches</h3><p class="sub">Pour méditer en silence, à ta façon.</p>
   <div class="row chips mt" id="lbMin">${[5,10,15,20,30,45].map(m=>`<button data-m="${m}" aria-pressed="${st.min===m}">${m} min</button>`).join('')}</div>
   <label class="f">Cloche pendant la séance<select id="lbEvery"><option value="0">Seulement au début et à la fin</option><option value="5" ${st.every===5?'selected':''}>Toutes les 5 minutes</option><option value="10" ${st.every===10?'selected':''}>Toutes les 10 minutes</option></select></label>
   <button class="main mt" id="lbGo">Commencer</button>`;
  $('#lbMin').onclick=e=>{const b=e.target.closest('[data-m]');if(b)setP(p=>p.libre={...(p.libre||{every:0}),min:+b.dataset.m})};
  $('#lbEvery').onchange=e=>setP(p=>p.libre={...(p.libre||{min:10}),every:+e.target.value});
  $('#lbGo').onclick=libreStart}
function libreStart(){const st=ST.prof.libre||{min:10,every:0};SND.ctx();stopVoice();if(brMain.on)brMain.stop(false);
  LB.on=true;LB.start=Date.now();LB.end=LB.start+st.min*60e3;LB.every=st.every;LB.next=st.every?LB.start+st.every*60e3:Infinity;SND.bell();
  clearInterval(LB.iv);LB.iv=setInterval(()=>{const now=Date.now();if(now>=LB.end)return libreEnd(true);if(now>=LB.next){SND.tone(523.25,3.5,.12);LB.next+=LB.every*60e3}
    const el=$('#libre .lbt');if(el)el.textContent=mmss(Math.round((LB.end-now)/1000))},500);renderLibre()}
function libreEnd(full){if(!LB.on)return;clearInterval(LB.iv);LB.on=false;SND.bell();if(full)sparkle(innerWidth/2,innerHeight/2,18);const min=Math.round((Date.now()-LB.start)/60000);
  renderLibre();if(min>=1){toast(full?'Séance terminée. Merci pour ce moment.':'Bien joué, chaque minute compte.');askHelp(addItem({kind:'pratique',ex:'libre',label:'Méditation libre',min}))}}
function renderStories(){$('#stories').innerHTML=STORIES.map(s=>itemHTML(s,true)).join('')}

/* ============ LECTEUR ============ */
const PL={m:null,i:-1,d:[],stepEl:0,el:0,tot:0,iv:null,paused:false,done:false,key:''};
function openPlayer(k,from){const m=findSess(k);if(!m)return;SND.ctx();if(brMain.on)brMain.stop(false);stopVoice();
  const story=isStory(k);PL.key=(story?'story:':'med:')+k;sessVoice=true;
  PL.m=m;PL.d=durs(m);PL.tot=PL.d.reduce((a,b)=>a+b,0);const start=Math.max(0,Math.min(from||0,m.s.length-1));PL.el=PL.d.slice(0,start).reduce((a,b)=>a+b,0);
  PL.done=false;PL.paused=false;const cat=story?'histoire':m.c;
  $('#plCov').outerHTML=covHTML(cat,'big',k).replace(/class="cov big art( photo)?"/,(m,p)=>`class="cov big art${p||''}" id="plCov"`);$('#plCov').hidden=!!m.eft;$('#plEft').hidden=!m.eft;
  const cs=getComputedStyle($('#plCov'));$('#plAura').style.setProperty('--c1',cs.getPropertyValue('--c1'));$('#plAura').style.setProperty('--c2',cs.getPropertyValue('--c2'));
  $('#plT').textContent=G(m.t);$('#plSub').textContent=G(m.d);syncPlLen();$('#plTag').textContent=story?'Histoire':(C.cats.find(c=>c[0]===m.c)||['',''])[1];
  $('#plTot').textContent=mmss(PL.tot);setPlay(true);syncPlVoice();syncPlFav();syncAmb();
  $('#player').classList.add('on');document.body.style.overflow='hidden';SND.bell();
  clearInterval(PL.iv);PL.iv=setInterval(tick,250);step(start);$('#plPlay').focus()}
function step(i){PL.i=i;PL.stepEl=0;const t=G(PL.m.s[i][0]);if(PL.m.eft)eftShow($('#plEft'),PL.m.s[i][2]);const say=$('#plSay');say.classList.add('fade');
  setTimeout(()=>{say.textContent=t;say.classList.remove('fade')},250);speak(t);updBar()}
function tick(){if(PL.paused||PL.done)return;PL.stepEl+=.25;PL.el+=.25;updBar();if(PL.stepEl>=PL.d[PL.i])advance()}
function advance(){if(PL.i+1>=PL.m.s.length)return finish();step(PL.i+1)}
function updBar(){$('#plBar').style.width=Math.min(100,PL.el/PL.tot*100)+'%';$('#plEl').textContent=mmss(PL.el)}
function setPlay(playing){$('#plPlay').innerHTML=`<svg class="icon"><use href="#i-${playing?'pause':'play'}"/></svg>`;$('#plPlay').setAttribute('aria-label',playing?'Pause':'Lecture')}
function finish(){PL.done=true;clearInterval(PL.iv);stopVoice();SND.bell();sparkle(PL.m.eft?$('#plEft'):$('#plCov'),0,20);const t=isStory(PL.m.k)?'Bonne nuit.':"Merci de t'être offert ce moment.";
  $('#plSay').textContent=t;PL.el=PL.tot;updBar();setPlay(false);
  setP(p=>{if(p.resume&&p.resume.k===PL.m.k)p.resume=null});askHelp(addItem({kind:'pratique',ex:PL.key,label:PL.m.t,min:Math.max(1,Math.round(PL.tot/60))}))}
function closePlayer(){clearInterval(PL.iv);stopVoice();$('#player').classList.remove('on');document.body.style.overflow=$('#sos').classList.contains('on')?'hidden':'';
  if(PL.m&&!PL.done&&(PL.i>0||PL.stepEl>=10)&&!PL.m.sos)setP(p=>{p.resume={k:PL.m.k,i:PL.i}})}
$('#plClose').onclick=closePlayer;
function syncPlLen(){const b=$('#plLen');if(!b||!PL.m)return;const ok=!PL.m.sos;b.hidden=!ok;b.textContent='Pauses : '+(ST.prof.long?'longues':'normales');b.setAttribute('aria-pressed',!!ST.prof.long)}
$('#plLen').onclick=()=>{if(!PL.m)return;setP(p=>p.long=!p.long);const frac=PL.d[PL.i]?PL.stepEl/PL.d[PL.i]:0;PL.d=durs(PL.m);PL.tot=PL.d.reduce((a,b)=>a+b,0);
  PL.stepEl=Math.round(frac*PL.d[PL.i]*4)/4;PL.el=PL.d.slice(0,PL.i).reduce((a,b)=>a+b,0)+PL.stepEl;$('#plTot').textContent=mmss(PL.tot);updBar();syncPlLen();
  toast(ST.prof.long?'Pauses plus longues entre les phrases.':'Pauses normales.')};
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
  const card=([k,n,d,g])=>{const on=a.includes(k);const v=ST.prof.sndVol[k]!=null?ST.prof.sndVol[k]:.8;
    return `<div class="sndc" aria-current="${on}"><button class="go" data-snd="${k}" aria-pressed="${on}">${covHTML(g==='m'?'musique':'son').replace('</span>',on?'<span class="eq"><i></i><i></i><i></i></span></span>':'</span>')}<span>${esc(n)}<small>${on?'En cours':esc(d)}</small></span></button>${on?`<input type="range" min="0" max="1" step="0.05" value="${v}" data-vol="${k}" aria-label="Volume : ${esc(n)}">`:''}</div>`};
  $('#sounds').innerHTML=C.sounds.filter(x=>!x[3]).map(card).join('');$('#musics').innerHTML=C.sounds.filter(x=>x[3]==='m').map(card).join('');$('#alts').innerHTML=C.sounds.filter(x=>x[3]==='g').map(card).join('');
  $('#sndState').textContent=a.length?`En cours : ${a.map(k=>EX['snd:'+k]).join(', ')}.`:'Aucun son en cours.';$('#sndStop').hidden=!a.length}
$('#sounds').onclick=$('#musics').onclick=$('#alts').onclick=e=>{const b=e.target.closest('[data-snd]');if(!b)return;const k=b.dataset.snd;const was=SND.active().length;
  if(SND.active().includes(k))SND.off(k);else{SND.on(k,ST.prof.sndVol[k]);if(!was)SND.timer(+$('#sndTimer').value)}haptic()};
$('#sounds').oninput=$('#musics').oninput=$('#alts').oninput=e=>{const r=e.target.closest('[data-vol]');if(!r)return;SND.vol(r.dataset.vol,+r.value);ST.prof.sndVol[r.dataset.vol]=+r.value;save()};
$('#mixes').onclick=e=>{const b=e.target.closest('[data-mix]');if(!b)return;const l=C.mixes[+b.dataset.mix][1];SND.only(null);setTimeout(()=>{l.forEach(k=>SND.on(k,ST.prof.sndVol[k]));SND.timer(+$('#sndTimer').value)},50)};
$('#sndTimer').onchange=e=>{if(SND.active().length)SND.timer(+e.target.value)};
$('#sndStop').onclick=()=>SND.stopAll();
function renderFavs(){const f=ST.prof.favs.filter(x=>EX[x]);$('#favBox').innerHTML=f.length?`<div class="sect"><h2>Mes favoris</h2></div><div class="tiles">${f.map(tileHTML).join('')}</div>`:''}

/* ============ SOS ============ */
const SOSIT={
 crise:{n:'Je sens une crise arriver',m:"Une vague monte. Elle va atteindre un sommet, puis redescendre. Tu n'as rien à réussir : on y va une petite chose à la fois.",o:['souffle','ground','audio','douce','parler'],a:'vague'},
 intense:{n:'Je ressens une angoisse intense',m:"C'est très dur, et tu as bien fait de venir ici. Ça ne restera pas à ce niveau-là. Choisis ce qui te semble le plus facile.",o:['audio','souffle','ground','froid','douce','eft','parler'],a:'vague'},
 controle:{n:"J'ai peur de perdre le contrôle",m:"Cette peur accompagne très souvent les fortes angoisses. Tu peux la laisser être là, sans lui obéir. Commençons par sentir le sol sous tes pieds.",o:['ground','audio','douce','defusion','parler'],a:'sosvoix'},
 physique:{n:"J'ai des sensations physiques inquiétantes",m:"Tes sensations comptent, et elles méritent d'être prises au sérieux.",warn:1,o:['ground','souffle','audio','corps','parler'],a:'sosvoix'},
 depasse:{n:'Je me sens {dépassé|dépassée}',m:"Tout semble trop à la fois. On met le reste de côté pour quelques minutes. Juste la prochaine petite chose.",o:['audio','ground','kit','reporter','parler'],a:'trop'},
 rumine:{n:'Mes pensées tournent en boucle',m:"Ton esprit essaie de résoudre quelque chose, et il tourne en rond. Pas besoin de tout comprendre maintenant : on cherche juste à sortir un peu de la boucle.",o:['ground','defusion','audio','reporter','parler'],a:'nuages'},
 nuit:{n:"Je n'arrive pas à dormir",m:"La nuit, tout paraît plus lourd. Ce n'est pas le moment de régler quoi que ce soit. On cherche seulement un peu de repos, même sans sommeil.",o:['nuitv','audio','douce','reporter','ground'],a:'reveil'},
 parler:{n:"J'ai besoin de parler",m:"Tu as le droit d'avoir besoin de quelqu'un. Tu peux écrire à ELYRA, ou appeler une personne de confiance.",o:['parler','contacts','ground','audio'],a:'sosvoix'}};
const SOSOPT={souffle:['Le soupir qui apaise','Quelques longues expirations',()=>sosFlow('souffle')],douce:['Respiration douce','Facultative, sans forcer',()=>sosBreath()],
 ground:['Ancrage 5-4-3-2-1',"Revenir à ce qui t'entoure",()=>sosFlow('ground')],eft:['Tapotements','Tapoter et se rassurer',()=>sosFlow('eft')],froid:['Le froid qui ramène',"De l'eau fraîche sur les mains",()=>sosFlow('froid')],
 audio:['Écouter une voix calme','Quelques minutes guidées',()=>openPlayer(SOSIT[sosSit].a)],kit:['Mon kit de secours','Tes phrases et tes repères',()=>sosKit()],
 defusion:['Prendre du recul avec une pensée','La regarder au lieu de la croire',()=>openTool('defusion','sos')],reporter:['Ranger une inquiétude',"Lui donner rendez-vous plus tard",()=>openTool('reporter','sos')],
 nuitv:['L’écran de nuit','Sombre et calme, pour te reposer',()=>{closeSOS();openNuit()}],corps:['Noter ce que je ressens','Pour en parler à ton médecin',()=>{closeSOS();location.hash='corps'}],
 parler:['Parler à ELYRA','Une conversation pour t’apaiser (Internet)',()=>{if(VOIX_URL())openConv({mode:'apaise',voice:true});else openChat('apaise')}],contacts:['Mes contacts de confiance','Appeler quelqu’un',()=>sosKit()]};
const optEx=o=>({souffle:'sos:souffle',ground:'sos:ground',eft:'sos:eft',froid:'sos:froid',douce:'br:douce',defusion:'outil:defusion',reporter:'outil:reporter',audio:sosSit&&SOSIT[sosSit]?'med:'+SOSIT[sosSit].a:''})[o]||'';
let sosUsed=[];
const sosBr={b:null};let sosSit=null;
function sosRender(html,back){$('#sosBody').innerHTML=html;$('#sosBack').hidden=!back;const h=$('#sosBody h2');if(h){h.setAttribute('tabindex','-1');h.focus()}}
function openSOS(){$('#rate').classList.remove('on');if(brMain.on)brMain.stop(false);$('#sos').classList.add('on');document.body.style.overflow='hidden';sosStart();haptic(30)}
function closeSOS(){$('#sos').classList.remove('overlock');toolStop();if(sosBr.b&&sosBr.b.on)sosBr.b.stop(false);stopVoice();$('#sos').classList.remove('on');document.body.style.overflow=''}
function sosStart(){sosSit=null;sosUsed=[];sosRender(`<div class="sosm" id="sosMasc"></div><h2 id="sosT">Je suis là.</h2><p class="quote mt">Tu as bien fait d'ouvrir ELYRA. On va y aller doucement, une chose à la fois.</p>
  <p class="mt" style="font-weight:600">Qu'est-ce qui se passe pour toi ?</p><div class="sitg">${Object.entries(SOSIT).map(([k,s])=>`<button class="opt" data-sit="${k}"><b>${esc(G(s.n))}</b></button>`).join('')}</div>
  <button class="opt noir" data-noir="1"><b>J'ai des pensées très sombres</b><span>Des personnes sont là pour t'écouter, 24 h sur 24</span></button>`,false);if(window.ElyraMascotte&&$('#sosMasc'))ElyraMascotte.create($('#sosMasc'),'reconfort')}
function sosNoir(){const N=O.noir;sosRender(`<h2 id="sosT">${esc(G(N.t))}</h2><p class="quote mt">${esc(G(N.m))}</p>
  <div class="urg big">${N.l.map(([n,a,b])=>`<a href="tel:${n.replace(/\s/g,'')}"><b>${esc(n)}</b><span><b>${esc(a)}</b><br>${esc(b)}</span></a>`).join('')}</div>
  <p class="mt">${esc(G(N.apres))}</p>${ST.prof.kit.con.length?`<p class="mt" style="font-weight:600">Tes contacts</p>${ST.prof.kit.con.map(c=>`<a class="btn ghost" style="justify-content:space-between;width:100%;margin-top:8px" href="tel:${esc(c.p.replace(/[^\d+]/g,''))}"><span>${esc(c.n)}</span><b>${esc(c.p)}</b></a>`).join('')}`:''}
  <p class="mt">Quand tu te sens prêt{e}, tu peux aussi essayer quelque chose pour traverser les prochaines minutes :</p>
  <div class="sitg"><button class="opt" data-opt2="ground"><b>Ancrage 5-4-3-2-1</b><span>Revenir à ce qui t'entoure</span></button><button class="opt" data-opt2="audio"><b>Écouter une voix calme</b><span>Quelques minutes guidées</span></button></div>`.replace('prêt{e}',G('prêt{e}')),true)}
function sosOptions(){const s=SOSIT[sosSit];const k=ST.prof.kit;
  const sc=o=>(k.tech.includes(optEx(o))?10:0)+helpAvg(optEx(o));const pref=s.o.slice().sort((a,b)=>sc(b)-sc(a));
  const warn=s.warn?`<div class="warnb"><p style="margin:0"><b>D'abord, ta sécurité.</b> Douleur ou oppression dans la poitrine, difficulté à respirer, faiblesse ou engourdissement d'un côté du corps, malaise, ou sensation nouvelle pour toi : <b>appelle le 112 maintenant</b>. Dans le doute, appeler est toujours une bonne décision. Le médecin de garde (1733) peut aussi te conseiller.</p>
    <a class="btn main mt" href="tel:112" style="background:var(--warm)">Appeler le 112</a></div><p class="mt">Si ces sensations te sont connues et ont déjà été vérifiées par un médecin, tu peux essayer :</p>`:'';
  const phr=k.phr.length?`<p class="mt" style="font-weight:600">Tes phrases</p>${k.phr.slice(0,3).map(p=>`<p class="phr">${esc(p)}</p>`).join('')}`:'';
  sosRender(`<h2 id="sosT">${esc(G(s.n))}</h2><p class="quote mt">${esc(G(s.m))}</p>${warn}<div class="sitg">${pref.map(o=>{const h=helpOf(optEx(o));return `<button class="opt" data-opt="${o}"><b>${esc(SOSOPT[o][0])}</b><span>${esc(SOSOPT[o][1])}</span>${h&&h.avg>=1.4?`<span class="hb">${esc(G('T’aide souvent'))}</span>`:''}</button>`}).join('')}</div>${phr}
    <button class="ghost mt2" data-sosend="1" style="width:100%">Ça va un peu mieux</button>`,true)}
function sosFlow(key){let i=0;const F=SOSF[key];
  const draw=()=>{const st=F.s[i];sosRender(`<h2 id="sosT">${esc(F.n)}</h2><div class="card"><p class="big">${esc(st[0])}</p><p class="step">${esc(st[1])}</p>
    <div class="row"><button class="ghost" id="fPrev" ${i===0?'disabled':''}>Précédent</button><button class="main" id="fNext">${i===F.s.length-1?'Terminé':'Suivant'}</button></div></div>`,true);
    speak(st[1]);
    $('#fPrev').onclick=()=>{if(i>0){i--;draw()}};$('#fNext').onclick=()=>{if(i<F.s.length-1){i++;draw()}else{stopVoice();const it=addItem({kind:'pratique',ex:'sos:'+key,label:F.n,min:2});sosUsed.push(it.id);sosEnd()}}};
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
let sosRec=null,sosAct=null;
function sosEnd(){sosRec=null;sosAct=null;const k=ST.prof.kit;const L=[...k.phr.slice(0,3),...O.recul.map(G)].filter((x,i,a)=>a.indexOf(x)===i);
  sosRender(`<h2 id="sosT">Prendre du recul</h2><p class="quote mt">Tu as traversé ce moment. Avant de reprendre, choisis une phrase pour toi.</p>
  <div class="sitg">${L.map((p,i)=>`<button class="opt" data-rec="${i}"><b>${esc(p)}</b></button>`).join('')}</div>
  <div id="recBox"></div><button class="ghost mt2" data-endnext="1" style="width:100%">Continuer</button>`,true);
  $$('#sosBody [data-rec]').forEach(b=>b.onclick=()=>{sosRec=L[+b.dataset.rec];$$('#sosBody [data-rec]').forEach(x=>x.setAttribute('aria-pressed',x===b));
    $('#recBox').innerHTML=`<p class="phr mt">${esc(sosRec)}</p>${k.phr.includes(sosRec)?'':`<button class="ghost" id="recKit">Garder cette phrase dans mon kit</button>`}`;
    const rk=$('#recKit');if(rk)rk.onclick=()=>{setP(p=>{if(!p.kit.phr.includes(sosRec))p.kit.phr.push(sosRec)});rk.outerHTML='<p class="note">Ajoutée à ton kit.</p>'};haptic()});
  $('#sosBody [data-endnext]').onclick=sosAction}
function sosAction(){sosRender(`<h2 id="sosT">Une petite chose pour toi</h2><p class="quote mt">Quelque chose de simple, à faire maintenant, à ton rythme.</p>
  <div class="row chips mt">${O.actions.map(([k,n])=>`<button data-act="${k}" aria-pressed="false">${esc(n)}</button>`).join('')}</div><p id="actMsg" class="mt"></p>
  <button class="ghost mt2" id="actNext" style="width:100%">Continuer</button>`,true);
  $$('#sosBody [data-act]').forEach(b=>b.onclick=()=>{sosAct=b.dataset.act;$$('#sosBody [data-act]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#actMsg').textContent='C’est parfait. Fais-le doucement, sans te presser.';haptic()});
  $('#actNext').onclick=sosLevel}
function sosLevel(){const used=sosUsed.map(id=>ST.items.find(x=>x.id===id)).filter(Boolean).filter((x,i,a)=>a.findIndex(y=>y.ex===x.ex)===i);
  sosRender(`<h2 id="sosT">Retour au calme</h2><p class="quote mt">Prends ton temps avant de reprendre.</p>
  <div class="card"><p style="font-weight:600;margin:0">Et maintenant, ton niveau d'angoisse : <span id="seV">5</span>/10</p><input type="range" id="seR" min="0" max="10" value="5" aria-label="Niveau d'angoisse maintenant">
  ${used.length?`<p class="mt" style="font-weight:600">${esc(G("Qu'est-ce qui t'a aidé{e} ?"))}</p><div class="row chips">${used.map(x=>`<button data-helped="${esc(x.id)}" aria-pressed="false">${esc(EX[x.ex]||x.label)}</button>`).join('')}</div>`:''}
  <button class="main mt" id="seSave">Noter et fermer</button></div>
  <div class="card"><h3>Si tu veux</h3><p>Note ce qui t'a aidé dans ton kit de secours, pour la prochaine fois.</p><p>Si ces moments reviennent souvent, en parler à ton médecin peut vraiment aider.</p></div>`,true);
  $('#seR').oninput=e=>$('#seV').textContent=e.target.value;
  $$('#sosBody [data-helped]').forEach(b=>b.onclick=()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true'));
  $('#seSave').onclick=()=>{$$('#sosBody [data-helped]').forEach(b=>{const it=ST.items.find(x=>x.id===b.dataset.helped);if(it)it.help=b.getAttribute('aria-pressed')==='true'?2:1});
    addItem({kind:'sos',sit:sosSit||'',stress:+$('#seR').value,rec:sosRec||'',act:sosAct||''});closeSOS();toast('Bien joué. Prends soin de toi.')}}
$('#sosOpen').onclick=openSOS;$('#sosX').onclick=closeSOS;
$('#sosBack').onclick=()=>{stopVoice();toolStop();if(sosBr.b&&sosBr.b.on)sosBr.b.stop(false);sosSit?sosOptions():sosStart()};
$('#sosBody').onclick=e=>{const s=e.target.closest('[data-sit]');if(s){sosSit=s.dataset.sit;sosOptions();return}
  if(e.target.closest('[data-noir]')){sosSit=null;sosNoir();return}
  const o2=e.target.closest('[data-opt2]');if(o2){if(o2.dataset.opt2==='audio')openPlayer('sosvoix');else sosFlow('ground');return}
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
  sparkle($('#jForm button[type=submit]')||$('#jForm'),0,10);addItem({kind:'journal',mood:jm,stress:+$('#stress').value,emos:jEmo.slice(),sits:jSit.slice(),note:note.slice(0,3000),q:note?$('#jPrompt').textContent:''});showReflect(note,jEmo.slice());resetJ();$('#jMsg').textContent="C'est noté. Merci de prendre ce temps pour toi."};
const KLAB={journal:'Journal',humeur:'Humeur',videtete:'Vide-tête',sos:'Après un SOS',pensee:'Pensée démêlée',tag:'Programme TAG',outil:'Outil',expo:'Exposition',corps:'Mon corps'};
function bars(el,days,key){const today=dstart(Date.now());const out=[];
  for(let i=days-1;i>=0;i--){const dd=dstart(today-i*DAY+432e5);const s=ST.items.filter(x=>x[key]!=null&&x[key]!==''&&dstart(x.t)===dd);const v=s.length?avg(s.map(x=>+x[key])):null;
    const max=key==='mood'?5:10;out.push(v==null?'<div class="z" title="pas de note"></div>':`<div style="height:${Math.max(4,v/max*100)}%" title="${key==='mood'?'humeur':'stress'} ${v.toFixed(1)}/${max}"></div>`)}
  el.innerHTML=out.join('')}
function entryBody(x){if(x.kind==='outil'||x.kind==='expo'||x.kind==='corps')return entryExtra(x);if(x.kind==='tag'){const M=window.ELYRA_TAG.mods.find(m=>m.id===x.mod);if(!M)return '';
  const lines=M.ex.f.map(f=>{let v=x.ans&&x.ans[f.k];if(v==null||v===''||(Array.isArray(v)&&!v.length))return '';if(f.t==='steps')v=v.map(s=>`${s.t} (${s.d}/10)`).join(' · ');else if(Array.isArray(v))v=v.join(', ');else if(f.t==='scale')v=v+'/10';return `<p class="sub" style="margin:2px 0 0"><b>${esc(G(f.l))}</b> ${esc(v)}</p>`}).filter(Boolean).slice(0,4).join('');
  return `<p><b>${esc(M.ex.t)}</b> · ${esc(M.n)}</p>${lines}`}
 if(x.kind==='pensee')return `<p><b>Situation :</b> ${esc(x.sit)}</p><p><b>Pensée :</b> ${esc(x.pen)}</p>${x.emos&&x.emos.length?`<p class="sub" style="margin:2px 0 0">${esc(x.emos.join(', '))} · ${+x.i1}/10 → ${+x.i2}/10</p>`:`<p class="sub" style="margin:2px 0 0">${+x.i1}/10 → ${+x.i2}/10</p>`}
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
  const it=addItem({kind:'pensee',ex:'pensee',sit:v('#t1'),pen:v('#t2'),emos:tEmo.slice(),i1:+$('#t3').value,traps:tTrap.slice(),pour:v('#t5a'),contre:v('#t5b'),autre:v('#t6'),i2:+$('#t7').value});
  ['#t1','#t2','#t5a','#t5b','#t6'].forEach(i=>$(i).value='');tEmo=[];tTrap=[];tI=0;tDraw();toast('Enregistré dans ton journal. Bravo pour ce travail.');location.hash='journal';askHelp(it)};
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
function renderSommeil(){if(window.ElyraMascotte&&!$('#sleepMasc .masc'))ElyraMascotte.create($('#sleepMasc'),'sommeil');$('#nightTiles').innerHTML=['med:scandodo','story:phare','story:cabane','story:jardinnuit','story:train','br:dodo','med:dodo','med:reveil','snd:pluie'].map(tileHTML).join('');
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
  if(!progOpen){box.innerHTML=`<div class="list">${PROGS.map(P=>{const d=(ST.prof.prog.done[P.id]||[]).length;return `<div class="item" aria-current="${P.id===act}"><button class="go" data-prog="${P.id}"><span class="cov" data-c="corps" aria-hidden="true" style="font:700 .9rem 'DM Sans',sans-serif">${d}/${P.s.length}</span><span>${P.audio?'<span class="tag lav">Série audio</span>':''}<h3>${esc(P.n)}</h3><p>${esc(P.d)}</p>${P.id===act?'<span class="meta" style="color:var(--lavd)">En cours</span>':''}</span></button></div>`}).join('')}</div>`;return}
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
  const P=ST.items.filter(x=>isPrat(x)&&x.ex&&EX[x.ex]);const cnt={};P.forEach(x=>cnt[x.ex]=(cnt[x.ex]||0)+1);
  const H=helpTop(1);if(H.length){const [id,h]=H[0];out.push([`Ce qui t'aide le plus, d'après tes réponses : ${EX[id]} (« beaucoup » ${h.b} fois sur ${h.n}).${ST.prof.kit.tech.includes(id)?'':' Tu peux l’ajouter à ton kit de secours.'}`,`Basé sur ${helpCount()} réponse(s) à « Ça t'a aidé ? ».`])}
  const fav=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  if(fav&&fav[1]>=3&&!(H.length&&H[0][0]===fav[0]))out.push([`Ce que tu pratiques le plus : ${EX[fav[0]]} (${fav[1]} fois).${ST.prof.kit.tech.includes(fav[0])?'':' Tu peux l’ajouter à ton kit de secours.'}`,`Basé sur ${P.length} exercices.`]);
  const S=ST.items.filter(x=>x.kind==='sommeil');const good=[],bad=[];
  S.forEach(n=>{const ms=ST.items.filter(x=>x.mood&&dkey(x.t)===n.night).map(x=>+x.mood);if(!ms.length)return;const m=avg(ms);if(n.q>=4)good.push(m);else if(n.q<=2)bad.push(m)});
  if(good.length>=3&&bad.length>=3){const g=avg(good),b=avg(bad);if(Math.abs(g-b)>=.5)out.push([`Après les nuits que tu notes comme bonnes, ton humeur moyenne est de ${g.toFixed(1)}/5, contre ${b.toFixed(1)}/5 après les nuits difficiles.`,`Basé sur ${good.length+bad.length} nuits.`])}
  const T=ST.items.filter(x=>x.kind==='pensee');if(T.length>=3){const d=avg(T.map(x=>x.i1-x.i2));if(d>=1)out.push([`Quand tu prends le temps de démêler une pensée, l'intensité de ton émotion baisse en moyenne de ${d.toFixed(1)} point(s).`,`Basé sur ${T.length} pensées démêlées.`])}
  const sos=ST.items.filter(x=>x.kind==='sos'&&Date.now()-x.t<30*DAY);if(sos.length>=3)out.push([`Tu as utilisé le SOS ${sos.length} fois ce mois-ci. C'est bien de t'en servir. Si ces moments reviennent souvent, en parler à ton médecin peut vraiment aider.`,'Basé sur ton utilisation du SOS.']);
  return out}
function period(from,to){const I=ST.items.filter(x=>x.t>=from&&x.t<to);return{ex:I.filter(x=>isPrat(x)&&x.min>0).length,min:I.filter(isPrat).reduce((a,x)=>a+(+x.min||0),0),
  st:avg(I.filter(x=>x.stress!=null&&x.kind!=='sos').map(x=>+x.stress)),wins:I.filter(x=>x.kind==='victoire').length,days:new Set(I.map(x=>dkey(x.t))).size}}
function summary(c,p,label){if(!c.days)return `<p class="sub">Rien de noté ${label}. Ce n'est pas grave : ELYRA est là quand tu en as besoin.</p>`;const o=[];
  o.push(`Tu as pris soin de toi ${c.days} jour(s) ${label}${c.ex?`, avec ${c.ex} exercice(s) et ${c.min} min de calme`:''}.`);
  if(c.st!=null&&p.st!=null){const d=c.st-p.st;o.push(Math.abs(d)<.5?`Ton stress déclaré est stable (${c.st.toFixed(1)}/10).`:d<0?`Ton stress déclaré a baissé : ${c.st.toFixed(1)}/10 contre ${p.st.toFixed(1)} avant.`:G(`Ton stress déclaré est un peu plus haut (${c.st.toFixed(1)}/10). Une période plus chargée, peut-être : sois {doux|douce} avec toi.`))}
  else if(c.st!=null)o.push(`Stress déclaré moyen : ${c.st.toFixed(1)}/10.`);
  if(c.wins)o.push(`${c.wins} petite(s) victoire(s) notée(s). Bravo.`);return o.map(x=>`<p>${esc(x)}</p>`).join('')}
function renderProgres(){renderBilan($('#bilan'));const now=Date.now();const I30=ST.items.filter(x=>now-x.t<30*DAY);
  $('#p30ex').textContent=I30.filter(x=>isPrat(x)&&x.min>0).length;$('#p30min').textContent=I30.filter(isPrat).reduce((a,x)=>a+(+x.min||0),0);
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
const SIZES=[['m','Normal'],['l','Grand'],['xl','Très grand']],THEMES=[['auto','Auto'],['light','Clair'],['dark','Sombre']],ANIMS=[['on','Douces'],['off','Calmes']],IMGS=[['photos','Photos'],['dessins','Dessins']],GENRES=[['f','Au féminin'],['m','Au masculin']];
const VVOICES=[['siwis','Voix féminine'],['tom','Voix masculine']];
const VMODES=[['elyra','Voix ELYRA'],['tel','Voix du téléphone'],['off','Sans voix']],RATES=[['1','Normal'],['0.9','Plus lent']];
const viewerTheme=document.documentElement.getAttribute('data-theme');
const isDark=()=>{const t=ST.prof.theme||'auto';return t==='dark'||(t==='auto'&&(document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)))};
function syncThm(){const b=$('#thmBtn');if(!b)return;const d=isDark();b.classList.toggle('dark',d);b.setAttribute('aria-label',d?'Passer en mode clair':'Passer en mode sombre')}
document.addEventListener('click',e=>{if(!e.target.closest('#thmBtn'))return;const d=isDark();setP(p=>p.theme=d?'light':'dark');applyPrefs();toast(d?'Mode clair':'Mode sombre');haptic()});
function applyPrefs(){const r=document.documentElement;const pf=faceSrc();r.classList.toggle('portrait',!!pf);if(pf)r.style.setProperty('--portrait',`url("${pf}")`);else r.style.removeProperty('--portrait');r.dataset.size=ST.prof.size||'m';r.dataset.anim=ST.prof.anim||'on';setTimeout(syncThm,0);r.dataset.img=ST.prof.img||'photos';if(ST.prof.theme==='auto'){if(viewerTheme)r.dataset.theme=viewerTheme;else r.removeAttribute('data-theme')}else r.dataset.theme=ST.prof.theme}
function renderVoiceSel(){const s=$('#pVoiceSel');if(!s)return;const L=CapTTS()?NV:voices;$('#pVoiceSelBox').hidden=!L.length;
  s.innerHTML=`<option value="">Voix par défaut</option>`+L.map(v=>`<option value="${esc(v.name)}" ${v.name===ST.prof.vname?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}
const chipRow=(sel,list,cur,attr)=>{$(sel).innerHTML=list.map(([k,n])=>`<button data-${attr}="${k}" aria-pressed="${String(cur)===k}">${n}</button>`).join('')};
function renderEspace(){const P=ST.prof;renderPf();if(document.activeElement!==$('#pName'))$('#pName').value=P.name||'';$('#pAnt').checked=!!P.anticip;$('#pCtx').checked=!!P.ctxShare;$('#brVoice').checked=!!P.brVoice;
  chipRow('#pGenre',GENRES,P.genre,'genre');chipRow('#onbGenre',GENRES,P.genre,'genre');chipRow('#pVoiceMode',VMODES,P.vmode,'vmode');chipRow('#pVVoice',VVOICES,VV(),'vvoice');$('#pVVoiceBox').hidden=P.vmode!=='elyra';chipRow('#pRate',RATES,String(+P.rate||1),'rate');
  chipRow('#pSize',SIZES,P.size,'size');chipRow('#pTheme',THEMES,P.theme,'theme');chipRow('#pAnim',ANIMS,P.anim||'on','anim');chipRow('#pImg',IMGS,P.img||'photos','img');$('#phCred').innerHTML=PHOTOS.credits.map(([a,u])=>`<li>${esc(a)}</li>`).join('');
  $('#pVoiceInfo').textContent=P.vmode==='elyra'?(VO.idx?`La voix ELYRA est ${VO.human?'une voix humaine (Microsoft)':VO.eng==='chatterbox'?'une voix naturelle (Chatterbox, d’après la voix d’une comédienne de la base libre SIWIS, CC BY 4.0)':'une voix française de synthèse (Piper)'}, intégrée à l'appli (${Object.keys(VO.idx).length} phrases enregistrées). Elle fonctionne hors ligne.`:"La voix ELYRA n'est pas encore disponible sur ce téléphone. En attendant, c'est la voix du téléphone qui lit les séances."):P.vmode==='tel'?"Astuce iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Français, puis télécharge une voix « améliorée » ou « premium ».":'Les séances s’affichent sans être lues.';
  $('#pOffline').hidden=isNative||!VO.idx||!('caches' in window);
  renderVoiceSel();$('#lastBackup').textContent=P.lastBackup?`Dernière sauvegarde : ${fmtD(P.lastBackup)}.`:"Pas encore de sauvegarde.";
  $('#persistInfo').textContent=storageOK?'':"Attention : ce navigateur n'autorise pas l'enregistrement. Installe l'appli sur l'écran d'accueil.";
  $('#verInfo').textContent=`ELYRA · version personnelle ${APP_VERSION}. ELYRA ne pose pas de diagnostic et ne remplace pas un professionnel de santé.`}
document.addEventListener('click',e=>{const g=e.target.closest('button[data-genre]');if(g)setP(p=>p.genre=g.dataset.genre);
  const v=e.target.closest('button[data-vmode]');if(v)setP(p=>p.vmode=v.dataset.vmode);
  const vv=e.target.closest('button[data-vvoice]');if(vv&&vv.dataset.vvoice!==VV()){setP(p=>p.vvoice=vv.dataset.vvoice);loadVoiceIdx().then(()=>{sessVoice=true;speak(TEST,true)})}const r=e.target.closest('button[data-rate]');if(r)setP(p=>p.rate=+r.dataset.rate);
  const s=e.target.closest('button[data-size]');if(s){setP(p=>p.size=s.dataset.size);applyPrefs()}const t=e.target.closest('button[data-theme]');if(t){setP(p=>p.theme=t.dataset.theme);applyPrefs()}const an=e.target.closest('button[data-anim]');if(an){setP(p=>p.anim=an.dataset.anim);applyPrefs()}const ig=e.target.closest('button[data-img]');if(ig)setP(p=>p.img=ig.dataset.img);});
/* visage d'ELYRA : image choisie sur le téléphone */
const PF={img:null};
function faceSrc(){const f=ST.prof.portrait;return f==='elyra'?'visage-elyra.jpg':(f&&f.startsWith('data:')?f:null)}
const isMascot=()=>{const f=ST.prof.portrait;return !f||f==='mascotte'};
function renderPf(){if(PF.img)return;const p=faceSrc(),v=ST.prof.portrait||'mascotte',box=$('#pfPrev');
  if(isMascot()){if(!box.querySelector('.masc')&&window.ElyraMascotte){box.innerHTML='';ElyraMascotte.create(box,'repos')}}
  else if(p)box.innerHTML=`<img src="${p}" alt="Le visage d’ELYRA">`;else if(!box.querySelector('.fl-svg')&&window.ElyraFace){box.innerHTML='';ElyraFace(box,{})}
  $$('#pfModes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pf===v||(b.dataset.pf==='perso'&&v.startsWith('data:'))))}
function pfDraw(){const im=PF.img,c=$('#pfPrev canvas');if(!im||!c)return;const z=+$('#pfZoom').value,side=Math.min(im.width,im.height)/z,x=(im.width-side)*+$('#pfX').value,y=(im.height-side)*+$('#pfY').value;
  const g=c.getContext('2d');g.fillStyle='#eee8f7';g.fillRect(0,0,480,480);g.drawImage(im,x,y,side,side,0,0,480,480)}
$('#pfFile').onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;const im=new Image();
  im.onload=()=>{PF.img=im;$('#pfEdit').hidden=false;$('#pfPrev').innerHTML='<canvas width="480" height="480"></canvas>';pfDraw();$('#pfEdit').scrollIntoView({behavior:'smooth',block:'nearest'})};
  im.onerror=()=>toast("Je n'arrive pas à ouvrir cette image.");im.src=URL.createObjectURL(f)};
['#pfZoom','#pfY','#pfX'].forEach(x=>$(x).oninput=pfDraw);
function pfApply(){$('#pfPrev').innerHTML='';if(elyFace){elyFace.destroy();elyFace=null;$('#elyFace').innerHTML=''}if(CV.face){CV.face.destroy();CV.face=null;$('#cvFace').innerHTML=''}applyPrefs();renderPf();renderElyra()}
$('#pfSave').onclick=()=>{const c=$('#pfPrev canvas');if(!c)return;const d=c.toDataURL('image/jpeg',.86);PF.img=null;$('#pfEdit').hidden=true;setP(p=>p.portrait=d);pfApply();sparkle($('#pfPrev'));toast('Voilà le nouveau visage d’ELYRA.')};
$('#pfCancel').onclick=()=>{PF.img=null;$('#pfEdit').hidden=true;renderPf()};
$('#pfModes').onclick=e=>{const b=e.target.closest('[data-pf]');if(!b)return;const k=b.dataset.pf;if(k==='perso'){$('#pfFile').click();return}
  const go=()=>{setP(p=>p.portrait=k==='mascotte'?null:k);$('#pfPrev').innerHTML='';pfApply()};const cur=ST.prof.portrait;
  if(cur&&cur.startsWith('data:'))ask('Changer de visage ?','Ton image sera retirée de ce téléphone.','Oui',go);else go()};
let nT;$('#pName').oninput=e=>{clearTimeout(nT);nT=setTimeout(()=>setP(p=>p.name=e.target.value.trim().slice(0,40)),400)};
$('#pAnt').onchange=e=>setP(p=>p.anticip=e.target.checked);$('#pCtx').onchange=e=>setP(p=>p.ctxShare=e.target.checked);$('#pVoiceSel').onchange=e=>setP(p=>p.vname=e.target.value);
const TEST="Bonjour. Je suis la voix de tes séances. Prends ton temps, tu n'as rien à réussir.";
$('#pVoiceTest').onclick=()=>{SND.ctx();sessVoice=true;speak(TEST,true)};
$('#pPhoneTest').onclick=()=>{ttsSpeak(TEST,+ST.prof.rate||1)};
$('#pOffline').onclick=async()=>{const files=[...new Set(Object.values(VO.idx||{}).map(x=>`voix/${VO.v||VV()}/`+x[0]))];let done=0,fail=0;const msg=$('#pOfflineMsg');
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

/* ============ PROGRAMME TAG ============ */
const TAG=window.ELYRA_TAG;
const tagM=()=>{if(!ST.prof.tag||typeof ST.prof.tag!=='object')ST.prof.tag={cur:null,m:{}};if(!ST.prof.tag.m)ST.prof.tag.m={};return ST.prof.tag};
const SECS=[['learn','Comprendre'],['ex','Exercice'],['mise','Mise en situation'],['defi','Défi de la semaine'],['quiz','Quiz (facultatif)'],['synth','Ce que je retiens']];
const modSt=id=>tagM().m[id]||{};
const modDone=id=>{const s=modSt(id);return !!(s.fini||(s.ex&&s.synth))};
const modCount=id=>SECS.filter(([k])=>modSt(id)[k]).length;
function setSec(id,k,v){const t=tagM();t.m[id]=Object.assign({},t.m[id],{[k]:v===undefined?true:v});t.cur=id;save();
  const S=modSt(id);$$('#tagBox [data-ok]').forEach(e=>{const kk=e.dataset.ok;e.textContent=kk==='quiz'?(S.quiz||''):(S[kk]?'✓':'')});try{renderHomeTag()}catch(e){}}
let tagOpen=null;
function openMod(id){tagOpen=id;setP(p=>{tagM();p.tag.cur=id});location.hash='programme';renderProgramme();window.scrollTo(0,0)}
/* schémas */
const T=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-size="${o.fs||12}" font-weight="${o.w||400}" fill="${o.c||'var(--ink)'}">${String(s).split('|').map((l,i)=>`<tspan x="${x}" dy="${i?15:0}">${esc(l)}</tspan>`).join('')}</text>`;
const ARW='<defs><marker id="ta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--soft)"/></marker></defs>';
function svgCycle(L,center){const P=[[170,38],[282,125],[170,212],[58,125]];
  const node=([x,y],l)=>`<rect x="${x-62}" y="${y-22}" width="124" height="44" rx="22" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>${T(x,y+(l.includes('|')?-3:4),l)}`;
  return `<svg viewBox="0 0 340 250" role="img" aria-label="Schéma en cercle">${ARW}<circle cx="170" cy="125" r="44" fill="var(--lavs)"/>${T(170,center.includes('|')?121:129,center,{fs:12,w:600,c:'var(--lavd)'})}
   <g fill="none" stroke="var(--soft)" stroke-width="1.4" marker-end="url(#ta)"><path d="M232 46 Q282 52 282 101"/><path d="M282 149 Q282 200 234 206"/><path d="M106 206 Q58 200 58 149"/><path d="M58 101 Q58 50 107 45"/></g>
   ${P.map((p,i)=>node(p,L[i])).join('')}</svg>`}
const SCHEMAS={
 cycle1:()=>svgCycle(['Déclencheur','« Et si… »','Émotions|et sensations','Éviter,|vérifier'],'Soulagement|court'),
 cycle3:()=>svgCycle(['Une sensation','Attention|fixée','Inquiétude','Vérifier'],'Sensation|amplifiée'),
 defusion:()=>`<svg viewBox="0 0 340 230" role="img" aria-label="Prendre de la distance avec une pensée">
   <circle cx="44" cy="62" r="22" fill="var(--sage)"/><rect x="72" y="40" width="250" height="44" rx="22" fill="var(--lav)" opacity=".85"/>${T(197,67,'« Je vais tout rater »',{w:600})}${T(30,112,'Collé à la pensée : elle décide pour toi',{a:'start',fs:11.5,c:'var(--soft)'})}
   <circle cx="44" cy="170" r="22" fill="var(--sage)"/><line x1="70" y1="170" x2="112" y2="170" stroke="var(--soft)" stroke-dasharray="3 5"/><rect x="116" y="148" width="210" height="44" rx="22" fill="var(--lavs)" stroke="var(--lav)"/>${T(221,166,"« J'ai la pensée que|je vais tout rater »",{fs:11.5})}${T(30,218,'Avec un peu de recul : elle passe',{a:'start',fs:11.5,c:'var(--soft)'})}</svg>`,
 incert:()=>`<svg viewBox="0 0 340 170" role="img" aria-label="De la certitude à la tolérance">${ARW}<line x1="40" y1="92" x2="300" y2="92" stroke="var(--soft)" stroke-width="1.6" marker-end="url(#ta)"/>
   ${T(30,40,'Besoin de|tout contrôler',{a:'start',w:600})}${T(310,40,'Tolérer|l’incertitude',{a:'end',w:600,c:'var(--saged)'})}
   ${[[86,'Ne pas|relire'],[170,'Ne pas tout|planifier'],[254,'Choisir sans|être sûr']].map(([x,l])=>`<circle cx="${x}" cy="92" r="7" fill="var(--lav)"/>${T(x,122,l,{fs:11})}`).join('')}</svg>`,
 anticip:()=>`<svg viewBox="0 0 340 220" role="img" aria-label="La courbe de l'anticipation">
   <line x1="30" y1="180" x2="320" y2="180" stroke="var(--line)" stroke-width="1.5"/><line x1="30" y1="30" x2="30" y2="180" stroke="var(--line)" stroke-width="1.5"/>
   ${T(14,105,'Anxiété',{fs:10.5,c:'var(--soft)'}).replace('<text','<text transform="rotate(-90 14 105)"')}
   <line x1="190" y1="30" x2="190" y2="180" stroke="var(--champ)" stroke-dasharray="4 4"/>${T(190,24,'La situation',{fs:11,w:600})}
   <path d="M40 165 C100 150 150 60 185 52 C210 48 230 120 310 160" fill="none" stroke="var(--lavd)" stroke-width="2.4"/>
   <path d="M40 168 C100 156 140 92 176 74" fill="none" stroke="var(--warm)" stroke-width="2" stroke-dasharray="5 5"/>${T(176,70,'×',{fs:18,c:'var(--warm)',w:700})}
   ${T(70,200,'Avant',{fs:11,c:'var(--soft)'})}${T(190,200,'Pendant',{fs:11,c:'var(--soft)'})}${T(290,200,'Après',{fs:11,c:'var(--soft)'})}
   ${T(244,104,'Ça redescend',{fs:11,c:'var(--lavd)',a:'start'})}${T(42,44,'En pointillés : si on évite,|on ne voit jamais la descente',{fs:10.5,c:'var(--warm)',a:'start'})}</svg>`,
 echelle:()=>`<svg viewBox="0 0 340 210" role="img" aria-label="L'échelle d'exposition">
   ${[[2,0],[4,1],[5,2],[7,3],[9,4]].map(([d,i])=>{const x=24+i*60,h=36+i*30;return `<rect x="${x}" y="${190-h}" width="56" height="${h}" rx="8" fill="var(--sage)" opacity="${.35+i*.13}"/>${T(x+28,190-h+20,d+'/10',{fs:12,w:600,c:'var(--ink)'})}`}).join('')}
   ${T(24,22,'Une marche à la fois, à ton rythme',{a:'start',fs:12,w:600})}</svg>`,
 balance:()=>`<svg viewBox="0 0 340 200" role="img" aria-label="La balance d'énergie">
   <path d="M170 70 L150 180 H190 Z" fill="var(--champ)"/><line x1="60" y1="84" x2="280" y2="62" stroke="var(--soft)" stroke-width="3" stroke-linecap="round"/>
   <path d="M30 120 Q60 140 90 120 Z" fill="var(--warms)" stroke="var(--warm)"/><line x1="60" y1="84" x2="36" y2="120" stroke="var(--soft)"/><line x1="60" y1="84" x2="84" y2="120" stroke="var(--soft)"/>
   <path d="M250 98 Q280 118 310 98 Z" fill="var(--sages)" stroke="var(--saged)"/><line x1="280" y1="62" x2="256" y2="98" stroke="var(--soft)"/><line x1="280" y1="62" x2="304" y2="98" stroke="var(--soft)"/>
   ${T(60,160,'Ce qui épuise',{fs:12,w:600,c:'var(--warm)'})}${T(280,138,'Ce qui ressource',{fs:12,w:600,c:'var(--saged)'})}${T(170,26,'Protéger ce qui recharge la batterie',{fs:12,w:600})}</svg>`,
 sommeil:()=>`<svg viewBox="0 0 340 230" role="img" aria-label="Le plan du soir">
   <path d="M300 34 a20 20 0 1 1 -16 32 a16 16 0 0 0 16 -32z" fill="var(--lav)"/><line x1="40" y1="30" x2="40" y2="210" stroke="var(--line)" stroke-width="2"/>
   ${[[44,'En début de soirée','Le moment d’inquiétude'],[90,'Avant le coucher','Le vide-tête, un rituel doux'],[136,'Au lit','Le lit, c’est pour dormir'],[182,'La nuit','Ne pas regarder l’heure']].map(([y,a,b],i)=>`<circle cx="40" cy="${y}" r="8" fill="${i<2?'var(--champ)':'var(--lav)'}"/>${T(60,y-2,a,{a:'start',fs:11,c:'var(--soft)'})}${T(60,y+14,b,{a:'start',fs:12.5,w:600})}`).join('')}</svg>`
};
/* champs d'exercice */
function fieldHTML(f,v){const id='tf-'+f.k,l=`<label class="f" for="${id}">${esc(G(f.l))}</label>`;
  if(f.t==='area')return `${l}<textarea id="${id}" data-k="${f.k}" maxlength="1500">${esc(v||'')}</textarea>`;
  if(f.t==='text')return `${l}<input type="text" id="${id}" data-k="${f.k}" maxlength="200" value="${esc(v||'')}">`;
  if(f.t==='scale'){const n=v==null?5:+v;return `<p class="f">${esc(G(f.l))} : <span data-sv="${f.k}">${n}</span>/10</p><input type="range" min="0" max="10" value="${n}" data-k="${f.k}" data-scale="1" aria-label="${esc(G(f.l))}">`}
  if(f.t==='chips'||f.t==='one'){const a=Array.isArray(v)?v:(v?[v]:[]);return `<p class="f">${esc(G(f.l))}</p><div class="row chips" data-k="${f.k}" data-one="${f.t==='one'?1:''}">${f.o.map(o=>`<button type="button" data-v="${esc(G(o))}" aria-pressed="${a.includes(G(o))}">${esc(G(o))}</button>`).join('')}</div>`}
  if(f.t==='steps'){const a=Array.isArray(v)&&v.length?v:[{t:'',d:3},{t:'',d:5},{t:'',d:8}];return `<p class="f">${esc(G(f.l))}</p><div class="steps" data-k="${f.k}">${a.map(stepRow).join('')}</div><button type="button" class="ghost mt" data-addstep="1">Ajouter une étape</button>`}
  if(f.t==='up')return `${l}<input type="date" id="${id}" data-k="${f.k}" value="${esc(v||'')}">`;
  return ''}
const stepRow=s=>`<div class="steprow"><input type="text" maxlength="120" placeholder="Une étape" value="${esc(s.t||'')}" aria-label="Étape"><input type="range" min="0" max="10" value="${+s.d||0}" aria-label="Difficulté"><b>${+s.d||0}</b></div>`;
function readForm(box,M){const ans={};for(const f of M.ex.f){
  if(f.t==='chips'||f.t==='one')ans[f.k]=[...box.querySelectorAll(`[data-k="${f.k}"] button[aria-pressed=true]`)].map(b=>b.dataset.v);
  else if(f.t==='steps')ans[f.k]=[...box.querySelectorAll(`[data-k="${f.k}"] .steprow`)].map(r=>({t:r.querySelector('input[type=text]').value.trim().slice(0,120),d:+r.querySelector('input[type=range]').value})).filter(s=>s.t);
  else{const el=box.querySelector(`[data-k="${f.k}"]`);ans[f.k]=el?(f.t==='scale'?+el.value:el.value.trim().slice(0,1500)):''}
  if(f.t==='one')ans[f.k]=ans[f.k][0]||''}
  return ans}
const lastEx=id=>ST.items.find(x=>x.kind==='tag'&&x.mod===id);
let tagRendered=null;
function renderProgramme(){const box=$('#tagBox');if(!box)return;const keep=tagOpen&&tagRendered===tagOpen?[...box.querySelectorAll('details.sec[open]')].map(d=>d.dataset.sec):null;tagRendered=tagOpen;
  if(!tagOpen){const done=TAG.mods.filter(m=>modDone(m.id)).length;
    box.innerHTML=`<h1>Programme TAG</h1><p class="sub">${esc(TAG.intro)}</p>
     <div class="card qcard"><p class="quote" style="margin:0">${esc(TAG.devise)}</p></div>
     <div class="card flat"><div class="row between"><b>${done} module(s) terminé(s) sur ${TAG.mods.length}</b><span class="note" style="margin:0">Aucune durée imposée</span></div><div class="prog mt"><div class="bar"><i style="width:${done/TAG.mods.length*100}%"></i></div></div></div>
     <div class="list">${TAG.mods.map((m,i)=>{const c=modCount(m.id),d=modDone(m.id);return `<div class="item" aria-current="${tagM().cur===m.id}"><button class="go" data-mod="${m.id}">${covHTML(m.c)}<span><span class="meta" style="margin:0 0 2px">Module ${i+1}${d?' · terminé':c?` · ${c}/${SECS.length}`:''}</span><h3>${esc(m.n)}</h3><p>${esc(m.d)}</p></span></button></div>`}).join('')}</div>
     <p class="note">${esc(TAG.note)}</p>`;return}
  const i=TAG.mods.findIndex(m=>m.id===tagOpen),M=TAG.mods[i],S=modSt(M.id),last=lastEx(M.id),A=last?last.ans:{};
  const chk=k=>`<span class="ok" data-ok="${k}">${S[k]?'✓':''}</span>`;
  const quizHTML=M.quiz.map((q,qi)=>`<fieldset class="qz" data-q="${qi}"><legend>${qi+1}. ${esc(G(q.q))}</legend>${q.o.map((o,oi)=>`<label class="qo"><input type="radio" name="q${qi}" value="${oi}"> <span>${esc(G(o))}</span></label>`).join('')}<p class="qe" hidden></p></fieldset>`).join('');
  box.innerHTML=`<button class="back" id="tagBack">‹ Tous les modules</button>
   <div class="card" style="background:linear-gradient(135deg,var(--lavs),var(--champs));border:0"><div class="row" style="gap:14px;flex-wrap:nowrap">${covHTML(M.c)}<div><span class="tag lav">Module ${i+1} sur ${TAG.mods.length}</span><h1 class="mt" style="font-size:1.7rem">${esc(M.n)}</h1></div></div>
     <p class="mt" style="font-weight:600">Objectifs</p><ul class="obj">${M.obj.map(o=>`<li>${esc(G(o))}</li>`).join('')}</ul></div>
   <details class="sec" data-sec="learn" ${S.learn?'':'open'}><summary>1. Comprendre ${chk('learn')}</summary><div class="sbody">
     ${M.learn.map(x=>Array.isArray(x)?`<div class="blk"><b>${esc(x[0])}</b><p>${esc(G(x[1]))}</p></div>`:`<p>${esc(G(x))}</p>`).join('')}
     <figure class="schema">${SCHEMAS[M.schema]?SCHEMAS[M.schema]():''}</figure>
     <button class="ghost mt" data-secdone="learn">J'ai lu</button></div></details>
   <details class="sec" data-sec="ex"><summary>2. Exercice : ${esc(M.ex.t)} ${chk('ex')}</summary><div class="sbody" id="tagEx">
     <p class="sub">${esc(G(M.ex.i))}</p>${M.ex.f.map(f=>fieldHTML(f,A[f.k])).join('')}
     <div class="row mt"><button class="main" id="tagExSave">Enregistrer</button><span class="note" id="tagExMsg" style="margin:0">${last?'Ton dernier exercice est prérempli : tu peux le refaire quand tu veux.':''}</span></div></div></details>
   <details class="sec" data-sec="mise"><summary>3. Mise en situation ${chk('mise')}</summary><div class="sbody">
     <p class="quote" style="font-size:1.08rem">${esc(G(M.mise.t))}</p><p class="mt" style="font-weight:600">${esc(G(M.mise.q))}</p>
     <textarea id="tagMise" maxlength="1000" placeholder="Ce que tu en penses (facultatif)">${esc(S.miseTxt||'')}</textarea>
     <button class="ghost mt" id="tagMiseGo">Voir une piste</button><div class="blk" id="tagMiseA" ${S.mise?'':'hidden'}><b>Une piste</b><p>${esc(G(M.mise.a))}</p></div></div></details>
   <details class="sec" data-sec="defi"><summary>4. Défi de la semaine ${chk('defi')}</summary><div class="sbody">
     <p>${esc(G(M.defi))}</p><p class="note">Sans obligation de réussite : essayer, c'est déjà avancer.</p>
     <button class="${S.defi?'ghost':'main'} mt" id="tagDefi">${S.defi?'Défi ajouté à mes objectifs':'Je relève le défi'}</button></div></details>
   <details class="sec" data-sec="quiz"><summary>5. Quiz (facultatif) <span class="ok" data-ok="quiz">${esc(S.quiz||'')}</span></summary><div class="sbody">
     <p class="sub">Pour vérifier ce que tu as compris. Ce n'est pas un test sur toi.</p>${quizHTML}<button class="main mt" id="tagQuiz">Vérifier mes réponses</button><p class="note" id="tagQuizMsg"></p></div></details>
   <details class="sec" data-sec="synth"><summary>6. Ce que je retiens ${chk('synth')}</summary><div class="sbody">
     <ul class="obj">${M.synth.map(o=>`<li>${esc(G(o))}</li>`).join('')}</ul>
     <label class="f" for="tagNote">Avec tes mots, ce que tu veux garder de ce module</label><textarea id="tagNote" maxlength="1500">${esc(S.note||'')}</textarea>
     <button class="main mt" id="tagNoteSave">Enregistrer</button>
     <p class="mt" style="font-weight:600">Pour aller plus loin</p><div class="row chips">${M.next.filter(x=>EX[x]).map(x=>`<button data-ex="${esc(x)}">${esc(EX[x])}</button>`).join('')}</div></div></details>
   <div class="row between mt2">${modDone(M.id)?'<span class="tag">Module terminé</span>':`<button class="ghost" id="tagFini">Marquer comme terminé</button>`}${i<TAG.mods.length-1?`<button class="main" data-mod="${TAG.mods[i+1].id}">Module suivant</button>`:''}</div>
   <p class="note">${esc(TAG.note)}</p>`;
  if(keep)box.querySelectorAll('details.sec').forEach(d=>d.open=keep.includes(d.dataset.sec));
  const id=M.id,ex=$('#tagEx');
  $('#tagBack').onclick=()=>{tagOpen=null;renderProgramme();window.scrollTo(0,0)};
  box.querySelectorAll('details.sec').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&d.dataset.sec==='learn'&&!modSt(id).learn)setSec(id,'learn')}));
  ex.addEventListener('click',e=>{const b=e.target.closest('.chips button');if(b){const wrap=b.parentElement;if(wrap.dataset.one)wrap.querySelectorAll('button').forEach(x=>x!==b&&x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')}
    if(e.target.closest('[data-addstep]')){const s=ex.querySelector('.steps');if(s.children.length<10)s.insertAdjacentHTML('beforeend',stepRow({t:'',d:5}))}});
  ex.addEventListener('input',e=>{const r=e.target;if(r.dataset.scale)ex.querySelector(`[data-sv="${r.dataset.k}"]`).textContent=r.value;if(r.closest('.steprow')&&r.type==='range')r.nextElementSibling.textContent=r.value});
  $('#tagExSave').onclick=()=>{const ans=readForm(ex,M);const filled=Object.values(ans).some(v=>Array.isArray(v)?v.length:(typeof v==='number'?false:!!v));
    if(!filled){$('#tagExMsg').textContent='Remplis au moins une partie, même brièvement.';return}
    const upF=M.ex.f.find(f=>f.t==='up');if(upF&&ans[upF.k]&&ans[upF.k]>=dkey()){const txt=(ans.sit||M.n).slice(0,140);setP(p=>{if(!p.up.some(u=>u.date===ans[upF.k]&&u.txt===txt))p.up.push({id:'u'+uid(),date:ans[upF.k],txt})})}
    addItem({kind:'tag',mod:id,ans});setSec(id,'ex');toast('Exercice enregistré dans ton journal.');haptic(20)};
  $('#tagMiseGo').onclick=()=>{$('#tagMiseA').hidden=false;setSec(id,'miseTxt',$('#tagMise').value.trim().slice(0,1000));setSec(id,'mise')};
  $('#tagDefi').onclick=e=>{if(modSt(id).defi)return;ST.prof.goals.push({id:'g'+uid(),txt:('Défi : '+G(M.defi)).slice(0,200),done:false});setSec(id,'defi');try{renderProgres()}catch(x){}
    e.target.textContent='Défi ajouté à mes objectifs';e.target.className='ghost mt';toast('Défi ajouté à tes objectifs (Mes progrès).')};
  $('#tagQuiz').onclick=()=>{let ok=0,ans=0;M.quiz.forEach((q,qi)=>{const fs=box.querySelector(`[data-q="${qi}"]`),r=fs.querySelector('input:checked'),e=fs.querySelector('.qe');if(!r)return;ans++;const good=+r.value===q.c;if(good)ok++;
      e.hidden=false;e.textContent=(good?'Oui. ':'Pas tout à fait. ')+G(q.e);e.className='qe '+(good?'good':'bad')});
    if(!ans){$('#tagQuizMsg').textContent='Choisis au moins une réponse.';return}$('#tagQuizMsg').textContent=`${ok} bonne(s) réponse(s) sur ${M.quiz.length}. L'important, ce sont les explications.`;setSec(id,'quiz',`${ok}/${M.quiz.length}`)};
  $('#tagNoteSave').onclick=()=>{const v=$('#tagNote').value.trim();setSec(id,'note',v.slice(0,1500));setSec(id,'synth');toast('Enregistré.')};
  const fb=$('#tagFini');if(fb)fb.onclick=()=>{setSec(id,'fini');renderProgramme();toast('Bravo pour ce module !');haptic(30)}}
$('#tagBox').addEventListener('click',e=>{const b=e.target.closest('[data-mod]');if(b)openMod(b.dataset.mod);const s=e.target.closest('[data-secdone]');if(s){setSec(tagOpen,s.dataset.secdone);toast('Noté.')}});
function renderHomeTag(){const el=$('#homeTag');if(!el)return;const t=tagM();const started=TAG.mods.filter(m=>modCount(m.id)>0);const done=TAG.mods.filter(m=>modDone(m.id)).length;
  if(!started.length){el.innerHTML=`<span class="tag lav">Programme TAG</span><h3 class="mt">Apprivoiser l'anxiété, pas à pas</h3><p class="sub">8 modules inspirés des TCC et de l'ACT, à ton rythme.</p><button class="main mt" data-mod="m1">Commencer le module 1</button>`;return}
  const cur=TAG.mods.find(m=>m.id===t.cur&&!modDone(m.id))||TAG.mods.find(m=>!modDone(m.id));
  el.innerHTML=cur?`<span class="tag lav">Programme TAG · ${done}/8 terminé(s)</span><h3 class="mt">Module ${TAG.mods.indexOf(cur)+1} : ${esc(cur.n)}</h3><p class="sub">${modCount(cur.id)}/${SECS.length} étapes faites. Reprends où tu en étais.</p><button class="main mt" data-mod="${cur.id}">Continuer</button>`
    :`<span class="tag lav">Programme TAG</span><h3 class="mt">Les 8 modules sont terminés</h3><p class="sub">Bravo pour ce chemin. Tu peux revenir sur n'importe quel module.</p><a class="btn ghost mt" href="#programme">Revoir le programme</a>`}
document.addEventListener('click',e=>{const b=e.target.closest('#homeTag [data-mod]');if(b)openMod(b.dataset.mod)});

/* ============ ÇA T'A AIDÉ ? (ELYRA apprend ce qui aide) ============ */
let helpIt=null,helpT;
function askHelp(it){if(!it||!it.ex)return;
  if($('#sos').classList.contains('on')){if(!sosUsed.includes(it.id))sosUsed.push(it.id);return}
  helpIt=it;$('#rateQ').textContent=G("Ça t'a aidé{e} ?");$('#rateL').textContent=EX[it.ex]||it.label||'';$('#rate').classList.add('on');
  clearTimeout(helpT);helpT=setTimeout(()=>$('#rate').classList.remove('on'),25000)}
$('#rate').onclick=e=>{const b=e.target.closest('[data-help]');
  if(b&&helpIt){const v=+b.dataset.help;helpIt.help=v;save();try{renderHome();renderOutils()}catch(x){}
    toast(v===2?'Noté. ELYRA te le proposera plus souvent.':v===1?'Noté, merci.':"Noté. ELYRA te proposera d'autres pistes.");haptic()}
  if(b||e.target.closest('[data-rateclose]')){$('#rate').classList.remove('on');helpIt=null}};
function helpStats(){const H={};for(const x of ST.items){if(x.help==null||!x.ex)continue;const h=H[x.ex]=H[x.ex]||{n:0,s:0,b:0};h.n++;h.s+=+x.help;if(+x.help===2)h.b++}
  for(const k in H)H[k].avg=H[k].s/H[k].n;return H}
function helpOf(id){if(!id)return null;const H=helpStats();
  if(id==='calme:respirer'||id==='calme:mediter'){const pre=id==='calme:respirer'?'br:':'med:';const a=Object.entries(H).filter(([k])=>k.startsWith(pre)).map(x=>x[1]);if(!a.length)return null;
    const n=a.reduce((x,y)=>x+y.n,0),s=a.reduce((x,y)=>x+y.s,0),b=a.reduce((x,y)=>x+y.b,0);return{n,s,b,avg:s/n}}
  return H[id]||null}
const helpAvg=id=>{const h=helpOf(id);return h?h.avg:1};
const helpCount=()=>ST.items.filter(x=>x.help!=null).length;
function helpTop(minB){return Object.entries(helpStats()).filter(([id,h])=>EX[id]&&h.avg>=1.4&&h.b>=(minB||1)).sort((a,b)=>b[1].avg-a[1].avg||b[1].n-a[1].n)}
function helpBadge(id){const h=helpOf(id);if(!h)return '';
  const t=h.avg>=1.5?"T'aide beaucoup":h.avg>=.9?"T'aide un peu":h.n>=2?'Pas trop pour toi':"Pas trop, la dernière fois";
  return `<span class="hb ${h.avg>=1.5?'good':h.avg<.9?'meh':''}">${esc(t)} · ${h.n} avis</span>`}
function personalise(list){const H=helpStats();const bad=id=>H[id]&&H[id].n>=2&&H[id].avg<.6;
  const top=helpTop(1).map(x=>x[0]).filter(id=>!list.includes(id)&&/^(br|med|story|sos|outil):/.test(id)&&!(slot()!=='nuit'&&/^story:/.test(id))).slice(0,2);
  const l=list.filter(x=>!bad(x)).map((x,i)=>[x,i]).sort((a,b)=>(helpAvg(b[0])-helpAvg(a[0]))||a[1]-b[1]).map(x=>x[0]);
  return [...l.slice(0,1),...top,...l.slice(1)]}
function bestBreath(){const b=Object.keys(PRESETS).map(k=>[k,helpOf('br:'+k)]).filter(([,h])=>h&&h.avg>=1.2).sort((a,b)=>b[1].avg-a[1].avg||b[1].n-a[1].n)[0];return b?b[0]:'coh'}

/* ============ BOÎTE À OUTILS ============ */
let outNeed=null;
const toolCat=id=>{const [k,v]=id.split(':');return k==='calme'?(v==='respirer'?'breath':'stress'):k==='pensee'?'visu':k==='expo'?'confiance':k==='journal'?'quotidien':k==='videtete'?'sommeil':catOf(id)};
function renderOutils(){const box=$('#outBox');if(!box)return;const top=helpTop(1).slice(0,4);const P=ST.prof;
  let h=`<h1>Ma boîte à outils</h1><p class="sub">${esc(G("Tous les outils d'ELYRA au même endroit. Après chaque exercice, ELYRA te demande si ça t'a aidé{e} : elle apprend ce qui te convient, à toi, et te le propose en premier."))}</p>`;
  h+=top.length?`<div class="sect"><h2>Ce qui t'aide le plus</h2></div><div class="tiles">${top.map(([id])=>tileHTML(id)).join('')}</div>`
    :`<div class="card flat"><p style="margin:0">${esc(G("Pas encore assez de réponses pour savoir ce qui t'aide le plus. Après un exercice, réponds simplement « Pas trop », « Un peu » ou « Beaucoup » : ça suffit."))}</p></div>`;
  if(P.soucis.length){const r=P.rem.soucis;h+=`<div class="card" style="background:var(--lavs)"><span class="tag lav">Ma boîte à soucis</span><h3 class="mt">${P.soucis.length} inquiétude(s) rangée(s)</h3>
    <p class="sub">À regarder pendant ton moment d'inquiétude${r&&r.on?` (${esc(r.h||'18:00')})`:''}, pas avant. Si l'une n'est plus d'actualité, tu peux la laisser partir.</p>
    <details class="sz"><summary>C'est mon moment d'inquiétude</summary>${P.soucis.map(w=>`<div class="entry"><div><small>${esc(fmtD(w.t))}</small><p>${esc(w.txt)}</p>
      <div class="row"><button class="ghost" data-sz="probleme:${esc(w.id)}">Résoudre</button><button class="ghost" data-sz="defusion:${esc(w.id)}">Prendre du recul</button></div></div><button class="del" data-sz="del:${esc(w.id)}">Plus d'actualité</button></div>`).join('')}</details></div>`}
  h+=`<p class="mt2" style="font-weight:600">${esc(G("J'ai besoin d'un outil quand…"))}</p><div class="row chips" id="outNeeds">${O.besoins.map(([k,n])=>`<button data-need="${k}" aria-pressed="${outNeed===k}">${esc(G(n))}</button>`).join('')}</div>`;
  for(const grp of O.boite){const items=grp.i.filter(x=>!outNeed||x[4].includes(outNeed));if(!items.length)continue;
    h+=`<div class="sect"><h2>${esc(grp.g)}</h2></div><div class="list">${items.map(([id,n,u,src])=>`<div class="tool"><div class="th">${covHTML(toolCat(id))}<div><h3>${esc(n)}</h3><span class="src">${esc(src)}</span></div></div>
      <p>${esc(G(u))}</p><div class="row between">${helpBadge(id)||'<span></span>'}<button class="ghost" data-ex="${esc(id)}">Ouvrir</button></div></div>`).join('')}</div>`}
  h+=`<p class="note">Ces outils s'inspirent des thérapies cognitives et comportementales (TCC), de la thérapie d'acceptation et d'engagement (ACT), de la relaxation et de la pleine conscience. Ils ne remplacent pas un accompagnement par un professionnel.</p>`;
  box.innerHTML=h}
$('#outBox').addEventListener('click',e=>{const n=e.target.closest('[data-need]');if(n){outNeed=outNeed===n.dataset.need?null:n.dataset.need;renderOutils();return}
  const z=e.target.closest('[data-sz]');if(z){const [a,id]=z.dataset.sz.split(':');const w=ST.prof.soucis.find(x=>x.id===id);if(!w)return;
    if(a==='del'){setP(p=>p.soucis=p.soucis.filter(x=>x.id!==id));toast('Elle est partie. Bravo.')}
    else{setP(p=>p.soucis=p.soucis.filter(x=>x.id!==id));openTool(a,'view',a==='probleme'?{pb:w.txt}:{p:w.txt})}}});

/* ============ OUTILS GUIDÉS ============ */
const TR={k:null,i:0,ans:{},ctx:'view',iv:null};
function toolStop(){clearInterval(TR.iv);TR.iv=null}
function openTool(k,ctx,pre){const T=O.tools[k];if(!T)return;toolStop();Object.assign(TR,{k,i:0,ans:Object.assign({},pre||{}),ctx:ctx||'view'});
  if(TR.ctx!=='sos'){if(cur()!=='outil')location.hash='outil';window.scrollTo(0,0)}toolDraw()}
function toolRender(html){if(TR.ctx==='sos'){sosRender(html,true);return}const b=$('#toolBox');b.innerHTML=html;const h=b.querySelector('h2');if(h){h.setAttribute('tabindex','-1');try{h.focus({preventScroll:true})}catch(e){}}}
const tval=v=>Array.isArray(v)?v.join(', '):String(v);
const tsub=s=>esc(G(s)).replace(/\{(\w+)\}/g,(m,k)=>{const v=TR.ans[k];return v!=null&&v!==''&&!(Array.isArray(v)&&!v.length)?`<b>${esc(tval(v))}</b>`:'…'});
const tps=a=>(a||[]).map(x=>`<p>${tsub(x)}</p>`).join('');
const riverHTML=()=>`<div class="river" id="river" role="img" aria-label="Une rivière où flottent tes pensées"><span class="leaf" style="top:38%">${esc(TR.ans.p||'ma pensée')}</span></div><p class="note">Touche la rivière pour poser une nouvelle feuille.</p>`;
const timerHTML=sec=>`<div class="tmr" id="tmr" style="--p:0"><b id="tmrV">${sec}</b><span>secondes</span></div><div class="row center"><button class="sage" id="tmGo" data-s="${sec}">Lancer le minuteur</button></div>`;
function matrixHTML(A){const c=(k,l)=>`<div class="mxc"><small>${l}</small><p>${A[k]?esc(A[k]):'…'}</p></div>`;
  return `<div class="mx"><div class="mxh">Ce qui m'éloigne</div><div class="mxh">Ce qui me rapproche</div>${c('loin','Ce que je fais')}${c('vers','Ce que je fais')}${c('int','Ce qui se passe en moi')}${c('qui','Ce qui compte pour moi')}</div>
   <p class="note">En haut : ce qui se voit. En bas : ce qui se passe à l'intérieur.</p>`}
function toolDraw(){toolStop();const T=O.tools[TR.k];if(!T)return;const N=T.s.length,st=T.s[TR.i],A=TR.ans;let b='';
  const lab=st.l?`<p class="sub">${tsub(st.l)}</p>`:'';
  if(st.t==='txt')b=`<h2>${tsub(st.h)}</h2>${tps(st.p)}${st.note?`<p class="note warnn">${esc(G(st.note))}</p>`:''}`;
  else if(st.t==='in')b=`<h2>${tsub(st.h)}</h2>${lab}${st.area?`<textarea id="trIn" maxlength="1500" placeholder="${esc(G(st.ph||''))}" aria-label="${esc(G(st.h))}">${esc(A[st.k]||'')}</textarea>`:`<input type="text" id="trIn" maxlength="200" placeholder="${esc(G(st.ph||''))}" value="${esc(A[st.k]||'')}" aria-label="${esc(G(st.h))}">`}`;
  else if(st.t==='scale'){const v=A[st.k]!=null?A[st.k]:5;b=`<h2>${tsub(st.h)}</h2>${lab}<p class="bigv"><span id="trV">${v}</span>/10</p><input type="range" id="trR" min="0" max="10" value="${v}" aria-label="${esc(G(st.h))}">`}
  else if(st.t==='one'||st.t==='chips'){const a=Array.isArray(A[st.k])?A[st.k]:(A[st.k]?[A[st.k]]:[]);b=`<h2>${tsub(st.h)}</h2>${lab}<div class="row chips mt" id="trCh" data-one="${st.t==='one'?1:''}">${st.o.map(o=>`<button type="button" data-v="${esc(G(o))}" aria-pressed="${a.includes(G(o))}">${esc(G(o))}</button>`).join('')}</div>`}
  else if(st.t==='pick')b=`<h2>${tsub(st.h)}</h2>${lab}<div class="sitg">${st.o.map((o,i)=>`<button class="opt" data-pick="${i}" aria-pressed="${A[st.k]===i}"><b>${esc(G(o.n))}</b></button>`).join('')}</div>`;
  else if(st.t==='picked'){const pk=T.s.find(x=>x.t==='pick'&&x.k===st.k);const o=pk.o[A[st.k]||0];b=`<h2>${esc(G(o.n))}</h2>${tps(o.p)}${o.anim==='leaf'?riverHTML():''}${o.timer?timerHTML(o.timer):''}`}
  else if(st.t==='timer')b=`<h2>${tsub(st.h)}</h2>${tps(st.p)}${timerHTML(st.s)}`;
  else if(st.t==='matrix')b=`<h2>Ta boussole</h2>${matrixHTML(A)}`;
  else if(st.t==='cercle')b=cercleHTML(A);
  else if(st.t==='bio')b=bioHTML();
  else if(st.t==='sum'){let c='';if(st.cmp){const [x,y,t]=st.cmp;if(A[x]!=null&&A[y]!=null)c=`<p class="bigv sm">${tsub(t)}</p>`}
    const sh=st.show?`<div class="sumlist">${st.show.filter(([k])=>A[k]!=null&&A[k]!==''&&!(Array.isArray(A[k])&&!A[k].length)).map(([k,l])=>`<div><small>${esc(l)}</small><p>${esc(tval(A[k]))}</p></div>`).join('')}</div>`:'';
    const g=st.goal&&A[st.goal]?`<button class="ghost mt" id="trGoal">Ajouter à mes objectifs</button>`:'';
    b=`<h2>${tsub(st.h)}</h2>${c}${sh}${tps(st.p)}${g}`}
  const last=TR.i===N-1;
  toolRender(`${TR.ctx==='sos'?'':`<span class="tag lav">${esc(T.n)}</span>`}<div class="dots mt">${T.s.map((_,i)=>`<i class="${i<=TR.i?'on':''}"></i>`).join('')}</div>
   <div class="card tstepc">${b}</div><div class="row between mt"><button class="ghost" id="trPrev" ${TR.i===0?'disabled':''}>Précédent</button>${st.t==='pick'?'<span></span>':`<button class="main" id="trNext">${last?'Terminer':'Suivant'}</button>`}</div><p class="note" id="trMsg" role="status"></p>`);
  if(st.t==='bio')bioInit(A);
  const R=$('#trR');if(R)R.oninput=e=>{$('#trV').textContent=e.target.value};
  const ch=$('#trCh');if(ch)ch.onclick=e=>{const x=e.target.closest('button');if(!x)return;if(ch.dataset.one)ch.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',y===x&&y.getAttribute('aria-pressed')!=='true'));else x.setAttribute('aria-pressed',x.getAttribute('aria-pressed')!=='true')};
  $$('[data-pick]').forEach(x=>x.onclick=()=>{TR.ans[st.k]=+x.dataset.pick;TR.i++;toolDraw()});
  const rv=$('#river');if(rv)rv.onclick=e=>{const r=rv.getBoundingClientRect();const l=document.createElement('span');l.className='leaf';l.textContent=TR.ans.p||'ma pensée';
    l.style.top=Math.max(8,Math.min(72,((e.clientY-r.top)/(r.height||1))*100||40))+'%';rv.appendChild(l);l.addEventListener('animationend',()=>l.remove());haptic()};
  const tg=$('#tmGo');if(tg)tg.onclick=()=>{toolStop();let s=+tg.dataset.s;const tot=s;tg.hidden=true;SND.ctx();
    TR.iv=setInterval(()=>{const v=$('#tmrV');if(!v){toolStop();return}s--;v.textContent=Math.max(0,s);$('#tmr').style.setProperty('--p',(tot-s)/tot);
      if(s<=0){toolStop();SND.bell();v.textContent='✓';const n=$('#trMsg');if(n)n.textContent="C'est fini. Prends ton temps avant de continuer."}},1000)};
  const gl=$('#trGoal');if(gl)gl.onclick=()=>{const t=String(A[st.goal]).slice(0,120);setP(p=>{if(!p.goals.some(g=>g.txt===t))p.goals.push({id:'g'+uid(),txt:t,done:false})});gl.outerHTML='<p class="note">Ajouté à tes objectifs (Mes progrès).</p>'};
  $('#trPrev').onclick=()=>{toolRead();if(TR.i>0){TR.i--;toolDraw()}};
  const nx=$('#trNext');if(nx)nx.onclick=()=>{toolRead();if(st.t==='in'&&st.req&&!String(A[st.k]||'').trim()){$('#trMsg').textContent='Écris quelques mots, même imparfaits.';return}
    if(last)toolFinish();else{TR.i++;toolDraw();if(TR.ctx!=='sos')window.scrollTo(0,0)}}}
function toolRead(){const T=O.tools[TR.k],st=T.s[TR.i];if(!st||!st.k)return;
  if(st.t==='in'){const i=$('#trIn');if(i)TR.ans[st.k]=i.value.trim().slice(0,1500)}
  else if(st.t==='scale'){const r=$('#trR');if(r)TR.ans[st.k]=+r.value}
  else if(st.t==='one'||st.t==='chips'){const v=$$('#trCh button[aria-pressed=true]').map(b=>b.dataset.v);TR.ans[st.k]=st.t==='one'?(v[0]||''):v}}
/* biofeedback respiratoire */
function bioHTML(){return `<h2>Respire avec la goutte</h2><p class="sub">Appuie et garde le doigt pendant que tu inspires. Relâche pendant que tu expires. Fais au moins une dizaine de respirations.</p>
  <div class="bio"><div class="biom" id="bioM"></div><button type="button" class="biop" id="bioP">Appuie pour inspirer</button></div>
  <div class="biostats"><div><b id="bioR">–</b><small>respirations par minute</small></div><div><b id="bioX">–</b><small>expiration ÷ inspiration</small></div><div><b id="bioN">0</b><small>respirations</small></div></div>
  <div class="biog" aria-hidden="true"><span class="zone"></span><i id="bioG"></i></div><p class="biol"><span>Rapide</span><span style="margin-right:7%">Apaisant</span></p>
  <p class="note" id="bioT" aria-live="polite">Fais d'abord quelques respirations naturelles.</p>`}
function bioInit(A){const P=$('#bioP');if(!P)return;const M=window.ElyraMascotte?ElyraMascotte.create($('#bioM'),'respiration'):null;if(M){M.extBr=0}
  const cy=[];let t0=0,tx=0,down=false;const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const upd=()=>{const L=cy.slice(-4);$('#bioN').textContent=cy.length;if(L.length<2)return;const ins=avg(L.map(c=>c.i)),exs=avg(L.map(c=>c.e)),r=60/(ins+exs),x=exs/ins;
    $('#bioR').textContent=r.toFixed(1);$('#bioX').textContent=x.toFixed(1);$('#bioG').style.left=Math.max(0,Math.min(100,(16-r)/12*100))+'%';
    if(cy.length>=3&&A.r0==null)A.r0=+r.toFixed(1);if(A.r0!=null)A.r1=+r.toFixed(1);
    $('#bioT').textContent=r>9?"Ralentis un peu : allonge surtout l'expiration, sans forcer.":x<1.25?"Essaie d'expirer un peu plus longtemps que tu n'inspires.":r<4.5?"Pas besoin d'aller si lentement : reste confortable.":"C'est le rythme qui apaise. Continue comme ça.";
    if(r>=5&&r<=7.5&&x>=1.25&&M&&!M._ok){M._ok=1;M.set('joie');setTimeout(()=>{if(M.state==='joie')M.set('respiration')},1800)}};
  const start=e=>{e.preventDefault();if(down)return;down=true;const now=performance.now();if(tx&&cy.length&&cy[cy.length-1].e==null)cy[cy.length-1].e=(now-tx)/1000;
    if(cy.length&&cy[cy.length-1].e!=null)upd();t0=now;P.classList.add('on');P.textContent='Inspire… relâche pour expirer';const L=cy.slice(-3);if(M)M.brT={from:M.extBr||0,to:1,t0:now,d:L.length?avg(L.map(c=>c.i)):4};haptic(8)};
  const end=e=>{e&&e.preventDefault();if(!down)return;down=false;const now=performance.now(),i=(now-t0)/1000;if(i<.4){P.classList.remove('on');return}
    cy.push({i,e:null});tx=now;P.classList.remove('on');P.textContent='Expire… appuie pour inspirer';const L=cy.filter(c=>c.e!=null).slice(-3);if(M)M.brT={from:M.extBr||1,to:0,t0:now,d:L.length?avg(L.map(c=>c.e)):5}};
  P.addEventListener('pointerdown',start);P.addEventListener('pointerup',end);P.addEventListener('pointercancel',end);P.addEventListener('pointerleave',end);P.addEventListener('contextmenu',e=>e.preventDefault());
  P.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')start(e)});P.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')end(e)})}
/* le cercle anxieux, dessiné avec tes réponses */
function cercleHTML(A){const t=(x,n)=>{const v=Array.isArray(x)?x.join(', '):String(x||'…');return v.length>n?v.slice(0,n-1)+'…':v};
  const N=[['Situation',t(A.dec,46),'#4F7DA8'],['Pensée de danger',t(A.pen,52),'#7966D9'],['Sensations',t(A.sen,48),'#F28C83'],['Ce que je fais',t(A.act,52),'#2E9B8E']];
  return `<h2>Ton cercle</h2><div class="cercle">${N.map(([h,v,c],i)=>`<div class="cn n${i}" style="--cc:${c}"><small>${h}</small><p>${esc(G(v))}</p></div>`).join('')}<svg class="ca" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14 A36 36 0 1 1 49.9 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M84 46 l2 5 l3-4.5M54 87 l-5 2 l4.5 3M14 54 l-2-5 l-3 4.5M46 13 l5-2 l-4.5-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><div class="cmid">La peur<br>se renforce</div></div>
   <p class="sub mt">${esc(G("Ce que tu fais soulage sur le moment. Mais ton cerveau retient que c'était dangereux, et la peur revient, souvent plus vite."))}</p>
   <div class="blk"><b>Où casser la boucle</b><p>La pensée : la regarder avec du recul (Démêler une pensée, ou avec ELYRA).</p><p>Les sensations : apprendre qu'elles ne sont pas dangereuses (Tolérer les sensations).</p><p>Ce que tu fais : réduire les comportements de sécurité, et t'exposer pas à pas (Coach d'exposition).</p><p class="note">Tous ces outils sont dans « Apprivoiser l'anxiété ».</p></div>`}
function renderTcc(){const box=$('#tccBox');if(!box||!C.tcc)return;
  box.innerHTML=C.tcc.map(([h,d,items])=>`<div class="sect"><h2>${esc(h)}</h2></div><p class="sub" style="margin-top:4px">${esc(G(d))}</p><div class="list">${items.filter(([id])=>EX[id]).map(([id,dd])=>{const [k,v]=id.split(':'),key=(k==='med'||k==='story')?v:null,cat=k==='outil'&&O.tools[v]?O.tools[v].c:k==='tcc'?'stress':catOf(id);
    return `<div class="item"><button class="go" data-ex="${esc(id)}">${covHTML(cat,'',key)}<span><h3>${esc(G(EX[id]))}</h3><p>${esc(G(dd))}</p></span></button></div>`}).join('')}</div>`).join('')}
function toolFinish(){const k=TR.k,T=O.tools[k],A=TR.ans,ctx=TR.ctx;const sum=T.s.find(x=>x.t==='sum');toolStop();TR.k=null;
  if(sum&&sum.souci&&A[sum.souci])ST.prof.soucis.push({id:'w'+uid(),t:Date.now(),txt:String(A[sum.souci]).slice(0,200)});
  const it=addItem({kind:'outil',ex:'outil:'+k,tool:k,label:T.n,min:T.min,ans:A});
  if(ctx==='sos'){sosUsed.push(it.id);sosEnd()}else{location.hash='outils';toast(sum&&sum.souci?'Rangée dans ta boîte à soucis.':'Enregistré dans ton journal.');setTimeout(()=>askHelp(it),400)}}
function entryExtra(x){
  if(x.kind==='outil'){const T=O.tools[x.tool];if(!T)return `<p><b>${esc(x.label||'Outil')}</b></p>`;const A=x.ans||{};
    const lines=T.s.filter(s=>s.k&&A[s.k]!=null&&A[s.k]!==''&&!(Array.isArray(A[s.k])&&!A[s.k].length)&&s.t!=='picked').map(s=>{let v=A[s.k];if(s.t==='pick')v=G(s.o[v]?s.o[v].n:'');else if(s.t==='scale')v=v+'/10';return `<p class="sub" style="margin:2px 0 0"><b>${esc(G(s.h))}</b> ${esc(tval(v))}</p>`}).slice(0,5).join('');
    return `<p><b>${esc(T.n)}</b></p>${lines}`}
  if(x.kind==='expo')return `<p><b>Exposition</b> · ${esc(x.step||'')}</p><p class="sub" style="margin:2px 0 0">Anxiété prévue ${+x.pred}/10 · au plus fort ${+x.peak}/10${x.stopped?' · arrêtée en cours':''}</p>${x.appris?`<p><b>Ce que j'en retiens :</b> ${esc(x.appris)}</p>`:''}`;
  if(x.kind==='corps'){const Z=O.corps.zones;return `<p><b>${esc((x.zones||[]).map(z=>(Z.find(y=>y[0]===z)||[0,z])[1]).join(', ')||'Sensation')}</b>${x.sens&&x.sens.length?' · '+esc(x.sens.join(', ')):''}</p>
    <p class="sub" style="margin:2px 0 0">Intensité ${+x.i}/10${x.ctx&&x.ctx.length?' · '+esc(x.ctx.join(', ')):''}${x.verif==='oui'?' · déjà vérifié par un médecin':''}</p>${x.note?`<p style="white-space:pre-wrap">${esc(x.note)}</p>`:''}`}
  return ''}

/* ============ COACH D'EXPOSITION ============ */
const XP={mode:'list',sid:null,ph:0,tr:{},iv:null,t0:0};
const EXPO=()=>ST.prof.expo;
const xpSorted=()=>EXPO().steps.slice().sort((a,b)=>a.d-b.d);
function xpStop(){clearInterval(XP.iv);XP.iv=null}
function openExpo(){xpStop();XP.mode=EXPO().steps.length?'list':'edit';location.hash='expo';renderExpo();window.scrollTo(0,0)}
function renderExpo(){const box=$('#expoBox');if(!box)return;const E=EXPO(),X=O.expo;$('#expoBack').textContent=XP.mode==='try'||XP.mode==='edit'&&E.steps.length?'‹ Mon échelle':'‹ Boîte à outils';
  if(XP.mode==='edit'){const m6=lastEx('m6');const imp=m6&&m6.ans&&Array.isArray(m6.ans.steps)&&m6.ans.steps.length&&!E.steps.length;
    const rows=E.steps.length?xpSorted():[{t:'',d:2},{t:'',d:4},{t:'',d:6},{t:'',d:8}];
    box.innerHTML=`<h1>Coach d'exposition</h1><p class="sub">${esc(X.intro)}</p><div class="warnb soft"><p style="margin:0">${esc(G(X.secu))}</p></div>
     ${imp?`<div class="card flat"><p style="margin:0">Tu as déjà construit une échelle dans le module 6 du programme TAG.</p><button class="ghost mt" id="xpImp">La reprendre ici</button></div>`:''}
     <div class="card"><h2>Mon échelle</h2><label class="f" for="xpBut">Ton objectif</label><input type="text" id="xpBut" maxlength="160" value="${esc(E.but||'')}" placeholder="Ex. Reprendre le train pour aller travailler">
      <p class="f mt">Les marches, avec leur difficulté (0 facile, 10 très difficile)</p><div class="steps" id="xpSteps">${rows.map(stepRow).join('')}</div>
      <button type="button" class="ghost mt" id="xpAdd">Ajouter une marche</button>
      <div class="row mt"><button class="main" id="xpSave">Enregistrer mon échelle</button>${E.steps.length?'<button class="ghost" id="xpCancel">Annuler</button>':''}</div><p class="note" id="xpMsg" role="status"></p></div>`;
    const ib=$('#xpImp');if(ib)ib.onclick=()=>{$('#xpBut').value=m6.ans.but||'';$('#xpSteps').innerHTML=m6.ans.steps.map(stepRow).join('')};
    $('#xpAdd').onclick=()=>$('#xpSteps').insertAdjacentHTML('beforeend',stepRow({t:'',d:5}));
    const cc=$('#xpCancel');if(cc)cc.onclick=()=>{XP.mode='list';renderExpo()};
    $('#xpSave').onclick=()=>{const rs=$$('#xpSteps .steprow').map(r=>({t:r.querySelector('input[type=text]').value.trim().slice(0,120),d:+r.querySelector('input[type=range]').value})).filter(s=>s.t);
      if(!rs.length){$('#xpMsg').textContent='Ajoute au moins une marche.';return}
      setP(p=>{const old=p.expo.steps;p.expo.but=$('#xpBut').value.trim().slice(0,160);p.expo.steps=rs.map(s=>{const o=old.find(x=>x.t===s.t);return o?Object.assign(o,{d:s.d}):{id:'x'+uid(),t:s.t,d:s.d,tries:[],done:false}})});
      XP.mode='list';renderExpo();toast('Ton échelle est prête. Commence par la marche la plus facile.')};return}
  if(XP.mode==='try')return xpTry();
  const S=xpSorted();const next=S.find(s=>!s.done);
  box.innerHTML=`<h1>Coach d'exposition</h1>${E.but?`<div class="card qcard"><span class="tag">Mon objectif</span><h3 class="mt">${esc(E.but)}</h3></div>`:''}
   <div class="ladder">${S.slice().reverse().map(s=>{const l=s.tries[s.tries.length-1];return `<div class="rung ${s.done?'done':''} ${next&&s.id===next.id?'next':''}"><div class="rd">${+s.d}/10</div>
     <div class="rt"><b>${esc(s.t)}</b><small>${s.done?'Apprivoisée · ':''}${s.tries.length?`${s.tries.length} essai(s) · dernier : prévu ${+l.pred}, ressenti ${+l.peak}`:'Pas encore essayée'}</small></div>
     <button class="${next&&s.id===next.id?'main':'ghost'}" data-xgo="${esc(s.id)}">${s.tries.length?'Refaire':'Je me lance'}</button></div>`}).join('')}</div>
   <p class="note">${next?esc(G("Commence par la marche la plus facile, et répète-la jusqu'à ce qu'elle devienne plus légère. Tu avances à ton rythme : rien n'est obligatoire.")):esc(G('Toutes tes marches sont apprivoisées. Bravo pour ce chemin. Tu peux en ajouter de nouvelles.'))}</p>
   <div class="row"><button class="ghost" id="xpEdit">Modifier mon échelle</button><button class="ghost" data-ex="tag:m6">Relire le module 6</button></div>
   <div class="warnb soft"><p style="margin:0">${esc(G(X.secu))}</p></div>`;
  $('#xpEdit').onclick=()=>{XP.mode='edit';renderExpo()}}
$('#expoBox').addEventListener('click',e=>{const g=e.target.closest('[data-xgo]');if(g){XP.sid=g.dataset.xgo;XP.ph=0;XP.tr={pred:5,drop:[]};XP.mode='try';renderExpo();window.scrollTo(0,0)}});
$('#expoBox').addEventListener('input',e=>{const r=e.target.closest('.steprow input[type=range]');if(r)r.nextElementSibling.textContent=r.value});
$('#expoBack').onclick=()=>{xpStop();if(XP.mode==='try'||(XP.mode==='edit'&&EXPO().steps.length)){XP.mode='list';renderExpo()}else location.hash='outils'};
function xpTry(){const box=$('#expoBox'),X=O.expo,s=EXPO().steps.find(x=>x.id===XP.sid),T=XP.tr;if(!s){XP.mode='list';return renderExpo()}xpStop();
  const head=(t)=>`<span class="tag lav">${t}</span><h1 class="mt" style="font-size:1.7rem">${esc(s.t)}</h1><div class="dots mt">${[0,1,2,3].map(i=>`<i class="${i<=XP.ph?'on':''}"></i>`).join('')}</div>`;
  if(XP.ph===0){box.innerHTML=`${head('Avant')}<div class="card"><p style="font-weight:600;margin:0">L'anxiété que tu prévois : <span id="xpPv">${T.pred}</span>/10</p><input type="range" id="xpP" min="0" max="10" value="${T.pred}" aria-label="Anxiété prévue">
     <label class="f mt" for="xpF">Ce que tu crains qu'il se passe</label><input type="text" id="xpF" maxlength="200" value="${esc(T.fear||'')}" placeholder="Ex. Faire un malaise, ne pas pouvoir sortir">
     <p class="f mt">${esc(G('Un comportement de sécurité que tu peux essayer de laisser (facultatif)'))}</p><div class="row chips" id="xpD">${X.secur.map(o=>`<button type="button" data-v="${esc(G(o))}" aria-pressed="${T.drop.includes(G(o))}">${esc(G(o))}</button>`).join('')}</div></div>
     <p class="note">Ne lâche un comportement de sécurité que si tu te sens prêt{e}. Et jamais un traitement sans l'avis de ton médecin.</p>
     <button class="main" id="xpGo" style="width:100%">J'y vais</button>`.replace('prêt{e}',G('prêt{e}'));
    $('#xpP').oninput=e=>{T.pred=+e.target.value;$('#xpPv').textContent=e.target.value};$('#xpF').oninput=e=>T.fear=e.target.value.slice(0,200);
    $('#xpD').onclick=e=>{const b=e.target.closest('button');if(!b)return;T.drop=toggleIn(T.drop,b.dataset.v);b.setAttribute('aria-pressed',T.drop.includes(b.dataset.v))};
    $('#xpGo').onclick=()=>{XP.ph=1;XP.t0=Date.now();xpTry();window.scrollTo(0,0)};return}
  if(XP.ph===1){let mi=0;box.innerHTML=`${head('Pendant')}<div class="card qcard"><p class="quote" id="xpMsg1" aria-live="polite">${esc(G(X.pendant[0]))}</p></div>
     <p class="bigv"><span id="xpEl">0:00</span></p><p class="note center">Le temps passé dans la situation. Pas besoin de regarder : c'est juste un repère.</p>
     <button class="main" id="xpDone" style="width:100%">J'ai fini</button><div class="row mt"><button class="ghost" id="xpStopB">C'est trop pour aujourd'hui</button><button class="ghost" id="xpSos">Ouvrir le SOS</button></div>`;
    XP.iv=setInterval(()=>{const el=$('#xpEl');if(!el){xpStop();return}const sec=Math.round((Date.now()-XP.t0)/1000);el.textContent=mmss(sec);
      if(sec>0&&sec%25===0){mi=(mi+1)%X.pendant.length;const m=$('#xpMsg1');if(m)m.textContent=G(X.pendant[mi])}},1000);
    $('#xpDone').onclick=()=>{T.stopped=false;T.min=Math.max(1,Math.round((Date.now()-XP.t0)/60000));XP.ph=2;T.peak=T.pred;xpTry();window.scrollTo(0,0)};
    $('#xpStopB').onclick=()=>{T.stopped=true;T.min=Math.max(1,Math.round((Date.now()-XP.t0)/60000));XP.ph=2;T.peak=T.pred;xpTry();window.scrollTo(0,0)};
    $('#xpSos').onclick=openSOS;return}
  if(XP.ph===2){box.innerHTML=`${head('Après')}<div class="card"><p style="font-weight:600;margin:0">Au plus fort, ton anxiété a été de : <span id="xpKv">${T.peak}</span>/10</p><input type="range" id="xpK" min="0" max="10" value="${T.peak}" aria-label="Anxiété au plus fort">
     ${T.fear?`<p class="f mt">Tu craignais : « ${esc(T.fear)} ». Est-ce que c'est arrivé ?</p>`:`<p class="f mt">Ce que tu craignais est-il arrivé ?</p>`}<div class="row chips" id="xpR">${X.resultat.map(([k,n])=>`<button type="button" data-v="${k}" aria-pressed="${T.res===k}">${esc(n)}</button>`).join('')}</div>
     <label class="f mt" for="xpW">Ce qui s'est vraiment passé</label><textarea id="xpW" maxlength="1000">${esc(T.what||'')}</textarea>
     <label class="f mt" for="xpL">Ce que tu en retiens</label><input type="text" id="xpL" maxlength="200" value="${esc(T.learn||'')}" placeholder="Ex. L'anxiété est montée, puis elle a baissé"></div>
     <button class="main" id="xpSave2" style="width:100%">Faire le bilan</button>`;
    $('#xpK').oninput=e=>{T.peak=+e.target.value;$('#xpKv').textContent=e.target.value};
    $('#xpR').onclick=e=>{const b=e.target.closest('button');if(!b)return;T.res=b.dataset.v;$$('#xpR button').forEach(x=>x.setAttribute('aria-pressed',x===b))};
    $('#xpSave2').onclick=()=>{T.what=$('#xpW').value.trim().slice(0,1000);T.learn=$('#xpL').value.trim().slice(0,200);
      const tr={t:Date.now(),pred:T.pred,peak:T.peak,fear:T.fear||'',res:T.res||'',what:T.what,learn:T.learn,drop:T.drop,stopped:!!T.stopped,min:T.min||1};
      s.tries.push(tr);XP.ph=3;addItem({kind:'expo',ex:'expo',step:s.t,pred:tr.pred,peak:tr.peak,res:tr.res,appris:tr.learn,stopped:tr.stopped,min:tr.min});xpTry();window.scrollTo(0,0)};return}
  const l=s.tries[s.tries.length-1];const M=[];
  if(l.stopped)M.push(G("Tu t'es {arrêté|arrêtée} quand c'était trop. C'est une information précieuse, pas un échec. La prochaine fois, une marche un peu plus petite peut aider."));
  else if(l.peak<l.pred)M.push(`Ton anxiété a été moins forte que prévu : ${l.peak}/10 au plus fort, au lieu des ${l.pred}/10 que tu imaginais.`);
  else if(l.peak===l.pred)M.push(`Ton anxiété a été à peu près celle que tu prévoyais (${l.peak}/10). Et tu l'as traversée.`);
  else M.push(G(`C'était plus difficile que prévu (${l.peak}/10). Tu es {resté|restée} malgré tout : c'est exactement comme ça que le cerveau apprend.`));
  if(l.res==='non')M.push("Ce que tu craignais ne s'est pas produit.");else if(l.res==='part')M.push("Ce que tu craignais s'est produit en partie, et tu as pu y faire face.");else if(l.res==='oui')M.push(G("Ce que tu craignais est arrivé, et tu es là. Qu'est-ce qui t'a aidé{e} à le traverser ? Tu peux en parler à ELYRA ou à ton thérapeute."));
  const S=xpSorted(),nx=S[S.indexOf(s)+1],last2=s.tries.slice(-2);const easy=s.tries.length>=2&&last2.every(x=>x.peak<=4&&!x.stopped);
  const sug=easy?G(`Cette marche semble plus légère maintenant. Quand tu te sens prêt{e}, tu peux passer à la suivante${nx?` : « ${nx.t} »`:''}.`):"Tu peux refaire cette marche quelques fois. C'est la répétition qui fait baisser l'anxiété, petit à petit.";
  box.innerHTML=`${head('Bilan')}<div class="card"><div class="cmp"><div><small>Prévu</small><b>${l.pred}</b></div><div><small>Au plus fort</small><b>${l.peak}</b></div></div>${M.map(m=>`<p>${esc(m)}</p>`).join('')}${l.learn?`<p class="phr">${esc(l.learn)}</p>`:''}</div>
    <div class="card qcard"><p class="quote" style="margin:0">${esc(sug)}</p></div>
    ${s.done?'':`<button class="sage" id="xpTame" style="width:100%">${esc(G('Cette marche est apprivoisée'))}</button>`}<button class="ghost mt" id="xpList" style="width:100%">Retour à mon échelle</button>`;
  const tm=$('#xpTame');if(tm)tm.onclick=()=>{setP(p=>{const x=p.expo.steps.find(y=>y.id===s.id);if(x)x.done=true});XP.mode='list';renderExpo();toast('Bravo. Une marche de plus !');haptic(30)};
  $('#xpList').onclick=()=>{XP.mode='list';renderExpo()}}

/* ============ MON CORPS ============ */
const CB={z:[],s:[],c:[],v:'',i:4,n:'',msg:''};
function bodySVG(){const on=z=>CB.z.includes(z)?'on':'';const g=(z,shape)=>`<g class="bz ${on(z)}" data-zone="${z}">${shape}</g>`;
  return `<svg class="body" viewBox="0 0 160 300" role="img" aria-label="Silhouette : touche une zone">
   ${g('tete','<circle cx="80" cy="34" r="24"/>')}${g('gorge','<rect x="70" y="58" width="20" height="16" rx="6"/>')}
   ${g('poitrine','<rect x="48" y="76" width="64" height="52" rx="18"/>')}${g('ventre','<rect x="52" y="130" width="56" height="48" rx="16"/>')}
   ${g('bras','<rect x="24" y="80" width="20" height="104" rx="10"/><rect x="116" y="80" width="20" height="104" rx="10"/>')}
   ${g('jambes','<rect x="55" y="182" width="23" height="108" rx="11"/><rect x="82" y="182" width="23" height="108" rx="11"/>')}</svg>`}
function renderCorps(){const box=$('#corpsBox');if(!box)return;const K=O.corps;const keep=document.activeElement&&document.activeElement.id==='cbN';
  const H=ST.items.filter(x=>x.kind==='corps'&&Date.now()-x.t<30*DAY);const cz={},cs={};H.forEach(x=>{(x.zones||[]).forEach(z=>cz[z]=(cz[z]||0)+1);(x.sens||[]).forEach(z=>cs[z]=(cs[z]||0)+1)});
  const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,3);
  box.innerHTML=`<h1>Mon corps</h1><p class="sub">Noter ce que tu ressens, comprendre, et prendre soin de ton corps. ELYRA ne dit jamais d'où vient une sensation : seul un médecin peut le faire.</p>
   <div class="warnb"><p style="margin:0"><b>Appelle le 112 tout de suite si tu as :</b></p><ul class="obj">${K.alerte.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>
    <p>Dans le doute, appeler est toujours une bonne décision. Pour un avis en dehors des heures de ton médecin : <b>1733</b>.</p><div class="row"><a class="btn main" href="tel:112" style="background:var(--warm)">Appeler le 112</a><a class="btn ghost" href="tel:1733">Médecin de garde 1733</a></div></div>
   <div class="card"><h2>Noter une sensation</h2><div class="bodyw">${bodySVG()}<div><p class="f" style="margin-top:0">Où ?</p><div class="row chips" id="cbZ">${K.zones.map(([k,n])=>`<button type="button" data-v="${k}" aria-pressed="${CB.z.includes(k)}">${esc(n)}</button>`).join('')}</div></div></div>
    <p class="f mt">Ce que tu ressens</p><div class="row chips" id="cbS">${K.sens.map(n=>`<button type="button" data-v="${esc(n)}" aria-pressed="${CB.s.includes(n)}">${esc(n)}</button>`).join('')}</div>
    <p class="f mt">Intensité : <span id="cbIv">${CB.i}</span>/10</p><input type="range" id="cbI" min="0" max="10" value="${CB.i}" aria-label="Intensité">
    <p class="f mt">Quand ?</p><div class="row chips" id="cbC">${K.ctx.map(n=>`<button type="button" data-v="${esc(n)}" aria-pressed="${CB.c.includes(n)}">${esc(n)}</button>`).join('')}</div>
    <p class="f mt">Cette sensation a-t-elle déjà été vérifiée par un médecin ?</p><div class="row chips" id="cbV">${K.verif.map(([k,n])=>`<button type="button" data-v="${k}" aria-pressed="${CB.v===k}">${esc(n)}</button>`).join('')}</div>
    <label class="f mt" for="cbN">Une note (facultatif)</label><textarea id="cbN" maxlength="1000">${esc(CB.n)}</textarea>
    <button class="main mt" id="cbSave">Noter</button>${CB.msg?`<div class="card flat mt" role="status"><p style="margin:0">${esc(CB.msg)}</p></div>`:''}</div>
   <div class="sect"><h2>Prendre soin de ton corps</h2></div><div class="tiles">${['med:place','outil:accueil','med:etire','med:muscle','med:scan','br:coh','med:marche'].filter(x=>EX[x]).map(tileHTML).join('')}</div>
   <div class="card"><h2>Comprendre</h2>${K.info.map(([t,p])=>`<div class="blk"><b>${esc(t)}</b><p>${esc(G(p))}</p></div>`).join('')}<button class="ghost mt" data-ex="fiche:panique">Lire : la crise de panique</button></div>
   <div class="card"><h2>Ces 30 derniers jours</h2>${H.length?`<p>${H.length} sensation(s) notée(s).${top(cz).length?` Surtout : ${esc(top(cz).map(([z,n])=>(K.zones.find(y=>y[0]===z)||[0,z])[1].toLowerCase()+' ('+n+')').join(', '))}.`:''}${top(cs).length?` Le plus souvent : ${esc(top(cs).map(([z,n])=>z.toLowerCase()+' ('+n+')').join(', '))}.`:''}</p>
     ${H.filter(x=>x.verif!=='oui').length?`<p class="note">${H.filter(x=>x.verif!=='oui').length} note(s) concernent des sensations pas encore vérifiées par un médecin. Parles-en lors de ta prochaine consultation.</p>`:''}
     <div class="mt">${H.slice(0,8).map(x=>`<div class="entry"><div><small>${esc(fmtDT(x.t))}</small>${entryExtra(x)}</div><button class="del" data-del="${esc(x.id)}">Supprimer</button></div>`).join('')}</div>
     <a class="btn ghost mt" href="#consult">Préparer une consultation</a>`:'<p class="sub">Rien de noté pour le moment.</p>'}</div>`;
  CB.msg='';if(keep){const n=$('#cbN');n.focus();n.selectionStart=n.selectionEnd=n.value.length}}
$('#corpsBox').addEventListener('click',e=>{const z=e.target.closest('[data-zone]');if(z){CB.z=toggleIn(CB.z,z.dataset.zone);renderCorps();haptic();return}
  const b=e.target.closest('#cbZ button,#cbS button,#cbC button,#cbV button');if(b){const p=b.parentElement.id;
    if(p==='cbZ')CB.z=toggleIn(CB.z,b.dataset.v);else if(p==='cbS')CB.s=toggleIn(CB.s,b.dataset.v);else if(p==='cbC')CB.c=toggleIn(CB.c,b.dataset.v);else CB.v=CB.v===b.dataset.v?'':b.dataset.v;renderCorps();return}
  if(e.target.closest('#cbSave')){if(!CB.z.length&&!CB.s.length){toast('Choisis au moins une zone ou une sensation.');return}
    const urgent=CB.v!=='oui'&&(CB.z.includes('poitrine')||CB.s.includes('Souffle court')||CB.s.includes('Douleur')||CB.s.includes('Palpitations'))&&CB.i>=7;
    const it={kind:'corps',zones:CB.z.slice(),sens:CB.s.slice(),i:CB.i,ctx:CB.c.slice(),verif:CB.v,note:CB.n.trim().slice(0,1000)};
    Object.assign(CB,{z:[],s:[],c:[],v:'',i:4,n:''});
    CB.msg=urgent?"C'est noté. Comme cette sensation est forte et n'a pas encore été vérifiée, n'attends pas : si elle ressemble aux signes ci-dessus, appelle le 112. Sinon, demande l'avis du médecin de garde (1733) ou de ton médecin."
      :it.verif!=='oui'?"C'est noté. Cette sensation n'a pas encore été vérifiée : parles-en à ton médecin. Si elle devient forte ou nouvelle, appelle le 1733 ou le 112."
      :"C'est noté. Si tu veux, essaie un des exercices ci-dessous pour prendre soin de toi.";
    addItem(it);window.scrollTo(0,0)}});
$('#corpsBox').addEventListener('input',e=>{if(e.target.id==='cbI'){CB.i=+e.target.value;$('#cbIv').textContent=e.target.value}if(e.target.id==='cbN')CB.n=e.target.value});

/* ============ RÉVEIL LA NUIT ============ */
const NU={b:null};
function openNuit(){SND.ctx();$('#rate').classList.remove('on');if(brMain.on)brMain.stop(false);$('#nuit').classList.add('on');document.body.style.overflow='hidden';renderNuit();setTimeout(()=>{const h=$('#nuitT');if(h)h.focus()},50)}
function closeNuit(){if(NU.b&&NU.b.on)NU.b.stop(false);$('#nuit').classList.remove('on');document.body.style.overflow=''}
function renderNuit(){const N=O.nuit;const rain=SND.active().includes('pluie');
  $('#nuitBody').innerHTML=`<svg class="moon" viewBox="0 0 60 60" aria-hidden="true"><path d="M40 8a22 22 0 1 0 12 32A18 18 0 0 1 40 8z"/></svg><h1 id="nuitT" tabindex="-1">${esc(G(N.accueil))}</h1><p class="sub">${esc(N.sous)}</p>
   <div class="nbtns"><button data-n="br">Respirer lentement</button><button data-n="hist">Écouter une histoire</button><button data-n="vt">Déposer ce qui tourne</button>
    <button data-n="med">Une voix pour le réveil nocturne</button><button data-n="pluie" aria-pressed="${rain}">${rain?'Arrêter la pluie':'Le son de la pluie'}</button></div><div id="nuitZone"></div>
   <details class="nd"><summary>Si le sommeil ne revient pas</summary>${N.conseils.map(c=>`<p>${esc(G(c))}</p>`).join('')}</details>`}
$('#nuit').addEventListener('click',e=>{if(e.target.closest('#nuitX')){closeNuit();return}const b=e.target.closest('[data-n]');if(!b)return;const k=b.dataset.n,z=$('#nuitZone');
  if(NU.b&&NU.b.on)NU.b.stop(false);
  if(k==='br'){z.innerHTML=`<div id="nuBr"></div><div class="row center"><button class="ghost" id="nuGo">Commencer</button></div><p class="note center">Rythme apaisant 4-6, sans retenir ton souffle. Arrête si c'est inconfortable.</p>`;
    NU.b=Breather($('#nuBr'));NU.b.onState=on=>{const x=$('#nuGo');if(x)x.textContent=on?'Arrêter':'Commencer'};$('#nuGo').onclick=()=>NU.b.on?NU.b.stop(false):NU.b.start('apaise',5)}
  else if(k==='hist')z.innerHTML=`<div class="list">${STORIES.map(s=>`<div class="item"><button class="go" data-nst="${s.k}"><span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></span></button></div>`).join('')}</div>`;
  else if(k==='vt'){z.innerHTML=`<label class="f" for="nuVt">Écris ce qui tourne, en vrac. Ça peut attendre demain.</label><textarea id="nuVt" maxlength="3000"></textarea><button class="ghost mt" id="nuVtGo">Poser</button><p class="note" id="nuVtM" role="status"></p>`;
    $('#nuVtGo').onclick=()=>{const v=$('#nuVt').value.trim();if(!v)return;addItem({kind:'videtete',note:v.slice(0,3000)});$('#nuVt').value='';$('#nuVtM').textContent="C'est posé. Tu peux le laisser là jusqu'à demain."}}
  else if(k==='med')openPlayer('reveil');
  else if(k==='pluie'){if(SND.active().includes('pluie'))SND.off('pluie');else SND.on('pluie',ST.prof.sndVol.pluie);renderNuit()}});
$('#nuit').addEventListener('click',e=>{const s=e.target.closest('[data-nst]');if(s)openPlayer(s.dataset.nst)});

/* ============ PRÉPARER UNE CONSULTATION ============ */
let conDays=30;
function consultSections(days){const now=Date.now(),from=dstart(now)-(days-1)*DAY;const I=ST.items.filter(x=>x.t>=from);const out=[];const f1=n=>n.toFixed(1).replace('.',',');
  const J=I.filter(x=>x.stress!=null&&(x.kind==='journal'||x.kind==='humeur'));const md=I.filter(x=>x.mood);
  const L=[];if(md.length){const m=avg(md.map(x=>+x.mood));L.push(`Humeur moyenne : ${f1(m)}/5 (${MOODS[Math.max(0,Math.min(4,Math.round(m)-1))][1].toLowerCase()}), sur ${md.length} note(s).`)}
  if(J.length){const s=avg(J.map(x=>+x.stress));L.push(`Stress déclaré moyen : ${f1(s)}/10.`);const hi=new Set(J.filter(x=>x.stress>=7).map(x=>dkey(x.t))).size;if(hi)L.push(`Jours avec un stress de 7/10 ou plus : ${hi}.`);
    const mid=from+(now-from)/2,a=avg(J.filter(x=>x.t<mid).map(x=>+x.stress)),b=avg(J.filter(x=>x.t>=mid).map(x=>+x.stress));if(a!=null&&b!=null)L.push(`Tendance : ${Math.abs(b-a)<.5?'plutôt stable':b<a?'plutôt en baisse':'plutôt en hausse'} (${f1(a)} puis ${f1(b)}).`)}
  out.push(['Humeur et stress',L.length?L:['Pas de note sur cette période.']]);
  const sos=I.filter(x=>x.kind==='sos');const L2=[];if(sos.length){const c={};sos.forEach(x=>{if(x.sit)c[x.sit]=(c[x.sit]||0)+1});L2.push(`Moments difficiles (mode SOS) : ${sos.length} fois.`);
    const t=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3).filter(([k])=>SOSIT[k]);if(t.length)L2.push('Le plus souvent : '+t.map(([k,n])=>`« ${G(SOSIT[k].n)} » (${n})`).join(', ')+'.')}
  const sc={};I.filter(x=>x.sits).forEach(x=>x.sits.forEach(s=>sc[s]=(sc[s]||0)+1));const ts=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,4);if(ts.length)L2.push('Situations souvent notées : '+ts.map(([s,n])=>`${s.toLowerCase()} (${n})`).join(', ')+'.');
  const ec={};I.filter(x=>x.emos&&x.kind==='journal').forEach(x=>x.emos.forEach(s=>ec[s]=(ec[s]||0)+1));const te=Object.entries(ec).sort((a,b)=>b[1]-a[1]).slice(0,4);if(te.length)L2.push('Émotions souvent notées : '+te.map(([s,n])=>`${s.toLowerCase()} (${n})`).join(', ')+'.');
  out.push(['Moments difficiles',L2.length?L2:['Rien de noté sur cette période.']]);
  const sl=I.filter(x=>x.kind==='sommeil');const L3=[];if(sl.length){L3.push(`Nuits notées : ${sl.length}. Qualité moyenne : ${f1(avg(sl.map(x=>+x.q)))}/5.`);const d=sl.map(x=>durMin(x.bed,x.wake)).filter(Boolean);if(d.length){const m=avg(d);L3.push(`Durée moyenne au lit : ${Math.floor(m/60)} h ${pad(Math.round(m%60))}.`)}
    const w=sl.filter(x=>x.w!=null);if(w.length)L3.push(`Réveils nocturnes : en moyenne ${f1(avg(w.map(x=>+x.w)))} par nuit.`)}
  out.push(['Sommeil',L3.length?L3:['Pas de nuit notée sur cette période.']]);
  const co=I.filter(x=>x.kind==='corps');const L4=[];if(co.length){const Z=O.corps.zones,cz={},cs={};co.forEach(x=>{(x.zones||[]).forEach(z=>cz[z]=(cz[z]||0)+1);(x.sens||[]).forEach(s=>cs[s]=(cs[s]||0)+1)});
    L4.push(`Sensations notées : ${co.length}, intensité moyenne ${f1(avg(co.map(x=>+x.i)))}/10.`);
    const tz=Object.entries(cz).sort((a,b)=>b[1]-a[1]).slice(0,4);if(tz.length)L4.push('Zones : '+tz.map(([z,n])=>`${(Z.find(y=>y[0]===z)||[0,z])[1].toLowerCase()} (${n})`).join(', ')+'.');
    const t2=Object.entries(cs).sort((a,b)=>b[1]-a[1]).slice(0,4);if(t2.length)L4.push('Sensations : '+t2.map(([s,n])=>`${s.toLowerCase()} (${n})`).join(', ')+'.');
    const nv=co.filter(x=>x.verif!=='oui').length;if(nv)L4.push(`${nv} note(s) sur des sensations que je n'ai pas encore fait vérifier.`)}
  if(L4.length)out.push(['Sensations physiques',L4]);
  const L5=[];const H=helpTop(1).slice(0,4);if(H.length)L5.push("Ce qui m'aide le plus : "+H.map(([id])=>EX[id]).join(', ')+'.');
  const P=I.filter(isPrat);if(P.length)L5.push(`Exercices faits : ${P.length} (${P.reduce((a,x)=>a+(+x.min||0),0)} min au total).`);
  const pe=I.filter(x=>x.kind==='pensee');if(pe.length)L5.push(`Pensées démêlées : ${pe.length}.`);
  const tg=TAG.mods.filter(m=>modDone(m.id)).length;if(tg)L5.push(`Programme TAG : ${tg} module(s) sur 8 terminé(s).`);
  const xs=ST.prof.expo.steps;if(xs.length){const tr=xs.reduce((a,s)=>a+s.tries.filter(t=>t.t>=from).length,0);L5.push(`Exposition progressive : ${xs.filter(s=>s.done).length}/${xs.length} marche(s) apprivoisée(s)${tr?`, ${tr} essai(s) sur la période`:''}.`)}
  out.push(['Ce que je fais pour aller mieux',L5.length?L5:['Rien de noté sur cette période.']]);
  return{from,out}}
function consultText(){const {from,out}=consultSections(conDays);const P=ST.prof;
  return [`Résumé pour ma consultation${P.name?' · '+P.name:''}`,`Du ${new Date(from).toLocaleDateString('fr-BE')} au ${new Date().toLocaleDateString('fr-BE')}`,'',
    ...out.flatMap(([t,l])=>[t.toUpperCase(),...l.map(x=>'- '+x),'']),...(P.consult?['CE QUE JE VEUX ABORDER',P.consult,'']:[]),
    "Résumé établi avec l'appli ELYRA, à partir de mes propres notes. Ce n'est pas un document médical et il ne contient aucun diagnostic."].join('\n')}
function renderConsult(){const box=$('#consultBox');if(!box)return;const {from,out}=consultSections(conDays);const P=ST.prof;if(document.activeElement&&document.activeElement.id==='conQ')return;
  box.innerHTML=`<h1>Préparer une consultation</h1><p class="sub">Un résumé simple de tes notes, à montrer ou à lire à ton médecin, ton psychologue ou ton psychiatre. C'est toi qui choisis ce que tu partages.</p>
   <div class="row chips">${[[30,'30 derniers jours'],[90,'3 derniers mois']].map(([d,n])=>`<button data-cond="${d}" aria-pressed="${conDays===d}">${n}</button>`).join('')}</div>
   <div class="card"><label class="f" for="conQ" style="margin-top:0">Ce que je veux aborder, mes questions</label><textarea id="conQ" maxlength="2000" placeholder="Ex. Mes réveils la nuit. Est-ce que mon traitement peut jouer ? Comment trouver un psychologue ?">${esc(P.consult||'')}</textarea><p class="note" id="conQm"></p></div>
   <article class="card consult" id="consultDoc"><h2>Résumé pour ma consultation${P.name?` · ${esc(P.name)}`:''}</h2><p class="sub">Du ${esc(new Date(from).toLocaleDateString('fr-BE'))} au ${esc(new Date().toLocaleDateString('fr-BE'))}</p>
    ${out.map(([t,l])=>`<h3 class="mt">${esc(t)}</h3><ul>${l.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`).join('')}
    <div id="conAsk">${P.consult&&P.consult.trim()?`<h3 class="mt">Ce que je veux aborder</h3><p style="white-space:pre-wrap">${esc(P.consult)}</p>`:''}</div>
    <p class="note">Résumé établi avec l'appli ELYRA, à partir de mes propres notes. Ce n'est pas un document médical et il ne contient aucun diagnostic.</p></article>
   <div class="row"><button class="main" id="conCopy">Copier le texte</button>${canShare()?'<button class="ghost" id="conShare">Partager</button>':''}${isNative?'':'<button class="ghost" id="conPrint">Imprimer ou PDF</button>'}</div>`;
  $('#conQ').oninput=e=>{clearTimeout(kT);kT=setTimeout(()=>{ST.prof.consult=e.target.value.slice(0,2000);save();$('#conQm').textContent='Enregistré.';
    const v=ST.prof.consult.trim();$('#conAsk').innerHTML=v?`<h3 class="mt">Ce que je veux aborder</h3><p style="white-space:pre-wrap">${esc(v)}</p>`:''},500)};
  $('#conCopy').onclick=async()=>{try{await navigator.clipboard.writeText(consultText());toast('Résumé copié.')}catch(e){toast("La copie n'est pas possible ici.")}};
  const sh=$('#conShare');if(sh)sh.onclick=()=>shareText('Résumé pour ma consultation',consultText());
  const pr=$('#conPrint');if(pr)pr.onclick=()=>{document.body.classList.add('printc');setTimeout(()=>{try{print()}catch(e){}document.body.classList.remove('printc')},50)}}
$('#consultBox').addEventListener('click',e=>{const b=e.target.closest('[data-cond]');if(b){conDays=+b.dataset.cond;renderConsult()}});
const SharePl=()=>{try{return window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Share||null}catch(e){return null}};
const canShare=()=>!!(SharePl()||navigator.share);
async function shareText(title,text){try{const s=SharePl();if(s)await s.share({title,text,dialogTitle:title});else await navigator.share({title,text})}catch(e){}}

/* ============ VERROU PAR CODE ============ */
async function hashPin(pin,salt){try{if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('elyra:'+salt+':'+pin));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}
  let h=2166136261;for(const c of 'elyra:'+salt+':'+pin){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return 'f'+(h>>>0).toString(16)}
const LK={pin:'',fails:0,until:0,away:0,mode:'unlock',first:''};
function showLock(mode){LK.mode=mode||'unlock';if(LK.mode==='unlock'&&!ST.prof.lock.on)return;LK.pin='';LK.first='';$('#lock').classList.add('on');$('#lockCancel').hidden=LK.mode==='unlock';$('#lockForgot').hidden=LK.mode!=='unlock';drawLock('')}
function hideLock(){$('#lock').classList.remove('on');LK.pin=''}
function drawLock(msg){$('#lockT').textContent=LK.mode==='unlock'?'Entre ton code':LK.mode==='off'?'Entre ton code actuel':LK.mode==='set1'?'Choisis un code à 4 chiffres':'Confirme ton code';
  $('#lockDots').innerHTML=[0,1,2,3].map(i=>`<i class="${i<LK.pin.length?'on':''}"></i>`).join('');$('#lockMsg').textContent=msg||''}
async function lockDigit(d){if(Date.now()<LK.until){drawLock(`Patiente ${Math.ceil((LK.until-Date.now())/1000)} secondes.`);return}if(LK.pin.length>=4)return;LK.pin+=d;drawLock('');haptic();if(LK.pin.length<4)return;
  const pin=LK.pin;if(LK.mode==='set1'){LK.first=pin;LK.pin='';LK.mode='set2';drawLock('');return}
  await new Promise(r=>setTimeout(r,120));
  if(LK.mode==='set2'){if(pin!==LK.first){LK.mode='set1';LK.pin='';drawLock("Les deux codes ne correspondent pas. On recommence.");return}
    const s=uid(),h=await hashPin(pin,s);setP(p=>p.lock={on:true,h,s});hideLock();toast('Code activé. ELYRA le demandera à chaque ouverture.');return}
  const ok=(await hashPin(pin,ST.prof.lock.s))===ST.prof.lock.h;LK.pin='';
  if(!ok){LK.fails++;if(LK.fails>=5){LK.until=Date.now()+30000;LK.fails=0;drawLock('Trop d’essais. Patiente 30 secondes.')}else drawLock('Ce n’est pas le bon code.');haptic(60);return}
  LK.fails=0;if(LK.mode==='off'){setP(p=>p.lock={on:false,h:'',s:''});hideLock();toast('Code retiré.');return}hideLock()}
$('#lockPad').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.d!=null)lockDigit(b.dataset.d);else if(b.dataset.k==='del'){LK.pin=LK.pin.slice(0,-1);drawLock('')}};
addEventListener('keydown',e=>{if(!$('#lock').classList.contains('on'))return;if(/^\d$/.test(e.key))lockDigit(e.key);else if(e.key==='Backspace'){LK.pin=LK.pin.slice(0,-1);drawLock('')}});
$('#lockCancel').onclick=hideLock;
$('#lockSos').onclick=()=>{$('#sos').classList.add('overlock');openSOS()};
$('#lockForgot').onclick=()=>ask('Code oublié ?',"Pour protéger tes notes, ELYRA ne peut pas retrouver ton code. Tu peux tout effacer et recommencer, puis restaurer une sauvegarde si tu en as une. C'est définitif.",'Tout effacer',()=>{
  try{localStorage.removeItem(KEY)}catch(e){}ST.items=[];ST.prof=defP();applyPrefs();renderAll();hideLock();location.hash='accueil';$('#onb').classList.add('on')});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')LK.away=Date.now();else if(ST.prof.lock.on&&LK.away&&Date.now()-LK.away>60000&&!$('#lock').classList.contains('on'))showLock()});
function renderLockBox(){const b=$('#lockBox');if(!b)return;const on=ST.prof.lock.on;
  b.innerHTML=`<p>${on?'Le code est activé : ELYRA le demande à l’ouverture, et après une minute en arrière-plan.':'Un code à 4 chiffres pour que personne d’autre n’ouvre ELYRA sur ce téléphone.'}</p>
   <div class="row mt">${on?'<button class="ghost" id="lkChange">Changer le code</button><button class="ghost" id="lkOff">Retirer le code</button>':'<button class="main" id="lkOn">Activer un code</button>'}</div>
   <p class="note">Le SOS et les numéros d'urgence restent toujours accessibles, même verrouillé. Si tu oublies le code, il faudra tout effacer : pense à faire des sauvegardes.</p>`;
  const a=$('#lkOn');if(a)a.onclick=()=>showLock('set1');const c=$('#lkChange');if(c)c.onclick=()=>showLock('set1');const o=$('#lkOff');if(o)o.onclick=()=>showLock('off')}

/* ============ RAPPELS DOUX ============ */
const LN=()=>{try{return window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications||null}catch(e){return null}};
const remOf=r=>Object.assign({on:false,h:r.h},ST.prof.rem[r.k]||{});
function renderRappels(){const b=$('#remBox');if(!b)return;const nat=!!LN();
  b.innerHTML=`<p>${nat?'De petits rappels, jamais insistants. Tu choisis lesquels et à quelle heure.':'Sur iPhone, une appli web ne peut pas envoyer de rappels sans serveur. À la place, ELYRA peut les ajouter à ton calendrier : il te préviendra chaque jour à l’heure choisie.'}</p>
   ${O.rappels.map(r=>{const v=remOf(r);return `<div class="sw rem"><label style="display:flex;gap:10px;align-items:center;flex:1"><input type="checkbox" data-rem="${r.k}" ${v.on?'checked':''}><span>${esc(r.n)}</span></label><input type="time" data-remh="${r.k}" value="${esc(v.h)}" aria-label="Heure : ${esc(r.n)}"></div>`}).join('')}
   ${nat?'<p class="note" id="remMsg" role="status"></p>':`<button class="ghost mt" id="remIcs">Ajouter à mon calendrier</button><p class="note">Si rien ne s'ouvre, ouvre ELYRA dans Safari puis réessaie. Pour les retirer, supprime l'événement « ELYRA » de ton calendrier.</p>`}`;
  const ic=$('#remIcs');if(ic)ic.onclick=downloadIcs}
$('#remBox').addEventListener('change',e=>{const c=e.target.closest('[data-rem]'),h=e.target.closest('[data-remh]');if(!c&&!h)return;const k=(c||h).dataset[c?'rem':'remh'];const r=O.rappels.find(x=>x.k===k);
  setP(p=>{p.rem[k]=Object.assign(remOf(r),c?{on:c.checked}:{h:h.value||r.h})});applyRappels(true)});
async function applyRappels(ui){const ln=LN();if(!ln)return;const msg=t=>{const m=$('#remMsg');if(m&&ui)m.textContent=t};
  try{await ln.cancel({notifications:O.rappels.map(r=>({id:r.id}))})}catch(e){}
  const on=O.rappels.filter(r=>remOf(r).on);if(!on.length){msg('Aucun rappel actif.');return}
  try{let p=await ln.checkPermissions();if(p.display!=='granted')p=await ln.requestPermissions();if(p.display!=='granted'){msg("Les notifications sont bloquées. Autorise-les pour ELYRA dans les réglages du téléphone.");return}
    await ln.schedule({notifications:on.map(r=>{const [h,m]=remOf(r).h.split(':').map(Number);return{id:r.id,title:'ELYRA',body:G(r.b),schedule:{on:{hour:h,minute:m},allowWhileIdle:true},extra:{go:r.go}}})});
    msg(`${on.length} rappel(s) programmé(s).`)}catch(e){msg("Je n'ai pas réussi à programmer les rappels.")}}
function downloadIcs(){const on=O.rappels.filter(r=>remOf(r).on);if(!on.length){toast('Coche au moins un rappel.');return}
  const d=new Date(),ymd=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate()),st=d.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const ev=on.map(r=>{const [h,m]=remOf(r).h.split(':');const b=G(r.b).replace(/[,;]/g,'\\$&');return ['BEGIN:VEVENT',`UID:elyra-${r.k}@elyra.local`,`DTSTAMP:${st}`,`DTSTART:${ymd}T${h}${m}00`,'DURATION:PT5M','RRULE:FREQ=DAILY',`SUMMARY:ELYRA · ${r.n.replace(/[,;]/g,'\\$&')}`,`DESCRIPTION:${b}`,'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M',`DESCRIPTION:${b}`,'END:VALARM','END:VEVENT'].join('\r\n')});
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ELYRA//Rappels doux//FR','CALSCALE:GREGORIAN',...ev,'END:VCALENDAR'].join('\r\n');
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='elyra-rappels.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}catch(e){toast("Le calendrier n'a pas pu s'ouvrir ici.")}}
try{const ln=LN();if(ln){ln.addListener('localNotificationActionPerformed',a=>{const g=a&&a.notification&&a.notification.extra&&a.notification.extra.go;if(g)location.hash=g});applyRappels(false)}}catch(e){}

/* ============ CONVERSATION : CONTEXTE ET « PARLE-MOI » ============ */
function ctxText(){const P=ST.prof;const L=[];if(P.name)L.push('Prénom : '+P.name);L.push(P.genre==='f'?"Elle souhaite qu'on s'adresse à elle au féminin":"Il souhaite qu'on s'adresse à lui au masculin");
  const H=helpTop(1).slice(0,4).map(([id])=>EX[id]);if(H.length)L.push("Ce qui l'aide le plus dans l'appli : "+H.join(', '));
  const bad=Object.entries(helpStats()).filter(([id,h])=>h.n>=2&&h.avg<.6&&EX[id]).map(([id])=>EX[id]).slice(0,3);if(bad.length)L.push("Ce qui l'aide peu : "+bad.join(', '));
  const t=tagM(),cm=TAG.mods.find(m=>m.id===t.cur);if(cm)L.push(`Programme TAG : module « ${cm.n} » en cours, ${TAG.mods.filter(m=>modDone(m.id)).length}/8 terminés`);
  const lm=ST.items.find(x=>x.mood&&Date.now()-x.t<3*DAY);if(lm)L.push('Humeur récente : '+MOODS[lm.mood-1][1].toLowerCase()+(lm.stress!=null?', stress '+lm.stress+'/10':''));
  if(P.kit.phr.length)L.push('Ses phrases rassurantes : '+P.kit.phr.slice(0,3).join(' / '));
  return L.join('. ').slice(0,700)}
$('#talkBar').onsubmit=e=>{e.preventDefault();const v=$('#talkIn').value.trim();if(VOIX_URL()){$('#talkIn').value='';openConv(v?{text:v}:{voice:true});return}if(!v){openChat('ecoute');return}
  try{navigator.clipboard.writeText(v).catch(()=>{})}catch(x){}const a=document.createElement('a');a.href=chatHref('ecoute',v);a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  $('#talkIn').value='';toast("Ton message t'attend dans la conversation (il est aussi copié).")};
$('#nuit').addEventListener('keydown',e=>{if(e.key==='Escape')closeNuit()});

/* ============ CONVERSATION À VOIX HAUTE (visage animé + micro mains libres) ============ */
const CFG=window.ELYRA_CONFIG||{};
const VOIX_URL=()=>String(ST.prof.voixUrl||CFG.voix||'').replace(/\/+$/,'');
const CRISIS=/suicid|me tuer|en finir avec (la vie|tout)|mettre fin à (ma vie|mes jours)|plus envie de vivre|envie de mourir|veux mourir|me faire du mal|me blesser|me scarifi|overdose|disparaître pour toujours/i;
const BODY=/(douleur|mal|serrement|pression|oppression) (à|a|dans|sur) la poitrine|douleur thoracique|n'arrive plus à respirer|arrive pas à respirer|j'étouffe|bras gauche|paralys|engourdi|perdre connaissance|évanoui|malaise/i;
const CVM=[['ecoute','Écoute'],['apaise','Apaise'],['comprend','Comprend'],['tcc','Séance TCC'],['accompagne','Accompagne'],['encourage','Encourage'],['apprendre','Explique'],['nuit','La nuit']];
const cvP=()=>{const p=ST.prof;if(!p.cv||typeof p.cv!=='object')p.cv={};const c=p.cv;if(!Array.isArray(c.msgs))c.msgs=[];if(!Array.isArray(c.mem))c.mem=[];
  if(c.memOn===undefined)c.memOn=null;if(c.subs===undefined)c.subs=true;if(c.interrupt===undefined)c.interrupt=true;return c};
const CV={open:false,face:null,mic:null,live:false,mode:'ecoute',speaking:false,queue:[],abort:null,busy:false,lastSaid:'',sess:0,textMode:false,ticket:0};
function cvStatus(t){$('#cvStatus').textContent=t}
function cvSet(s){CV.face&&CV.face.state(s);$('#conv').dataset.state=s;
  cvStatus(s==='listen'?G("Je t'écoute…"):s==='think'?'Je réfléchis…':s==='speak'?'':CV.live?'':(VOIX_URL()?'Touche le micro pour parler, ou écris-moi.':''))}
function cvRenderModes(){$('#cvModes').innerHTML=CVM.map(([k,n])=>`<button data-cvm="${k}" aria-pressed="${CV.mode===k}">${n}</button>`).join('')}
function cvSubs(){const c=cvP();$('#cvSubBox').hidden=!c.subs&&!c.muted;$('#cvSub').setAttribute('aria-pressed',!!c.subs);$('#cvMute').setAttribute('aria-pressed',!!c.muted);
  $('#cvMute').setAttribute('aria-label',c.muted?'Remettre le son':'Couper le son');$('#cvMute').innerHTML=`<svg class="icon"><use href="#i-${c.muted?'mute':'vol'}"/></svg>`}
function cvExtra(html,keep){const b=$('#cvExtra');if(keep)b.insertAdjacentHTML('beforeend',html);else b.innerHTML=html}
function openConv(o){o=o||{};const c=cvP();CV.open=true;CV.sess=0;CV.textMode=!!o.text&&!o.voice;CV.mode=o.mode||(slot()==='nuit'?'nuit':'ecoute');
  if(brMain.on)brMain.stop(false);SND.duck(true);$('#rate').classList.remove('on');
  $('#conv').classList.add('on');document.body.style.overflow='hidden';
  if(!CV.face)CV.face=ElyraFace($('#cvFace'),{label:'Le visage d’ELYRA',photo:faceSrc(),mascot:isMascot()});CV.face.expr('doux');
  cvRenderModes();cvSubs();$('#cvYou').textContent='';$('#cvEly').textContent='';cvExtra('');$('#cvClaude').href=chatHref(CV.mode);
  $('#cvForm').hidden=!CV.textMode;$('#cvMicW').hidden=CV.textMode;
  if(!VOIX_URL()){cvSet('idle');CV.face.expr('sourire');$('#cvMic').disabled=true;
    cvExtra(`<div class="card flat cv-card"><p style="margin:0"><b>La conversation à voix haute n'est pas encore activée.</b> Il faut, une seule fois, un compte Cloudflare gratuit (sans carte bancaire). Les étapes sont dans <a href="https://github.com/priscivyro/Elyra#activer-la-conversation-%C3%A0-voix-haute" target="_blank" rel="noopener">le guide</a>.</p>
      <p>En attendant, tu peux parler à ELYRA dans Claude.</p><a class="btn main mt" href="${esc(chatHref(CV.mode,o.text||''))}" target="_blank" rel="noopener">Écrire à ELYRA dans Claude</a></div>`);return}
  $('#cvMic').disabled=false;if(!PV.ac){try{PV.ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}srvPing().then(()=>{if(wantPiper()&&!(navigator.connection&&navigator.connection.saveData))piperStart();piperUI()});
  if(c.memOn===null){cvSet('idle');CV.face.expr('sourire');
    cvExtra(`<div class="card flat cv-card"><p style="margin:0"><b>Avant de commencer :</b> veux-tu qu'ELYRA se souvienne du sujet de vos conversations, et de ce que tu choisis de garder ? Tu pourras tout voir et tout effacer dans Mon espace.</p>
      <div class="row mt"><button class="main" data-cvmem="1">Oui, avec plaisir</button><button class="ghost" data-cvmem="0">Non, merci</button></div></div>`);CV.pending=o;return}
  cvBegin(o)}
function cvBegin(o){const c=cvP();cvExtra('');
  if(o.text){cvUser(o.text);return}
  const nm=ST.prof.name?' '+ST.prof.name:'';
  if(c.memOn&&c.last&&c.last.txt&&Date.now()-c.last.t<45*DAY){cvSet('think');CV.after=()=>cvListen();cvAsk([{role:'user',content:"(La personne vient d'ouvrir la conversation. Accueille-la chaleureusement en une ou deux phrases courtes, en reprenant doucement ce dont vous aviez parlé la dernière fois si c'est utile, et pose une seule question.)"}],true);return}
  const h=new Date().getHours();
  const g=CV.mode==='nuit'?`Je suis là${nm}. Tout doucement. Rien à régler maintenant. Dis-moi juste ce qui se passe, si tu veux.`
    :CV.mode==='apaise'?`Je suis là${nm}. On va y aller doucement, une chose à la fois. Qu'est-ce qui se passe pour toi ?`
    :`${h<5||h>=18?'Bonsoir':'Bonjour'}${nm}. Je t'écoute. Comment ça va, là, maintenant ?`;
  cvPush('assistant',g);$('#cvEly').textContent=g;cvSpeakAll([g],()=>{if(!CV.textMode)cvListen()})}
function cvPush(role,content){const c=cvP();c.msgs.push({r:role,c:String(content).slice(0,2000),t:Date.now()});if(c.msgs.length>80)c.msgs=c.msgs.slice(-80);save()}
/* micro */
async function cvListen(){if(!CV.open||CV.textMode)return cvSet('idle');
  if(!CV.mic){CV.mic=ElyraMic({onStart:cvHeard,onEnd:cvGotAudio,onLevel:v=>{$('#cvMic').style.setProperty('--lv',v.toFixed(2))},onError:cvMicErr})}
  if(!CV.mic.on){const ok=await CV.mic.start();if(!ok)return;}
  CV.live=true;$('#cvMic').setAttribute('aria-pressed','true');CV.mic.sens=1;CV.mic.pause(false);if(!CV.speaking&&!CV.busy)cvSet('listen')}
function cvMicOff(){CV.live=false;if(CV.mic)CV.mic.stop();$('#cvMic').setAttribute('aria-pressed','false');$('#cvMic').style.setProperty('--lv',0);if(!CV.speaking&&!CV.busy)cvSet('idle')}
function cvMicErr(k){CV.live=false;$('#cvMic').setAttribute('aria-pressed','false');
  cvExtra(`<div class="card flat cv-card"><p style="margin:0">${k==='refus'?"ELYRA n'a pas accès au micro. Autorise le micro pour ELYRA dans les réglages du téléphone (ou du navigateur), puis réessaie.":"Le micro n'est pas disponible ici."} Tu peux aussi m'écrire.</p><button class="ghost mt" data-cvkb="1">Écrire à ELYRA</button></div>`);cvSet('idle')}
function cvHeard(){if(CV.speaking&&cvP().interrupt){cvStopTalk();cvStatus(G("Je t'écoute…"))}if(!CV.busy)cvSet('listen')}
async function cvGotAudio(w){if(!w||!CV.open)return;const tk=++CV.ticket;cvSet('think');CV.busy=true;
  try{const r=await fetch(VOIX_URL()+'/stt',{method:'POST',headers:{'Content-Type':'audio/wav'},body:w});if(!r.ok)throw r;const j=await r.json();CV.busy=false;if(tk!==CV.ticket)return;
    const t=(j.text||'').trim();if(!t||cvEcho(t)){cvSet(CV.live?'listen':'idle');if(!t)cvStatus("Je n'ai pas bien entendu. Tu peux répéter ?");return}cvUser(t)}
  catch(e){CV.busy=false;cvNetErr(e)}}
function cvEcho(t){const a=new Set(CV.lastSaid.toLowerCase().split(/\W+/).filter(x=>x.length>3)),b=t.toLowerCase().split(/\W+/).filter(x=>x.length>3);if(!a.size||b.length<3)return false;return b.filter(x=>a.has(x)).length/b.length>.7}
function cvNetErr(e){const s=e&&e.status;CV.face.expr('doux');
  const m=!navigator.onLine||!s?"Je n'arrive pas à me connecter. Vérifie Internet. Les exercices et le SOS marchent toujours, même sans connexion."
    :s===429?"J'ai atteint ma limite gratuite pour aujourd'hui. Elle revient demain matin. En attendant, tu peux continuer dans Claude."
    :s===403?"Le petit serveur d'ELYRA refuse la connexion. Il faut vérifier sa configuration (voir le guide).":"Je n'ai pas réussi à répondre. Tu peux réessayer dans un instant.";
  cvStatus('');cvExtra(`<div class="card flat cv-card"><p style="margin:0">${esc(m)}</p><div class="row mt"><a class="btn ghost" href="${esc(chatHref(CV.mode))}" target="_blank" rel="noopener">Continuer dans Claude</a><button class="ghost" data-cvex="br:apaise">Respirer</button></div></div>`);
  cvSet(CV.live?'listen':'idle')}
/* la personne parle */
function cvUser(t){t=String(t).trim().slice(0,1500);if(!t)return;cvStopTalk();$('#cvYou').textContent=t;$('#cvEly').textContent='';cvExtra('');cvPush('user',t);CV.sess++;
  if(CRISIS.test(t))cvExtra(`<div class="cv-urg"><b>Ce que tu vis compte, et tu n'as pas à le porter sans aide.</b> Si tu penses à te faire du mal ou si tu es en danger, appelle maintenant :<div class="urg">${[['112','Urgence, danger immédiat'],['0800 32 123','Centre de Prévention du Suicide, gratuit, 24 h sur 24'],['107','Télé-Accueil, 24 h sur 24']].map(([n,d])=>`<a href="tel:${n.replace(/\s/g,'')}"><b>${n}</b><span>${d}</span></a>`).join('')}</div></div>`,true);
  else if(BODY.test(t))cvExtra(`<div class="cv-urg"><b>Tes sensations comptent.</b> Douleur ou oppression dans la poitrine, difficulté à respirer, engourdissement, malaise : appelle le <b>112</b> maintenant. Dans le doute, appeler est toujours une bonne décision. Médecin de garde : 1733.<div class="urg"><a href="tel:112"><b>112</b><span>Urgence</span></a><a href="tel:1733"><b>1733</b><span>Médecin de garde</span></a></div></div>`,true);
  const e=/panique|angoiss|peur|stress|crise|oppress/i.test(t)?'attentif':/triste|pleur|seul|vide|déprim/i.test(t)?'soucieux':/mieux|content|réussi|fier|bien passé/i.test(t)?'sourire':'attentif';CV.face.expr(e);
  cvSet('think');cvAsk(cvP().msgs.filter(m=>m.r==='user'||m.r==='assistant').slice(-16).map(m=>({role:m.r,content:m.c})))}
/* ELYRA répond, phrase par phrase */
const TECH=/\n?\s*(EXERCICE|VISAGE|M[EÉ]MOIRE)\s*:/i;
async function cvAsk(messages,greet){const c=cvP(),P=ST.prof,tk=++CV.ticket;CV.busy=true;CV.queue=[];if(!greet)CV.after=null;CV.abort=new AbortController();
  const exl=Object.entries(EX).filter(([k])=>/^(br|med|story|sos|outil):/.test(k)||['pensee','journal','videtete','expo'].includes(k));
  const last=c.memOn&&c.last?{last:c.last.txt,lastWhen:fmtD(c.last.t)}:{};
  const body=Object.assign({mode:CV.mode,name:P.name,genre:P.genre,memOn:!!c.memOn,mem:c.memOn?c.mem.map(x=>x.txt):[],ctx:P.ctxShare?ctxText():'',ex:exl,messages},last);
  let full='',spoken=0,done=false;
  const feed=()=>{let t=full;const m=t.search(TECH);if(m>=0)t=t.slice(0,m);else if(!done)t=t.replace(/\n\s*[A-ZÉ]{1,9}$/,'');
    $('#cvEly').textContent=t.trim();const rest=t.slice(spoken);let cut=0;
    if(done)cut=rest.length;else{const re=/[.!?…]+["»”)]*\s+/g;let mm;while((mm=re.exec(rest)))cut=mm.index+mm[0].length}
    const piece=rest.slice(0,cut).trim();spoken+=cut;if(piece)cvSpeak(piece)};
  try{const r=await fetch(VOIX_URL()+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:CV.abort.signal});
    if(!r.ok)throw r;
    const take=chunk=>{for(const line of chunk.split('\n')){const l=line.trim();if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(!d||d==='[DONE]')continue;
      try{const j=JSON.parse(d);const x=j.response!=null?j.response:(j.choices&&j.choices[0]&&(j.choices[0].delta&&j.choices[0].delta.content||j.choices[0].text))||'';if(x){full+=x;if(tk===CV.ticket)feed()}}catch(e){}}};
    if(r.body&&r.body.getReader){const rd=r.body.getReader(),dec=new TextDecoder();let buf='';for(;;){const {value,done:d}=await rd.read();if(d)break;buf+=dec.decode(value,{stream:true});const i=buf.lastIndexOf('\n');if(i>=0){take(buf.slice(0,i));buf=buf.slice(i+1)}}take(buf)}
    else take(await r.text());
    done=true;if(tk!==CV.ticket)return;feed();CV.busy=false;
    const ex=(full.match(/EXERCICE\s*:\s*([a-z]+(?::[a-z0-9]+)?)/i)||[])[1],vi=(full.match(/VISAGE\s*:\s*(\w+)/i)||[])[1],me=(full.match(/M[EÉ]MOIRE\s*:\s*(.+)/i)||[])[1];
    const text=full.split(TECH)[0].trim()||'Je suis là.';cvPush('assistant',text);if(vi)CV.face.expr(vi.toLowerCase());
    if(ex&&EX[ex.toLowerCase()])cvExtra(`<button class="sage cv-ex" data-cvex="${esc(ex.toLowerCase())}">Faire maintenant : ${esc(EX[ex.toLowerCase()])}</button>`,true);
    if(me&&c.memOn){const m=me.replace(/^\s*[a-z]+\s*\|\s*/i,'').trim().slice(0,200);if(m)cvExtra(`<div class="memp cv-card"><span>ELYRA propose de retenir : <b>${esc(m)}</b></span><div class="row mt"><button class="main" data-cvkeep="${esc(m)}">Garder</button><button class="ghost" data-cvno="1">Non merci</button></div></div>`,true)}
    if(!CV.queue.length&&!CV.speaking)cvAfterTalk()}
  catch(e){CV.busy=false;if(e&&e.name==='AbortError')return;if(tk===CV.ticket)cvNetErr(e)}}
/* la voix : celle du téléphone, avec les lèvres au rythme du texte */
/* voix naturelle d'ELYRA (Piper, calculée sur le téléphone) */
const SRV={tts:null,at:0};
async function srvPing(){if(!VOIX_URL()||Date.now()-SRV.at<60000&&SRV.tts!==null)return SRV.tts;try{const r=await fetch(VOIX_URL()+'/ping');const j=await r.json();SRV.tts=!!j.tts;SRV.at=Date.now()}catch(e){}try{piperUI()}catch(e){}return SRV.tts}
const cvVoice=()=>{const v=cvP().voice||'auto';if((v==='auto'||v==='humaine')&&SRV.tts)return 'humaine';return v==='tel'?'tel':'elyra'};
async function azureSay(text){text=oral(text);if(!PV.ac)PV.ac=new (window.AudioContext||window.webkitAudioContext)();
  const r=await fetch(VOIX_URL()+'/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice:VV()==='tom'?'m':'f'})});if(!r.ok)throw r;
  const buf=await r.arrayBuffer();const ab=await new Promise((ok,ko)=>{const p=PV.ac.decodeAudioData(buf,ok,ko);if(p&&p.then)p.then(ok,ko)});return{pcm:ab.getChannelData(0),sr:ab.sampleRate}}
const PV={state:'off',pct:0,w:null,cb:{},n:0,ac:null,src:null,raf:0,voice:'',ms:[]};
const PV_TOTAL=92e6;
const piperBase=()=>isNative?'https://priscivyro.github.io/Elyra/':new URL('.',location.href).href;
const piperVoice=()=>VV()==='tom'?'fr_FR-tom-medium':'fr_FR-siwis-medium';
const wantPiper=()=>cvVoice()==='elyra';
function piperStart(){if(PV.state==='loading'||(PV.state==='ready'&&PV.voice===piperVoice()))return;
  if(!window.Worker||!window.WebAssembly||typeof BigInt64Array==='undefined'){PV.state='nosupport';piperUI();return}
  if(PV.w){try{PV.w.terminate()}catch(e){}}PV.state='loading';PV.pct=0;PV.voice=piperVoice();const prog={};
  try{PV.w=new Worker('piper-worker.js')}catch(e){PV.state='error';piperUI();return}
  PV.w.onmessage=e=>{const m=e.data;
    if(m.type==='progress'){prog[m.url]=m.got;const g=Object.values(prog).reduce((a,x)=>a+x,0);PV.pct=Math.min(99,Math.round(g/PV_TOTAL*100));piperUI()}
    else if(m.type==='ready'){PV.state='ready';PV.pct=100;piperUI()}
    else if(m.type==='audio'){const c=PV.cb[m.id];delete PV.cb[m.id];PV.ms.push(m.ms);if(c)c.res(m)}
    else if(m.type==='error'){if(m.id!=null&&PV.cb[m.id]){PV.cb[m.id].rej(new Error(m.msg));delete PV.cb[m.id]}else if(PV.state!=='ready'){PV.state='error';PV.err=m.msg;piperUI()}}};
  PV.w.onerror=()=>{if(PV.state!=='ready'){PV.state='error';piperUI()}};
  PV.w.postMessage({type:'init',base:piperBase(),voice:PV.voice,lengthScale:VV()==='tom'?1.12:1.18})}
function piperSay(text){text=oral(text);return new Promise((res,rej)=>{const id=++PV.n;PV.cb[id]={res,rej};PV.w.postMessage({type:'say',id,text});setTimeout(()=>{if(PV.cb[id]){delete PV.cb[id];rej(new Error('lent'))}},20000)})}
/* Voix de conversation plus chaude : graves doux, aigus adoucis, petite pièce feutrée (comme les séances).
   Renvoie [entrée, sortie] d'une petite chaîne créée pour chaque phrase (la réverbération est calculée une fois). */
function pvWarm(ac){try{const f=(t,fr,gn,q)=>{const b=ac.createBiquadFilter();b.type=t;b.frequency.value=fr;b.gain.value=gn;if(q)b.Q.value=q;return b};
  if(!PV.ir||PV.ir.sampleRate!==ac.sampleRate){const n=Math.round(ac.sampleRate*.45),ir=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)}PV.ir=ir}
  const lo=f('lowshelf',200,2.5),mid=f('peaking',3200,-1.5,1),hi=f('highshelf',7000,-2.5),out=ac.createGain(),wet=ac.createGain(),cv=ac.createConvolver();
  cv.buffer=PV.ir;wet.gain.value=.1;lo.connect(mid).connect(hi);hi.connect(out);hi.connect(cv).connect(wet).connect(out);return [lo,out]}catch(e){const g=ac.createGain();return [g,g]}}
function pvPlay(pcm,sr,onEnd){try{if(!PV.ac)PV.ac=new (window.AudioContext||window.webkitAudioContext)();const ac=PV.ac;if(ac.state==='suspended')ac.resume();
  const b=ac.createBuffer(1,pcm.length,sr);b.getChannelData(0).set(pcm);const s=ac.createBufferSource();s.buffer=b;s.playbackRate.value=+ST.prof.rate||1;
  const g=ac.createGain();g.gain.value=1.5;const an=ac.createAnalyser();an.fftSize=1024;const W=pvWarm(ac);s.connect(W[0]);W[1].connect(g).connect(an).connect(ac.destination);
  PV.src=s;const d=new Float32Array(an.fftSize);
  const loop=()=>{if(PV.src!==s)return;an.getFloatTimeDomainData(d);let e=0;for(let i=0;i<d.length;i++)e+=d[i]*d[i];CV.face&&CV.face.level(Math.min(1,Math.sqrt(e/d.length)*6));PV.raf=requestAnimationFrame(loop)};loop();
  s.onended=()=>{if(PV.src!==s)return;PV.src=null;cancelAnimationFrame(PV.raf);CV.face&&CV.face.level(0);onEnd()};s.start()}catch(e){onEnd()}}
function pvStop(){const s=PV.src;PV.src=null;cancelAnimationFrame(PV.raf);if(s){try{s.stop()}catch(e){}}}
function piperUI(){const c=cvP(),want=c.voice||'auto',vv=cvVoice();
  const pip=PV.state==='ready'?"La voix ELYRA hors ligne est prête sur ce téléphone.":PV.state==='loading'?`Téléchargement de la voix ELYRA hors ligne : ${PV.pct} %. En attendant, c'est la voix du téléphone.`
    :PV.state==='error'?"La voix hors ligne n'a pas pu être préparée. Réessaie avec une bonne connexion.":PV.state==='nosupport'?"Ce téléphone ne peut pas calculer la voix hors ligne.":"Pas encore téléchargée (environ 90 Mo, une seule fois, de préférence en Wi-Fi).";
  const hum=SRV.tts?"Voix humaine active : ELYRA parle avec une voix Microsoft très naturelle (Internet nécessaire). Sans Internet, la voix hors ligne prend le relais."
    :"La voix humaine n'est pas encore activée (compte Microsoft gratuit, voir le guide). En attendant, ELYRA utilise sa voix hors ligne.";
  const n=$('#cvVoiceNote');if(n)n.textContent=vv==='elyra'&&PV.state!=='ready'?pip:'';
  const e=$('#pvStat');if(e)e.textContent=vv==='tel'?"ELYRA utilise la voix choisie dans « Voix du téléphone » ci-dessus.":(want==='humaine'||want==='auto')?hum+(vv==='elyra'?' '+pip:''):pip;
  const b=$('#pvGo');if(b)b.hidden=vv!=='elyra'||PV.state==='ready'||PV.state==='loading'||PV.state==='nosupport'}
function cvSpeak(t){const it={t,p:null};const pip=()=>PV.state==='ready'?piperSay(t).catch(()=>null):null;
  if(!cvP().muted){if(cvVoice()==='humaine')it.p=azureSay(t).catch(()=>pip());else if(wantPiper())it.p=pip()}CV.queue.push(it);if(!CV.speaking)cvNext()}
function cvSpeakAll(list,then){CV.after=then;list.forEach(cvSpeak)}
function cvNext(){const it=CV.queue.shift();if(!it){CV.speaking=false;CV.face.quiet();if(!CV.busy)cvAfterTalk();return}const t=it.t;
  CV.speaking=true;CV.lastSaid=t;cvSet('speak');if(CV.mic&&CV.mic.on){CV.mic.sens=cvP().interrupt?.42:1;CV.mic.pause(!cvP().interrupt)}
  const rate=+ST.prof.rate||1,sec=Math.max(1.2,t.length/14.5/rate),my=++CV.utt;
  const fin=()=>{if(my!==CV.utt)return;CV.utt++;cvNext()};
  if(cvP().muted){CV.face.talk(t,sec);setTimeout(fin,Math.min(6000,600+t.length*35));return}
  if(it.p){CV.face.quiet();it.p.then(r=>{if(my!==CV.utt)return;if(r&&r.pcm&&r.pcm.length)pvPlay(r.pcm,r.sr,fin);else cvPhone(t,sec,fin)});return}
  cvPhone(t,sec,fin)}
function cvPhone(t,sec,fin){const rate=+ST.prof.rate||1;
  CV.face.talk(t,sec);const guard=setTimeout(fin,sec*1600+3000);const ok=()=>{clearTimeout(guard);fin()};
  const cap=CapTTS();
  if(cap){try{cap.speak({text:t,lang:'fr-FR',rate:.95*rate,pitch:1,volume:1,category:'playback'}).then(ok,ok)}catch(e){ok()}return}
  try{const ss=window.speechSynthesis;if(!ss){return}const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=.95*rate;
    const v=voices.find(v=>v.name===ST.prof.vname)||voices.find(v=>/(premium|enhanced|améliorée|neural|natural)/i.test(v.name))||voices.find(v=>/fr[-_](BE|FR)/i.test(v.lang))||voices[0];if(v)u.voice=v;
    u.onboundary=e=>{CV.face.sync(e.charIndex||0,t)};u.onend=ok;u.onerror=ok;ss.speak(u)}catch(e){ok()}}
CV.utt=0;
function cvAfterTalk(){CV.speaking=false;CV.face&&CV.face.quiet();const a=CV.after;CV.after=null;if(a){a();return}if(CV.mic&&CV.mic.on){CV.mic.sens=1;CV.mic.pause(false)}cvSet(CV.live?'listen':'idle')}
function cvStopTalk(){CV.queue=[];CV.utt++;pvStop();CV.after=null;try{CV.abort&&CV.abort.abort()}catch(e){}CV.busy=false;CV.speaking=false;
  const cap=CapTTS();if(cap){try{cap.stop().catch(()=>{})}catch(e){}}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}CV.face&&CV.face.quiet()}
async function closeConv(){if(!CV.open)return;CV.open=false;cvStopTalk();cvMicOff();CV.ticket++;$('#conv').classList.remove('on');document.body.style.overflow='';SND.duck(false);$('#cvHistBox').hidden=true;
  const c=cvP();if(c.memOn&&CV.sess>=2&&VOIX_URL()){try{const r=await fetch(VOIX_URL()+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({summary:true,messages:c.msgs.slice(-16).map(m=>({role:m.r,content:m.c}))})});
    if(r.ok){const j=await r.json();if(j.text){c.last={t:Date.now(),txt:j.text};save()}}}catch(e){}}}
function cvHist(){const c=cvP(),b=$('#cvHistBox');b.hidden=!b.hidden;if(b.hidden)return;
  b.innerHTML=`<div class="row between"><h3>Historique</h3><button class="ghost" data-cvhclose="1">Fermer</button></div>${c.msgs.length?c.msgs.slice(-40).map(m=>`<div class="msg ${m.r==='user'?'u':'a'}"><small>${esc(fmtDT(m.t))}</small>${esc(m.c)}</div>`).join(''):'<p class="sub">Rien pour le moment.</p>'}
   ${c.msgs.length?'<button class="ghost mt" data-cvhwipe="1" style="color:var(--warm)">Effacer l’historique</button>':''}<p class="note">L'historique reste sur ce téléphone.</p>`;b.scrollTop=b.scrollHeight}
/* commandes */
$('#cvMic').onclick=()=>{if(CV.textMode){CV.textMode=false;$('#cvForm').hidden=true;$('#cvMicW').hidden=false}if(CV.live)cvMicOff();else{SND.ctx();cvListen()}};
$('#cvKb').onclick=()=>{CV.textMode=true;cvMicOff();$('#cvForm').hidden=false;$('#cvMicW').hidden=true;$('#cvIn').focus()};
$('#cvForm').onsubmit=e=>{e.preventDefault();const v=$('#cvIn').value.trim();if(!v)return;$('#cvIn').value='';if(!VOIX_URL()){openChat(CV.mode);return}cvUser(v)};
$('#cvEnd').onclick=closeConv;$('#cvSos').onclick=()=>{closeConv();openSOS()};
$('#cvMute').onclick=()=>{const c=cvP();c.muted=!c.muted;save();if(c.muted){const cap=CapTTS();if(cap){try{cap.stop().catch(()=>{})}catch(e){}}try{speechSynthesis.cancel()}catch(e){}}cvSubs()};
$('#cvSub').onclick=()=>{const c=cvP();c.subs=!c.subs;save();cvSubs()};
$('#cvHist').onclick=cvHist;
$('#cvFace').onclick=()=>{if(CV.speaking){cvStopTalk();cvAfterTalk()}};
$('#conv').addEventListener('click',e=>{const t=e.target;
  const m=t.closest('[data-cvm]');if(m){CV.mode=m.dataset.cvm;cvRenderModes();$('#cvClaude').href=chatHref(CV.mode);return}
  const k=t.closest('[data-cvmem]');if(k){cvP().memOn=k.dataset.cvmem==='1';save();const o=CV.pending||{};CV.pending=null;cvBegin(o);return}
  const x=t.closest('[data-cvex]');if(x){const id=x.dataset.cvex;closeConv();setTimeout(()=>doEx(id),60);return}
  const kp=t.closest('[data-cvkeep]');if(kp){const c=cvP();c.mem.push({id:'m'+uid(),txt:kp.dataset.cvkeep,t:Date.now()});save();kp.closest('.memp').outerHTML='<p class="note">C’est gardé. Tu peux le voir et l’effacer dans Mon espace.</p>';return}
  if(t.closest('[data-cvno]')){t.closest('.memp').remove();return}
  if(t.closest('[data-cvkb]')){$('#cvKb').click();return}
  if(t.closest('[data-cvhclose]')){$('#cvHistBox').hidden=true;return}
  if(t.closest('[data-cvhwipe]'))ask("Effacer l'historique ?","Les messages de la conversation à voix haute seront effacés de ce téléphone.",'Effacer',()=>{cvP().msgs=[];save();cvHist();cvHist()})});
addEventListener('keydown',e=>{if(e.key==='Escape'&&CV.open)closeConv()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&CV.open){cvStopTalk();cvMicOff()}});
/* Mon espace : ce que retient la conversation */
function renderCvMem(){const b=$('#cvMemBox');if(!b)return;const c=cvP();
  b.innerHTML=`<div class="sw"><span>Autoriser ELYRA à se souvenir du sujet de nos conversations à voix haute et de ce que je choisis de garder</span><input type="checkbox" id="cvMemOn" ${c.memOn?'checked':''}></div>
   ${c.last&&c.last.txt?`<div class="entry"><div><small>Dernière conversation · ${esc(fmtD(c.last.t))}</small><p>${esc(c.last.txt)}</p></div><button class="del" data-cvforget="last">Oublier</button></div>`:''}
   ${c.mem.map(m=>`<div class="mi"><input type="text" value="${esc(m.txt)}" data-cvedit="${esc(m.id)}" maxlength="200" aria-label="Modifier"><button class="del" data-cvforget="${esc(m.id)}">Supprimer</button></div>`).join('')}
   ${!c.mem.length&&!(c.last&&c.last.txt)?'<p class="sub">ELYRA n’a rien retenu pour le moment.</p>':''}
   <p class="mt" style="font-weight:600">Voix de la conversation</p><div class="row chips" id="cvVoiceSel">${[['humaine','Voix humaine (Internet)'],['elyra','ELYRA hors ligne'],['tel','Voix du téléphone']].map(([k,n])=>`<button data-cvvoice="${k}" aria-pressed="${((c.voice&&c.voice!=='auto')?c.voice:cvVoice())===k}">${n}</button>`).join('')}</div>
   <p class="note" id="pvStat"></p><button class="ghost" id="pvGo" hidden>Télécharger la voix naturelle maintenant</button>
   <div class="sw"><span>Pouvoir interrompre ELYRA en parlant (si elle se coupe toute seule, désactive)</span><input type="checkbox" id="cvIntOn" ${c.interrupt?'checked':''}></div>
   <div class="row mt"><button class="ghost" id="cvWipe" style="color:var(--warm)">Effacer mémoire et historique</button></div>
   <details class="mt"><summary class="note" style="cursor:pointer">Réglage avancé : adresse du serveur</summary><label class="f">Adresse du petit serveur ELYRA<input type="url" id="cvUrl" value="${esc(ST.prof.voixUrl||'')}" placeholder="${esc(CFG.voix||'https://elyra-voix.….workers.dev')}"></label><p class="note">Laisse vide pour utiliser l'adresse prévue par l'appli${CFG.voix?'':' (pas encore configurée)'}.</p></details>`;
  $('#cvMemOn').onchange=e=>{c.memOn=e.target.checked;save()};$('#pvGo').onclick=()=>{piperStart();piperUI()};piperUI();if(SRV.tts===null&&VOIX_URL())srvPing().then(()=>renderCvMem());$('#cvIntOn').onchange=e=>{c.interrupt=e.target.checked;save()};
  $('#cvUrl').onchange=e=>{const v=e.target.value.trim();if(v&&!/^https:\/\/[^\s]+$/.test(v)){toast('Adresse invalide (elle doit commencer par https://).');return}setP(p=>p.voixUrl=v)};
  $('#cvWipe').onclick=()=>ask('Tout effacer ?',"La mémoire et l'historique de la conversation à voix haute seront effacés de ce téléphone.",'Effacer',()=>{Object.assign(c,{msgs:[],mem:[],last:null});save();renderCvMem()})}
$('#cvMemBox').addEventListener('click',e=>{const vb=e.target.closest('[data-cvvoice]');if(vb){cvP().voice=vb.dataset.cvvoice;save();renderCvMem();return}const f=e.target.closest('[data-cvforget]');if(!f)return;const c=cvP();if(f.dataset.cvforget==='last')c.last=null;else c.mem=c.mem.filter(m=>m.id!==f.dataset.cvforget);save();renderCvMem()});
$('#cvMemBox').addEventListener('change',e=>{const i=e.target.closest('[data-cvedit]');if(!i)return;const c=cvP(),m=c.mem.find(x=>x.id===i.dataset.cvedit);if(!m)return;const v=i.value.trim();if(v)m.txt=v.slice(0,200);else c.mem=c.mem.filter(x=>x!==m);save()});
/* points d'entrée */
function talkEntry(e,o){if(!VOIX_URL())return;e.preventDefault();openConv(o||{})}
$('#talkHome').addEventListener('click',e=>talkEntry(e,{voice:true}));
$('#elyLive').onclick=()=>openConv({voice:true});

/* ============ RENDU GLOBAL ============ */
function renderAll(){for(const f of [renderTcc,renderHome,renderHomeTag,renderProgramme,renderElyra,renderMeds,renderStories,renderSounds,renderFavs,renderJournal,renderSommeil,renderParcours,renderComprendre,renderProgres,renderKit,renderEspace,renderOutils,renderCorps,renderLockBox,renderRappels,renderConsult,renderCvMem,()=>{if(XP.mode==='list')renderExpo()}]){try{f()}catch(e){console.error(e)}}}

/* ============ DÉMARRAGE ============ */
load();applyPrefs();renderAll();route();loadNativeVoices();
if(!ST.prof.onb)$('#onb').classList.add('on');else showLock();
loadVoiceIdx();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if('serviceWorker' in navigator&&location.protocol==='https:'&&!isNative){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cur()==='accueil')renderHome()});
}
