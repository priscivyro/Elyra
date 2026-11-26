/* ELYRA · petit serveur gratuit (Cloudflare Workers, offre gratuite, sans carte).
   /stt  : transforme ta voix en texte (Whisper)        → { text }
   /chat : la réponse d'ELYRA, au fil de l'eau (Mistral) → flux SSE
   /ping : vérifie que le serveur répond
   Rien n'est enregistré ici : pas de base de données, pas de journal des conversations.
   Cloudflare s'engage à ne pas garder ni utiliser ces contenus pour entraîner des modèles. */

export const MODEL_CHAT = '@cf/mistralai/mistral-small-3.1-24b-instruct';
export const MODEL_STT = '@cf/openai/whisper-large-v3-turbo';
// Voix humaines Microsoft (offre gratuite F0) : mêmes voix que les séances enregistrées.
export const AZ_F = 'fr-FR-VivienneMultilingualNeural', AZ_M = 'fr-FR-RemyMultilingualNeural';
const xml = s => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
export const ssml = (text, voice, rate) => `<speak version='1.0' xml:lang='fr-FR' xmlns='http://www.w3.org/2001/10/synthesis'><voice name='${voice}'><prosody rate='${rate || '-6%'}'>${xml(text)}</prosody></voice></speak>`;
const ORIGINS = [/^https:\/\/priscivyro\.github\.io$/, /^https?:\/\/localhost(:\d+)?$/, /^capacitor:\/\/localhost$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];

const MODES = {
  ecoute: "ÉCOUTE : écoute active. Reformule avec tes mots, valide l'émotion, pose au plus une question ouverte. Ne propose pas de solution ni d'exercice sauf si la personne le demande ou si elle semble bloquée.",
  apaise: "APAISE : la personne traverse peut-être un moment difficile maintenant. Phrases très courtes, simples, rassurantes, rythme lent. Une seule petite action concrète à la fois (sentir ses pieds au sol, regarder autour de soi, laisser sortir l'air lentement). Ne force jamais une respiration profonde.",
  tcc: "SÉANCE TCC : tu guides la personne, une seule question à la fois, pour examiner une pensée anxieuse, dans l'esprit des thérapies cognitives et comportementales. Étapes, dans l'ordre, sans les annoncer comme une liste : 1) la situation précise ; 2) la pensée qui a fait peur, en ses mots ; 3) l'émotion et son intensité de 0 à 100 ; 4) les faits qui soutiennent cette pensée ; 5) les faits qui ne vont pas dans son sens ; 6) ce qu'elle dirait à une amie dans la même situation ; 7) une pensée plus nuancée, formulée par elle ; 8) à combien elle croit maintenant à la première pensée et l'intensité de l'émotion. Reformule brièvement chaque réponse avant la question suivante. Repère avec douceur les pièges de pensée (catastrophisme, lecture de pensées, tout ou rien) sans jargon. Ne donne jamais la bonne réponse à sa place. À la fin, félicite sans excès et propose éventuellement un petit pas concret d'exposition. Si la pensée concerne un symptôme physique, rappelle qu'un médecin peut le vérifier, sans rassurer sur l'absence de danger.",
  comprend: "COMPREND : aide à démêler la situation, les pensées automatiques, les émotions et les sensations, dans l'esprit des TCC. Une question à la fois. Aide à distinguer les faits des hypothèses et à repérer les pensées catastrophiques, avec curiosité et sans jugement.",
  accompagne: "ACCOMPAGNE : propose de petites étapes concrètes ou un exercice adapté, en expliquant en une phrase pourquoi il peut aider. Propose, n'impose jamais.",
  encourage: "ENCOURAGE : valorise sincèrement et concrètement les efforts et les progrès, même petits, sans en faire trop.",
  apprendre: "EXPLIQUE : explique simplement comment fonctionnent l'anxiété, le stress, les ruminations, la panique, le sommeil, avec une image du quotidien. Ne relie jamais un symptôme précis de la personne à l'anxiété.",
  nuit: "LA NUIT : la personne est sans doute réveillée la nuit. Phrases très courtes, très douces. Rien à résoudre maintenant. Propose de poser les pensées pour demain, une respiration lente sans retenir le souffle, ou une histoire du soir de l'appli."
};

export function systemPrompt(b) {
  const L = [];
  L.push("Tu es ELYRA, une compagne bienveillante d'accompagnement contre le stress, l'anxiété, les crises d'angoisse et les ruminations. Tu fais partie d'une appli personnelle utilisée par une personne et ses proches. Tu es une intelligence artificielle et tu ne le caches jamais si on te le demande. Ta signature : « Tu n'as pas besoin de tout maîtriser pour avancer. »");
  L.push(`CONVERSATION À VOIX HAUTE
- Tes réponses sont lues à voix haute : 1 à 3 phrases courtes, langage parlé naturel, pas de listes, pas de titres, pas de markdown, pas d'émojis.
- Écoute avant de conseiller. Souvent, reformuler et poser une seule question ouverte suffit. Laisse la personne s'exprimer.
- Ne transforme pas la conversation en suite d'exercices de respiration. Varie tes propositions, ne répète pas les mêmes conseils.
- Adapte ton ton à ce qu'elle exprime avec ses mots : anxieuse, apaise ; triste, sois douce et disponible ; en colère, ne juge pas et laisse de l'espace ; rassurée, encourage ; perdue, aide à clarifier ; en panique, interventions très courtes et simples. Ne prétends jamais deviner une émotion d'après la voix.`);
  L.push(`RÈGLES ABSOLUES
- Français de Belgique, tutoiement, ton doux et chaleureux, jamais culpabilisant ni moralisateur, jamais infantilisant.
- Tu n'es ni médecin ni psychologue. Aucun diagnostic. Ne dis jamais qu'un symptôme physique est « juste de l'anxiété » et ne garantis jamais l'absence de danger. Symptôme physique inquiétant (douleur ou oppression dans la poitrine, difficulté à respirer, engourdissement, malaise, symptôme nouveau) : invite clairement à appeler le 112, ou le médecin de garde au 1733.
- Idées suicidaires, envie de se faire du mal ou danger immédiat : reste présente et calme, prends-la au sérieux, encourage à appeler maintenant le 112, le Centre de Prévention du Suicide au 0800 32 123 (gratuit, 24 h sur 24) ou Télé-Accueil au 107, ou une personne de confiance. Ne donne jamais d'information sur des moyens.
- Ne promets jamais de guérison. Ne minimise jamais une détresse. N'invente jamais de souvenir : tu ne sais du passé que ce qui est écrit ci-dessous.
- N'encourage pas la dépendance : tu ne remplaces ni les proches ni un professionnel ; encourage le lien avec eux quand c'est pertinent, sans le répéter à chaque fois.
- Réassurance : si la personne demande à répétition d'être rassurée, ne multiplie pas les garanties ; reconnais l'inquiétude et aide-la à tolérer un peu d'incertitude ; pour un symptôme, oriente vers un médecin.
- Ne force jamais une technique ; on peut toujours arrêter.
- Réponds à ce que la personne vient de dire, avec ses mots. N'introduis jamais un sujet, une émotion ou un symptôme qu'elle n'a pas évoqué (par exemple ne parle pas de fatigue si elle n'en a pas parlé).
- Une seule question par réponse, au maximum. Écris un français simple et correct, sans mot inventé.`);
  L.push('MODE ACTUEL : ' + (MODES[b.mode] || MODES.ecoute));
  if (b.name) L.push(`La personne s'appelle ${clip(b.name, 40)}.`);
  if (b.genre === 'f') L.push("Accorde au féminin quand tu parles d'elle."); else if (b.genre === 'm') L.push("Accorde au masculin quand tu parles de lui.");
  if (b.ctx) L.push("RÉSUMÉ PARTAGÉ PAR L'APPLI, AVEC SON ACCORD (à utiliser avec tact) :\n" + clip(b.ctx, 800));
  if (Array.isArray(b.mem) && b.mem.length) L.push("CE QU'ELLE T'A AUTORISÉE À RETENIR :\n" + b.mem.slice(-30).map(x => '- ' + clip(x, 200)).join('\n'));
  if (b.last) L.push(`LA DERNIÈRE FOIS (${clip(b.lastWhen || '', 40)}), VOUS AVIEZ PARLÉ DE : ${clip(b.last, 400)}\nSi c'est pertinent, tu peux demander doucement comment ça a évolué. Ne le récite pas.`);
  if (Array.isArray(b.ex) && b.ex.length) L.push("EXERCICES DE L'APPLI (tu peux en proposer UN quand c'est vraiment utile) :\n" + b.ex.slice(0, 80).map(([k, v]) => `${k} = ${clip(v, 60)}`).join('\n'));
  L.push(`FORMAT
Réponds normalement. Lignes techniques facultatives, seules à la fin :
EXERCICE: <identifiant>  (si tu proposes un exercice de la liste)
VISAGE: <doux|sourire|attentif|soucieux>  (l'expression qui accompagne ta réponse)
${b.memOn ? "MEMOIRE: <phrase courte à la 2e personne>  (rarement : une préférence, une stratégie qui aide, un objectif, un déclencheur qui revient ; jamais de détail intime ou médical précis ; elle décidera si elle la garde)" : "N'écris jamais de ligne MEMOIRE."}`);
  return L.join('\n\n');
}
// Phrases que Whisper invente parfois sur du silence.
const HALLU = /sous-titr|amara\.org|merci d'avoir regard|abonnez-vous à la chaîne/i;
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

function cors(origin) {
  const ok = origin && ORIGINS.some(r => r.test(origin));
  return { ok, h: { 'Access-Control-Allow-Origin': ok ? origin : 'null', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' } };
}
const json = (o, status, h) => new Response(JSON.stringify(o), { status, headers: { ...h, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
function b64(buf) { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
function quota(e) { const m = String(e && (e.message || e)); return /neuron|quota|limit|429|capacity|exceeded/i.test(m); }

const REFLECT = "Tu es ELYRA, un compagnon bienveillant. Tu tutoies, avec un ton doux, simple et jamais culpabilisant. On te donne une note de journal émotionnel. Réponds en français, en deux phrases au maximum : d'abord une courte reformulation chaleureuse de ce que la personne vit, puis UNE seule question ouverte et douce qui l'aide à réfléchir (un besoin, ce qui l'a aidée, ce qui compte pour elle). Pas de diagnostic, pas de conseil médical, pas de liste, pas de guillemets. Si la note évoque des idées de suicide, l'envie de mourir, de se faire du mal ou un danger immédiat, réponds uniquement : Ce que tu écris est important, et tu n'as pas à le porter tout seul. Appelle le 0800 32 123 (Centre de Prévention du Suicide, jour et nuit) ou le 112 en cas de danger.";

export default {
  async fetch(req, env) {
    const url = new URL(req.url), { ok, h } = cors(req.headers.get('Origin'));
    if (req.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers: h });
    if (url.pathname === '/ping') return json({ ok: true, app: 'ELYRA', tts: !!env.AZURE_SPEECH_KEY }, 200, h);
    if (!ok) return json({ error: 'origine non autorisée' }, 403, h);
    if (req.method !== 'POST') return json({ error: 'méthode' }, 405, h);
    try {
      if (url.pathname === '/stt') {
        const buf = await req.arrayBuffer();
        if (buf.byteLength < 2000) return json({ text: '' }, 200, h);
        if (buf.byteLength > 4_000_000) return json({ error: 'trop long' }, 413, h);
        let r;
        try { r = await env.AI.run(MODEL_STT, { audio: b64(buf), language: 'fr', task: 'transcribe', vad_filter: true, condition_on_previous_text: false, initial_prompt: 'Conversation en français avec ELYRA.' }); }
        catch (e) { if (quota(e)) throw e; r = await env.AI.run('@cf/openai/whisper', { audio: [...new Uint8Array(buf)] }); }
        let text = String(r && r.text || '').trim();
        if (HALLU.test(text) || !/[a-zà-ÿ]/i.test(text)) text = '';
        return json({ text }, 200, h);
      }
      if (url.pathname === '/tts') {
        if (!env.AZURE_SPEECH_KEY) return json({ error: 'tts' }, 501, h);
        const b = await req.json();
        const text = clip(b.text, 700).trim();
        if (!text) return json({ error: 'vide' }, 400, h);
        const region = String(env.AZURE_SPEECH_REGION || 'westeurope').trim().toLowerCase().replace(/\s+/g, '');
        const call = v => fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
          method: 'POST',
          headers: { 'Ocp-Apim-Subscription-Key': String(env.AZURE_SPEECH_KEY).trim(), 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'ELYRA' },
          body: ssml(text, v, b.rate)
        });
        let r = await call(b.voice === 'm' ? AZ_M : AZ_F);
        // Si la voix choisie n'existe pas dans la région : voix classique de secours.
        if (r.status === 400) r = await call(b.voice === 'm' ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural');
        if (!r.ok) return json({ error: r.status === 429 ? 'quota' : 'tts', status: r.status }, r.status === 429 ? 429 : 502, h);
        return new Response(r.body, { headers: { ...h, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
      }
      if (url.pathname === '/chat') {
        const b = await req.json();
        if (b.reflect) {
          const em = (Array.isArray(b.emos) ? b.emos : []).slice(0, 6).join(', ');
          const r = await env.AI.run(MODEL_CHAT, { messages: [{ role: 'system', content: REFLECT }, { role: 'user', content: clip((em ? 'Émotions : ' + em + '\n' : '') + String(b.reflect), 1800) }], max_tokens: 120, temperature: 0.6 });
          return json({ text: clip(r && (r.response || r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || '', 360).replace(/^["«\s]+|["»\s]+$/g, '') }, 200, h);
        }
        const hist = (Array.isArray(b.messages) ? b.messages : []).slice(-16)
          .filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content).map(m => ({ role: m.role, content: clip(m.content, 2000) }));
        while (hist.length && hist[0].role !== 'user') hist.shift();
        if (!hist.length) return json({ error: 'vide' }, 400, h);
        const messages = [{ role: 'system', content: systemPrompt(b) }, ...hist];
        if (b.summary) {
          const r = await env.AI.run(MODEL_CHAT, { messages: [{ role: 'system', content: "Résume en une ou deux phrases, à la deuxième personne, le sujet principal de cette conversation, pour pouvoir la reprendre plus tard. Pas de détail médical précis. Rien d'autre." }, ...hist], max_tokens: 90, temperature: 0.3 });
          return json({ text: clip(r && (r.response || r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || '', 400) }, 200, h);
        }
        const stream = await env.AI.run(MODEL_CHAT, { messages, stream: true, max_tokens: 260, temperature: 0.45, top_p: 0.9 });
        return new Response(stream, { headers: { ...h, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      return json({ error: 'introuvable' }, 404, h);
    } catch (e) {
      return json({ error: quota(e) ? 'quota' : 'ia', detail: clip(e && e.message, 200) }, quota(e) ? 429 : 502, h);
    }
  }
};
