// Test de la conversation à voix haute (serveur simulé). Usage : node voix.test.js http://localhost:8766/index.html
const {JSDOM}=require('jsdom');const url=process.argv[2];const errors=[];const calls=[];let mode='ok';
const SSE=t=>t.split(/(?<=\s)/).map(x=>'data: '+JSON.stringify({response:x})+'\n\n').join('')+'data: [DONE]\n\n';
JSDOM.fromURL(url,{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,beforeParse(w){
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
  const P_=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
  w.AudioContext=function(){return{currentTime:0,sampleRate:8000,state:'running',resume(){},destination:{},createGain(){return{gain:P_(),connect:x=>x||{connect:y=>y},disconnect(){}}},createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)}),
    createBufferSource(){return{connect:x=>x,start(){},stop(){},loop:false}},createBiquadFilter(){return{frequency:P_(),Q:P_(),connect:x=>x}},createStereoPanner(){return{pan:P_(),connect:x=>x}},
    createOscillator(){return{frequency:P_(),detune:P_(),connect:x=>x,start(){},stop(){}}},createConvolver(){return{connect:x=>x}},createDynamicsCompressor(){return{threshold:P_(),ratio:P_(),connect:x=>x}}}};
  w.SpeechSynthesisUtterance=function(t){this.text=t};w.speechSynthesis={speak(u){setTimeout(()=>u.onend&&u.onend(),5)},cancel(){},getVoices:()=>[]};
  w.localStorage.setItem('elyra.v1',JSON.stringify({v:1,prof:{name:'Priscilla',genre:'f',onb:true,voixUrl:'https://srv.test'},items:[]}));
  w.fetch=async(u,o)=>{u=String(u);if(!u.startsWith('https://srv.test'))return{ok:false,status:404,json:async()=>({})};const b=o&&o.body&&typeof o.body==='string'?JSON.parse(o.body):null;calls.push({u,b});
    if(mode==='quota')return{ok:false,status:429,json:async()=>({error:'quota'})};
    if(u.endsWith('/ping'))return{ok:true,status:200,json:async()=>({ok:true,tts:true})};
    if(u.endsWith('/tts')){calls.push({u,tts:1});return{ok:true,status:200,arrayBuffer:async()=>new ArrayBuffer(8)}}
    if(u.endsWith('/stt'))return{ok:true,status:200,json:async()=>({text:'Je suis stressée'})};
    if(b&&b.summary)return{ok:true,status:200,json:async()=>({text:'Tu parlais de ton stress pour demain.'})};
    const last=b.messages[b.messages.length-1].content;
    const t=/mourir/.test(last)?"Je suis là avec toi. Tu peux appeler le 0800 32 123 maintenant.":"Je comprends que demain t'inquiète. Qu'est-ce qui te pèse le plus ?\nEXERCICE: sos:ground\nVISAGE: doux\nMEMOIRE: Tu préfères qu'on avance doucement";
    return{ok:true,status:200,body:null,text:async()=>SSE(t)}};
  w.addEventListener('error',e=>errors.push('error: '+(e.error&&e.error.stack||e.message)));w.console.error=(...a)=>errors.push('console.error: '+a.map(x=>x&&x.stack||x).join(' '))}}).then(dom=>{
const w=dom.window,d=w.document,$=s=>d.querySelector(s);const ok=(c,m)=>{if(!c)errors.push('ÉCHEC: '+m);else console.log('✓',m)};
const click=s=>{const e=typeof s==='string'?$(s):s;if(!e)throw new Error('introuvable: '+s);e.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}))};
const go=h=>{w.location.hash=h;w.dispatchEvent(new w.HashChangeEvent('hashchange'))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const P=()=>JSON.parse(w.localStorage.getItem('elyra.v1')).prof;
w.addEventListener('load',async()=>{try{
  go('elyra');ok(!!$('#elyFace svg'),'visage animé dans la vue ELYRA');ok(!/Pas encore activée/.test($('#elyLiveNote').textContent),'serveur configuré');
  click('#elyLive');ok($('#conv').classList.contains('on'),'conversation ouverte en plein écran');ok(!!$('#cvFace .fl-svg .fl-mouth'),'visage avec bouche animée');
  ok(/se souvienne/.test($('#cvExtra').textContent),'consentement demandé pour la mémoire');click($('[data-cvmem="1"]'));await wait(80);
  ok(/Priscilla/.test($('#cvEly').textContent),'ELYRA accueille avec son prénom (sous-titre)');await wait(200);
  ok(/micro n'est pas disponible/.test($('#cvExtra').textContent),'micro absent : message clair et passage à l’écrit');
  click($('[data-cvkb]'));ok(!$('#cvForm').hidden,'mode texte');
  click($('#cvModes [data-cvm="comprend"]'));
  $('#cvIn').value='Je stresse pour demain';$('#cvForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(400);
  const c=calls.filter(x=>x.u.endsWith('/chat')).pop();ok(c&&c.b.mode==='comprend'&&c.b.memOn===true&&c.b.genre==='f'&&c.b.ex.length>30,'demande envoyée (mode, accord mémoire, exercices)');
  ok(c.b.messages[c.b.messages.length-1].content==='Je stresse pour demain'&&c.b.messages[c.b.messages.length-1].role==='user','message de la personne transmis');
  ok(/demain t'inquiète/.test($('#cvEly').textContent)&&!/EXERCICE|VISAGE|MEMOIRE/.test($('#cvEly').textContent),'réponse affichée sans lignes techniques');
  ok(/Ancrage/.test($('#cvExtra').textContent),'exercice proposé depuis la conversation');
  ok(calls.some(x=>x.tts),'voix humaine demandée au serveur (avec repli si indisponible)');
  ok(/avance doucement/.test($('#cvExtra').textContent),'proposition de souvenir');click($('[data-cvkeep]'));await wait(350);ok(P().cv.mem.length===1,'souvenir gardé avec accord');
  $('#cvIn').value="j'ai envie de mourir";$('#cvForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(300);
  ok(/0800 32 123/.test($('#cvExtra .cv-urg').textContent)&&/112/.test($('#cvExtra').textContent),'protocole de crise immédiat');
  click('#cvHist');ok($('#cvHistBox').querySelectorAll('.msg').length>=4,'historique');click($('[data-cvhclose]'));
  click('#cvMute');await wait(300);ok(P().cv.muted===true&&$('#cvMute').getAttribute('aria-pressed')==='true','couper le son');click('#cvMute');
  mode='quota';$('#cvIn').value='encore';$('#cvForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(250);ok(/limite gratuite/.test($('#cvExtra').textContent),'limite gratuite du jour expliquée');mode='ok';
  click('#cvEnd');await wait(400);ok(!$('#conv').classList.contains('on'),'conversation terminée');ok(/stress pour demain/.test(P().cv.last&&P().cv.last.txt),'résumé gardé pour la prochaine fois');
  go('espace');ok(/stress pour demain/.test($('#cvMemBox').textContent)&&!!$('#cvMemBox [data-cvedit]'),'mémoire consultable dans Mon espace');
  click($('#cvMemBox [data-cvforget="last"]'));await wait(350);ok(!P().cv.last,'oublier la dernière conversation');
  go('accueil');$('#talkIn').value='Bonjour ELYRA';$('#talkBar').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(400);
  ok($('#conv').classList.contains('on')&&calls.filter(x=>x.u.endsWith('/chat')).pop().b.messages.pop().content==='Bonjour ELYRA','« Parle-moi » envoie le message à ELYRA');
  // reprise : la dernière fois
  $('#cvIn').value='Et toi ?';$('#cvForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(300);
  click('#cvEnd');await wait(400);const before=calls.length;click('#talkHome');await wait(400);
  const lc=calls.filter(x=>x.u.endsWith('/chat')&&x.b&&x.b.messages).pop();ok(calls.length>before&&/dernière fois/.test(lc.b.messages[0].content),'au retour, ELYRA reprend la dernière conversation');click('#cvEnd');await wait(300);
  // sans serveur
  go('espace');const u=$('#cvUrl');u.value='';u.dispatchEvent(new w.Event('change',{bubbles:true}));await wait(50);go('elyra');ok(/Pas encore activée/.test($('#elyLiveNote').textContent),'sans serveur : explication');
  click('#elyLive');ok(/pas encore activée/.test($('#cvExtra').textContent)&&/Claude/.test($('#cvExtra').textContent),'sans serveur : lien vers Claude');click('#cvEnd');
  ok(/claude\.ai/.test($('#talkHome').href),'« Parler » ouvre Claude tant que le serveur n’est pas activé');
  const L=w.ElyraLive;const wav=L.wav(new Float32Array(48000).fill(.1),48000);ok(wav.length===44+16000*2&&String.fromCharCode(...wav.slice(0,4))==='RIFF','encodeur WAV 16 kHz');
  ok(L.lips('Bonjour, ça va ?').length>10&&L.lips('ma')[0]===0,'rythme des lèvres');
 }catch(e){errors.push('EXCEPTION: '+e.stack)}
 console.log(errors.length?'\n'+errors.join('\n'):'\nTOUT EST OK');process.exit(errors.length?1:0)})});
