// Extrait quelques séances (version féminine) pour l'essai d'écoute « avant / après ».
// Usage : node tools/voix/essai_seances.mjs > essai_seances.json
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox = { window: {} };
for (const f of ['content.js', 'seances.js'])
  vm.runInNewContext(fs.readFileSync(new URL('../../www/' + f, import.meta.url), 'utf8'), sandbox);
const C = sandbox.window.ELYRA_CONTENT;
const fem = t => t.replace(/\{([^|}]*)\|([^}]*)\}/g, (x, a, b) => b).replace(/\{e\}/g, 'e');
const pick = (list, k, n) => { const m = list.find(m => m.k === k); return { k, t: m.t, s: m.s.slice(0, n || m.s.length).map(s => [fem(s[0]), s[1]]) }; };
process.stdout.write(JSON.stringify([
  pick(C.meds, 'expiration'),
  pick(C.meds, 'lac'),
  pick(C.stories, 'phare', 6),
]));
