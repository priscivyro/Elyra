// Liste des phrases pour la voix C (Chatterbox), chacune avec son « ton » selon la situation.
// Usage : node tools/voix/lignes_c.mjs > lignes_c.json   →   [[texte, ton], ...]
// Tons : calme (SOS, crise), doux (sommeil, histoires), chaleureux (par défaut), lumineux (élan, confiance).
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox = { window: {} };
for (const f of ['content.js', 'seances.js'])
  vm.runInNewContext(fs.readFileSync(new URL('../../www/' + f, import.meta.url), 'utf8'), sandbox);
const C = sandbox.window.ELYRA_CONTENT;

const variants = t => {
  const m = t.replace(/\{([^|}]*)\|([^}]*)\}/g, (x, a) => a).replace(/\{e\}/g, '');
  const f = t.replace(/\{([^|}]*)\|([^}]*)\}/g, (x, a, b) => b).replace(/\{e\}/g, 'e');
  return [...new Set([f, m])];
};
const DOUX = new Set(['hypdodo', 'yogasoir', 'eftdodo', 'soir']);
const LUMINEUX = new Set(['matin', 'yogamatin', 'gratitude', 'montagne', 'force', 'estime', 'non', 'echec', 'hypconfiance', 'bureau']);
const ton = m => m.c === 'sos' ? 'calme' : (m.c === 'sommeil' || DOUX.has(m.k)) ? 'doux'
  : (LUMINEUX.has(m.k) || m.c === 'mouvement') ? 'lumineux' : 'chaleureux';
// Priorité si une même phrase sert à plusieurs endroits : le ton le plus calme l'emporte.
const RANG = { calme: 0, doux: 1, chaleureux: 2, lumineux: 3 };
const out = new Map();
const add = (t, tn) => variants(t).forEach(v => { if (!out.has(v) || RANG[tn] < RANG[out.get(v)]) out.set(v, tn); });

for (const k in C.sosf) for (const s of C.sosf[k].s) add(s[1], 'calme');
for (const m of C.meds) for (const s of m.s) add(s[0], ton(m));
for (const m of C.stories) for (const s of m.s) add(s[0], 'doux');
['Inspire', 'Expire', 'Retiens', 'Pause'].forEach(t => add(t, 'calme'));
add("Bonjour. Je suis la voix de tes séances. Prends ton temps, tu n'as rien à réussir.", 'chaleureux');
process.stdout.write(JSON.stringify([...out]));
