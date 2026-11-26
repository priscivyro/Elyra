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
const modOk=(id,k)=>{const t=JSON.parse(w.localStorage.getItem('elyra.v1')||'{}');return !!(t.prof&&t.prof.tag&&t.prof.tag.m[id]&&t.prof.tag.m[id][k])};
const ok=(c,m)=>{if(!c)errors.push('ÉCHEC: '+m);else console.log('✓',m)};
w.addEventListener('load',async()=>{try{
  ok($('#onb').classList.contains('on'),'écran de bienvenue au premier lancement');
  $('#onbName').value='Priscilla';click($('#onbGenre [data-genre="f"]'));click('#onbGo');
  ok(!$('#onb').classList.contains('on'),'bienvenue fermée');
  ok($('#hello').textContent.includes('Priscilla'),'prénom affiché : '+$('#hello').textContent);
  // L'Instant Présent : parcours de 7 jours, séance silencieuse, retour en douceur, évolution
  go('#instant');await wait(80);ok($('#v-instant').classList.contains('on')&&d.querySelectorAll('#instBox .ip-day').length===7&&d.querySelectorAll('#ipPays button').length===6,"L'Instant Présent : 7 jours, 6 paysages");
  ok(!!$('.ip-door[href="#instant"]'),'porte depuis Calme');
  click('#instBox [data-ip="jour"][data-d="1"]');await wait(50);ok(/S.arr.ter/.test($('#ipOv').textContent)&&/objectif/.test($('#ipOv').textContent),'jour 1 : introduction et objectif');
  click('#ipPrep');for(let i=0;i<3;i++){await wait(400);click('#ipNext')}await wait(80);
  ok($('#ipOv').classList.contains('immersive')&&!!$('#ipOv .ip-bg.live')&&/^3:00|^2:5/.test($('#ipTime').textContent)&&!/[a-z]{4}/i.test($('#ipOv .ip-hud').textContent.replace(/Terminer/,'')),'méditation silencieuse plein écran, minuteur 3 min, aucun texte');
  click('#ipPause');ok($('#ipOv').classList.contains('paused'),'pause');click('#ipPause');
  click('#ipStop');await wait(1800);ok(/Te voilà de retour/.test($('#ipOv').textContent)&&d.querySelectorAll('#ipOv [data-ipf]').length===5,'retour en douceur et 5 ressentis');
  click('#ipOv [data-ipf="apaise"]');await wait(30);click('#ipDone');await wait(800);
  ok(!$('#ipOv')&&/1<\/b><small>séance/.test($('#instBox').innerHTML)&&/apaisée/.test($('#instBox .ip-feels').textContent),'évolution : séance et ressenti enregistrés');
  click('#instBox [data-ipd="libre"]');click('#instBox [data-ipp="mer"]');await wait(30);ok($('#instBox [data-ipd="libre"]').getAttribute('aria-pressed')==='true'&&$('#instBox [data-ipp="mer"]').getAttribute('aria-pressed')==='true','sanctuaire : sans objectif, bord de mer');
  click('#instBox [data-ip="sanctuaire"]');await wait(1200);ok(/^0:0/.test($('#ipTime').textContent),'sans objectif : le temps monte');click('#ipStop');await wait(1700);click('#ipSkip');await wait(800);
  go('#accueil');await wait(50);
  ok(d.querySelectorAll('#homeTiles .tile').length>=4,'suggestions « Pour toi, maintenant »');
  click($('#moodQuick button[data-v="2"]'));$('#qStress').value='8';click('#qSave');ok(/SOS/.test($('#suggTxt').textContent),'suggestion SOS si stress haut');
  await wait(400);ok(JSON.parse(w.localStorage.getItem('elyra.v1')).items.filter(e=>e.kind!=='pratique').length===1,'humeur enregistrée sur le téléphone');
  for(const v of ['elyra','calme','journal','pensee','moi','parcours','sommeil','progres','kit','espace','comprendre','accueil']){go(v);ok($('#v-'+v).classList.contains('on'),'vue '+v)}
  // SOS
  click('#sosOpen');ok(d.querySelectorAll('#sosBody [data-sit]').length===8,'SOS : 8 situations');ok(!!$('#sosBody [data-noir]'),'SOS : accès « pensées très sombres »');
  click($('#sosBody [data-noir]'));ok(/0800 32 123/.test($('#sosBody').textContent)&&/24 h sur 24/.test($('#sosBody').textContent),'SOS : pensées sombres → Centre de Prévention du Suicide');click('#sosBack');
  ok(/dépassée/.test($('#sosBody').textContent),'SOS : accord au féminin');
  ok(d.querySelectorAll('#sos .urg a').length===4,'SOS : 4 numéros d\'urgence');
  click($('#sosBody [data-sit="physique"]'));ok(/112/.test($('#sosBody').textContent),'SOS : alerte 112 pour sensations physiques');
  click($('#sosBody [data-opt="ground"]'));for(let i=0;i<6;i++)click('#fNext');ok(/Prendre du recul/.test($('#sosBody').textContent),'SOS : ancrage puis « prendre du recul »');
  click($('#sosBody [data-rec="0"]'));ok(!!$('#recKit'),'SOS : garder la phrase dans le kit');click('#recKit');
  click($('#sosBody [data-endnext]'));ok(/petite chose/.test($('#sosBody').textContent),'SOS : petite action finale');click($('#sosBody [data-act="eau"]'));click('#actNext');
  ok(/Retour au calme/.test($('#sosBody').textContent)&&!!$('#sosBody [data-helped]'),'SOS : retour au calme et « ce qui t\'a aidé »');click($('#sosBody [data-helped]'));
  click('#seSave');ok(!$('#sos').classList.contains('on'),'SOS fermé');
  click('#sosOpen');click($('#sosBody [data-sit="intense"]'));click($('#sosBody [data-opt="audio"]'));ok($('#player').classList.contains('on')&&/vague/i.test($('#plT').textContent),'SOS : audio « Traverser la vague »');
  click('#plClose');click($('#sosBody [data-opt="froid"]'));ok(/fraîche/.test($('#sosBody').textContent),'SOS : le froid qui ramène');click('#sosX');
  // Calme
  go('calme');click($('#presets [data-k="vague"]'));click('#brBtn');ok($('#brBtn').textContent==='Arrêter','respiration démarre');click('#brBtn');
  click('#brFav');ok(/Vague/.test($('#favBox').textContent),'favori affiché');
  click($('#calTabs [data-t="mediter"]'));ok(d.querySelectorAll('#meds .item').length===79,'79 séances');
  ok(d.querySelectorAll('#medSits .sitc .cov.art').length===14,'situations illustrées');ok(!!$('#meds .cov.art'),'couvertures illustrées');
  click($('#medCats [data-cat="eft"]'));ok(!$('#eftBox').hidden&&d.querySelectorAll('#meds .item').length===6,'catégorie EFT');click($('#eftChips [data-pt="CO"]'));ok(/Coin de l/.test($('#eftView').textContent)&&!!$('#eftView .ep.on[data-pt="CO"]'),'point EFT affiché');
  click($('#meds [data-ex="med:eftstress"]'));await wait(400);ok(!$('#plEft').hidden&&!!$('#plEft .ep.on[data-pt="MK"]'),'ronde EFT : point dans le lecteur');click('#plNext');click('#plNext');click('#plNext');click('#plNext');click('#plNext');click('#plNext');click('#plNext');click('#plNext');await wait(350);ok(!!$('#plEft .ep.on[data-pt="ST"]'),'ronde EFT : point suivant');click('#plClose');
  click($('#medCats [data-cat="tout"]'));
  click($('#medSits [data-sit="avant"]'));ok(d.querySelectorAll('#meds .item').length===5&&/examen/.test($('#meds').textContent),'séances par situation');
  click($('#medSits [data-sit="avant"]'));ok(d.querySelectorAll('#meds .item').length===79,'situation désélectionnée');
  click($('#lbMin [data-m="5"]'));click('#lbGo');ok(/En cours/.test($('#libre').textContent),'méditation libre démarre');click('#lbStop');ok(!!$('#lbGo'),'méditation libre arrêtée');
  click($('#medCats [data-cat="sommeil"]'));ok(d.querySelectorAll('#meds .item').length===5,'filtre sommeil');
  click($('#meds [data-ex="med:scandodo"]'));ok($('#player').classList.contains('on'),'lecteur ouvert');
  await wait(600);ok($('#plSay').textContent.length>5,'texte de la séance affiché');
  click('#plNext');click('#plNext');await wait(400);click('#plPlay');ok(/Lecture/.test($('#plPlay').getAttribute('aria-label')),'pause');click('#plPlay');
  click('#plFav');ok(/★/.test($('#plFav').textContent),'favori depuis le lecteur');
  {const t1=$('#plTot').textContent;click('#plLen');ok(/longues/.test($('#plLen').textContent)&&$('#plTot').textContent!==t1,'pauses longues');click('#plLen')}
  click('#plClose');ok(/Scan du soir/.test($('#resume').textContent),'reprise de lecture proposée');
  click($('#calTabs [data-t="histoires"]'));ok(d.querySelectorAll('#stories .item').length===12,'12 histoires');
  click($('#stories [data-ex="story:phare"]'));ok(/phare/.test($('#plT').textContent),'histoire ouverte');click('#plClose');
  click($('#calTabs [data-t="sons"]'));ok(d.querySelectorAll('#sounds .sndc').length===17,'17 ambiances');ok(d.querySelectorAll('#musics .sndc').length===8,'8 musiques');ok(d.querySelectorAll('#alts .sndc').length===2,'2 sons gauche-droite');
  click($('#musics [data-snd="piano"]'));ok(/Piano doux/.test($('#sndState').textContent),'musique lancée');click('#sndStop');await wait(50);
  click($('#sounds [data-snd="pluie"]'));click($('#sounds [data-snd="feu"]'));ok(/Pluie douce, Feu/.test($('#sndState').textContent),'mélange de deux sons');
  ok(!!$('#sounds [data-vol="pluie"]'),'réglage de volume par son');click('#sndStop');await wait(50);ok(/Aucun/.test($('#sndState').textContent),'tout arrêter');
  click([...d.querySelectorAll('#mixes [data-mix]')].find(b=>/Bord de mer/.test(b.textContent)));await wait(120);ok(/Vagues/.test($('#sndState').textContent),'mélange prédéfini');click('#sndStop');
  go('tcc');ok(d.querySelectorAll('#tccBox .item').length>=18&&/Mon cercle anxieux/.test($('#tccBox').textContent),'espace Apprivoiser l\'anxiété');
  click($('#tccBox [data-ex="outil:cercle"]'));ok(/cercle anxieux/i.test(d.body.textContent),'outil cercle ouvert');
  // Journal + pensée
  go('journal');ok($('#jPrompt').textContent.length>5,'question pour écrire');click($('#moodJ button[data-v="3"]'));click($('#emoJ button'));click($('#sitJ button'));$('#jNote').value='Test';
  submit('#jForm');ok(/noté/.test($('#jMsg').textContent),'note de journal');
  go('pensee');$('#t1').value='Réunion';$('#t2').value='Je vais rater';for(let i=0;i<6;i++)click('#tNext');click($('#tTrap button'));click('#tNext');
  ok(/Pensée démêlée/.test($('#entries').textContent)&&/Je vais rater/.test($('#entries').textContent),'pensée démêlée enregistrée');
  // Sommeil
  go('sommeil');ok(d.querySelectorAll('#nightTiles .tile').length===9,'tuiles du soir');click($('#slQ button[data-v="4"]'));submit('#slForm');ok(/enregistrée/.test($('#slMsg').textContent),'nuit enregistrée');
  $('#vtTxt').value='trucs';click('#vtGo');ok(/posé/.test($('#vtMsg').textContent),'vide-tête');
  // Parcours
  go('parcours');ok(d.querySelectorAll('#progBox .item').length===16&&/Série audio/.test($('#progBox').textContent),'15 parcours dont séries audio');click($('#progBox [data-prog="elan"]'));click('#progPick');go('accueil');ok(/élan/.test($('#homeProg').textContent),'programme du jour');
  click($('#homeProg [data-stepdone]'));ok(/étape 2/.test($('#homeProg').textContent),'étape suivante');
  // Programme TAG
  go('programme');ok(d.querySelectorAll('#tagBox .item').length===8,'programme : 8 modules');
  click($('#tagBox [data-mod="m5"]'));ok(/anticipatoire/.test($('#tagBox h1').textContent),'module 5 ouvert');
  ok(!!$('#tagBox .schema svg'),'schéma affiché');
  $('#tf-sit').value='Prendre la voiture';$('#tf-pire').value='Me sentir mal';$('#tf-date').value=new Date(Date.now()+2*864e5).toISOString().slice(0,10);
  $('#tagBox details[data-sec="ex"]').open=true;click('#tagExSave');await wait(900);ok(modOk('m5','ex'),'exercice enregistré');
  ok($('#tagBox details[data-sec="ex"]').open,'section restée ouverte après enregistrement');
  go('journal');ok(/Programme TAG/.test($('#entries').textContent)&&/Prendre la voiture/.test($('#entries').textContent),'exercice visible dans le journal');
  go('accueil');ok(/Prendre la voiture/.test($('#homeUp').textContent),'situation ajoutée à « bientôt »');
  ok(/Module 5/.test($('#homeTag').textContent),'carte du programme sur l\'accueil');
  click($('#homeTag [data-mod]'));ok(/anticipatoire/.test($('#tagBox h1').textContent),'reprise depuis l\'accueil');
  click('#tagMiseGo');ok(!$('#tagMiseA').hidden,'piste de la mise en situation');
  click('#tagDefi');go('progres');ok(/Défi :/.test($('#goals').textContent),'défi ajouté aux objectifs');go('programme');
  $('#tagBox details[data-sec="quiz"]').open=true;d.querySelectorAll('#tagBox .qz').forEach(fs=>{fs.querySelector('input').checked=true});click('#tagQuiz');ok(/sur 3/.test($('#tagQuizMsg').textContent)&&!d.querySelector('#tagBox .qe').hidden,'quiz corrigé avec explications');
  $('#tagNote').value='Préparer a une fin';click('#tagNoteSave');ok(/terminé/.test($('#tagBox').textContent),'module terminé (exercice + synthèse)');
  click($('#tagBox [data-mod="m6"]'));$('#tagBox details[data-sec="ex"]').open=true;click($('#tagBox [data-addstep]'));ok(d.querySelectorAll('#tagBox .steprow').length===4,'échelle : ajout d\'étape');
  d.querySelector('#tagBox .steprow input[type=text]').value='Photo de station';click('#tagExSave');await wait(900);ok(modOk('m6','ex'),'échelle enregistrée');
  click('#tagBack');ok(/1 module\(s\) terminé/.test($('#tagBox').textContent),'progression du programme');
  // Comprendre
  go('comprendre');ok(d.querySelectorAll('#comBox .item').length===13,'13 fiches');click($('#comBox [data-ex="fiche:aide"]'));ok(/0800 32 123/.test($('#comBox').textContent)&&/11 €/.test($('#comBox').textContent),'fiche « Demander de l\'aide »');
  click('#ficheNext');ok(/proche/.test($('#comBox').textContent),'fiche suivante');click('#comBack');ok(d.querySelectorAll('#comBox .item').length===13,'retour à la liste');
  // Progrès
  go('progres');$('#upTxt').value='Réunion';$('#upDate').value=new Date(Date.now()+864e5).toISOString().slice(0,10);submit('#upForm');go('accueil');ok(/Réunion/.test($('#homeUp').textContent),'situation à venir');
  go('progres');$('#goalTxt').value='Respirer';submit('#goalForm');ok(/Respirer/.test($('#goals').textContent),'objectif');
  $('#winTxt').value='Osé';submit('#winForm');ok(/Osé/.test($('#wins').textContent),'victoire');
  // Kit
  go('kit');click($('#kSug button'));ok(d.querySelectorAll('#kPhr .entry').length===2,'phrase ajoutée (en plus de celle gardée depuis le SOS)');
  $('#kConN').value='Philou';$('#kConP').value='0470 12 34 56';submit('#kConF');ok(/Philou/.test($('#kCon').textContent),'contact');
  click('#sosOpen');click($('#sosBody [data-sit="parler"]'));click($('#sosBody [data-opt="contacts"]'));ok(/Philou/.test($('#sosBody').textContent),'contacts dans le SOS');click('#sosX');
  // Boîte à outils et « ça t'a aidé ? »
  go('outils');ok(d.querySelectorAll('#outBox .tool').length>=22,'boîte à outils : '+d.querySelectorAll('#outBox .tool').length+' outils');
  click($('#outNeeds [data-need="pensees"]'));ok(d.querySelectorAll('#outBox .tool').length<12&&/Prendre du recul/.test($('#outBox').textContent),'filtre « mes pensées tournent »');click($('#outNeeds [data-need="pensees"]'));
  click($('#outBox [data-ex="outil:defusion"]'));await wait(30);ok($('#v-outil').classList.contains('on'),'outil de défusion ouvert');
  click('#trNext');click('#trNext');ok(/quelques mots/.test($('#trMsg').textContent),'champ obligatoire');
  $('#trIn').value='Je vais craquer';click('#trNext');$('#trR').value='8';click('#trNext');
  click($('#toolBox [data-pick="1"]'));ok(/Je vais craquer/.test($('#river').textContent),'défusion : la feuille sur la rivière');
  click('#river');ok(d.querySelectorAll('#river .leaf').length===2,'nouvelle feuille');
  click('#trNext');$('#trR').value='4';click('#trNext');ok(/8\/10, maintenant à 4\/10/.test($('#toolBox').textContent),'défusion : avant / après');
  click('#trNext');await wait(600);ok($('#rate').classList.contains('on')&&/aidée/.test($('#rateQ').textContent),'« Ça t\'a aidée ? » après l\'exercice');
  click($('#rate [data-help="2"]'));ok(!$('#rate').classList.contains('on'),'réponse enregistrée');
  ok(/Ce qui t'aide le plus/.test($('#outBox').textContent)&&/T'aide beaucoup/.test($('#outBox').textContent),'boîte à outils personnalisée');
  go('accueil');ok(/Prendre du recul/.test($('#homeHelp').textContent),'accueil : « Ce qui t\'aide »');
  click('#sosOpen');click($('#sosBody [data-sit="rumine"]'));ok(['defusion','ground'].includes($('#sosBody [data-opt]').dataset.opt)&&/T’aide souvent/.test($('#sosBody').textContent),'SOS : ce qui aide proposé en premier');
  click($('#sosBody [data-opt="defusion"]'));ok(!!$('#sosBody #trNext'),'SOS : outil de défusion dans le SOS');click('#sosX');
  go('journal');ok(/Prendre du recul avec une pensée/.test($('#entries').textContent),'outil visible dans le journal');
  go('outils');click($('#outBox [data-ex="outil:reporter"]'));await wait(30);click('#trNext');$('#trIn').value='Et si je rate mon examen';click('#trNext');click('#trNext');await wait(50);
  ok(/boîte à soucis/i.test($('#outBox').textContent)&&/rate mon examen/.test($('#outBox').textContent),'inquiétude rangée dans la boîte à soucis');click('[data-rateclose]');
  click($('#outBox [data-sz^="probleme:"]'));await wait(30);click('#trNext');ok($('#trIn').value==='Et si je rate mon examen','boîte à soucis → résoudre un problème (prérempli)');
  go('outils');click($('#outBox [data-ex="outil:valeurs"]'));await wait(30);click('#trNext');click($('#trCh button'));click('#trNext');click($('#trCh button'));click('#trNext');
  $('#trIn').value='Voir mes amis';click('#trNext');$('#trIn').value='Appeler Philou jeudi';click('#trNext');click('#trNext');click('#trNext');
  ok(/Appeler Philou jeudi/.test($('#toolBox').textContent)&&!!$('#trGoal'),'valeurs : résumé et prochain pas');click('#trGoal');go('progres');ok(/Appeler Philou/.test($('#goals').textContent),'pas ajouté aux objectifs');
  go('outils');click($('#outBox [data-ex="outil:matrice"]'));await wait(30);click('#trNext');for(const t of ['Ma famille','Sortir','La peur','Rester chez moi']){$('#trIn').value=t;click('#trNext')}
  ok(d.querySelectorAll('#toolBox .mxc').length===4&&/Rester chez moi/.test($('#toolBox .mx').textContent),'boussole ACT en 4 cases');
  // Coach d'exposition
  go('outils');click($('#outBox [data-ex="expo"]'));await wait(30);ok($('#v-expo').classList.contains('on')&&!!$('#xpImp'),'coach : reprendre l\'échelle du module 6');
  click('#xpImp');click('#xpSave');ok(d.querySelectorAll('#expoBox .rung').length>=1,'coach : échelle enregistrée');
  click($('#expoBox .rung.next [data-xgo]'));$('#xpP').value='7';$('#xpP').dispatchEvent(new w.Event('input',{bubbles:true}));click($('#xpD button'));click('#xpGo');
  ok(!!$('#xpEl')&&/Pendant/.test($('#expoBox').textContent),'coach : pendant');click('#xpDone');
  $('#xpK').value='3';$('#xpK').dispatchEvent(new w.Event('input',{bubbles:true}));click($('#xpR [data-v="non"]'));$('#xpL').value='Ça redescend';click('#xpSave2');
  ok(/moins forte que prévu/.test($('#expoBox').textContent)&&/ne s'est pas produit/.test($('#expoBox').textContent),'coach : bilan après l\'essai');
  click('#xpTame');ok(!!$('#expoBox .rung.done'),'coach : marche apprivoisée');
  go('journal');ok(/Exposition/.test($('#entries').textContent)&&/Ça redescend/.test($('#entries').textContent),'essai visible dans le journal');
  // Mon corps
  go('corps');ok(/112/.test($('#corpsBox .warnb').textContent),'Mon corps : quand appeler le 112');
  click($('#corpsBox [data-zone="poitrine"]'));ok(!!$('#corpsBox .bz.on'),'silhouette : zone choisie');click($('#cbS [data-v="Palpitations"]'));
  $('#cbI').value='8';$('#cbI').dispatchEvent(new w.Event('input',{bubbles:true}));click('#cbSave');ok(/n'attends pas/.test($('#corpsBox').textContent),'sensation forte non vérifiée : orientation 112 / 1733');
  ok(/1 sensation/.test($('#corpsBox').textContent),'historique des sensations');
  // Consultation
  go('consult');ok(/Humeur et stress/.test($('#consultDoc').textContent)&&/Sensations physiques/.test($('#consultDoc').textContent)&&/aucun diagnostic/.test($('#consultDoc').textContent),'résumé pour la consultation');
  click($('#consultBox [data-cond="90"]'));ok(/3 derniers mois/.test($('#consultBox [aria-pressed=true]').textContent),'période 3 mois');
  // Nuit
  click('#sosOpen');click($('#sosBody [data-sit="nuit"]'));click($('#sosBody [data-opt="nuitv"]'));ok($('#nuit').classList.contains('on')&&!$('#sos').classList.contains('on'),'écran de nuit');
  click($('#nuit [data-n="br"]'));ok(!!$('#nuBr .stage'),'nuit : respiration');click($('#nuit [data-n="vt"]'));$('#nuVt').value='demain';click('#nuVtGo');ok(/posé/.test($('#nuVtM').textContent),'nuit : vide-tête');
  click($('#nuit [data-n="hist"]'));ok(d.querySelectorAll('#nuitZone [data-nst]').length===12,'nuit : histoires');click('#nuitX');ok(!$('#nuit').classList.contains('on'),'nuit fermée');
  // Verrou, rappels, contexte
  go('espace');click('#lkOn');ok($('#lock').classList.contains('on'),'verrou : choisir un code');for(const k of '1234')click($(`#lockPad [data-d="${k}"]`));await wait(50);ok(/Confirme/.test($('#lockT').textContent),'verrou : confirmer le code');for(const k of '1234')click($(`#lockPad [data-d="${k}"]`));await wait(500);
  ok(!$('#lock').classList.contains('on')&&JSON.parse(w.localStorage.getItem('elyra.v1')).prof.lock.on,'verrou activé (code enregistré, pas en clair)');
  ok(!/1234/.test(JSON.stringify(JSON.parse(w.localStorage.getItem('elyra.v1')).prof.lock)),'code non stocké en clair');
  click('#lkOff');for(const k of '9999')click($(`#lockPad [data-d="${k}"]`));await wait(400);ok(/pas le bon/.test($('#lockMsg').textContent),'mauvais code refusé');
  ok(!!$('#lockSos')&&d.querySelectorAll('#lock .urg a').length===4,'SOS et urgences accessibles sur l\'écran verrouillé');
  for(const k of '1234')click($(`#lockPad [data-d="${k}"]`));await wait(400);ok(!JSON.parse(w.localStorage.getItem('elyra.v1')).prof.lock.on,'code retiré');
  const rc=$('#remBox [data-rem="humeur"]');rc.checked=true;rc.dispatchEvent(new w.Event('change',{bubbles:true}));await wait(300);ok(JSON.parse(w.localStorage.getItem('elyra.v1')).prof.rem.humeur.on&&!!$('#remIcs'),'rappels : calendrier sur iPhone');
  const cx=$('#pCtx');cx.checked=true;cx.dispatchEvent(new w.Event('change',{bubbles:true}));ok(/&c=/.test($('#talkHome').href)&&/Programme%20TAG|aide/.test($('#talkHome').href),'contexte partagé avec ELYRA (si accepté)');
  cx.checked=false;cx.dispatchEvent(new w.Event('change',{bubbles:true}));ok(!/&c=/.test($('#talkHome').href),'contexte non partagé par défaut');
  // Espace
  go('espace');ok(d.querySelectorAll('#pVVoice button').length===2,'choix voix féminine / masculine');click($('#pVoiceMode [data-vmode="off"]'));ok(/sans être lues/.test($('#pVoiceInfo').textContent),'mode sans voix');click($('#pVoiceMode [data-vmode="elyra"]'));
  click($('#pSize [data-size="l"]'));ok(d.documentElement.dataset.size==='l','taille du texte');
  click($('#pTheme [data-theme="dark"]'));ok(d.documentElement.dataset.theme==='dark','mode sombre');click($('#pTheme [data-theme="auto"]'));
  click($('#pGenre [data-genre="m"]'));click('#sosOpen');ok(/dépassé\b/.test($('#sosBody').textContent)&&!/dépassée/.test($('#sosBody').textContent),'accord au masculin');click('#sosX');
  const backup=JSON.stringify({app:'ELYRA',version:'1',prof:JSON.parse(w.localStorage.getItem('elyra.v1')).prof,items:[{id:'x',t:Date.now(),kind:'victoire',note:'restauré'}]});
  go('espace');$('#impBox').value=backup;click('#impGo');click('#dlgOk');go('progres');ok(/restauré/.test($('#wins').textContent),'restauration');
  go('espace');click('#wipe');click('#dlgOk');ok($('#onb').classList.contains('on')&&!w.localStorage.getItem('elyra.v1'),'tout effacer');
  $('#onbName').value='<img src=x onerror=alert(1)>';click('#onbGo');ok(!d.querySelector('#hello img'),'texte échappé');
 }catch(e){errors.push('EXCEPTION: '+e.stack)}
 console.log(errors.length?'\n'+errors.join('\n'):'\nTOUT EST OK');process.exit(errors.length?1:0)})});
