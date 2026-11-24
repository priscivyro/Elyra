const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');const errors=[];const store={};let lastMsgs=null;
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://claude.ai/x#apaise',beforeParse(w){
  w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.addEventListener('error',e=>errors.push(e.error&&e.error.stack||e.message));
  const col=p=>({limit:()=>({get:async()=>({docs:Object.values(store).map(v=>({data:()=>v}))})}),doc:id=>({set:async o=>{store[id]=JSON.parse(JSON.stringify(o))},delete:async()=>{delete store[id]}})});
  const sample=async(msgs,o)=>{lastMsgs=msgs;const t="Je suis là avec toi. Sens tes pieds au sol.\nEXERCICE: sos:ground\nMEMOIRE: stratégies | Sentir tes pieds au sol t'aide";o.onText&&o.onText({text:t});return{text:t}};
  w.claude={use:async n=>n==='db'?{collection:col}:n==='user'?{id:async()=>'u1'}:n==='sample'?sample:null}}});
const w=dom.window,d=w.document,$=s=>d.querySelector(s);const ok=(c,m)=>{if(!c)errors.push('ÉCHEC: '+m);else console.log('✓',m)};
const click=s=>(typeof s==='string'?$(s):s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
setTimeout(async()=>{try{
  ok(/Apaise/.test($('#modes [aria-pressed="true"]').textContent),'mode depuis le lien (#apaise)');
  ok(/Je suis là/.test($('#msgs').textContent),'message d\'accueil du mode');
  $('#inp').value="j'ai mal à la poitrine et j'ai peur";$('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(r=>setTimeout(r,1500));
  ok(/112/.test($('#msgs').textContent)&&/sensations comptent/.test($('#msgs').textContent),'alerte symptômes physiques');
  ok(/Sens tes pieds/.test($('#msgs').textContent)&&!/EXERCICE:/.test($('#msgs').textContent),'réponse affichée sans lignes techniques');
  ok(/Ancrage 5-4-3-2-1/.test($('#msgs').textContent),'exercice proposé');
  ok(lastMsgs[0].content.includes('ELYRA APAISE')&&lastMsgs[lastMsgs.length-1].role==='user','consignes et historique envoyés');
  click($('[data-mk]'));await new Promise(r=>setTimeout(r,900));
  ok(store.memoire&&store.memoire.items.length===1&&store.memoire.items[0].cat==='strategies','souvenir gardé après accord');
  ok(store.chat&&store.chat.msgs.length===3,'conversation enregistrée');
  $('#inp').value="parfois j'ai envie d'en finir avec la vie";$('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,300));
  ok(/0800 32 123/.test($('#msgs').textContent),'alerte crise avec numéros');
  ok(lastMsgs[0].content.includes('Sentir tes pieds'),'mémoire transmise à ELYRA');
  click('#memOpen');ok(/Ce qui a aidé/.test($('#memList').textContent),'mémoire consultable');
  const inp=$('[data-edit]');inp.value='Modifié';inp.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,700));ok(store.memoire.items[0].txt==='Modifié','mémoire modifiable');
  click($('[data-rm]'));await new Promise(r=>setTimeout(r,700));ok(store.memoire.items.length===0,'mémoire supprimable');
  click('#newC');click('#dlgOk');await new Promise(r=>setTimeout(r,300));ok(!store.chat,'nouvelle conversation efface l\'ancienne');
}catch(e){errors.push(e.stack)}console.log(errors.length?errors.join('\n'):'TOUT EST OK');process.exit(0)},500);
