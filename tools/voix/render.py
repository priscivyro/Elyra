"""Génère les audios de la voix ELYRA avec Piper (synthèse vocale neuronale, gratuite, hors ligne).
Usage : python tools/voix/render.py <modele.onnx> <lignes.json> <dossier_sortie> [lenteur, ex. 1.18]
Les fichiers déjà présents sont réutilisés : seules les nouvelles phrases sont générées.

Version 2 (voix plus humaine) : chaque phrase est lue séparément, avec une vraie pause après
(plus longue après « … »), un tempo qui varie légèrement d'une phrase à l'autre, une dernière
phrase un peu plus posée, et un son plus chaud (graves doux, aigus adoucis, petite pièce feutrée)."""
import hashlib, json, os, random, subprocess, sys, tempfile, wave
import numpy as np
from piper import PiperVoice, SynthesisConfig
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rythme import phrases, pause_apres, assemble, FILTRE



def name(text):
    return hashlib.sha1(('v2|' + text).encode('utf-8')).hexdigest()[:14] + '.mp3'


def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path],
                       capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)


def lire(voice, text, slow=1.18):
    """Lit un texte phrase par phrase avec des pauses naturelles. Renvoie (audio float32, fréquence)."""
    rnd = random.Random(text)  # même texte → même lecture (fichiers stables)
    ps = phrases(text)
    morceaux = []
    for i, p in enumerate(ps):
        dernier = i == len(ps) - 1
        ls = slow * (1 + rnd.uniform(-0.035, 0.045)) * (1.05 if dernier and len(ps) > 1 else 1)
        cfg = SynthesisConfig(length_scale=ls, noise_scale=0.62, noise_w_scale=0.82)
        a = [c.audio_int16_array.astype(np.float32) / 32768 for c in voice.synthesize(p, syn_config=cfg)]
        if a:
            morceaux.append((np.concatenate(a), pause_apres(p, dernier)))
    sr = voice.config.sample_rate
    return assemble(morceaux, sr), sr


def main():
    model, lines_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)
    lines = json.load(open(lines_path, encoding='utf-8'))
    voice = PiperVoice.load(model)
    slow = float(sys.argv[4]) if len(sys.argv) > 4 else 1.18
    items, made = {}, 0
    for text in lines:
        f = name(text)
        dst = os.path.join(out_dir, f)
        if not os.path.exists(dst):
            with tempfile.TemporaryDirectory() as td:
                wav = os.path.join(td, 'a.wav')
                audio, sr = lire(voice, text, slow)
                pcm = (np.clip(audio, -1, 1) * 32767).astype('<i2')
                with wave.open(wav, 'wb') as w:
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
                subprocess.run(['ffmpeg', '-v', 'fatal', '-y', '-i', wav, '-af', FILTRE,
                                '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', dst], check=True)
            made += 1
        items[text] = [f, duration(dst)]

    keep = {v[0] for v in items.values()}
    for f in os.listdir(out_dir):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(out_dir, f))
    json.dump({'v': 2, 'voice': os.path.basename(model), 'items': items}, open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{len(items)} phrases, {made} nouvelles')


if __name__ == '__main__':
    main()
