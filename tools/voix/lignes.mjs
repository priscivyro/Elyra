// Liste toutes les phrases à faire lire par la voix ELYRA, à partir de www/content.js et www/seances.js.
// Usage : node tools/voix/lignes.mjs > tools/voix/lignes.json
import fs from 'node:fs';
import vm from 'node:vm';
const code = fs.readFileSync(new URL('../../www/content.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
vm.runInNewContext(fs.readFileSync(new URL('../../www/seances.js', import.meta.url), 'utf8'), sandbox);
const C = sandbox.window.ELYRA_CONTENT;

// Les accords « prêt{e} » / « {doux|douce} » : on génère la version masculine et la version féminine.
const variants = t => {
  const m = t.replace(/\{([^|}]*)\|([^}]*)\}/g, (x, a) => a).replace(/\{e\}/g, '');
  const f = t.replace(/\{([^|}]*)\|([^}]*)\}/g, (x, a, b) => b).replace(/\{e\}/g, 'e');
  return [...new Set([m, f])];
};
const out = new Set();
for (const m of [...C.meds, ...C.stories]) for (const s of m.s) variants(s[0]).forEach(v => out.add(v));
for (const k in C.sosf) for (const s of C.sosf[k].s) variants(s[1]).forEach(v => out.add(v));
['Inspire', 'Expire', 'Retiens', 'Pause',
 "Bonjour. Je suis la voix de tes séances. Prends ton temps, tu n'as rien à réussir."].forEach(t => out.add(t));
process.stdout.write(JSON.stringify([...out], null, 0));
