"""Voix C (Chatterbox Multilingual V3, open source MIT) pour les séances, calculée gratuitement par GitHub.
Timbre : base SIWIS (comédienne française professionnelle, licence CC BY 4.0).

Trois étapes (voir .github/workflows/voix-c.yml) :
  plan   <lignes_c.json> <deja_dir> <plan_dir>            → répartit les phrases manquantes en lots
  rendre <ref.wav> <lot.json> <sortie_dir> <minutes_max>  → fabrique un lot (s'arrête proprement avant la limite)
  fusion <lignes_c.json> <sortie_dir> <dirs...>           → rassemble tout dans un seul dossier + index.json
"""
import hashlib, json, math, os, shutil, subprocess, sys, time, wave
import numpy as np

# Réglages de l'émotion selon la situation (exaggeration = intensité, cfg = rythme : plus bas = plus posé).
TONS = {
    'calme':      dict(exaggeration=0.30, cfg_weight=0.45, temperature=0.60, cps=13.0),
    'doux':       dict(exaggeration=0.35, cfg_weight=0.25, temperature=0.65, cps=11.5),
    'chaleureux': dict(exaggeration=0.45, cfg_weight=0.30, temperature=0.70, cps=13.0),
    'lumineux':   dict(exaggeration=0.60, cfg_weight=0.35, temperature=0.75, cps=14.5),
}
VITESSE = 1.45  # caractères calculés par seconde sur un serveur gratuit GitHub (mesuré)


def nom(texte, ton):
    return hashlib.sha1(f'c1|{ton}|{texte}'.encode('utf-8')).hexdigest()[:14] + '.mp3'


def charge_index(d):
    try:
        return json.load(open(os.path.join(d, 'index.json'), encoding='utf-8')).get('items', {})
    except Exception:
        return {}


def plan(lignes_path, deja, plan_dir):
    lignes = json.load(open(lignes_path, encoding='utf-8'))
    manquent = [(t, tn) for t, tn in lignes if not os.path.exists(os.path.join(deja, nom(t, tn)))]
    total = sum(len(t) for t, _ in manquent)
    n = max(1, min(16, math.ceil(total / 9000))) if manquent else 0
    lots = [[] for _ in range(n)]
    poids = [0] * n
    for t, tn in sorted(manquent, key=lambda x: -len(x[0])):
        i = poids.index(min(poids))
        lots[i].append([t, tn]); poids[i] += len(t)
    os.makedirs(plan_dir, exist_ok=True)
    for i, lot in enumerate(lots):
        json.dump(lot, open(os.path.join(plan_dir, f'lot-{i}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{len(lignes)} phrases, {len(manquent)} à fabriquer ({total} caractères) en {n} lots '
          f'(≈ {max(poids or [0]) / VITESSE / 3600:.1f} h chacun)')
    gh = os.environ.get('GITHUB_OUTPUT')
    if gh:
        with open(gh, 'a') as f:
            f.write(f'lots={json.dumps(list(range(n)))}\n')


def rendre(ref, lot_path, out, minutes_max):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from rythme import phrases, pause_apres, assemble, FILTRE
    import torch
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    debut = time.time()
    limite = debut + float(minutes_max) * 60
    lot = json.load(open(lot_path, encoding='utf-8'))
    os.makedirs(out, exist_ok=True)
    tts = ChatterboxMultilingualTTS.from_pretrained(device='cpu', t3_model='v3')
    print(f'Chatterbox V3 prêt en {time.time() - debut:.0f} s, {len(lot)} phrases à faire', flush=True)
    ton_actuel, faits = None, 0
    # On regroupe par ton pour ne préparer la voix de référence qu'une fois par ton.
    for texte, ton in sorted(lot, key=lambda x: x[1]):
        dst = os.path.join(out, nom(texte, ton))
        if os.path.exists(dst):
            continue
        if time.time() > limite:
            print('Limite de temps atteinte : le reste sera fait au prochain passage.', flush=True)
            break
        r = TONS[ton]
        if ton != ton_actuel:
            tts.prepare_conditionals(ref, exaggeration=r['exaggeration'])
            ton_actuel = ton
        t0 = time.time()
        ps = phrases(texte)
        morceaux = []
        for i, p in enumerate(ps):
            attendu = len(p) / r['cps'] + 0.3
            best, ecart = None, 1e9
            for essai in range(3):
                wav = tts.generate(p, language_id='fr', exaggeration=r['exaggeration'],
                                   cfg_weight=r['cfg_weight'], temperature=r['temperature'])
                a = wav.squeeze().detach().cpu().numpy().astype(np.float32)
                d = a.size / tts.sr
                e = abs(math.log(max(d, 0.05) / attendu))
                if e < ecart:
                    best, ecart = a, e
                # Accepté si la durée est plausible (ni phrase coupée, ni phrase qui s'éternise).
                if 0.5 * attendu < d < 2.0 * attendu + 1.0:
                    break
                print(f'  essai {essai + 1} écarté ({d:.1f} s pour ~{attendu:.1f} s) : {p[:50]}', flush=True)
            morceaux.append((best, pause_apres(p, i == len(ps) - 1)))
        audio = assemble(morceaux, tts.sr)
        tmp = dst + '.wav'
        with wave.open(tmp, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(tts.sr)
            w.writeframes((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-v', 'fatal', '-y', '-i', tmp, '-af', FILTRE, '-ac', '1', '-ar', '24000',
                        '-c:a', 'libmp3lame', '-b:a', '48k', dst], check=True)
        os.remove(tmp)
        faits += 1
        print(f'[{faits}/{len(lot)}] {ton:10s} {len(texte):4d} car. en {time.time() - t0:.0f} s', flush=True)
    print(f'Lot terminé : {faits} phrases en {(time.time() - debut) / 60:.0f} min')


def duree(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', p],
                       capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)


def fusion(lignes_path, out, dirs):
    lignes = json.load(open(lignes_path, encoding='utf-8'))
    os.makedirs(out, exist_ok=True)
    anciens = charge_index(out)
    items = {}
    for t, tn in lignes:
        f = nom(t, tn)
        dst = os.path.join(out, f)
        if not os.path.exists(dst):
            for d in dirs:
                src = os.path.join(d, f)
                if os.path.exists(src):
                    shutil.copy(src, dst)
                    break
        if os.path.exists(dst):
            old = anciens.get(t)
            items[t] = [f, old[1] if old and old[0] == f else duree(dst)]
    garde = {v[0] for v in items.values()}
    for f in os.listdir(out):
        if f.endswith('.mp3') and f not in garde:
            os.remove(os.path.join(out, f))
    complet = len(items) == len(lignes)
    json.dump({'v': 1, 'engine': 'chatterbox', 'complete': complet, 'items': items},
              open(os.path.join(out, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'Voix C : {len(items)} / {len(lignes)} phrases prêtes' + (' (complet)' if complet else ''))


if __name__ == '__main__':
    cmd, args = sys.argv[1], sys.argv[2:]
    {'plan': plan, 'rendre': rendre}.get(cmd, lambda *a: fusion(a[0], a[1], a[2:]))(*args)
