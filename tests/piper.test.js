const pp=require('puppeteer-core');(async()=>{const b=await pp.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const p=await b.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(process.argv[2]||'http://localhost:8766/index.html');
const r=await p.evaluate(async(text)=>{const w=new Worker('piper-worker.js');const t0=performance.now();let prog=0;
  const res=await new Promise((ok,ko)=>{w.onmessage=e=>{const m=e.data;if(m.type==='progress')prog++;else if(m.type==='ready'){w.postMessage({type:'say',id:1,text})}else if(m.type==='audio')ok(m);else if(m.type==='error')ko(m.msg)};
    w.postMessage({type:'init',base:new URL('.',location.href).href,voice:'fr_FR-siwis-medium',lengthScale:1.18});setTimeout(()=>ko('délai'),180000)});
  const t1=performance.now();
  const r2=await new Promise((ok,ko)=>{w.onmessage=e=>{const m=e.data;if(m.type==='audio')ok(m);else if(m.type==='error')ko(m.msg)};w.postMessage({type:'say',id:2,text:'Je suis là. Prends ton temps, rien ne presse.'})});
  let peak=0;for(const x of res.pcm)peak=Math.max(peak,Math.abs(x));
  return{prepare_s:+((t1-t0)/1000).toFixed(1),samples:res.pcm.length,sr:res.sr,duree_audio_s:+(res.pcm.length/res.sr).toFixed(2),calcul_ms:res.ms,deuxieme_ms:r2.ms,deuxieme_audio_s:+(r2.pcm.length/r2.sr).toFixed(2),peak:+peak.toFixed(3),progressions:prog,cache:(await caches.keys())}},
  'Bonjour Priscilla. Je suis là, avec toi. Respire tranquillement.');
console.log(JSON.stringify(r));console.log('erreurs',errs);await b.close();process.exit(errs.filter(e=>!/404/.test(e)).length||!(r.samples>0)?1:0)})().catch(e=>{console.error('ÉCHEC',e);process.exit(1)});
