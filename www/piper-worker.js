/* ELYRA · voix naturelle calculée sur le téléphone (Piper + onnxruntime-web), en arrière-plan.
   Les fichiers (≈ 90 Mo) sont téléchargés une seule fois puis gardés sur le téléphone (Cache Storage).
   Messages reçus : {type:'init', base, voice, lengthScale} · {type:'say', id, text}
   Messages envoyés : progress · ready · audio {id, pcm, sr, ms} · error */
let ORT = null, sess = null, cfg = null, base = '', lenScale = 1, phonWasm = null, phonData = null, phonCompiled = null;
const CACHE = 'elyra-piper';

async function get(url, label) {
  let c = null;
  try { c = await caches.open(CACHE); } catch (e) {}
  let r = c && await c.match(url);
  if (r) return r;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
  const total = +res.headers.get('content-length') || 0;
  let blob;
  if (res.body && res.body.getReader) {
    const rd = res.body.getReader(), parts = []; let got = 0, last = 0;
    for (;;) {
      const { done, value } = await rd.read(); if (done) break;
      parts.push(value); got += value.length;
      if (got - last > 400000) { last = got; postMessage({ type: 'progress', label, url, got, total }); }
    }
    postMessage({ type: 'progress', label, url, got, total: total || got });
    blob = new Blob(parts);
  } else blob = await res.blob();
  r = new Response(blob, { headers: { 'Content-Type': res.headers.get('content-type') || 'application/octet-stream' } });
  if (c) { try { await c.put(url, r.clone()); } catch (e) {} }
  return r;
}
const blobUrl = async (url, label) => URL.createObjectURL(await (await get(url, label)).blob());

async function init(m) {
  base = m.base; lenScale = m.lengthScale || 1;
  importScripts(base + 'vendor/ort.wasm.min.js', base + 'vendor/piper_phonemize.js');
  ORT = self.ort;
  ORT.env.wasm.numThreads = 1; ORT.env.wasm.proxy = false;
  const ow = await blobUrl(base + 'vendor/ort-wasm-simd.wasm', 'moteur');
  ORT.env.wasm.wasmPaths = { 'ort-wasm-simd.wasm': ow, 'ort-wasm.wasm': ow };
  phonWasm = await blobUrl(base + 'vendor/piper_phonemize.wasm', 'prononciation');
  phonData = await blobUrl(base + 'vendor/piper_phonemize.data', 'prononciation');
  try { phonCompiled = await WebAssembly.compile(await (await fetch(phonWasm)).arrayBuffer()); } catch (e) { phonCompiled = null; }
  cfg = await (await get(`${base}voix/modele/${m.voice}.onnx.json`, 'réglages')).json();
  const model = await (await get(`${base}voix/modele/${m.voice}.onnx`, 'voix')).arrayBuffer();
  sess = await ORT.InferenceSession.create(model, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  postMessage({ type: 'ready', sr: cfg.audio.sample_rate });
}

function phonemize(text) {
  return new Promise((resolve, reject) => {
    let done = false;
    const opts = {
      print: d => { if (done) return; try { const j = JSON.parse(d); done = true; resolve(j.phoneme_ids); } catch (e) {} },
      printErr: () => {},
      locateFile: u => u.endsWith('.wasm') ? phonWasm : u.endsWith('.data') ? phonData : u
    };
    if (phonCompiled) opts.instantiateWasm = (imports, ok) => { WebAssembly.instantiate(phonCompiled, imports).then(i => ok(i), reject); return {}; };
    self.createPiperPhonemize(opts).then(mod => {
      mod.callMain(['-l', cfg.espeak.voice, '--input', JSON.stringify([{ text }]), '--espeak_data', '/espeak-ng-data']);
      setTimeout(() => { if (!done) reject(new Error('phonémisation')); }, 8000);
    }, reject);
  });
}

// Retire le silence de fin et laisse une pause naturelle selon la ponctuation (plus longue après « … »).
function respire(a, sr, text) {
  let end = a.length;
  while (end > 0 && Math.abs(a[end - 1]) < 0.01) end--;
  end = Math.min(a.length, end + Math.round(sr * 0.04));
  const c = text.slice(-1), p = c === '…' ? 0.9 : c === '?' ? 0.6 : c === '.' ? 0.5 : c === '!' ? 0.45 : 0.3;
  const o = new Float32Array(end + Math.round(sr * p));
  o.set(a.subarray(0, end));
  return o;
}

async function say(m) {
  const t0 = performance.now();
  const ids = await phonemize(String(m.text).trim().slice(0, 600));
  const I = cfg.inference || {};
  const feeds = {
    input: new ORT.Tensor('int64', BigInt64Array.from(ids.map(x => BigInt(x))), [1, ids.length]),
    input_lengths: new ORT.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new ORT.Tensor('float32', Float32Array.from([0.72, lenScale * (0.965 + Math.random() * 0.08), 0.9]), [3])
  };
  if (cfg.speaker_id_map && Object.keys(cfg.speaker_id_map).length) feeds.sid = new ORT.Tensor('int64', BigInt64Array.from([0n]), [1]);
  const out = await sess.run(feeds);
  const pcm = respire(new Float32Array(out.output.data), cfg.audio.sample_rate, String(m.text).trim());
  postMessage({ type: 'audio', id: m.id, pcm, sr: cfg.audio.sample_rate, ms: Math.round(performance.now() - t0) }, [pcm.buffer]);
}

let chain = Promise.resolve();
self.onmessage = e => {
  const m = e.data;
  chain = chain.then(() => (m.type === 'init' ? init(m) : m.type === 'say' ? say(m) : null))
    .catch(err => postMessage({ type: 'error', id: m.id, msg: String(err && err.message || err) }));
};
