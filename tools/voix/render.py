"""Génère les audios de la voix ELYRA avec Piper (synthèse vocale neuronale, gratuite, hors ligne).
Usage : python tools/voix/render.py <modele.onnx> <lignes.json> <dossier_sortie> [lenteur, ex. 1.18]
Les fichiers déjà présents sont réutilisés : seules les nouvelles phrases sont générées."""
import hashlib, json, os, subprocess, sys, tempfile, wave
from piper import PiperVoice, SynthesisConfig

model, lines_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out_dir, exist_ok=True)
lines = json.load(open(lines_path, encoding='utf-8'))
voice = PiperVoice.load(model)
slow = float(sys.argv[4]) if len(sys.argv) > 4 else 1.18
cfg = SynthesisConfig(length_scale=slow, noise_scale=0.55, noise_w_scale=0.75)

def name(text):
    return hashlib.sha1(('v1|' + text).encode('utf-8')).hexdigest()[:14] + '.mp3'

def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path],
                       capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)

items, made = {}, 0
for text in lines:
    f = name(text)
    dst = os.path.join(out_dir, f)
    if not os.path.exists(dst):
        with tempfile.TemporaryDirectory() as td:
            wav = os.path.join(td, 'a.wav')
            with wave.open(wav, 'wb') as w:
                voice.synthesize_wav(text, w, syn_config=cfg)
            # Voix plus chaude et régulière : léger filtrage, volume homogène, petit silence avant/après.
            subprocess.run(['ffmpeg', '-v', 'fatal', '-y', '-i', wav, '-af',
                            'highpass=f=70,lowpass=f=9000,equalizer=f=220:t=q:w=1:g=2,'
                            'loudnorm=I=-19:TP=-2:LRA=7,aresample=24000,adelay=250,apad=pad_dur=0.4',
                            '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', dst], check=True)
        made += 1
    items[text] = [f, duration(dst)]

keep = {v[0] for v in items.values()}
for f in os.listdir(out_dir):
    if f.endswith('.mp3') and f not in keep:
        os.remove(os.path.join(out_dir, f))
json.dump({'v': 1, 'voice': os.path.basename(model), 'items': items}, open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(f'{len(items)} phrases, {made} nouvelles')
