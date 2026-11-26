/* ELYRA — L'Instant Présent : apprendre le silence intérieur.
   Parcours de 7 jours, sanctuaire libre, paysages immersifs, retour en douceur, évolution.
   Pendant la méditation : aucune voix, aucun texte, aucune musique imposée. Seulement le paysage.
   Données : A.st().prof.inst = {done:[jours terminés], feels:[{t,f,min,d}]} + une entrée « pratique » dans le journal des progrès. */
(function(){
const A=window.ElyraApp;if(!A)return;const {$,$$,esc,G,setP,addItem,wakeOn,wakeOff,SND}=A;
const PAYS=[
 ['lac','Lac paisible','Eau calme, montagnes et brume du matin.','lac'],
 ['foret','Forêt lumineuse','Rayons de soleil entre les arbres.','foret'],
 ['mer','Bord de mer','Horizon dégagé, vagues lentes.','plage'],
 ['prairie','Prairie','Fleurs sauvages et lumière dorée.','jardin'],
 ['montagne','Montagne','Sommets, nuages et air pur.','montagne'],
 ['aube','Aube dans la brume','La lumière qui se lève sur la vallée.','matin']];
const JOURS=[
 {n:"S'arrêter",min:3,but:"Découvrir qu'on peut faire une pause sans rien devoir accomplir.",
  intro:["Aujourd'hui, une seule chose : t'arrêter. Pas pour réussir quoi que ce soit. Juste pour voir ce que ça fait de ne rien faire pendant trois minutes.","Il est possible que ce soit inconfortable, ou que tu t'ennuies. C'est normal : nous avons rarement l'habitude de nous arrêter."],
  prep:["Installe-toi assis{e}, le dos soutenu, les pieds à plat.","Laisse tes épaules descendre et tes mains se poser.","Garde les yeux ouverts sur le paysage, ou ferme-les. Les deux sont bien."]},
 {n:'Observer sans suivre',min:5,but:"Remarquer les pensées sans te laisser emporter par elles.",
  intro:["Pendant ces cinq minutes, des pensées vont arriver. C'est ce que fait un esprit vivant : tu n'as pas à les empêcher.","Quand tu remarques une pensée, tu peux simplement te dire « tiens, une pensée », et la laisser repartir, comme un nuage qui traverse le ciel. Pas besoin de l'analyser ni de lui répondre."],
  prep:["Installe-toi confortablement.","Pose ton attention sur ta respiration, telle qu'elle est.","Chaque fois qu'une pensée t'emmène ailleurs, reviens au souffle. Revenir, c'est ça, méditer."]},
 {n:'Écouter la nature',min:5,but:"Te reconnecter à ce qui t'entoure, par les sens.",
  intro:["Aujourd'hui, ton point d'appui est l'extérieur : les sons, l'air, la lumière.","Tu peux activer le son de la nature si tu le souhaites. Écoute les sons arriver et repartir, proches et lointains, sans les juger agréables ou désagréables."],
  prep:["Laisse tes oreilles s'ouvrir, sans chercher.","Remarque aussi l'air sur ta peau, la température, les points de contact de ton corps.","Si l'esprit s'échappe, reviens à un son, n'importe lequel."],son:true},
 {n:'Laisser être',min:7,but:"Ne plus vouloir contrôler chaque sensation.",
  intro:["Souvent, on essaie de tout contrôler : la respiration, les pensées, les émotions. Aujourd'hui, tu essaies l'inverse : laisser faire.","La respiration se fait toute seule. Les pensées vont et viennent. Une émotion peut être là sans que tu aies à la chasser. Tu observes, comme on regarde la pluie tomber."],
  prep:["Installe-toi et sens tes pieds sur le sol.","Laisse ta respiration se faire sans la guider.","Si une sensation est désagréable, remarque-la avec douceur : « elle est là, elle peut rester un moment »."]},
 {n:"Habiter l'instant",min:8,but:"Développer la présence à ce qui se passe ici et maintenant.",
  intro:["L'esprit adore voyager entre hier et demain. Aujourd'hui, tu t'entraînes à revenir ici, maintenant.","Ce n'est pas grave de partir : l'important, c'est de remarquer, puis de revenir. Chaque retour est un petit pas."],
  prep:["Choisis un point d'ancrage : le souffle, les mains posées, ou les pieds au sol.","Quand tu remarques que tu es parti{e}, dis-toi simplement « ici », et reviens à ton ancrage.","Le paysage peut t'aider : regarde-le comme si tu le voyais pour la première fois."]},
 {n:'Accueillir le calme',min:10,but:"Découvrir que le calme n'exige pas l'absence de pensées.",
  intro:["On croit souvent que méditer, c'est faire le vide. Ce n'est pas le cas. Le calme peut exister au milieu des pensées, comme le fond d'un lac reste tranquille quand la surface bouge.","Il y aura peut-être des moments paisibles et des moments agités. Les deux font partie de la pratique. Aucun n'est un échec."],
  prep:["Installe-toi et laisse ton corps devenir lourd.","Accueille ce qui est là, calme ou agitation.","Si l'agitation est forte, ouvre les yeux sur le paysage et sens tes pieds au sol."]},
 {n:'Le silence libre',min:15,but:"Une méditation entièrement autonome, sans aucune consigne.",
  intro:["Tu as maintenant tout ce qu'il faut. Aujourd'hui, aucune consigne, aucune voix, aucun texte. Seulement toi et le silence.","Utilise ce qui t'a aidé{e} ces derniers jours : t'arrêter, observer sans suivre, écouter, laisser être, revenir ici. Et si tu as besoin de t'arrêter avant la fin, tu peux : c'est toi qui décides."],
  prep:["Installe-toi comme tu le sens.","Rappelle-toi : rien à faire, rien à atteindre.","Juste être là."]}];
const FEELS=[['apaise','Je me sens apaisé{e}'],['present','Je me sens plus présent{e}'],['agite','Mon esprit est toujours agité'],['fatigue','Je me sens fatigué{e}'],['sais','Je ne sais pas vraiment']];
const DUREES=[3,5,10,15,20,30,45,60];
const I=()=>{if(!A.st().prof.inst)A.st().prof.inst={done:[],feels:[],pays:'lac',son:false,timer:true,awake:false};return A.st().prof.inst};
const photo=k=>`photos/${(PAYS.find(p=>p[0]===k)||PAYS[0])[3]}.webp`;
let SAN={min:10,libre:false};

/* ---------- écrans de l'espace ---------- */
function render(){const box=$('#instBox');if(!box)return;const P=I(),next=JOURS.findIndex((j,i)=>!P.done.includes(i+1));
  const S=stats();
  box.innerHTML=`<div class="ip-hero" style="--ip:url(${photo(P.pays)})"><div class="ip-veil"></div><div class="ip-hin">
   <svg class="ip-logo" aria-hidden="true"><use href="#mk"/></svg><h1 id="instT">L'Instant Présent</h1><p class="ip-sig">Retrouve le silence en toi</p>
   <button class="main ip-go" data-ip="jour" data-d="${next<0?7:next+1}">${next<0?'Refaire le silence libre':P.done.length?`Continuer : jour ${next+1}`:'Commencer mon initiation'}</button></div></div>
  <p class="ip-quote">« Tu n'as rien à faire. Rien à atteindre. Juste être là. »</p>
  <div class="card"><h2>Découvrir le silence</h2><p class="sub">${esc(G("Sept étapes pour apprendre à méditer seul{e}, sans voix ni musique. À ton rythme : tu peux refaire un jour, faire une pause, ou t'arrêter quand tu veux."))}</p>
   <div class="ip-days">${JOURS.map((j,i)=>`<button class="ip-day${P.done.includes(i+1)?' done':''}" data-ip="jour" data-d="${i+1}"><span class="ip-n">${P.done.includes(i+1)?'✓':i+1}</span><span><b>${esc(G(j.n))}</b><small>${j.min} min · ${esc(G(j.but))}</small></span></button>`).join('')}</div></div>
  <div class="card"><h2>Mon sanctuaire</h2><p class="sub">Méditation libre, en silence. Tu choisis tout, et tu termines quand tu veux.</p>
   <h3 class="mt">Durée</h3><div class="row chips mt" id="ipDur">${DUREES.map(d=>`<button data-ipd="${d}" aria-pressed="${!SAN.libre&&SAN.min===d}">${d} min</button>`).join('')}<button data-ipd="libre" aria-pressed="${SAN.libre}">Sans objectif</button></div>
   <h3 class="mt2">Paysage</h3><div class="ip-pays" id="ipPays">${PAYS.map(p=>`<button data-ipp="${p[0]}" aria-pressed="${P.pays===p[0]}" style="--ip:url(${photo(p[0])})"><span>${esc(p[1])}</span></button>`).join('')}</div>
   <div class="ip-opts mt2">
    <label class="sw"><span>Sons de la nature (doux)</span><input type="checkbox" id="ipSon" ${P.son?'checked':''}></label>
    <label class="sw"><span>Afficher le minuteur</span><input type="checkbox" id="ipTim" ${P.timer?'checked':''}></label>
    <label class="sw"><span>Garder l'écran allumé (yeux ouverts)</span><input type="checkbox" id="ipAwake" ${P.awake?'checked':''}></label>
   </div>
   <button class="main mt2" data-ip="sanctuaire">Entrer dans mon sanctuaire</button></div>
  <div class="card"><h2>Mon évolution</h2>${S.n?`<div class="ip-stats"><div><b>${S.n}</b><small>séance${S.n>1?'s':''}</small></div><div><b>${S.min}</b><small>minutes de silence</small></div><div><b>${S.jours}</b><small>jour${S.jours>1?'s':''} de pratique</small></div><div><b>${P.done.length}/7</b><small>étapes découvertes</small></div></div>
   ${P.feels.length?`<h3 class="mt2">Tes derniers ressentis</h3><ul class="ip-feels">${P.feels.slice(0,6).map(f=>`<li><span>${esc(new Date(f.t).toLocaleDateString('fr-BE',{day:'numeric',month:'short'}))}</span> ${esc(G((FEELS.find(x=>x[0]===f.f)||['',''])[1]))} <small>· ${f.min} min${f.d?` · jour ${f.d}`:''}</small></li>`).join('')}</ul>`:''}
   <p class="sub mt">Il n'y a pas de bonne ou de mauvaise séance. Chaque moment de silence compte, même agité.</p>`:'<p class="sub">Ton évolution apparaîtra ici, sans compétition ni pression. Chaque moment compte, même court.</p>'}</div>
  <p class="note">L'Instant Présent n'est pas un traitement. Si l'angoisse devient trop forte pendant une séance, ouvre les yeux, sens tes pieds au sol, et arrête quand tu veux.</p>`}
function stats(){const L=A.st().items.filter(e=>e.kind==='pratique'&&String(e.ex||'').startsWith('instant'));
  return{n:L.length,min:L.reduce((a,e)=>a+(e.min||0),0),jours:new Set(L.map(e=>new Date(e.t).toDateString())).size}}

/* ---------- avant la séance : introduction, objectif, préparation ---------- */
function jour(d){const j=JOURS[d-1];const o=ov();
  o.innerHTML=`<div class="ip-bg" style="--ip:url(${photo(I().pays)})"></div><div class="ip-veil soft"></div>
   <div class="ip-card"><span class="tag lav">Jour ${d} sur 7 · ${j.min} minutes</span><h2>${esc(G(j.n))}</h2>
    <p class="ip-but"><b>L'objectif :</b> ${esc(G(j.but))}</p>${j.intro.map(t=>`<p>${esc(G(t))}</p>`).join('')}
    <div class="row mt2"><button class="main" id="ipPrep">Je me prépare</button><button class="ghost" id="ipClose">Plus tard</button></div></div>`;
  $('#ipClose').onclick=close;
  $('#ipPrep').onclick=()=>prep(j.prep,()=>seance({min:j.min,d,son:j.son?I().son||true:I().son}))}
function prep(lines,go){const c=$('#ipOv .ip-card');let i=0;
  const show=()=>{c.classList.add('fade');setTimeout(()=>{c.innerHTML=`<p class="ip-prep">${esc(G(lines[i]))}</p><div class="row mt2 center"><button class="main" id="ipNext">${i<lines.length-1?'Suivant':'Commencer le silence'}</button></div>`;c.classList.remove('fade');
    $('#ipNext').onclick=()=>{i++;if(i<lines.length)show();else go()}},300)};show()}

/* ---------- la méditation silencieuse, plein écran ---------- */
const M={t0:0,paused:0,acc:0,min:0,d:0,end:null,iv:null,son:false,libre:false};
function seance(o){const P=I();const ov0=ov();M.min=o.min||0;M.libre=!!o.libre;M.d=o.d||0;M.acc=0;M.paused=0;M.t0=Date.now();M.son=!!o.son;
  ov0.className='ip-ov on immersive';
  ov0.innerHTML=`<div class="ip-bg live" style="--ip:url(${photo(P.pays)})"></div><div class="ip-mist"></div><div class="ip-light"></div>
   <div class="ip-hud"><span class="ip-tim" id="ipTime" ${P.timer?'':'hidden'}></span>
    <div class="ip-ctl"><button class="ip-b" id="ipPause" aria-label="Pause">❚❚</button><button class="ip-b" id="ipTog" aria-label="Afficher ou masquer le minuteur">⏱</button><button class="ip-b" id="ipStop" aria-label="Terminer">Terminer</button></div></div>`;
  try{SND.ctx();SND.bell()}catch(e){}
  if(M.son){try{SND.only(({lac:'ruisseau',foret:'foret',mer:'vagues',prairie:'cigales',montagne:'vent',aube:'matin'})[P.pays]||'vagues')}catch(e){}}
  if(P.awake)wakeOn();
  // Les commandes s'effacent pour laisser toute la place au paysage ; un toucher les fait revenir.
  let hide;const hud=$('#ipOv .ip-hud');const wake=()=>{hud.classList.remove('off');clearTimeout(hide);hide=setTimeout(()=>hud.classList.add('off'),4000)};
  ov0.onclick=e=>{if(!e.target.closest('button'))wake()};wake();
  $('#ipPause').onclick=()=>{if(M.paused){M.t0=Date.now();M.paused=0;$('#ipPause').textContent='❚❚';ov0.classList.remove('paused')}else{M.acc+=Date.now()-M.t0;M.paused=1;$('#ipPause').textContent='▶';ov0.classList.add('paused')}wake()};
  $('#ipTog').onclick=()=>{setP(p=>{I().timer=!I().timer});$('#ipTime').hidden=!I().timer;wake()};
  $('#ipStop').onclick=()=>fin(true);
  clearInterval(M.iv);M.iv=setInterval(tickM,500);tickM()}
const el=()=>M.acc+(M.paused?0:Date.now()-M.t0);
function tickM(){const s=Math.floor(el()/1000),t=$('#ipTime');if(!t)return;
  if(M.libre)t.textContent=mm(s);else{const r=Math.max(0,M.min*60-s);t.textContent=mm(r);if(r<=0)fin(false)}}
const mm=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

/* ---------- retour en douceur ---------- */
function fin(stop){clearInterval(M.iv);const min=Math.max(1,Math.round(el()/60000));wakeOff();
  try{SND.bell()}catch(e){}if(M.son){try{SND.stopAll()}catch(e){}}
  const o=$('#ipOv');o.classList.add('back');
  const entry=addItem({kind:'pratique',ex:'instant'+(M.d?':jour'+M.d:':sanctuaire'),label:M.d?`L'Instant Présent, jour ${M.d}`:'Mon sanctuaire',min});
  if(M.d&&(!stop||el()>=M.min*60000*.5))setP(p=>{const P=I();if(!P.done.includes(M.d))P.done.push(M.d)});
  setTimeout(()=>{o.className='ip-ov on';o.innerHTML=`<div class="ip-bg" style="--ip:url(${photo(I().pays)})"></div><div class="ip-veil soft"></div>
   <div class="ip-card"><h2>Te voilà de retour.</h2><p class="sub">Prends le temps de bouger un peu les mains, de sentir tes pieds au sol. Rien ne presse.</p>
    <h3 class="mt2">Comment te sens-tu maintenant ?</h3><div class="ip-fl">${FEELS.map(([k,n])=>`<button data-ipf="${k}">${esc(G(n))}</button>`).join('')}</div>
    <div class="row mt2"><button class="ghost" id="ipSkip">Passer</button></div>
    <p class="note mt">Une séance n'est jamais réussie ou ratée : tu as pris ${min} minute${min>1?'s':''} pour toi.</p></div>`;
   $$('#ipOv [data-ipf]').forEach(b=>b.onclick=()=>{setP(p=>{I().feels.unshift({t:Date.now(),f:b.dataset.ipf,min,d:M.d});I().feels=I().feels.slice(0,200)});merci()});
   $('#ipSkip').onclick=close},1600)}
function merci(){const c=$('#ipOv .ip-card');c.innerHTML=`<h2>Merci.</h2><p>Ce calme, tu l'as trouvé en toi. Il reste disponible, même sans l'appli : quelques respirations, les pieds au sol, et tu peux y revenir.</p><div class="row mt2"><button class="main" id="ipDone">Revenir</button></div>`;$('#ipDone').onclick=close}

/* ---------- utilitaires ---------- */
function ov(){let o=$('#ipOv');if(!o){o=document.createElement('div');o.id='ipOv';document.body.appendChild(o)}o.className='ip-ov on';document.body.style.overflow='hidden';return o}
function close(){clearInterval(M.iv);wakeOff();const o=$('#ipOv');if(o){o.classList.add('out');setTimeout(()=>{o.remove();document.body.style.overflow=''},700)}render()}

document.addEventListener('click',e=>{const b=e.target.closest('#instBox [data-ip],#instBox [data-ipd],#instBox [data-ipp]');if(!b)return;
  if(b.dataset.ip==='jour')jour(+b.dataset.d);
  else if(b.dataset.ip==='sanctuaire')seance({min:SAN.min,libre:SAN.libre,son:I().son});
  else if(b.dataset.ipd){if(b.dataset.ipd==='libre')SAN.libre=true;else{SAN.libre=false;SAN.min=+b.dataset.ipd}render()}
  else if(b.dataset.ipp){setP(p=>{I().pays=b.dataset.ipp});render()}});
document.addEventListener('change',e=>{const id=e.target.id,map={ipSon:'son',ipTim:'timer',ipAwake:'awake'};if(map[id])setP(p=>{I()[map[id]]=e.target.checked})});
window.addEventListener('hashchange',()=>{if(location.hash==='#instant')render()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#ipOv')){if(M.iv&&$('#ipStop'))fin(true);else close()}});
render();
window.ElyraInstant={render,jour,seance,PAYS,JOURS};
})();
