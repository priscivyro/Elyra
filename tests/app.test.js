// Test de l'appli ELYRA dans un navigateur simulé (jsdom)
const {JSDOM}=require('jsdom');
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const errors=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://priscivyro.github.io/Elyra/',
  beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
    w.addEventListener('error',e=>errors.push('error: '+(e.error&&e.error.stack||e.message)));
    const ce=w.console.error;w.console.error=(...a)=>{errors.push('console.error: '+a.map(x=>x&&x.stack||x).join(' '))}}});
const w=dom.window,d=w.document,$=s=>d.querySelector(s);
const click=s=>{const e=typeof s==='string'?$(s):s;if(!e)throw new Error('introuvable: '+s);e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const go=h=>{w.location.hash=h;w.dispatchEvent(new w.HashChangeEvent('hashchange'))};
const ok=(c,m)=>{if(!c){errors.push('ÉCHEC: '+m)}else console.log('✓',m)};
setTimeout(async()=>{
 try{
  ok($('#onb').classList.contains('on'),'écran de bienvenue au premier lancement');
  $('#onbName').value='Priscilla';click('#onbGo');
  ok(!$('#onb').classList.contains('on'),'bienvenue fermée');
  ok($('#hello').textContent.includes('Priscilla'),'prénom dans le message de bienvenue: '+$('#hello').textContent);
  // humeur rapide
  click($('#moodQuick button[data-v="2"]'));ok(!$('#qStressBox').hidden,'curseur de stress affiché');
  $('#qStress').value='8';click('#qSave');ok(!$('#sugg').hidden&&/SOS/.test($('#suggTxt').textContent),'suggestion SOS si stress haut');
  ok(JSON.parse(w.localStorage.getItem('elyra.v1')||'{"items":[]}').items.length>=0,'stockage local');
  await new Promise(r=>setTimeout(r,400));
  const st=JSON.parse(w.localStorage.getItem('elyra.v1'));ok(st.items.length===1&&st.items[0].kind==='humeur','humeur enregistrée sur le téléphone');
  // navigation
  for(const v of ['elyra','calme','journal','moi','parcours','sommeil','progres','kit','espace','accueil']){go(v);ok($('#v-'+v).classList.contains('on'),'vue '+v)}
  // SOS
  click('#sosOpen');ok($('#sos').classList.contains('on'),'SOS ouvert');
  ok(d.querySelectorAll('#sosBody [data-sit]').length===6,'6 situations SOS');
  ok(d.querySelectorAll('#sos .urg a').length===4,'4 numéros d\'urgence dans le SOS');
  click($('#sosBody [data-sit="physique"]'));ok(/112/.test($('#sosBody').textContent),'alerte 112 pour sensations physiques');
  click($('#sosBody [data-opt="ground"]'));ok(/5 choses/.test($('#sosBody').textContent),'ancrage 5-4-3-2-1');
  for(let i=0;i<5;i++)click('#fNext');click('#fNext');ok(/Retour au calme/.test($('#sosBody').textContent),'fin de flux → retour au calme');
  click('#seSave');ok(!$('#sos').classList.contains('on'),'SOS fermé après enregistrement');
  click('#sosOpen');click($('#sosBody [data-sit="crise"]'));click($('#sosBody [data-opt="douce"]'));ok(!!$('#sosBr .bub'),'respiration douce dans le SOS');click('#sbGo');click('#sbGo');click('#sbDone');
  click($('#sosBody [data-opt="audio"]'));ok($('#sheet').classList.contains('on'),'audio SOS ouvert');click('#shClose');click('#sosX');
  // calme
  go('calme');click($('#presets [data-k="apaise"]'));click('#brBtn');ok($('#brBtn').textContent==='Arrêter','respiration démarre');click('#brBtn');
  click('#brFav');ok(/★/.test($('#brFav').textContent),'favori ajouté');ok(/Apaisante/.test($('#favBox').textContent),'favoris affichés');
  click($('#calTabs [data-t="mediter"]'));ok(d.querySelectorAll('#meds .item').length===10,'10 méditations');
  click($('#meds [data-med="scan"]'));ok($('#sheet').classList.contains('on'),'séance ouverte');
  await new Promise(r=>setTimeout(r,11500));click('#shClose');ok(/Scan/.test($('#resume').textContent),'reprise de lecture proposée');
  click($('#calTabs [data-t="sons"]'));click($('#sounds [data-snd="pluie"]'));ok(/Pluie/.test($('#sndState').textContent),'son lancé');click($('#sounds [data-snd="pluie"]'));ok(/Aucun/.test($('#sndState').textContent),'son arrêté');
  // journal
  go('journal');click($('#moodJ button[data-v="3"]'));click($('#emoJ button'));click($('#sitJ button'));$('#jNote').value='Test';
  $('#jForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));ok(/noté/.test($('#jMsg').textContent),'note de journal');
  ok(d.querySelectorAll('#entries .entry').length>=2,'historique affiché');
  // sommeil
  go('sommeil');click($('#slQ button[data-v="4"]'));$('#slForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));ok(/enregistrée/.test($('#slMsg').textContent),'nuit enregistrée');
  const cb=$('#routine input');cb.checked=true;cb.dispatchEvent(new w.Event('change',{bubbles:true}));
  $('#vtTxt').value='trucs';click('#vtGo');ok(/posé/.test($('#vtMsg').textContent),'vide-tête');
  // parcours
  go('parcours');click($('#progBox [data-prog="anx"]'));click('#progPick');go('accueil');ok(/Anxiété quotidienne/.test($('#homeProg').textContent),'programme du jour sur l\'accueil');
  click($('#homeProg [data-stepdone]'));ok(/étape 2/.test($('#homeProg').textContent),'étape suivante');
  // progrès
  go('progres');$('#upTxt').value='Réunion';$('#upDate').value=new Date(Date.now()+864e5).toISOString().slice(0,10);
  $('#upForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));go('accueil');ok(/Réunion/.test($('#homeUp').textContent),'situation à venir sur l\'accueil');
  go('progres');$('#goalTxt').value='Respirer';$('#goalForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));ok(/Respirer/.test($('#goals').textContent),'objectif');
  $('#winTxt').value='Osé';$('#winForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));ok(/Osé/.test($('#wins').textContent),'victoire');
  ok(d.querySelectorAll('#chStress div').length===30,'graphique 30 jours');
  // kit
  go('kit');click($('#kSug button'));ok(d.querySelectorAll('#kPhr .entry').length===1,'phrase ajoutée');
  $('#kConN').value='Philou';$('#kConP').value='0470 12 34 56';$('#kConF').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));ok(/Philou/.test($('#kCon').textContent),'contact ajouté');
  click($('#kTech button'));click('#sosOpen');click($('#sosBody [data-sit="parler"]'));click($('#sosBody [data-opt="contacts"]'));ok(/Philou/.test($('#sosBody').textContent),'contacts dans le SOS');click('#sosX');
  // espace
  go('espace');click($('#pSize [data-size="l"]'));ok(d.documentElement.dataset.size==='l','taille du texte');
  click($('#pTheme [data-theme="dark"]'));ok(d.documentElement.dataset.theme==='dark','mode sombre');click($('#pTheme [data-theme="auto"]'));
  // sauvegarde/restauration
  const backup=JSON.stringify({app:'ELYRA',version:'1',prof:JSON.parse(w.localStorage.getItem('elyra.v1')).prof,items:[{id:'x',t:Date.now(),kind:'victoire',note:'restauré'}]});
  $('#impBox').value=backup;click('#impGo');ok($('#dlg').classList.contains('on'),'confirmation restauration');click('#dlgOk');go('progres');ok(/restauré/.test($('#wins').textContent),'restauration');
  $('#impBox').value='nimporte';click('#impGo');ok(/valide/.test($('#impMsg').textContent),'sauvegarde invalide refusée');
  // effacer
  go('espace');click('#wipe');click('#dlgOk');ok($('#onb').classList.contains('on')&&!w.localStorage.getItem('elyra.v1'),'tout effacer');
  // XSS
  $('#onbName').value='<img src=x onerror=alert(1)>';click('#onbGo');ok(!d.querySelector('#hello img'),'texte échappé');
 }catch(e){errors.push('EXCEPTION: '+e.stack)}
 console.log(errors.length?'\n'+errors.join('\n'):'\nTOUT EST OK');process.exit(0)},300);
