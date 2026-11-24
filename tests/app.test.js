// Test de l'appli ELYRA dans un navigateur simulé (jsdom).
// Usage : (cd ../www && python3 -m http.server 8766 &) ; node app.test.js http://localhost:8766/index.html
const {JSDOM}=require('jsdom');
const url=process.argv[2];
const errors=[];
const fakeAudio=()=>{const ctx={currentTime:0,sampleRate:8000,state:'running',resume(){},destination:{},
  createGain(){return{gain:P(),connect:x=>x||{connect:y=>y},disconnect(){}}},createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)}),
  createBufferSource(){return{connect:x=>x,start(){},stop(){},loop:false}},createBiquadFilter(){return{frequency:P(),Q:P(),connect:x=>x}},
  createStereoPanner(){return{pan:P(),connect:x=>x}},createOscillator(){return{frequency:P(),detune:P(),connect:x=>x,start(){},stop(){}}},
  createConvolver(){return{connect:x=>x}},createDynamicsCompressor(){return{threshold:P(),ratio:P(),connect:x=>x}}};
  function P(){return{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}}}
  return ctx};
JSDOM.fromURL(url,{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,
  beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
    w.AudioContext=function(){return fakeAudio()};w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};w.HTMLMediaElement.prototype.pause=function(){};
    w.addEventListener('error',e=>errors.push('error: '+(e.error&&e.error.stack||e.message)));
    w.console.error=(...a)=>errors.push('console.error: '+a.map(x=>x&&x.stack||x).join(' '))}}).then(dom=>{
const w=dom.window,d=w.document,$=s=>d.querySelector(s);
const click=s=>{const e=typeof s==='string'?$(s):s;if(!e)throw new Error('introuvable: '+s);e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const go=h=>{w.location.hash=h;w.dispatchEvent(new w.HashChangeEvent('hashchange'))};
const submit=s=>$(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{if(!c)errors.push('ÉCHEC: '+m);else console.log('✓',m)};
w.addEventListener('load',async()=>{try{
  ok($('#onb').classList.contains('on'),'écran de bienvenue au premier lancement');
  $('#onbName').value='Priscilla';click($('#onbGenre [data-genre="f"]'));click('#onbGo');
  ok(!$('#onb').classList.contains('on'),'bienvenue fermée');
  ok($('#hello').textContent.includes('Priscilla'),'prénom affiché : '+$('#hello').textContent);
  ok(d.querySelectorAll('#homeTiles .tile').length>=4,'suggestions « Pour toi, maintenant »');
  click($('#moodQuick button[data-v="2"]'));$('#qStress').value='8';click('#qSave');ok(/SOS/.test($('#suggTxt').textContent),'suggestion SOS si stress haut');
  await wait(400);ok(JSON.parse(w.localStorage.getItem('elyra.v1')).items.length===1,'humeur enregistrée sur le téléphone');
  for(const v of ['elyra','calme','journal','pensee','moi','parcours','sommeil','progres','kit','espace','comprendre','accueil']){go(v);ok($('#v-'+v).classList.contains('on'),'vue '+v)}
  // SOS
  click('#sosOpen');ok(d.querySelectorAll('#sosBody [data-sit]').length===6,'SOS : 6 situations');
  ok(/dépassée/.test($('#sosBody').textContent),'SOS : accord au féminin');
  ok(d.querySelectorAll('#sos .urg a').length===4,'SOS : 4 numéros d\'urgence');
  click($('#sosBody [data-sit="physique"]'));ok(/112/.test($('#sosBody').textContent),'SOS : alerte 112 pour sensations physiques');
  click($('#sosBody [data-opt="ground"]'));for(let i=0;i<6;i++)click('#fNext');ok(/Retour au calme/.test($('#sosBody').textContent),'SOS : ancrage puis retour au calme');
  click('#seSave');ok(!$('#sos').classList.contains('on'),'SOS fermé');
  click('#sosOpen');click($('#sosBody [data-sit="intense"]'));click($('#sosBody [data-opt="audio"]'));ok($('#player').classList.contains('on')&&/vague/i.test($('#plT').textContent),'SOS : audio « Traverser la vague »');
  click('#plClose');click($('#sosBody [data-opt="froid"]'));ok(/fraîche/.test($('#sosBody').textContent),'SOS : le froid qui ramène');click('#sosX');
  // Calme
  go('calme');click($('#presets [data-k="vague"]'));click('#brBtn');ok($('#brBtn').textContent==='Arrêter','respiration démarre');click('#brBtn');
  click('#brFav');ok(/Vague/.test($('#favBox').textContent),'favori affiché');
  click($('#calTabs [data-t="mediter"]'));ok(d.querySelectorAll('#meds .item').length===27,'27 séances');
  click($('#medCats [data-cat="sommeil"]'));ok(d.querySelectorAll('#meds .item').length===3,'filtre sommeil');
  click($('#meds [data-ex="med:scandodo"]'));ok($('#player').classList.contains('on'),'lecteur ouvert');
  await wait(600);ok($('#plSay').textContent.length>5,'texte de la séance affiché');
  click('#plNext');click('#plNext');await wait(400);click('#plPlay');ok(/Lecture/.test($('#plPlay').getAttribute('aria-label')),'pause');click('#plPlay');
  click('#plFav');ok(/★/.test($('#plFav').textContent),'favori depuis le lecteur');
  click('#plClose');ok(/Scan du soir/.test($('#resume').textContent),'reprise de lecture proposée');
  click($('#calTabs [data-t="histoires"]'));ok(d.querySelectorAll('#stories .item').length===4,'4 histoires');
  click($('#stories [data-ex="story:phare"]'));ok(/phare/.test($('#plT').textContent),'histoire ouverte');click('#plClose');
  click($('#calTabs [data-t="sons"]'));ok(d.querySelectorAll('#sounds .sndc').length===10,'10 sons');
  click($('#sounds [data-snd="pluie"]'));click($('#sounds [data-snd="feu"]'));ok(/Pluie douce, Feu/.test($('#sndState').textContent),'mélange de deux sons');
  ok(!!$('#sounds [data-vol="pluie"]'),'réglage de volume par son');click('#sndStop');await wait(50);ok(/Aucun/.test($('#sndState').textContent),'tout arrêter');
  click($('#mixes [data-mix="1"]'));await wait(120);ok(/Vagues/.test($('#sndState').textContent),'mélange prédéfini');click('#sndStop');
  // Journal + pensée
  go('journal');ok($('#jPrompt').textContent.length>5,'question pour écrire');click($('#moodJ button[data-v="3"]'));click($('#emoJ button'));click($('#sitJ button'));$('#jNote').value='Test';
  submit('#jForm');ok(/noté/.test($('#jMsg').textContent),'note de journal');
  go('pensee');$('#t1').value='Réunion';$('#t2').value='Je vais rater';for(let i=0;i<6;i++)click('#tNext');click($('#tTrap button'));click('#tNext');
  ok(/Pensée démêlée/.test($('#entries').textContent)&&/Je vais rater/.test($('#entries').textContent),'pensée démêlée enregistrée');
  // Sommeil
  go('sommeil');ok(d.querySelectorAll('#nightTiles .tile').length===9,'tuiles du soir');click($('#slQ button[data-v="4"]'));submit('#slForm');ok(/enregistrée/.test($('#slMsg').textContent),'nuit enregistrée');
  $('#vtTxt').value='trucs';click('#vtGo');ok(/posé/.test($('#vtMsg').textContent),'vide-tête');
  // Parcours
  go('parcours');ok(d.querySelectorAll('#progBox .item').length===12,'12 parcours');click($('#progBox [data-prog="elan"]'));click('#progPick');go('accueil');ok(/élan/.test($('#homeProg').textContent),'programme du jour');
  click($('#homeProg [data-stepdone]'));ok(/étape 2/.test($('#homeProg').textContent),'étape suivante');
  // Comprendre
  go('comprendre');ok(d.querySelectorAll('#comBox .item').length===11,'11 fiches');click($('#comBox [data-ex="fiche:aide"]'));ok(/0800 32 123/.test($('#comBox').textContent)&&/11 €/.test($('#comBox').textContent),'fiche « Demander de l\'aide »');
  click('#ficheNext');ok(/proche/.test($('#comBox').textContent),'fiche suivante');click('#comBack');ok(d.querySelectorAll('#comBox .item').length===11,'retour à la liste');
  // Progrès
  go('progres');$('#upTxt').value='Réunion';$('#upDate').value=new Date(Date.now()+864e5).toISOString().slice(0,10);submit('#upForm');go('accueil');ok(/Réunion/.test($('#homeUp').textContent),'situation à venir');
  go('progres');$('#goalTxt').value='Respirer';submit('#goalForm');ok(/Respirer/.test($('#goals').textContent),'objectif');
  $('#winTxt').value='Osé';submit('#winForm');ok(/Osé/.test($('#wins').textContent),'victoire');
  // Kit
  go('kit');click($('#kSug button'));ok(d.querySelectorAll('#kPhr .entry').length===1,'phrase ajoutée');
  $('#kConN').value='Philou';$('#kConP').value='0470 12 34 56';submit('#kConF');ok(/Philou/.test($('#kCon').textContent),'contact');
  click('#sosOpen');click($('#sosBody [data-sit="parler"]'));click($('#sosBody [data-opt="contacts"]'));ok(/Philou/.test($('#sosBody').textContent),'contacts dans le SOS');click('#sosX');
  // Espace
  go('espace');click($('#pVoiceMode [data-vmode="off"]'));ok(/sans être lues/.test($('#pVoiceInfo').textContent),'mode sans voix');click($('#pVoiceMode [data-vmode="elyra"]'));
  click($('#pSize [data-size="l"]'));ok(d.documentElement.dataset.size==='l','taille du texte');
  click($('#pTheme [data-theme="dark"]'));ok(d.documentElement.dataset.theme==='dark','mode sombre');click($('#pTheme [data-theme="auto"]'));
  click($('#pGenre [data-genre="m"]'));click('#sosOpen');ok(/dépassé\b/.test($('#sosBody').textContent)&&!/dépassée/.test($('#sosBody').textContent),'accord au masculin');click('#sosX');
  const backup=JSON.stringify({app:'ELYRA',version:'1',prof:JSON.parse(w.localStorage.getItem('elyra.v1')).prof,items:[{id:'x',t:Date.now(),kind:'victoire',note:'restauré'}]});
  go('espace');$('#impBox').value=backup;click('#impGo');click('#dlgOk');go('progres');ok(/restauré/.test($('#wins').textContent),'restauration');
  go('espace');click('#wipe');click('#dlgOk');ok($('#onb').classList.contains('on')&&!w.localStorage.getItem('elyra.v1'),'tout effacer');
  $('#onbName').value='<img src=x onerror=alert(1)>';click('#onbGo');ok(!d.querySelector('#hello img'),'texte échappé');
 }catch(e){errors.push('EXCEPTION: '+e.stack)}
 console.log(errors.length?'\n'+errors.join('\n'):'\nTOUT EST OK');process.exit(errors.length?1:0)})});
