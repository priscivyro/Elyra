"""Essai d'écoute : les mêmes séances en 3 versions, pour choisir avant de tout changer.
  1-actuelle   : voix Piper telle qu'elle est aujourd'hui dans l'appli
  2-retouchee  : voix Piper avec le nouveau rythme (pauses, variations, son plus chaud)
  3-chatterbox : voix Chatterbox (open source, MIT), timbre pris sur une vraie voix humaine
                 sous licence libre (base SIWIS, comédienne française professionnelle)
Usage : python tools/voix/essai_chatterbox.py <piper_siwis.onnx> <voix_reference.wav> <seances.json> <dossier>
Les silences entre les étapes sont raccourcis (4 s max) pour que l'écoute reste agréable."""
import json, os, random, subprocess, sys, time, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rythme import phrases, pause_apres, assemble, FILTRE
from render import lire as lire_v2
from piper import PiperVoice, SynthesisConfig

piper_model, ref, seances_path, out = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
seances = json.load(open(seances_path, encoding='utf-8'))
piper = PiperVoice.load(piper_model)
PSR = piper.config.sample_rate
ANCIEN_FILTRE = 'highpass=f=70,lowpass=f=9000,equalizer=f=220:t=q:w=1:g=2,loudnorm=I=-19:TP=-2:LRA=7'


def lire_v1(text):
    """Lecture d'avant : tout le texte d'un bloc, sans pauses ajoutées."""
    cfg = SynthesisConfig(length_scale=1.18, noise_scale=0.55, noise_w_scale=0.75)
    a = [c.audio_int16_array.astype(np.float32) / 32768 for c in piper.synthesize(text, syn_config=cfg)]
    return np.concatenate(a), PSR


cb = None


def lire_cb(text):
    """Chatterbox, phrase par phrase, avec le même rythme que la version retouchée."""
    global cb
    if cb is None:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        t0 = time.time()
        try:
            cb = ChatterboxMultilingualTTS.from_pretrained(device='cpu', t3_model='v3')
            print('Chatterbox Multilingual V3 chargé', flush=True)
        except Exception as e:
            print('V3 indisponible, version par défaut :', e, flush=True)
            cb = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
        print(f'chargement {time.time() - t0:.0f} s', flush=True)
    ps = phrases(text)
    morceaux = []
    for i, p in enumerate(ps):
        t1 = time.time()
        best = None
        for essai in range(3):
            wav = cb.generate(p, language_id='fr', audio_prompt_path=ref,
                              exaggeration=0.4, cfg_weight=0.3, temperature=0.7)
            a = wav.squeeze().detach().cpu().numpy().astype(np.float32)
            d, attendu = a.size / cb.sr, len(p) / 14.0  # ~14 caractères par seconde, voix posée
            # Écarte les ratés (phrase coupée ou qui s'éternise).
            if 0.45 * attendu < d < 2.2 * attendu + 1.5:
                best = a
                break
            print(f'  essai {essai + 1} écarté ({d:.1f} s pour ~{attendu:.1f} s)', flush=True)
            best = a if best is None else best
        morceaux.append((best, pause_apres(p, i == len(ps) - 1)))
        print(f'  {len(p):3d} car. en {time.time() - t1:.0f} s', flush=True)
    return assemble(morceaux, cb.sr), cb.sr


def ecrire(chemin, audio, sr, filtre):
    wav = chemin + '.wav'
    pcm = (np.clip(audio, -1, 1) * 32767).astype('<i2')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', filtre, '-ac', '1', '-ar', '24000',
                    '-c:a', 'libmp3lame', '-b:a', '64k', chemin + '.mp3'], check=True)
    os.remove(wav)


VERSIONS = [('1-actuelle', lambda t: lire_v1(t), ANCIEN_FILTRE),
            ('2-retouchee', lambda t: lire_v2(piper, t, 1.18), FILTRE),
            ('3-chatterbox', lire_cb, FILTRE)]

for n, s in enumerate(seances, 1):
    for nom, lecteur, filtre in VERSIONS:
        print(f'== {s["t"]} — {nom}', flush=True)
        blocs, sr = [], None
        for texte, sec in s['s']:
            a, sr = lecteur(texte)
            d = a.size / sr
            blocs.append((a, min(4.0, max(1.5, sec - d))))
        audio = assemble(blocs, sr)
        ecrire(os.path.join(out, f'{n}-{s["k"]}-{nom}'), audio, sr, filtre)
        print(f'   → {audio.size / sr:.0f} s', flush=True)
print('Terminé.')
